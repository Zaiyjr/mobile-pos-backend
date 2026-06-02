import { CategoryRepo } from "../repositories/category.repository.js";
import { Prisma } from "@prisma/client";

const categoryRepo = new CategoryRepo();

export class CategoryService {
    // ຮັບໜ້າທີ່ສົ່ງຂໍ້ມູນຕໍ່ໃຫ້ Repo ບັນທຶກ
    async create(data: Prisma.CategoryCreateInput) {
        // ໃນອະນາຄົດ ຖ້າມີການກວດສອບວ່າ "ຊື່ໝວດໝູ່ຊ້ຳກັນບໍ" ຈະມາຂຽນຢູ່ Layer ນີ້
        return await categoryRepo.createCategory(data);
    }

    async getAll() {
        return await categoryRepo.getAllCategory();
    }

    async getOne(id:number) {
        return await categoryRepo.getOneCategory(id);
    }

    async update(id: number, data: Prisma.CategoryUpdateInput) {
        return await categoryRepo.updateCategory(id, data);
    }

    async delete(id: number) {
        return await categoryRepo.deleteCategory(id);
    }
}