export interface Order {
  id: string;
  employeeId: string;
  customerId?: string | null;
  totalAmount: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface CreateOrderDTO {
  employeeId: string;
  customerId?: string;
  totalAmount: number;
  items: { variantId: string; quantity: number; priceAtTime: number; stockItemIds: string[] }[];
}
