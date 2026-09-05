import type { CategoryRepositoryPort } from "../domain/ports.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "../domain/entities.js";
export class CategoryService {
  constructor(private readonly repo: CategoryRepositoryPort) {}
  create(data: CreateCategoryInput) { return this.repo.create(data); }
  getAll() { return this.repo.findAll(); }
  getOne(id: string) { return this.repo.findById(id); }
  update(id: string, data: UpdateCategoryInput) { return this.repo.update(id, data); }
  delete(id: string) { return this.repo.delete(id); }
}
