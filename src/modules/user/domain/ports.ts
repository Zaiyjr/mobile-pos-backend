import type { User } from "./entities.js";
export interface UserRepositoryPort {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  update(id: number, data: Record<string, unknown>): Promise<User | null>;
  softDelete(id: number): Promise<User | null>;
}
