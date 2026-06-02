import type { Request, Response } from "express";
import { RoleService } from "../services/role.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const roleService = new RoleService();

export class RoleController {
    // create
    create = asyncHandler(async (req: Request, res: Response) => {
        const result = await roleService.create(req.body);
        res.status(201).json({
            success: true,
            message: "ສ້າງ Role ໃໝ່ສຳເລັດ",
            data: result
        });
    });
    
    // get all
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const result = await roleService.getAll();
        res.status(200).json({
            success: true,
            data: result
        });
    });

    // get one
    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await roleService.getById(id);
        res.status(200).json({
            success: true,
            data: result
        });
    });

    // update
    update = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await roleService.update(id, req.body);
        res.status(200).json({
            success: true,
            message: "ແກ້ໄຂ Role ສຳເລັດ",
            data: result
        });
    });

    // delete
    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        await roleService.delete(id);
        res.status(200).json({
            success: true,
            message: "ລຶບ Role ສຳເລັດ"
        });
    });

}
