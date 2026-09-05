import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { TenantContext } from "../../infrastructure/context/tenant-context.js";

// Augment Express Request locally to avoid TS6 global-augmentation issues on Vercel
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
    tenantId: number;
  };
}

// JWT secret is read fail-fast from env (no insecure fallback).

// 1. Middleware ສຳລັບກວດສອບວ່າ Login ຫຼື ຫາກໍມີ Token ບໍ
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1]; // ແຍກເອົາແຕ່ຕົວ Token ອອກມາ

        // 💡 ກວດສອບຄວາມຖືກຕ້ອງເພື່ອປ້ອງກັນ TypeScript Error (string | undefined)
        if (!token) {
            return res.status(401).json({ success: false, message: "ບໍ່ພົບ Token ຫຼັງ Bearer" });
        }
      
        jwt.verify(token, env.jwtSecret, (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ success: false, message: "Token ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ" });
            }

            // Multi-tenancy: every authenticated request MUST carry a tenantId.
            if (typeof decoded?.tenantId !== "number") {
                return res.status(403).json({ success: false, message: "Token ບໍ່ມີ tenantId (tenant required)" });
            }

            // ຝັງຂໍ້ມູນ User ທີ່ແກະລັດສະໝີໄດ້ ເຂົ້າໄປໃນ req.user
            (req as AuthRequest).user = decoded as AuthRequest["user"];

            // Run the rest of the chain within this tenant's context so every
            // downstream repository query is scoped to it (see TenantContext).
            return TenantContext.run(decoded.tenantId as number, () => next());
        });
    } else {
        return res.status(401).json({ success: false, message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ (Missing Token)" });
    }
};

// 2. Middleware ສຳລັບກວດສອບສິດ (Role Authorization)
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "ບໍ່ພົບຂໍ້ມູນການ Login" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "ເຈົ້າບໍ່ມີສິດເຂົ້າເຖິງຟັງຊັນນີ້ (Unauthorized)" });
        }

       return next(); // ຜ່ານດ່ານ
    };
};