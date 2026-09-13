/**
 * Vercel serverless entry point.
 * Exports the Express app as a handler — no listen() needed.
 * Local dev uses server/index.ts (which does call listen()).
 */
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "../server/routes";

const app = express();

// Trust Vercel's proxy for HTTPS detection
app.set("trust proxy", 1);

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src https://js.stripe.com;"
  );
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.removeHeader("X-Powered-By");
  next();
});

app.use(compression());

// Raw body for Stripe webhook signature verification
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message || "Unknown error"}`);
  const status = err.status || err.statusCode || 500;
  if (!res.headersSent) {
    res.status(status).json({ error: "Internal server error" });
  }
});

// Initialize routes once — cached across warm Lambda invocations
let initPromise: Promise<void> | null = null;

function initialize(): Promise<void> {
  if (!initPromise) {
    initPromise = registerRoutes(app)
      .then(() => {
        console.log("RepShield API initialised on Vercel");
      })
      .catch((err) => {
        console.error("Init error:", err);
        initPromise = null; // allow retry
        throw err;
      });
  }
  return initPromise;
}

// Default export — Vercel calls this for every request
export default async function handler(req: Request, res: Response) {
  await initialize();
  return app(req, res);
}
