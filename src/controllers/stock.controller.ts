import type{ Request, Response } from "express";
import { StockService } from "../services/stock.service.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const stockService = new StockService();

export class StockController {
    addIMEI = asyncHandler(async (req: Request, res: Response) => {
        const result = await stockService.addIMEI(req.body);
        res.status(201).json({
            success: true,
            message: "ເພີ່ມເລກ IMEI ເຂົ້າສະຕັອກສຳເລັດ",
            data: result
        });
    });

    checkIMEI = asyncHandler(async (req: Request, res: Response) => {
        const { serialNumber } = req.params;
        const result = await stockService.checkIMEI(serialNumber as string);
        res.status(200).json({ success: true, data: result });
    });

    updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id as string);
        const { status } = req.body;
        const result = await stockService.updateStatus(id, status);
        res.status(200).json({
            success: true,
            message: "ອັບເດດສະຖານະ Stock Item ສຳເລັດ",
            data: result
        });
    });
}