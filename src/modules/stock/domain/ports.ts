import type { StockItem } from "./entities.js";
export interface StockRepositoryPort {
  add(data: { variantId: number; serialNumber: string; status?: string }): Promise<StockItem>;
  findAvailableBySerial(serialNumber: string): Promise<StockItem | null>;
  updateStatus(id: number, status: string): Promise<StockItem | null>;
}
