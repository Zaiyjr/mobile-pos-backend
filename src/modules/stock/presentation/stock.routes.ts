import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { stockCreateSchema, stockStatusSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { StockController } from "./stock.controller.js";
export function createStockRouter(controller: StockController) {
  const router = Router();
  router.post("/add", authenticateJWT, authorizeRoles("ADMIN"), validateBody(stockCreateSchema), controller.add);
  router.get("/check/:serial", authenticateJWT, controller.check);
  router.put("/status/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(stockStatusSchema), controller.updateStatus);
  return router;
}
