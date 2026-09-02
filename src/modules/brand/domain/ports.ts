import type { Brand, CreateBrandInput, UpdateBrandInput } from "./entities.js";

export interface BrandRepositoryPort {
  create(data: CreateBrandInput): Promise<Brand>;
  findAll(): Promise<Brand[]>;
  findById(id: number): Promise<Brand | null>;
  update(id: number, data: UpdateBrandInput): Promise<Brand | null>;
  delete(id: number): Promise<Brand | null>;
}
