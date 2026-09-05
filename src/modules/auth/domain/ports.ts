import type { AuthUser } from "./entities.js";

export interface AuthRepositoryPort {
  createUser(data: { id: string; email: string; name: string; roleId: string; tenantId: string }): Promise<AuthUser>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  findRoleByName(name: string): Promise<{ id: string; name: string } | null>;
}
