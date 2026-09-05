import { NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { UserRepositoryPort } from "../domain/ports.js";
export class UserService {
  constructor(private readonly repo: UserRepositoryPort) {}
  getAll() { return this.repo.findAll(); }
  async getById(id: string) {
    const u = await this.repo.findById(id);
    if (!u) throw new NotFoundError("ບໍ່ພົບຂໍ້ມູນພະນັກງານຄົນນີ້");
    return u;
  }
  // Passwords are owned by Supabase Auth; profile updates never touch them.
  update(id: string, data: Record<string, unknown>) { return this.repo.update(id, data); }
  delete(id: string) { return this.repo.softDelete(id); }
}
