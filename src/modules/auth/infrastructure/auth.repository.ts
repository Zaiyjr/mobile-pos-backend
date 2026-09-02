import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { AuthRepositoryPort } from "../domain/ports.js";
import type { AuthUser } from "../domain/entities.js";

export class AuthRepositoryPg implements AuthRepositoryPort {
  async register(data: { username: string; password: string; name: string; roleId: number }): Promise<AuthUser> {
    const { rows } = await pool.query(
      `INSERT INTO "User" ("username","password","name","roleId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW()) RETURNING *`,
      [data.username, data.password, data.name, data.roleId]
    );
    return rows[0];
  }
  async findByUsername(username: string): Promise<AuthUser | null> {
    const { rows } = await pool.query(
      `SELECT u.*, row_to_json(r) as role FROM "User" u LEFT JOIN "Role" r ON r."id"=u."roleId" WHERE u."username"=$1 AND u."isDeleted"=false LIMIT 1`,
      [username]
    );
    return rows[0] ?? null;
  }
  async findRoleByName(name: string) {
    const { rows } = await pool.query(`SELECT * FROM "Role" WHERE "name"=$1 LIMIT 1`, [name]);
    return rows[0] ?? null;
  }
}
