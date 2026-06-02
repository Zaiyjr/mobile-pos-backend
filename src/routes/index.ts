import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import productRoutes from "./product.route.js";
import brandRoutes from "./brand.route.js";
import categoryRoutes from "./category.route.js";
import stockRoutes from "./stock.route.js";
import customerRoutes from "./customer.route.js";
import orderRoutes from "./order.route.js"
import roleRoutes from "./role.route.js";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/users", userRoutes);
rootRouter.use("/products", productRoutes);
rootRouter.use("/brands", brandRoutes);
rootRouter.use("/categories", categoryRoutes);
rootRouter.use("/stocks", stockRoutes);
rootRouter.use("/customers", customerRoutes);
rootRouter.use("/orders", orderRoutes);
rootRouter.use("/roles", roleRoutes);

export default rootRouter;