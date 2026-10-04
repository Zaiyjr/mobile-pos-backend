import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { userUpdateSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { UserController } from "./user.controller.js";
export function createUserRouter(controller: UserController) {
  const router = Router();
  router.get("/", authenticateJWT, authorizeRoles("ADMIN"), controller.getAll);
  router.get("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.getById);
  router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(userUpdateSchema), controller.update);
  router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
  return router;
}
