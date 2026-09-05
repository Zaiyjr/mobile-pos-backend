import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../domain/entities.js";
import type { BrandRepositoryPort } from "../domain/ports.js";

export class BrandRepositoryPg implements BrandRepositoryPort {
  async create(data: CreateBrandInput): Promise<Brand> {
    const { rows } = await pool.query(`INSERT INTO "Brand" ("name","tenantId") VALUES ($1,$2) RETURNING *`, [data.name, TenantContext.getOrThrow()]);
    return rows[0];
  }
  async findAll(): Promise<Brand[]> {
    const { rows } = await pool.query(`SELECT * FROM "Brand" WHERE "tenantId"=$1 ORDER BY "name" ASC`, [TenantContext.getOrThrow()]);
    return rows;
  }
  async findById(id: string): Promise<Brand | null> {
    const { rows } = await pool.query(`SELECT * FROM "Brand" WHERE "id" = $1 AND "tenantId"=$2`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
  async update(id: string, data: UpdateBrandInput): Promise<Brand | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (data.name !== undefined) {
      fields.push(`"name" = $${idx++}`);
      values.push(data.name);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    values.push(TenantContext.getOrThrow());
    const { rows } = await pool.query(`UPDATE "Brand" SET ${fields.join(", ")} WHERE "id" = $${idx} AND "tenantId" = $${idx + 1} RETURNING *`, values);
    return rows[0] ?? null;
  }
  async delete(id: string): Promise<Brand | null> {
    const { rows } = await pool.query(`DELETE FROM "Brand" WHERE "id" = $1 AND "tenantId"=$2 RETURNING *`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
}
