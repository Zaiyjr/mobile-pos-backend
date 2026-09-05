import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { UserService } from "../application/user.service.js";
export class UserController {
  constructor(private readonly service: UserService) {}
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getAll() });
  });
  getById = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.getById(req.params.id as string) });
  });
  update = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: await this.service.update(req.params.id as string, req.body) });
  });
  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.service.delete(req.params.id as string);
    res.status(200).json({ success: true, message: "Soft Delete ພະນັກງານສຳເລັດ" });
  });
}
