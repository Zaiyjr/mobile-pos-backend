import { UserRepo } from "../repositories/user.repository.js";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const userRepo = new UserRepo();

export class UserService {
    async getAll() {
        return await userRepo.getAllUsers();
    }

    async getById(id: number) {
        const user = await userRepo.getUserById(id);
        if (!user) throw new Error("ບໍ່ພົບຂໍ້ມູນພະນັກງານຄົນນີ້");
        return user;
    }

    async update(id: number, data: Prisma.UserUncheckedUpdateInput) {
        // ຖ້າມີການປ່ຽນລະຫັດຜ່ານໃໝ່ ໃຫ້ເຂົ້າລະຫັດກ່ອນອັບເດດ
        if (data.password && typeof data.password === "string") {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return await userRepo.updateUser(id, data);
    }

    async delete(id: number) {
        return await userRepo.deleteUser(id);
    }
}