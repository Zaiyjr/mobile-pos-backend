import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const userController = new UserController();

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ມີສິດຈັດການຂໍ້ມູນພະນັກງານ
router.get("/", authenticateJWT, authorizeRoles("ADMIN"), userController.getAll);
router.get("/:id", authenticateJWT, authorizeRoles("ADMIN"), userController.getById);
router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), userController.update);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), userController.delete);

export default router;