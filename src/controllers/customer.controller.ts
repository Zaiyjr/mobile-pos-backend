import type{ Request, Response } from "express";
import { CustomerService } from "../services/customer.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const customerService = new CustomerService();

export class CustomerController {
    create = asyncHandler(async (req: Request, res: Response) => {
        const result = await customerService.create(req.body);
        res.status(201).json({
            success: true,
            message: "ລົງທະບຽນສະມາຊິກລູກຄ້າສຳເລັດ",
            data: result
        });
    });

    getByPhone = asyncHandler(async (req: Request, res: Response) => {
        const { phone } = req.params;
        const customer = await customerService.getByPhone(phone as string);
        res.status(200).json({ success: true, data: customer });
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const customers = await customerService.getAll();
        res.status(200).json({ success: true, data: customers });
    });

    addPoints = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const { points } = req.body;
        const result = await customerService.addPoints(id, points);
        res.status(200).json({
            success: true,
            message: "ຈັດການຄະແນນສະມາຊິກສຳເລັດ",
            data: result
        });
    });

    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        await customerService.delete(id);
        res.status(200).json({ success: true, message: "Soft Delete ຂໍ້ມູນລູກຄ້າສຳເລັດ" });
    });
}