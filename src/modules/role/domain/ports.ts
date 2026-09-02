import type { Role, CreateRoleInput, UpdateRoleInput } from "./entities.js";
export interface RoleRepositoryPort {
  create(data: CreateRoleInput): Promise<Role>;
  findAll(): Promise<Role[]>;
  findById(id: number): Promise<Role | null>;
  update(id: number, data: UpdateRoleInput): Promise<Role | null>;
  delete(id: number): Promise<Role | null>;
}
