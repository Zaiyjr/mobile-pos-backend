import { NotFoundError } from "../../../shared/domain/errors/AppError.js";
import type { StockRepositoryPort } from "../domain/ports.js";
export class StockService {
  constructor(private readonly repo: StockRepositoryPort) {}
  addIMEI(data: { variantId: string; serialNumber: string; status?: string }) { return this.repo.add(data); }
  async checkIMEI(serialNumber: string) {
    const item = await this.repo.findAvailableBySerial(serialNumber);
    if (!item) throw new NotFoundError("ເລກ IMEI ນີ້ບໍ່ມີໃນລະບົບ ຫຼື ຖືກຂາຍອອກໄປແລ້ວ");
    return item;
  }
  updateStatus(id: string, status: string) { return this.repo.updateStatus(id, status); }
}
