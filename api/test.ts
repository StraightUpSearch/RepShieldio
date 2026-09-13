// Replicate api/index.ts exactly to see if it crashes
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "../server/routes";

const app = express();
app.set("trust proxy", 1);
app.use(compression());
app.use(express.json());

let initPromise: Promise<void> | null = null;

function initialize(): Promise<void> {
  if (!initPromise) {
    initPromise = registerRoutes(app)
      .then(() => { console.log("Test API initialized"); })
      .catch((err) => { initPromise = null; throw err; });
  }
  return initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    await initialize();
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
}
