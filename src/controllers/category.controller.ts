import type{ Request, Response } from "express";
import { CategoryService } from "../services/category.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js"; // 👈 Import ເຂົ້າມາ

const categoryService = new CategoryService();

export class CategoryController {
    
    // ✅ ບໍ່ຕ້ອງມີ try-catch ອີກຕໍ່ໄປ! ສະອາດ ແລະ ອ່ານງ່າຍຂຶ້ນຫຼາຍ
    create = asyncHandler(async (req: Request, res: Response) => {
        const result = await categoryService.create(req.body);
        res.status(201).json({ success: true, data: result });
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const categories = await categoryService.getAll();
        res.status(200).json({ success: true, data: categories });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const category = await categoryService.getOne(id)
        res.status(200).json({ success: true, data: category });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await categoryService.update(id, req.body);
        res.status(200).json({ success: true, data: result });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await categoryService.delete(id);
        res.status(200).json({ success: true, data: result });
    });
}