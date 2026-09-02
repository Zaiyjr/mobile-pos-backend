import bcrypt from "bcrypt";
import { NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { UserRepositoryPort } from "../domain/ports.js";
export class UserService {
  constructor(private readonly repo: UserRepositoryPort) {}
  getAll() { return this.repo.findAll(); }
  async getById(id: number) {
    const u = await this.repo.findById(id);
    if (!u) throw new NotFoundError("ບໍ່ພົບຂໍ້ມູນພະນັກງານຄົນນີ້");
    return u;
  }
  async update(id: number, data: Record<string, unknown>) {
    if (data.password && typeof data.password === "string") data.password = await bcrypt.hash(data.password as string, 10);
    return this.repo.update(id, data);
  }
  delete(id: number) { return this.repo.softDelete(id); }
}
