import type { Customer, CreateCustomerInput } from "./entities.js";
export interface CustomerRepositoryPort {
  create(data: CreateCustomerInput): Promise<Customer>;
  findByPhone(phone: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  updatePoints(id: number, pointsToAdd: number): Promise<Customer>;
  softDelete(id: number): Promise<Customer>;
}
