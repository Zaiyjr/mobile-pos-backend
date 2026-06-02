import prisma from "../config/prisma.js";
import type{ CreateOrderDTO } from "../dtos/dtos.js";// 💡 ໃຊ້ DTO ທີ່ເຮົາສ້າງໄວ້ ເພາະຮູບແບບຂໍ້ມູນມີການ Nested ຊັບຊ້ອນ

export class OrderRepo {
    
    // 1. ຟັງຊັນປິດບິນຂາຍໜ້າຮ້ານ (POS Checkout Transaction)
    async createOrder(data: CreateOrderDTO) {
        // ໃຊ້ $transaction ເພື່ອບັງຄັບໃຫ້ທຸກ Query ເຮັດວຽກສຳເລັດພ້ອມກັນ ຖ້າຂັ້ນຕອນໃດໜຶ່ງພັງ ລະບົບຈະ Rollback ຄືນທັງໝົດ
        return await prisma.$transaction(async (tx) => {
            
            // ຂັ້ນຕອນທີ 1: ສ້າງບິນຫຼັກ (Order)
            const order = await tx.order.create({
                data: {
                    employeeId: data.employeeId,
                    customerId: data.customerId || null,
                    totalAmount: data.totalAmount,
                    status: "PAID" // ປິດບິນເປັນ PAID ທັນທີ ເພາະຮັບເງິນສົດ/ໂອນໜ້າຮ້ານຮຽບຮ້ອຍແລ້ວ
                }
            });

            // ວົນ Loop ຈັດການລາຍການສິນຄ້າແຕ່ລະລາຍການທີ່ຊື້
            for (const item of data.items) {
                
                // ຂັ້ນຕອນທີ 2: ສ້າງລາຍການສິນຄ້າໃນບິນ (OrderItem)
                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        priceAtTime: item.priceAtTime
                    }
                });

                // ຂັ້ນຕອນທີ 3: ຜູກເລກ IMEI ທີ່ຂາຍ ກັບ ລາຍການສິນຄ້າໃນບິນ (Junction Table)
                if (item.stockItemIds && item.stockItemIds.length > 0) {
                    await tx.orderItemItem.createMany({
                        data: item.stockItemIds.map((stockItemId) => ({
                            orderItemId: orderItem.id,
                            stockItemId: stockItemId
                        }))
                    });

                    // ຂັ້ນຕອນທີ 4: ປ່ຽນສະຖານະເລກ IMEI ແຕ່ລະເຄື່ອງໃຫ້ເປັນ "SOLD" (ຂາຍແລ້ວ)
                    await tx.stockItem.updateMany({
                        where: {
                            id: { in: item.stockItemIds }
                        },
                        data: {
                            status: "SOLD"
                        }
                    });
                }

                // ຂັ້ນຕອນທີ 5: ຕັດຍອດສະຕັອກລວມໃນ ProductVariant ອອກຕາມຈຳນວນທີ່ຂາຍ
                await tx.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity // ຫັກລົບສະຕັອກໂດຍກົງໃນ Database
                        }
                    }
                });
            }

            // ສົ່ງຂໍ້ມູນບິນຫຼັກທີ່ສ້າງສຳເລັດແລ້ວກັບຄືນໄປ
            return order;
        });
    }

    // 2. ດຶງປະຫວັດບິນຂາຍທັງໝົດ (ເອົາໄປເຮັດໜ້າລາຍງານ ຫຼື ປະຫວັດການຂາຍ Backoffice)
    async getAllOrders() {
        return await prisma.order.findMany({
            include: {
                employee: { select: { name: true } }, // ໃຫ້ເຫັນຊື່ພະນັກງານຄົນຂາຍ
                customer: { select: { name: true, phone: true } }, // ໃຫ້ເຫັນຊື່ລູກຄ້າ
                items: {
                    include: {
                        variant: { include: { product: true } } // ໃຫ້ເຫັນວ່າໃນບິນມີສິນຄ້າລຸ້ນໃດແດ່
                    }
                }
            },
            orderBy: { createdAt: "desc" } // ເອົາບິນໃໝ່ລ້າສຸດຂຶ້ນກ່ອນ
        });
    }

    // 3. ດຶງຂໍ້ມູນບິນ 1 ບິນແບບລະອຽດ (ໃຊ້ຕອນກົດປຸ່ມ Re-print ໃບບິນ ຫຼື ກວດສອບຍ້ອນຫຼັງ)
    async getOrderById(id: number) {
        return await prisma.order.findUnique({
            where: { id: id },
            include: {
                employee: { select: { name: true, username: true } },
                customer: true,
                items: {
                    include: {
                        variant: { include: { product: true } },
                        soldItems: {
                            include: { stockItem: true } // 📱 ດຶງເລກ IMEI ທັງໝົດທີ່ຢູ່ໃນບິນນີ້ອອກມາສະແດງໃນໃບບິນ
                        }
                    }
                }
            }
        });
    }

    // 4. ຟັງຊັນຍົກເລີກບິນ (Cancel Order)
    // 💡 ຫຼັກການ: ປ່ຽນສະຖານະເປັນ CANCELLED ເພື່ອບໍ່ໃຫ້ນຳໄປຄຳນວນຍອດຂາຍ ແຕ່ຈະບໍ່ລຶບຖິ້ມ
    async cancelOrder(id: number) {
        return await prisma.order.update({
            where: { id: id },
            data: { status: "CANCELLED" }
        });
    }
}