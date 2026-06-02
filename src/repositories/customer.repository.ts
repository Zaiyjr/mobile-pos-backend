import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";

export class CustomerRepo {
    // 1. ສະໝັກສະມາຊິກລູກຄ້າໃໝ່
    async createCustomer(data: Prisma.CustomerCreateInput) {
        return await prisma.customer.create({
            data: data
        });
    }

    // 2. ຄົ້ນຫາລູກຄ້າດ້ວຍເບີໂທ (ໃຊ້ຕະຫຼອດຢູ່ໜ້າ POS ຕອນ Cashier ພິມເບີລູກຄ້າເພື່ອສະສົມແຕ້ມ)
    async findByPhone(phone: string) {
        return await prisma.customer.findFirst({
            where: {
                phone: phone,
                isDeleted: false
            }
        });
    }

    // 3. ດຶງລາຍຊື່ລູກຄ້າທັງໝົດ
    async getAllCustomers() {
        return await prisma.customer.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" }
        });
    }

    // 4. ອັບເດດຄະແນນສະສົມ (Increment / Decrement ແຕ້ມ)
    async updatePoints(id: number, pointsToAdd: number) {
        return await prisma.customer.update({
            where: { id: id },
            data: {
                points: {
                    increment: pointsToAdd // ສັ່ງບວກຄະແນນເພີ່ມເຂົ້າໄປໂດຍກົງໃນ DB
                }
            }
        });
    }

    // 5. ລົບລູກຄ້າ (Soft Delete)
    async deleteCustomer(id: number) {
        return await prisma.customer.update({
            where: { id: id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
    }
}