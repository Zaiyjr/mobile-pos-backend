import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { errorHandler } from "../middlewares/error.js";
import { authenticateJWT, authorizeRoles, type AuthRequest } from "../middlewares/auth.js";
import { authRouter } from "../../../modules/auth/presentation/auth.routes.js";
import { userRouter } from "../../../modules/user/presentation/user.routes.js";
import { roleRouter } from "../../../modules/role/presentation/role.routes.js";
import { brandRouter } from "../../../modules/brand/presentation/brand.routes.js";
import { categoryRouter } from "../../../modules/category/presentation/category.routes.js";
import { customerRouter } from "../../../modules/customer/presentation/customer.routes.js";
import { productRouter } from "../../../modules/product/presentation/product.routes.js";
import { stockRouter } from "../../../modules/stock/presentation/stock.routes.js";
import { orderRouter } from "../../../modules/order/presentation/order.routes.js";

export function createApp() {
  const app = express();

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
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString(), env: { hasDb: !!process.env.DATABASE_URL } });
  });
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString(), env: { hasDb: !!process.env.DATABASE_URL } });
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

  // The ONLY routes reachable without a session (credential bootstrap).
  // Everything else under the API is private-by-default.
  const PUBLIC_API_ROUTES: { method: string; path: string }[] = [
    { method: "POST", path: "/auth/register" },
    { method: "POST", path: "/auth/login" },
  ];
  const isPublicApiRoute = (req: express.Request) =>
    PUBLIC_API_ROUTES.some((r) => r.method === req.method && r.path === req.path);

  // Aggregate every module router into one API router. Auth is applied ONCE
  // here (private-by-default) so module routers stay middleware-free; the
  // auth limiter guards /auth under every mounted prefix. Uniform role policy
  // is declared at the mount (e.g. /users = ADMIN); mixed routers keep
  // per-route authorizeRoles for their admin-only writes.
  const buildApiRouter = () => {
    const router = express.Router();
    router.use((req, res, next) =>
      isPublicApiRoute(req) ? next() : authenticateJWT(req as AuthRequest, res, next)
    );
    router.use("/auth", authLimiter, authRouter);
    router.use("/users", authorizeRoles("ADMIN"), userRouter);
    router.use("/roles", roleRouter);
    router.use("/brands", brandRouter);
    router.use("/categories", categoryRouter);
    router.use("/customers", customerRouter);
    router.use("/products", productRouter);
    router.use("/stocks", stockRouter);
    router.use("/orders", orderRouter);
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
