import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/presentation/middlewares/async.js";
import type { AuthService } from "../application/auth.service.js";
export class AuthController {
  constructor(private readonly service: AuthService) {}
  register = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.register(req.body);
    res.status(201).json({ success: true, message: "ສະໝັກບັນຊີພະນັກງານສຳເລັດ", data });
  });
  login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    res.status(200).json({ success: true, message: "ເຂົ້າສູ່ລະບົບສຳເລັດ", data: await this.service.login(username, password) });
  });
}
