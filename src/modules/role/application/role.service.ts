import type { RoleRepositoryPort } from "../domain/ports.js";
export class RoleService {
  constructor(private readonly repo: RoleRepositoryPort) {}
  async create(data: { name: string }) {
    if (!data.name) throw new Error("ກະລຸນາໃສ່ຊື່ Role!");
    const name = data.name.toUpperCase().trim();
    return this.repo.create({ name });
  }
  getAll() { return this.repo.findAll(); }
  getById(id: number) { return this.repo.findById(id); }
  async update(id: number, data: { name?: string }) {
    if (data.name) data.name = data.name.toUpperCase().trim();
    return this.repo.update(id, data);
  }
  delete(id: number) { return this.repo.delete(id); }
}
