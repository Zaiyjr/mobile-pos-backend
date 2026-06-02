import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";

export class ProductRepo {
    // 1. ສ້າງສິນຄ້າໃໝ່ (ຮອງຮັບ Nested Write ສ້າງ variants, images, specs ພ້ອມກັນ)
    async createProduct(data: Prisma.ProductUncheckedCreateInput) {
        return await prisma.product.create({
            data: data,
        });
    }

    // 2. ດຶງສິນຄ້າທັງໝົດ (ເອົາສະເພາະໂຕທີ່ຍັງບໍ່ຖືກລຶບ ແລະ include ຂໍ້ມູນຫຼັກ)
    async getAllProducts() {
        return await prisma.product.findMany({
            where: { isDeleted: false },
            include: {
                category: true,
                brand: true,
                images: { where: { isMain: true } }, // ເອົາແຕ່ຮູບຫຼັກໄປສະແດງໜ້າ POS
                variants: true // ດຶງລຸ້ນຍ່ອຍໄປເບິ່ງລາຄາ
            },
            orderBy: { createdAt: "desc" }
        });
    }

    // 3. ດຶງຂໍ້ມູນສິນຄ້າລະອຽດ 1 ອັນດ້ວຍ ID ( include ທຸກ Table ລູກທັງໝົດ )
    async getOneProduct(id: number) {
        return await prisma.product.findFirst({
            where: {
                id: id,
                isDeleted: false
            },
            include: {
                category: true,
                brand: true,
                images: true,
                variants: {
                    include: {
                        _count: {
                            select: { stockItems: { where: { status: "AVAILABLE" } } } // ເບິ່ງຈຳນວນເຄື່ອງທີ່ພ້ອມຂາຍ
                        }
                    }
                },
                specs: {
                    include: { attribute: true }
                }
            }
        });
    }

    // 4. ແგ້ໄຂຂໍ້ມູນສິນຄ້າ
    async updateProduct(id: number, data: Prisma.ProductUncheckedUpdateInput) {
        return await prisma.product.update({
            where: { id: id },
            data: data,
        });
    }

    // 5. ລົບສິນຄ້າ (Soft Delete)
    async deleteProduct(id: number) {
        return await prisma.product.update({
            where: { id: id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
    }
}