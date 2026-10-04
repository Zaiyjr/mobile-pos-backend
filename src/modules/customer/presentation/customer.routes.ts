import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { customerSchema, pointsSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { CustomerController } from "./customer.controller.js";
export function createCustomerRouter(controller: CustomerController) {
  const router = Router();
  router.post("/", authenticateJWT, validateBody(customerSchema), controller.create);
  router.get("/", authenticateJWT, controller.getAll);
  router.get("/phone/:phone", authenticateJWT, controller.getByPhone);
  router.put("/points/:id", authenticateJWT, authorizeRoles("ADMIN"), validateBody(pointsSchema), controller.addPoints);
  router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
  return router;
}
