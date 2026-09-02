import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { BrandService } from "../application/brand.service.js";

export class BrandController {
  constructor(private readonly service: BrandService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.create(req.body);
    res.status(201).json({ success: true, message: "ເພີ່ມຍີ່ຫໍ້ສຳເລັດ", data: result });
  });
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const data = await this.service.getAll();
    res.status(200).json({ success: true, data });
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = await this.service.getById(id);
    res.status(200).json({ success: true, data });
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const data = await this.service.update(id, req.body);
    res.status(200).json({ success: true, message: "ອັບເດດຍີ່ຫໍ້ສຳເລັດ", data });
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(parseInt(req.params.id as string));
    res.status(200).json({ success: true, message: "ລົບຍີ່ຫໍ້ສຳເລັດ" });
  });
}
