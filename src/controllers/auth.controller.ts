import type{ Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const authService = new AuthService();

export class AuthController {
    // 1. ສະໝັກບັນຊີພະນັກງານ
    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.register(req.body);
        res.status(201).json({ 
            success: true, 
            message: "ສະໝັກບັນຊີພະນັກງານສຳເລັດ", 
            data: result 
        });
    });

    // 2. ເຂົ້າສູ່ລະບົບ
    login = asyncHandler(async (req: Request, res: Response) => {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.status(200).json({ 
            success: true, 
            message: "ເຂົ້າສູ່ລະບົບສຳເລັດ", 
            data: result 
        });
    });
}