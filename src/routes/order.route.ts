import express from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
const orderController = new OrderController();

router.get("/", authenticateJWT, orderController.getAll);
router.get("/:id", authenticateJWT, orderController.getById);
router.post("/", authenticateJWT, orderController.checkout);

// 🔒 ພະນັກງານໜ້າ POS (ADMIN, CASHIER) ສາມາດຍົກເລີກແຕ້ມໄດ້
router.post("/cancel/:id", authenticateJWT, authorizeRoles("ADMIN", "CASHIER"), orderController.cancel);

export default router;