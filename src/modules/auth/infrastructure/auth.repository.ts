import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { AuthRepositoryPort } from "../domain/ports.js";
import type { AuthUser } from "../domain/entities.js";

export class AuthRepositoryPg implements AuthRepositoryPort {
  async createUser(data: { id: string; email: string; name: string; roleId: string; tenantId: string }): Promise<AuthUser> {
    const { rows } = await pool.query(
      `INSERT INTO "User" ("id","email","name","roleId","tenantId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
      [data.id, data.email, data.name, data.roleId, data.tenantId]
    );
    return rows[0];
  }
  async findByEmail(email: string): Promise<AuthUser | null> {
    const { rows } = await pool.query(
      `SELECT u.*, row_to_json(r) as role FROM "User" u LEFT JOIN "Role" r ON r."id"=u."roleId" WHERE u."email"=$1 AND u."isDeleted"=false LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  }
  async findById(id: string): Promise<AuthUser | null> {
    const { rows } = await pool.query(
      `SELECT u.*, row_to_json(r) as role FROM "User" u LEFT JOIN "Role" r ON r."id"=u."roleId" WHERE u."id"=$1 AND u."isDeleted"=false LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  }
  async findRoleByName(name: string) {
    const { rows } = await pool.query(`SELECT * FROM "Role" WHERE "name"=$1 LIMIT 1`, [name]);
    return rows[0] ?? null;
  }
}
