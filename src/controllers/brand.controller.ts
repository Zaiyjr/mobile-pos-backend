import type{ Request, Response } from "express";
import { BrandService } from "../services/brand.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const brandService = new BrandService();

export class BrandController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const result = await brandService.create(req.body);
        res.status(201).json({ 
            success: true, 
            message: "ເພີ່ມຍີ່ຫໍ້ສຳເລັດ", 
            data: result 
        });
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const brands = await brandService.getAll();
        res.status(200).json({ success: true, data: brands });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const brand = await brandService.getById(id);
        res.status(200).json({ success: true, data: brand });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await brandService.update(id, req.body);
        res.status(200).json({ 
            success: true, 
            message: "ອັບເດດຍີ່ຫໍ້ສຳເລັດ", 
            data: result 
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        await brandService.delete(id);
        res.status(200).json({ 
            success: true, 
            message: "Soft Delete ຍີ່ຫໍ້ສຳເລັດ" 
        });
    });
}