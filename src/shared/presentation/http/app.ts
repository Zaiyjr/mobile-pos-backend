import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { errorHandler } from "../middlewares/error.js";
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

  // Module routers — each module owns its seam (presentation)
  app.use("/auth", authLimiter, authRouter);
  app.use("/users", userRouter);
  app.use("/roles", roleRouter);
  app.use("/brands", brandRouter);
  app.use("/categories", categoryRouter);
  app.use("/customers", customerRouter);
  app.use("/products", productRouter);
  app.use("/stocks", stockRouter);
  app.use("/orders", orderRouter);

  // Keep legacy compatibility: old clients using /api prefix
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/roles", roleRouter);
  app.use("/api/brands", brandRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/customers", customerRouter);
  app.use("/api/products", productRouter);
  app.use("/api/stocks", stockRouter);
  app.use("/api/orders", orderRouter);

  app.use(errorHandler);
  app.use((_req, res) => {
    res.status(404).json({ message: "ບໍ່ພົບເສັ້ນທາງ (Route) ນີ້ໃນລະບົບ!" });
  });

  return app;
}

export default createApp;
