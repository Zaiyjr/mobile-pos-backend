import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAll);

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ເພີ່ມໝວດໝູ່ໄດ້
router.post("/", authenticateJWT, authorizeRoles("ADMIN"), categoryController.create);
router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), categoryController.update);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), categoryController.delete);

export default router;