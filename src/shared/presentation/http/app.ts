import express from "express";
import cors from "cors";
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

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://frontend-eta-jade-32.vercel.app",
        "https://mobile-pos-frontend-hr6v.vercel.app",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_req, res) => {
    res.send("Welcome to Mobile POS API! (Clean Modular)");
  });

  // Module routers — each module owns its seam (presentation)
  app.use("/auth", authRouter);
  app.use("/users", userRouter);
  app.use("/roles", roleRouter);
  app.use("/brands", brandRouter);
  app.use("/categories", categoryRouter);
  app.use("/customers", customerRouter);
  app.use("/products", productRouter);
  app.use("/stocks", stockRouter);
  app.use("/orders", orderRouter);

  // Keep legacy compatibility: old clients using /api prefix
  app.use("/api/auth", authRouter);
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
