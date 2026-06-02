import { OrderRepo } from "../repositories/order.repository.js";
import type{ CreateOrderDTO } from "../dtos/dtos.js";

const orderRepo = new OrderRepo();

export class OrderService {
    async checkout(data: CreateOrderDTO) {
        if (!data.items || data.items.length === 0) {
            throw new Error("ບໍ່ສາມາດປິດບິນໄດ້ ເພາະບໍ່ມີລາຍການສິນຄ້າໃນຕະກ້າ");
        }
        // ສົ່ງຕໍ່ໃຫ້ Repo ໄປລັນ $transaction ຫັກສະຕັອກ ແລະ ປ່ຽນສະຖານະ IMEI
        return await orderRepo.createOrder(data);
    }

    async getAll() {
        return await orderRepo.getAllOrders();
    }

    async getById(id: number) {
        const order = await orderRepo.getOrderById(id);
        if (!order) throw new Error("ບໍ່ພົບບິນຂາຍນີ້ໃນລະບົບ");
        return order;
    }

    async cancel(id: number) {
        return await orderRepo.cancelOrder(id);
    }
}