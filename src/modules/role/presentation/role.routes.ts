import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { roleSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { RoleController } from "./role.controller.js";
export function createRoleRouter(controller: RoleController) {
  const router = Router();
  router.post("/", authenticateJWT, authorizeRoles("ADMIN"), validateBody(roleSchema), controller.create);
  router.get("/", authenticateJWT, controller.getAll);
  router.get("/:id", authenticateJWT, controller.getById);
  router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(roleSchema.partial()), controller.update);
  router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
  return router;
}
