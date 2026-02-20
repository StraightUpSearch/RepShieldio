import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
const app = express();

// Trust proxy for SSL termination
app.set('trust proxy', 1);

// Production-grade HTTP security headers (no helmet dependency)
app.use((req, res, next) => {
  // Content-Security-Policy: allow self, inline styles (Tailwind), Google Fonts, and Stripe.js
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
  );

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS only in production — avoid locking localhost to HTTPS during development
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Hide default Express X-Powered-By
  res.removeHeader('X-Powered-By');

  next();
});

// Raw body for Stripe webhook signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Always log the full error stack for server-side debugging
    console.error(`[ERROR] ${err.message || 'Unknown error'}`);
    if (err.stack) {
      console.error(err.stack);
    }

    const status = err.status || err.statusCode || 500;

    // Build safe response - never leak stack traces in production
    const response: Record<string, any> = {
      error: "Internal server error",
    };

    if (process.env.NODE_ENV === "development") {
      response.message = err.message;
      response.stack = err.stack;
    }

    // Don't attempt to send if headers already sent
    if (!res.headersSent) {
      res.status(status).json(response);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment variable or default to 3000 (5000 was for Replit)
// this serves both the API and the client.
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const host = process.platform === 'win32' ? 'localhost' : '0.0.0.0';
  
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please:
1. Stop any other applications using port ${port}
2. Or run: netstat -ano | findstr :${port} (Windows) or lsof -ti:${port} (Mac/Linux)
3. Then kill the process using the port`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      throw err;
    }
  });
  
  server.listen(port, host, () => {
    log(`serving on port ${port} (${host})`);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    // Force exit after 10s if connections don't close
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled promise rejections so they don't crash the process silently
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
  });

  // Catch uncaught synchronous exceptions
  process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message);
    console.error(err.stack);
    // Give time to flush logs, then exit
    setTimeout(() => process.exit(1), 1000);
  });
})();
