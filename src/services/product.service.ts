import { ProductRepo } from "../repositories/product.repository.js";
import { Prisma } from "@prisma/client";

const productRepo = new ProductRepo();

export class ProductService {
    async create(data: Prisma.ProductUncheckedCreateInput) {
        return await productRepo.createProduct(data)
         
    }

    async getAll() {
        return await productRepo.getAllProducts();
    }

    async getById(id: number) {
        const product = await productRepo.getOneProduct(id);
        if (!product) throw new Error("ບໍ່ພົບສິນຄ້ານີ້ໃນລະບົບ");
        return product;
    }

    async update(id: number, data: Prisma.ProductUncheckedUpdateInput) {
        return await productRepo.updateProduct(id, data);
    }

    async delete(id: number) {
        return await productRepo.deleteProduct(id);
    }
}