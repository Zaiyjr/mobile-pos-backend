import { CustomerRepo } from "../repositories/customer.repository.js";
import { Prisma } from "@prisma/client";

const customerRepo = new CustomerRepo();

export class CustomerService {
    async create(data: Prisma.CustomerCreateInput) {
        return await customerRepo.createCustomer(data);
    }

    async getByPhone(phone: string) {
        const customer = await customerRepo.findByPhone(phone);
        if (!customer) throw new Error("ບໍ່ພົບເບີໂທສະມາຊິກນີ້");
        return customer;
    }

    async getAll() {
        return await customerRepo.getAllCustomers();
    }

    async addPoints(id: number, points: number) {
        return await customerRepo.updatePoints(id, points);
    }

    async delete(id: number) {
        return await customerRepo.deleteCustomer(id);
    }
}