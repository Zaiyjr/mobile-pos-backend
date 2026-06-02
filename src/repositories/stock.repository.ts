import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";

export class StockRepo {
    // 1. ເພີ່ມເລກ IMEI ເຂົ້າສະຕັອກ (ຍິງບາໂຄ້ດຮັບເຄື່ອງເຂົ້າຮ້ານ)
    async addStockItem(data: Prisma.StockItemUncheckedCreateInput) {
        return await prisma.stockItem.create({
            data: data
        });
    }

    // 2. ກວດເຊັກເລກ IMEI (ໃຊ້ຕອນ Cashier ຍິງບາໂຄ້ດຂາຍເຄື່ອງ ວ່າເລກນີ້ມີໃນລະບົບ ແລະ ພ້ອມຂາຍບໍ)
    async checkIMEI(serialNumber: string) {
        return await prisma.stockItem.findFirst({
            where: {
                serialNumber: serialNumber,
                status: "AVAILABLE" // ຕ້ອງເປັນເຄື່ອງທີ່ຍັງບໍ່ທັນຖືກຂາຍອອກ
            },
            include: {
                variant: {
                    include: { product: true } // ດຶງຊື່ສິນຄ້າອອກມານຳເລີຍ ວ່າແມ່ນລຸ້ນໃດ
                }
            }
        });
    }

    // 3. ອັບເດດສະຖານະເລກ IMEI (ເຊັ່ນ: ປ່ຽນເປັນ SOLD ຕອນຂາຍ ຫຼື CLAIM ຕອນເຄື່ອງມີບັນຫາ)
    async updateStockStatus(id: number, status: string) {
        return await prisma.stockItem.update({
            where: { id: id },
            data: { status: status }
        });
    }
}