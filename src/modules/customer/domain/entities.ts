export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
}
export type CreateCustomerInput = { name: string; phone: string; points?: number };
