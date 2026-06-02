import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const customerController = new CustomerController();

// 🔒 ພະນັກງານໜ້າ POS (ADMIN, CASHIER) ສາມາດເບິ່ງ ແລະ ຄົ້ນຫາເບີລູກຄ້າໄດ້
router.get("/", authenticateJWT, customerController.getAll);
router.get("/phone/:phone", authenticateJWT, customerController.getByPhone);
router.post("/", authenticateJWT, customerController.create);

// 🔒 ສະເພาະ ADMIN ເທົ່ານັ້ນ ທີ່ສາມາດແກ້ໄຂແຕ້ມ ຫຼື ລົບສະມາຊິກໄດ້
router.put("/points/:id", authenticateJWT, authorizeRoles("ADMIN"), customerController.addPoints);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), customerController.delete);

export default router;