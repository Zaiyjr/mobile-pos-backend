import type{ Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const orderService = new OrderService();

export class OrderController {
    checkout = asyncHandler(async (req: Request, res: Response) => {
        const employeeId = req.user?.userId; 
        
        const orderData = {
            ...req.body,
            employeeId: employeeId || req.body.employeeId
        };

        const result = await orderService.checkout(orderData);
        res.status(201).json({ 
            success: true, 
            message: "ປິດບິນຂາຍ (Checkout) ສຳເລັດ", 
            data: result 
        });
    });

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const orders = await orderService.getAll();
        res.status(200).json({ success: true, data: orders });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const order = await orderService.getById(id);
        res.status(200).json({ success: true, data: order });
    });

    cancel = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const result = await orderService.cancel(id);
        res.status(200).json({ 
            success: true, 
            message: "ຍົກເລີກບິນຂາຍສຳເລັດ", 
            data: result 
        });
    });
}