import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { CategoryService } from "../application/category.service.js";
export class CategoryController {
  constructor(private readonly service: CategoryService) {}
  create = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.create(req.body);
    res.status(201).json({ success: true, data });
  });
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getAll() });
  });
  getOne = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getOne(parseInt(req.params.id as string)) });
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.update(parseInt(req.params.id as string), req.body) });
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(parseInt(req.params.id as string));
    res.status(200).json({ success: true, message: "ລົບໝວດໝູ່ສຳເລັດ" });
  });
}
