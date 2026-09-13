// Test with static imports - same as api/index.ts uses
import express from "express";
import compression from "compression";
import { registerRoutes } from "../server/routes";

export default async function handler(req: any, res: any) {
  try {
    const app = express();
    app.use(compression());
    res.status(200).json({ ok: true, msg: "static imports loaded" });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
}
