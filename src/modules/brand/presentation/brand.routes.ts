import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { brandSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { BrandController } from "./brand.controller.js";

export function createBrandRouter(controller: BrandController) {
  const router = Router();
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", authenticateJWT, authorizeRoles("ADMIN"), validateBody(brandSchema), controller.create);
  router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(brandSchema.partial()), controller.update);
  router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
  return router;
}
