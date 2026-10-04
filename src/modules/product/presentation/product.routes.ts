import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { productCreateSchema, productUpdateSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { ProductController } from "./product.controller.js";
export function createProductRouter(controller: ProductController) {
  const router = Router();
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", authenticateJWT, authorizeRoles("ADMIN"), validateBody(productCreateSchema), controller.create);
  router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(productUpdateSchema), controller.update);
  router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
  return router;
}
