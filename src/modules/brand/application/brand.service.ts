import { ConflictError, NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { BrandRepositoryPort } from "../domain/ports.js";
import type { CreateBrandInput, UpdateBrandInput } from "../domain/entities.js";

export class BrandService {
  constructor(private readonly repo: BrandRepositoryPort) {}

  async create(data: CreateBrandInput) {
    const existing = await this.repo.findAll();
    if (existing.some((b) => b.name === data.name)) throw new ConflictError("ຊື່ຍີ່ຫໍ້ນີ້ມີຢູ່ແລ້ວ");
    return this.repo.create(data);
  }
  async getAll() {
    return this.repo.findAll();
  }
  async getById(id: number) {
    const brand = await this.repo.findById(id);
    if (!brand) throw new NotFoundError("ບໍ່ພົບຂໍ້ມູນຍີ່ຫໍ້ນີ້");
    return brand;
  }
  async update(id: number, data: UpdateBrandInput) {
    return this.repo.update(id, data);
  }
  async delete(id: number) {
    return this.repo.delete(id);
  }
}
