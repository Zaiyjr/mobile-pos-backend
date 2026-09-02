import "dotenv/config";
import { createApp } from "../src/shared/presentation/http/app.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const app = createApp();

// Vercel serverless handler — export as default function, not just the app
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
