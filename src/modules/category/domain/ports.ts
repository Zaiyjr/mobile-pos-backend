import type { Category, CreateCategoryInput, UpdateCategoryInput } from "./entities.js";
export interface CategoryRepositoryPort {
  create(data: CreateCategoryInput): Promise<Category>;
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | null>;
  update(id: number, data: UpdateCategoryInput): Promise<Category | null>;
  delete(id: number): Promise<Category | null>;
}
