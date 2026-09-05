import type { Product } from "./entities.js";
export interface ProductRepositoryPort {
  create(data: Record<string, unknown>): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(id: string, data: Record<string, unknown>): Promise<Product | null>;
  softDelete(id: string): Promise<Product | null>;
}
