import prisma from "../config/prisma.js";
import { Prisma } from "@prisma/client";

export class UserRepo {
    
    // 1. ດຶງລາຍຊື່ພະນັກງານທັງໝົດ (ເອົາໄປສະແດງເປັນຕາຕະລາງຢູ່ໜ້າ Admin Dashboard)
    async getAllUsers() {
        return await prisma.user.findMany({
            where: {
                isDeleted: false // 📱 ເອົາສະເພາະພະນັກງານທີ່ຍັງເຮັດວຽກຢູ່ (ບໍ່ຖືກ Soft Delete)
            },
            include: {
                role: true // ດຶງ Object ຂອງ Role { id, name } ອອກມາສະແດງຊື່ຕຳແໜ່ງນຳ
            },
            orderBy: {
                createdAt: "desc" // ເອົາພະນັກງານທີ່ເຂົ້າໃໝ່ຂຶ້ນກ່ອນ
            }
        });
    }

    // 2. ດຶງຂໍ້ມູນພະນັກງານລະອຽດ 1 ຄົນດ້ວຍ ID
    async getUserById(id: number) {
        return await prisma.user.findFirst({
            where: {
                id: id,
                isDeleted: false // ຕ້ອງເປັນຄົນທີ່ຍັງບໍ່ຖືກລຶບເທົ່ານັ້ນ
            },
            include: {
                role: true
            }
        });
    }

    // 3. ແກ້ໄຂຂໍ້ມູນພະນັກງານ (ເຊັ່ນ: ປ່ຽນຊື່, ປ່ຽນລະຫັດຜ່ານ ຫຼື Admin ກົດປ່ຽນ Role)
    // 💡 ໃຊ້ UncheckedUpdateInput ເພື່ອໃຫ້ສາມາດສົ່ງ roleId ເປັນຕົວເລກມາອັບເດດໄດ້ໂດຍກົງ
    async updateUser(id: number, data: Prisma.UserUncheckedUpdateInput) {
        return await prisma.user.update({
            where: { id: id },
            data: data,
            include: {
                role: true // ອັບເດດແລ້ວໃຫ້ສົ່ງຂໍ້ມູນພ້ອມ Role ກັບຄືນໄປຫາ Service
            }
        });
    }

    // 4. ລົບພະນັກງານ (ແບບ Soft Delete)
    // 💡 ຫ້າມໃຊ້ prisma.user.delete ເດັດຂາດ ເພາະຈະເຮັດໃຫ້ບິນເກົ່າທີ່ພະນັກງານຄົນນີ້ເຄີຍຂາຍພັງ
    async deleteUser(id: number) {
        return await prisma.user.update({
            where: { id: id },
            data: {
                isDeleted: true,
                deletedAt: new Date() // ບັນທຶກເວລາທີ່ກົດລຶບໄວ້ກວດສອບ
            }
        });
    }
}