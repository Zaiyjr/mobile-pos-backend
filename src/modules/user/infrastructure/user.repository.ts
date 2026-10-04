import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { User } from "../domain/entities.js";
import type { UserRepositoryPort } from "../domain/ports.js";
export class UserRepositoryPg implements UserRepositoryPort {
  async findAll(): Promise<User[]> {
    const { rows } = await pool.query(
      `SELECT u.*, row_to_json(r) as role FROM "User" u LEFT JOIN "Role" r ON r."id"=u."roleId" WHERE u."isDeleted"=false AND u."tenantId"=$1 ORDER BY u."createdAt" DESC`,
      [TenantContext.getOrThrow()]
    );
    return rows;
  }
  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query(
      `SELECT u.*, row_to_json(r) as role FROM "User" u LEFT JOIN "Role" r ON r."id"=u."roleId" WHERE u."id"=$1 AND u."isDeleted"=false AND u."tenantId"=$2 LIMIT 1`,
      [id, TenantContext.getOrThrow()]
    );
    return rows[0] ?? null;
  }
  async update(id: string, data: Record<string, unknown>): Promise<User | null> {
    const allowed = ["email", "name", "roleId"] as const;
    const tenantId = TenantContext.getOrThrow();
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const k of allowed) if (data[k] !== undefined) { fields.push(`"${k}"=$${idx++}`); values.push(data[k]); }
    fields.push(`"updatedAt"=NOW()`);
    if (fields.length === 1) return this.findById(id);
    values.push(id);
    values.push(tenantId);
    const { rows } = await pool.query(`UPDATE "User" SET ${fields.join(", ")} WHERE "id"=$${idx} AND "tenantId"=$${idx + 1} RETURNING *`, values);
    if (!rows[0]) return null;
    const { rows: withRole } = await pool.query(`SELECT u.*, row_to_json(r) as role FROM "User" u LEFT JOIN "Role" r ON r."id"=u."roleId" WHERE u."id"=$1 AND u."tenantId"=$2`, [id, tenantId]);
    return withRole[0];
  }
  async softDelete(id: string): Promise<User | null> {
    const { rows } = await pool.query(`UPDATE "User" SET "isDeleted"=true,"deletedAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1 AND "tenantId"=$2 RETURNING *`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
}
