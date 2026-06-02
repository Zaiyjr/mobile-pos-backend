import { Router } from "express";
import { BrandController } from "../controllers/brand.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const brandController = new BrandController();

router.get("/", brandController.getAll);
router.get("/:id", brandController.getById);

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ເພີ່ມ/ແກ້ໄຂ/ລົບ ຍີ່ຫໍ້ໄດ້
router.post("/", authenticateJWT, authorizeRoles("ADMIN"), brandController.create);
router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), brandController.update);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), brandController.delete);

export default router;