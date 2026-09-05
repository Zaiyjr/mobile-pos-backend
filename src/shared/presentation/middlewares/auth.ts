import type { Request, Response, NextFunction } from "express";
import { getSupabase } from "../../infrastructure/database/supabase.js";
import { TenantContext } from "../../infrastructure/context/tenant-context.js";
import { AuthRepositoryPg } from "../../../modules/auth/infrastructure/auth.repository.js";

// Augment Express Request locally to avoid TS6 global-augmentation issues on Vercel
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

// Profile lookups for the authenticated Supabase user (no DI container yet).
const profileRepo = new AuthRepositoryPg();

// 1. Middleware ສຳລັບກວດສອບວ່າ Login ຫຼື ຫາກໍມີ Token ບໍ
//    The Bearer token is a Supabase Auth access token; we re-validate it with
//    supabase.auth.getUser(token), then load our profile row to obtain role +
//    tenantId (Supabase JWTs carry neither).
export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ (Missing Token)" });
  }

  const token = authHeader.split(" ")[1]; // ແຍກເອົາແຕ່ຕົວ Token ອອກມາ
  if (!token) {
    return res.status(401).json({ success: false, message: "ບໍ່ພົບ Token ຫຼັງ Bearer" });
  }

  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) {
    return res.status(403).json({ success: false, message: "Token ໝົດອາຍຸ ຫຼື ບໍ່ຖືກຕ້ອງ" });
  }

  const profile = await profileRepo.findById(data.user.id);
  if (!profile || !profile.role) {
    return res.status(403).json({ success: false, message: "ບໍ່ພົບໂປຣໄຟລ໌ຜູ້ໃຊ້ໃນລະບົບ" });
  }

  // Multi-tenancy: every authenticated request MUST carry a tenantId.
  if (!profile.tenantId) {
    return res.status(403).json({ success: false, message: "Token ບໍ່ມີ tenantId (tenant required)" });
  }

  (req as AuthRequest).user = {
    userId: profile.id,
    email: profile.email,
    role: profile.role.name,
    tenantId: profile.tenantId,
  };

  // Run the rest of the chain within this tenant's context so every
  // downstream repository query is scoped to it (see TenantContext).
  return TenantContext.run(profile.tenantId, () => next());
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
