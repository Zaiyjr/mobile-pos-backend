import { Router } from "express";
import { StockController } from "../controllers/stock.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();
const stockController = new StockController();

// 🔒 ພະນັກງານທຸກຄົນທີ່ Login ສາມາດຍິງບາໂຄ້ດເຊັກ IMEI ໄດ້
router.get("/check/:serialNumber", authenticateJWT, stockController.checkIMEI);

// 🔒 ສະເພາະ ADMIN ເທົ່ານັ້ນ ທີ່ສາມາດເພີ່ມ S/N ຮັບເຄື່ອງເຂົ້າຄັງ ຫຼື ປ່ຽນສະຖານະເຄື່ອງດ້ວຍຕົນເອງໄດ້
router.post("/add", authenticateJWT, authorizeRoles("ADMIN"), stockController.addIMEI);
router.put("/status/:id", authenticateJWT, authorizeRoles("ADMIN"), stockController.updateStatus);

export default router;