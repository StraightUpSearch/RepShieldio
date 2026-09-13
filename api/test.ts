// Minimal test endpoint — no dependencies
export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, env: process.env.NODE_ENV });
}
