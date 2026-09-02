// MINIMAL TEST — no imports, no DB, no Express
// If this works → problem is in module imports
// If this ALSO hangs → problem is Vercel config / network
export default function handler(req: any, res: any) {
  res.status(200).json({ ok: true, ts: Date.now(), path: req.url });
}
