import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { errorHandler } from "../middlewares/error.js";
import { createModuleRouters } from "../../../modules/create-module-routers.js";

export function createApp() {
  const app = express();
  const modules = createModuleRouters();

  // Behind a reverse proxy (Vercel/Render): trust the first hop so rate
  // limiting and logging see the real client IP instead of the proxy's.
  app.set("trust proxy", 1);

  // Baseline security headers (CSP, HSTS, noSniff, frameguard, etc.).
  app.use(helmet());

  // CORS allow-list is configurable via CORS_ORIGINS (see .env.example).
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Coarse global rate limit — protects every endpoint from request floods.
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: {
        success: false,
        message: "ຄຳຮ້ອງຫຼາຍເກີນໄປ, ກະລຸນາລອງໃໝ່ພາຍຫຼັງ (Too many requests)",
      },
    })
  );

  // Cap request body size to blunt large-payload abuse.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.send("Welcome to Mobile POS API! (Clean Modular)");
  });

  // Health — never touches DB, proves Vercel cold start works
  app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString(), env: { hasDb: !!env.databaseUrl } });
  });
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString(), env: { hasDb: !!env.databaseUrl } });
  });

  // Stricter limiter for credential endpoints (login/register) to blunt
  // brute-force and credential-stuffing attempts.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      message:
        "ພະຍາຍາມເຂົ້າສູ່ລະບົບຫຼາຍເກີນໄປ, ກະລຸນາລອງໃໝ່ພາຍຫຼັງ (Too many login attempts)",
    },
  });

  // Aggregate every module router into one API router. The auth limiter is
  // applied here so it guards /auth under every mounted prefix. Each mount
  // gets its own Router instance; the module routers are safely reused.
  const buildApiRouter = () => {
    const router = express.Router();
    router.use("/auth", authLimiter, modules.auth);
    router.use("/users", modules.users);
    router.use("/roles", modules.roles);
    router.use("/brands", modules.brands);
    router.use("/categories", modules.categories);
    router.use("/customers", modules.customers);
    router.use("/products", modules.products);
    router.use("/stocks", modules.stocks);
    router.use("/orders", modules.orders);
    return router;
  };

  // Canonical versioned API — new clients should target /api/v1/*.
  app.use("/api/v1", buildApiRouter());

  // Legacy prefixes kept for backward compatibility with existing clients
  // (the Vercel frontends / older app builds). Deprecate once they move to /api/v1.
  app.use("/api", buildApiRouter());
  app.use("/", buildApiRouter());

  
  app.use(errorHandler);
  app.use((_req, res) => {
    res.status(404).json({ message: "ບໍ່ພົບເສັ້ນທາງ (Route) ນີ້ໃນລະບົບ!" });
  });

  return app;
}

export default createApp;
