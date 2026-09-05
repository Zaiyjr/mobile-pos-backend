import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../../shared/domain/errors/AppError.js";
import { env } from "../../../shared/config/env.js";
import type { AuthRepositoryPort } from "../domain/ports.js";

export class AuthService {
  constructor(private readonly repo: AuthRepositoryPort) {}

  async register(data: { username: string; password: string; name: string; roleId?: number }) {
    const existing = await this.repo.findByUsername(data.username);
    if (existing) throw new ConflictError("ຊື່ຜູ້ໃຊ້ນີ້ແລ້ວມີໃນລະບົບ");
    const defaultRole = await this.repo.findRoleByName("USER");
    const fallback = await this.repo.findRoleByName("CASHIER");
    const roleId = data.roleId || defaultRole?.id || fallback?.id;
    if (!roleId) throw new NotFoundError("ບໍ່ພົບ role ສຳລັບການສະໝັກບັນຊີ");
    const hashed = await bcrypt.hash(data.password, 10);
    return this.repo.register({ username: data.username, name: data.name, password: hashed, roleId });
  }

  async login(username: string, password: string) {
    const user = await this.repo.findByUsername(username);
    if (!user) throw new UnauthorizedError("ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedError("ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role.name, tenantId: user.tenantId }, env.jwtSecret, { expiresIn: "8h" });
    const { password: _, ...withoutPass } = user as unknown as Record<string, unknown>;
    return { user: withoutPass, token };
  }
}
