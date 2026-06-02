import { AuthRepo } from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRepo = new AuthRepo();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_123";

interface RegisterInput {
    username: string;
    password: string;
    name: string;
    roleId?: number;
}

export class AuthService {
    // 1. ສະໝັກບັນຊີຜູ້ໃຊ້ໃໝ່ ໂດຍ default ເປັນ USER
    async register(data: RegisterInput) {
        const existingUser = await authRepo.login(data.username)
        if(existingUser){
            throw new Error("ຊື່ຜູ້ໃຊ້ນີ້ແລ້ວມີໃນລະບົບ");
        }

        const defaultRole = await authRepo.getRoleByName("USER");
        const fallbackRole = await authRepo.getRoleByName("CASHIER");
        const resolvedRoleId = data.roleId || defaultRole?.id || fallbackRole?.id;

        if (!resolvedRoleId) {
            throw new Error("ບໍ່ພົບ role ສຳລັບການສະໝັກບັນຊີ");
        }
    
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await authRepo.register({
            username: data.username,
            name: data.name,
            password: hashedPassword,
            role: {
                connect: {
                    id: resolvedRoleId
                }
            }
        });
    }

    // 2. ເຂົ້າສູ່ລະບົບ (Login)
    async login(username: string, password: string) {
        // ຄົ້ນຫາ User ຈາກ Repo ທີ່ເຮົາຂຽນໃຫ້ include Role ມາພ້ອມ
        const user = await authRepo.login(username);
        if (!user) {
            throw new Error("ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
        }
        // ກວດສອບ Password ທີ່ User ໃສ່ມາກັບ Password ທີ່ເຮົາເກັບໄວ້ໃນ DB
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            throw new Error("ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
        }
        

      

        // ສ້າງ JWT Token ໂດຍຝັງ ID, Username ແລະ ຊື່ Role ໄປນຳ
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role.name
            },
            JWT_SECRET!,
            { expiresIn: "8h" } // Token ມີອາຍຸ 1 ມື້
        );

        // ສົ່ງຂໍ້ມູນ User ແລະ Token ກັບໄປ (ແຕ່ບໍ່ສົ່ງ password ໄປ)
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token
        };
    }
}
