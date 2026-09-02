import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { StockService } from "../application/stock.service.js";
export class StockController {
  constructor(private readonly service: StockService) {}
  add = asyncHandler(async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await this.service.addIMEI(req.body) });
  });
  check = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.checkIMEI(req.params.serial as string) });
  });
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.updateStatus(parseInt(req.params.id as string), req.body.status) });
  });
}
