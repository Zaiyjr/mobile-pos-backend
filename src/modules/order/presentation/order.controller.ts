import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { OrderService } from "../application/order.service.js";
export class OrderController {
  constructor(private readonly service: OrderService) {}
  checkout = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = (req as Request & { user?: { userId: number } }).user?.userId;
    const data = { ...req.body, employeeId: employeeId || req.body.employeeId };
    res.status(201).json({ success: true, message: "ປິດບິນຂາຍ (Checkout) ສຳເລັດ", data: await this.service.checkout(data) });
  });
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getAll() });
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getById(parseInt(req.params.id as string)) });
  });
  cancel = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "ຍົກເລີກບິນຂາຍສຳເລັດ", data: await this.service.cancel(parseInt(req.params.id as string)) });
  });
}
