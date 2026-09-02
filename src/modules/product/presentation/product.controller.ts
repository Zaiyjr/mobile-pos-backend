import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { ProductService } from "../application/product.service.js";
export class ProductController {
  constructor(private readonly service: ProductService) {}
  create = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ success: true, message: "ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ", data: await this.service.create(req.body) });
  });
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getAll() });
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getById(parseInt(req.params.id as string)) });
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "ອັບເດດຂໍ້ມູນສິນຄ້າສຳເລັດ", data: await this.service.update(parseInt(req.params.id as string), req.body) });
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(parseInt(req.params.id as string));
    res.status(200).json({ success: true, message: "Soft Delete ສິນຄ້າສຳເລັດ" });
  });
}
