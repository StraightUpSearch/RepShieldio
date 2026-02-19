import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import connectSqlite3 from "connect-sqlite3";
import { validateInput, registerSchema, loginSchema } from "./validation";
import { handleAsyncErrors, AppError } from "./error-handler";
import { getDatabaseConfig } from './config/database';
import { strictLimiter } from "./rate-limiter";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupSimpleAuth(app: Express) {
  // Validate essential environment variables
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be set and at least 32 characters long in production');
    }
    
    // Validate production database configuration
    const dbConfig = getDatabaseConfig();
    if (dbConfig.type === 'sqlite' && dbConfig.url.includes('development')) {
      throw new Error('❌ CRITICAL: Production cannot use development database for sessions');
    } else if (dbConfig.type === 'sqlite') {
      console.warn('⚠️  DATABASE_URL not set in production - using SQLite as fallback. For production deployments, consider setting DATABASE_URL for better performance and persistence.');
    }
  }

  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  const dbConfig = getDatabaseConfig();
  
  if (dbConfig.type === 'postgresql') {
    // Use PostgreSQL session store for production with DATABASE_URL
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: dbConfig.url,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    console.log(`✅ Using PostgreSQL session store for ${dbConfig.environment}`);
  } else {
    // Use SQLite session store for development or fallback
    const SQLiteStore = connectSqlite3(session);
    const sessionDbPath = dbConfig.environment === 'production' ? 'sessions-production.db' : 'sessions.db';
    sessionStore = new SQLiteStore({
      db: sessionDbPath,
      dir: '.',
      ttl: sessionTtl
    });
    console.log(`✅ Using SQLite session store (${sessionDbPath}) for ${dbConfig.environment}`);
  }
  
  console.log("Setting up session store with:", {
    dbType: dbConfig.type,
    dbUrl: dbConfig.url.replace(/\/\/.*@/, '//***:***@'), // Mask credentials in logs
    hasSessionSecret: !!process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV,
    isSecure: process.env.NODE_ENV === "production"
  });
  
  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret-key-for-testing-32chars-long-minimum',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Register endpoint
  app.post("/api/register", strictLimiter, handleAsyncErrors(async (req, res) => {
    try {
      console.log("Registration attempt:", { email: req.body.email, hasPassword: !!req.body.password });
      
      // Validate input
      const validatedData = validateInput(registerSchema, req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        console.log("Registration failed: User already exists", validatedData.email);
        throw new AppError("An account with this email already exists", 400);
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Set role based on admin email list (env var or default)
      const adminEmails = (process.env.ADMIN_EMAILS || 'jamie@straightupsearch.com').split(',').map(e => e.trim().toLowerCase());
      const role = adminEmails.includes(validatedData.email.toLowerCase()) ? "admin" : "user";
      
      // Create user
      const user = await storage.upsertUser({
        id: `user_${Date.now()}`,
        email: validatedData.email,
        firstName: validatedData.firstName || null,
        lastName: validatedData.lastName || null,
        profileImageUrl: null,
        role,
        password: hashedPassword,
        accountBalance: "0.00",
        creditsRemaining: role === "admin" ? 1000 : 0,
      });

      console.log("User created successfully:", { id: user.id, email: user.email, role: user.role });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login failed after registration:", err);
          throw new AppError("Registration successful but login failed", 500);
        }
        console.log("Auto-login successful after registration");
        res.status(201).json({ user, message: "Registration successful" });
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }));

  // Login endpoint - Fix path to match frontend expectations
  app.post("/api/auth/login", strictLimiter, (req, res, next) => {
    console.log("Login attempt:", { email: req.body.email, hasPassword: !!req.body.password });
    
    // Validate input first
    try {
      validateInput(loginSchema, req.body);
    } catch (error) {
      console.log("Login validation failed:", error.message);
      return res.status(400).json({ message: error.message });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login authentication error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        console.log("Login failed: Invalid credentials for", req.body.email);
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Login session creation failed:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("Login successful:", { id: user.id, email: user.email });
        res.json({ user, message: "Login successful" });
      });
    })(req, res, next);
  });

  // Keep legacy login endpoint for backwards compatibility
  app.post("/api/login", (req, res, next) => {
    console.log("Legacy login endpoint used - redirecting to /api/auth/login");
    // Forward to the new endpoint
    req.url = "/api/auth/login";
    return app._router.handle(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user - lightweight check, full user data in routes.ts
  // NOTE: The richer /api/auth/user with tickets is registered in routes.ts
  // and will override this one since it's registered later.
  // This serves as a fallback only.
}

export const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await storage.getUser(req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const isAuthenticated = (req: any, res: any, next: any) => {
  console.log("Auth check:", { 
    hasUser: !!req.user, 
    sessionID: req.sessionID,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false 
  });
  
  // Check if user is authenticated using Passport's built-in method
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Log unauthorized access attempts for debugging
  console.log("Unauthorized access attempt:", {
    url: req.url,
    method: req.method,
    headers: req.headers.authorization ? 'present' : 'missing',
    sessionExists: !!req.session,
    sessionData: req.session ? Object.keys(req.session) : 'no session'
  });
  
  return res.status(401).json({ 
    authenticated: false,
    message: "Authentication required. Please login to access this resource." 
  });
};