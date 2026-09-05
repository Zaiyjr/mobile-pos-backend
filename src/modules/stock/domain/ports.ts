import type { StockItem } from "./entities.js";
export interface StockRepositoryPort {
  add(data: { variantId: string; serialNumber: string; status?: string }): Promise<StockItem>;
  findAvailableBySerial(serialNumber: string): Promise<StockItem | null>;
  updateStatus(id: string, status: string): Promise<StockItem | null>;
}
