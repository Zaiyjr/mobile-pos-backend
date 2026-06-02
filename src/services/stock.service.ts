import { StockRepo } from "../repositories/stock.repository.js";
import { Prisma } from "@prisma/client";

const stockRepo = new StockRepo();

export class StockService {
    async addIMEI(data: Prisma.StockItemUncheckedCreateInput) {
        // ໃນ Layer ນີ້ເຮົາສາມາດໃສ່ Logic ເຊັກໄດ້ວ່າ "ເລກ IMEI ນີ້ຍິງຊ້ຳໃນລະບົບບໍ" ໄດ້
        return await stockRepo.addStockItem(data);
    }

    async checkIMEI(serialNumber: string) {
        const item = await stockRepo.checkIMEI(serialNumber);
        if (!item) throw new Error("ເລກ IMEI ນີ້ບໍ່ມີໃນລະບົບ ຫຼື ຖືກຂາຍອອກໄປແລ້ວ");
        return item;
    }

    async updateStatus(id: number, status: string) {
        return await stockRepo.updateStockStatus(id, status);
    }
}