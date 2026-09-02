import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// 💡 ໃຊ້ຫຼັກການ ແບບທີ 1 ເພື່ອປ້ອງກັນ Error ໂຕທີ່ເຈົ້າຫາກໍເຈີ
const JWT_SECRET = (process.env.JWT_SECRET || "SUPER_SECRET_KEY_123") as string;

// 1. Middleware ສຳລັບກວດສອບວ່າ Login ຫຼື ຫາກໍມີ Token ບໍ
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]; // ແຍກເອົາແຕ່ຕົວ Token ອອກມາ

        // 💡 ກວດສອບຄວາມຖືກຕ້ອງເພື່ອປ້ອງກັນ TypeScript Error (string | undefined)
        if (!token) {
            return res.status(401).json({ success: false, message: "ບໍ່ພົບ Token ຫຼັງ Bearer" });
        }
      
        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Token ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ" });
            }

            // ຝັງຂໍ້ມູນ User ທີ່ແກະລັດສະໝີໄດ້ ເຂົ້າໄປໃນ req.user 
            req.user = decoded; 
            return next(); // ຜ່ານດ່ານໄປຫາ Controller ໄດ້
        });
    } else {
        return res.status(401).json({ success: false, message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ (Missing Token)" });
    }
};

// 2. Middleware ສຳລັບກວດສອບສິດ (Role Authorization)
// ວິທີໃຊ້: authorizeRoles("ADMIN") ຫຼື authorizeRoles("ADMIN", "CASHIER")
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "ບໍ່ພົບຂໍ້ມູນການ Login" });
        }

        // ກວດເຊັກວ່າ Role ຂອງ User ຄົນນີ້ ຕົງກັບສິດທີ່ອະນຸຍາດບໍ
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "ເຈົ້າບໍ່ມີສິດເຂົ້າເຖິງຟັງຊັນນີ້ (Unauthorized)" });
        }

       return next(); // ຜ່ານດ່ານ
    };
};