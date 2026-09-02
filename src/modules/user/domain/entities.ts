export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  roleId: number;
  role?: { id: number; name: string };
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
}
