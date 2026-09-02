import { ValidationError, NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { OrderRepositoryPort } from "../domain/ports.js";
import type { CreateOrderDTO } from "../domain/entities.js";
export class OrderService {
  constructor(private readonly repo: OrderRepositoryPort) {}
  async checkout(data: CreateOrderDTO) {
    if (!data.items?.length) throw new ValidationError("ບໍ່ສາມາດປິດບິນໄດ້ ເພາະບໍ່ມີລາຍການສິນຄ້າໃນຕະກ້າ");
    return this.repo.create(data);
  }
  getAll() { return this.repo.findAll(); }
  async getById(id: number) {
    const o = await this.repo.findById(id);
    if (!o) throw new NotFoundError("ບໍ່ພົບບິນຂາຍນີ້ໃນລະບົບ");
    return o;
  }
  cancel(id: number) { return this.repo.cancel(id); }
}
