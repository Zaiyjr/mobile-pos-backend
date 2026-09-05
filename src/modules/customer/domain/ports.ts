import type { Customer, CreateCustomerInput } from "./entities.js";
export interface CustomerRepositoryPort {
  create(data: CreateCustomerInput): Promise<Customer>;
  findByPhone(phone: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  updatePoints(id: string, pointsToAdd: number): Promise<Customer>;
  softDelete(id: string): Promise<Customer>;
}
