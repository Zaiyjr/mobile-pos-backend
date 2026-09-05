import type { CreateOrderDTO, Order } from "./entities.js";
export interface OrderRepositoryPort {
  create(data: CreateOrderDTO): Promise<Order>;
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  cancel(id: string): Promise<Order | null>;
}
