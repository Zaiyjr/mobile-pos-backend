import type { Brand, CreateBrandInput, UpdateBrandInput } from "./entities.js";

export interface BrandRepositoryPort {
  create(data: CreateBrandInput): Promise<Brand>;
  findAll(): Promise<Brand[]>;
  findById(id: string): Promise<Brand | null>;
  update(id: string, data: UpdateBrandInput): Promise<Brand | null>;
  delete(id: string): Promise<Brand | null>;
}
