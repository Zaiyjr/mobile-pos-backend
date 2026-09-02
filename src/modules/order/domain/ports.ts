import type { CreateOrderDTO, Order } from "./entities.js";
export interface OrderRepositoryPort {
  create(data: CreateOrderDTO): Promise<Order>;
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  cancel(id: number): Promise<Order | null>;
}
