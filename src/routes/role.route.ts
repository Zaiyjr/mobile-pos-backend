import { Router } from "express";
import { RoleController } from "../controllers/role.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const roleController = new RoleController();

// 🔒 ພະນັກງານທີ່ Login ແລ້ວສາມາດເບິ່ງ Roles ໄດ້
router.get("/", authenticateJWT, roleController.getAll);
// 🔒 ພະນັກງານທີ່ Login ແລ້ວສາມາດເບິ່ງ Role ໂດຍ ID ໄດ້
router.get("/:id", authenticateJWT, roleController.getById);

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ມີສິດສ້າງ Role ໃໝ່
router.post("/", authenticateJWT, authorizeRoles("ADMIN"), roleController.create);

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ມີສິດແກ້ໄຂ Role
router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), roleController.update);

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ມີສິດແກ້ໄຂ Role
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), roleController.delete);

export default router;
