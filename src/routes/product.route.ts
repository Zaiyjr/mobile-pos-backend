import express from "express"
import { ProductController } from "../controllers/product.controller.js";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();
const productController = new ProductController();

router.get("/", productController.getAll);
router.get("/:id", productController.getById);

// 🔒 ສະເພາະ Admin ທີ່ມີສິດເພີ່ມສິນຄ້າ
router.post("/", authenticateJWT, authorizeRoles("ADMIN"), productController.create);
router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), productController.update);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), productController.delete);

export default router;