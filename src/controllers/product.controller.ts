import type{ Request, Response } from "express";
import { ProductService } from "../services/product.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const productService = new ProductService();

export class ProductController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const result = await productService.create(req.body);
        res.status(201).json({ 
            success: true, 
            message: "ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ", 
            data: result 
        });
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const products = await productService.getAll();
        res.status(200).json({ success: true, data: products });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const product = await productService.getById(id);
        res.status(200).json({ success: true, data: product });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await productService.update(id, req.body);
        res.status(200).json({ 
            success: true, 
            message: "ອັບເດດຂໍ້ມູນສິນຄ້າສຳເລັດ", 
            data: result 
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        await productService.delete(id);
        res.status(200).json({ 
            success: true, 
            message: "Soft Delete ສິນຄ້າສຳເລັດ" 
        });
    });
}