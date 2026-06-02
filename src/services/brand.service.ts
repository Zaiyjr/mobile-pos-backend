import { BrandRepo } from "../repositories/brand.repository.js";
import { Prisma } from "@prisma/client";

const brandRepo = new BrandRepo();

export class BrandService {
    async create(data: Prisma.BrandCreateInput) {
        const existingBrand = await brandRepo.getAllBrand();
        const isDuplicate = existingBrand.some((brand) => brand.name === data.name);
        if (isDuplicate) throw new Error("ຊື່ຍີ່ຫໍ້ນີ້ມີຢູ່ແລ້ວ");
        return await brandRepo.createBrand(data);
    }

    async getAll() {
        return await brandRepo.getAllBrand();
    }

    async getById(id: number) {
        const brand = await brandRepo.getOneBrand(id);
        if (!brand) throw new Error("ບໍ່ພົບຂໍ້ມູນຍີ່ຫໍ້ນີ້");
        return brand;
    }

    async update(id: number, data: Prisma.BrandUpdateInput) {
        return await brandRepo.updateBrand(id, data);
    }

    async delete(id: number) {
        return await brandRepo.deleteBrand(id);
    }
}