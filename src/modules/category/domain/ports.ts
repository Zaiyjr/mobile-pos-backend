import type { Category, CreateCategoryInput, UpdateCategoryInput } from "./entities.js";
export interface CategoryRepositoryPort {
  create(data: CreateCategoryInput): Promise<Category>;
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  update(id: string, data: UpdateCategoryInput): Promise<Category | null>;
  delete(id: string): Promise<Category | null>;
}
