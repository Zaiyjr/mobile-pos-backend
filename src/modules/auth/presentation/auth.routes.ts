import { Router } from "express";
import { validateBody } from "../../../shared/presentation/middlewares/validate-body.js";
import { authLoginSchema, authRegisterSchema } from "../../../shared/presentation/validation/request-schemas.js";
import type { AuthController } from "./auth.controller.js";

export function createAuthRouter(controller: AuthController) {
  return Router()
    .post("/register", validateBody(authRegisterSchema), controller.register)
    .post("/login", validateBody(authLoginSchema), controller.login);
}
