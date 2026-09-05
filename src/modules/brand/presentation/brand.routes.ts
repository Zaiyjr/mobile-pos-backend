import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../../../shared/presentation/middlewares/auth.js";
import { BrandRepositoryPg } from "../infrastructure/brand.repository.js";
import { BrandService } from "../application/brand.service.js";
import { BrandController } from "./brand.controller.js";

const repo = new BrandRepositoryPg();
const service = new BrandService(repo);
const controller = new BrandController(service);

export const brandRouter = Router();
brandRouter.get("/", controller.getAll);
brandRouter.get("/:id", controller.getById);
brandRouter.post("/", authenticateJWT, authorizeRoles("ADMIN"), controller.create);
brandRouter.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.update);
brandRouter.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), controller.delete);
