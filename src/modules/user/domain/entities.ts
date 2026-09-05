export interface User {
  id: string; // == auth.users.id (Supabase Auth owns credentials)
  email: string;
  name: string;
  roleId: string;
  role?: { id: string; name: string };
  tenantId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
}

