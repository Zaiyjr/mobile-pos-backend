import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { categorySchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { CategoryController } from "./category.controller.js";
export function createCategoryRouter(controller: CategoryController) {
  const router = Router();
  router.get("/", controller.getAll);
  router.get("/:id", controller.getOne);
  router.post("/", authenticateJWT, authorizeRoles("ADMIN"), validateBody(categorySchema), controller.create);
  router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(categorySchema.partial()), controller.update);
  router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
  return router;
}
