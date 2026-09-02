import { NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { CustomerRepositoryPort } from "../domain/ports.js";
import type { CreateCustomerInput } from "../domain/entities.js";
export class CustomerService {
  constructor(private readonly repo: CustomerRepositoryPort) {}
  create(data: CreateCustomerInput) { return this.repo.create(data); }
  async getByPhone(phone: string) {
    const c = await this.repo.findByPhone(phone);
    if (!c) throw new NotFoundError("ບໍ່ພົບເບີໂທສະມາຊິກນີ້");
    return c;
  }
  getAll() { return this.repo.findAll(); }
  addPoints(id: number, points: number) { return this.repo.updatePoints(id, points); }
  delete(id: number) { return this.repo.softDelete(id); }
}
