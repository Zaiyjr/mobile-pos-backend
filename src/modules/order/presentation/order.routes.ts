import { Router } from "express";
import { authenticateJWT } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { orderCheckoutSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { OrderController } from "./order.controller.js";
export function createOrderRouter(controller: OrderController) {
  const router = Router();
router.post("/", authenticateJWT, validateBody(orderCheckoutSchema), controller.checkout);
  router.get("/", authenticateJWT, controller.getAll);
  router.get("/:id", authenticateJWT, controller.getById);
  router.post("/cancel/:id", authenticateJWT, controller.cancel);
  return router;
}
