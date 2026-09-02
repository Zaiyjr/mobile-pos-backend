export interface Order {
  id: number;
  employeeId: number;
  customerId?: number | null;
  totalAmount: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateOrderDTO {
  employeeId: number;
  customerId?: number;
  totalAmount: number;
  items: { variantId: number; quantity: number; priceAtTime: number; stockItemIds: number[] }[];
}
