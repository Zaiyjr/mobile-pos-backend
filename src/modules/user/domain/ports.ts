import type { User } from "./entities.js";
export interface UserRepositoryPort {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Record<string, unknown>): Promise<User | null>;
  softDelete(id: string): Promise<User | null>;
}
