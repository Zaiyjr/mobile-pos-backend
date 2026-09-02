export interface AuthUser {
  id: number;
  username: string;
  password: string;
  name: string;
  roleId: number;
  role: { id: number; name: string };
}
