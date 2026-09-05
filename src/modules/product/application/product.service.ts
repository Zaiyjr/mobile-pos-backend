import { NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { ProductRepositoryPort } from "../domain/ports.js";
export class ProductService {
  constructor(private readonly repo: ProductRepositoryPort) {}
  create(data: Record<string, unknown>) { return this.repo.create(data); }
  getAll() { return this.repo.findAll(); }
  async getById(id: string) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundError("ບໍ່ພົບສິນຄ້ານີ້ໃນລະບົບ");
    return p;
  }
  update(id: string, data: Record<string, unknown>) { return this.repo.update(id, data); }
  delete(id: string) { return this.repo.softDelete(id); }
}
