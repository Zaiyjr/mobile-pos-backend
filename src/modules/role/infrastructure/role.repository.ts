import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { Role, CreateRoleInput, UpdateRoleInput } from "../domain/entities.js";
import type { RoleRepositoryPort } from "../domain/ports.js";
export class RoleRepositoryPg implements RoleRepositoryPort {
  async create(data: CreateRoleInput): Promise<Role> {
    const { rows } = await pool.query(`INSERT INTO "Role" ("name") VALUES ($1) RETURNING *`, [data.name]);
    return rows[0];
  }
  async findAll(): Promise<Role[]> {
    const { rows } = await pool.query(`SELECT * FROM "Role" ORDER BY "id" ASC`);
    return rows;
  }
  async findById(id: number): Promise<Role | null> {
    const { rows } = await pool.query(`SELECT * FROM "Role" WHERE "id" = $1`, [id]);
    return rows[0] ?? null;
  }
  async update(id: number, data: UpdateRoleInput): Promise<Role | null> {
    if (!data.name) return this.findById(id);
    const { rows } = await pool.query(`UPDATE "Role" SET "name" = $1 WHERE "id" = $2 RETURNING *`, [data.name, id]);
    return rows[0] ?? null;
  }
  async delete(id: number): Promise<Role | null> {
    const { rows } = await pool.query(`DELETE FROM "Role" WHERE "id" = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
  }
}
