import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { CustomerService } from "../application/customer.service.js";
export class CustomerController {
  constructor(private readonly service: CustomerService) {}
  create = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await this.service.create(req.body) });
  });
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getAll() });
  });
  getByPhone = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getByPhone(req.params.phone as string) });
  });
  addPoints = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.addPoints(parseInt(req.params.id as string), req.body.points) });
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(parseInt(req.params.id as string));
    res.status(200).json({ success: true, message: "ລົບລູກຄ້າສຳເລັດ" });
  });
}
