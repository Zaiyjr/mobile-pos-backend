import type { Role, CreateRoleInput, UpdateRoleInput } from "./entities.js";
export interface RoleRepositoryPort {
  create(data: CreateRoleInput): Promise<Role>;
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  update(id: string, data: UpdateRoleInput): Promise<Role | null>;
  delete(id: string): Promise<Role | null>;
}
