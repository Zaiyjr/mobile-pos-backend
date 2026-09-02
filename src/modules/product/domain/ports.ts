import type { Product } from "./entities.js";
export interface ProductRepositoryPort {
  create(data: Record<string, unknown>): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  update(id: number, data: Record<string, unknown>): Promise<Product | null>;
  softDelete(id: number): Promise<Product | null>;
}
