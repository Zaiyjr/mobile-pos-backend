import type { AuthUser } from "./entities.js";

export interface AuthRepositoryPort {
  register(data: { username: string; password: string; name: string; roleId: number }): Promise<AuthUser>;
  findByUsername(username: string): Promise<AuthUser | null>;
  findRoleByName(name: string): Promise<{ id: number; name: string } | null>;
}
