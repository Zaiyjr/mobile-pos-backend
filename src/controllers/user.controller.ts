import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const userService = new UserService();

export class UserController {
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const users = await userService.getAll();
        res.status(200).json({ success: true, data: users });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const user = await userService.getById(id);
        res.status(200).json({ success: true, data: user });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await userService.update(id, req.body);
        res.status(200).json({ 
            success: true, 
            message: "ອັບເດດຂໍ້ມູນພະນັກງານສຳເລັດ", 
            data: result 
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        await userService.delete(id);
        res.status(200).json({ 
            success: true, 
            message: "Soft Delete ພະນັກງານສຳເລັດ" 
        });
    });
}