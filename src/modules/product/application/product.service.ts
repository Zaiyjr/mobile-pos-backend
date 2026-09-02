import { NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { ProductRepositoryPort } from "../domain/ports.js";
export class ProductService {
  constructor(private readonly repo: ProductRepositoryPort) {}
  create(data: Record<string, unknown>) { return this.repo.create(data); }
  getAll() { return this.repo.findAll(); }
  async getById(id: number) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundError("ບໍ່ພົບສິນຄ້ານີ້ໃນລະບົບ");
    return p;
  }
  update(id: number, data: Record<string, unknown>) { return this.repo.update(id, data); }
  delete(id: number) { return this.repo.softDelete(id); }
}
