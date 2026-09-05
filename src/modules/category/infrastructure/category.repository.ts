import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../domain/entities.js";
import type { CategoryRepositoryPort } from "../domain/ports.js";
export class CategoryRepositoryPg implements CategoryRepositoryPort {
  async create(data: CreateCategoryInput): Promise<Category> {
    const { rows } = await pool.query(`INSERT INTO "Category" ("name","tenantId") VALUES ($1,$2) RETURNING *`, [data.name, TenantContext.getOrThrow()]);
    return rows[0];
  }
  async findAll(): Promise<Category[]> {
    const { rows } = await pool.query(`SELECT * FROM "Category" WHERE "tenantId"=$1 ORDER BY "name" ASC`, [TenantContext.getOrThrow()]);
    return rows;
  }
  async findById(id: string): Promise<Category | null> {
    const { rows } = await pool.query(`SELECT * FROM "Category" WHERE "id" = $1 AND "tenantId"=$2`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
  async update(id: string, data: UpdateCategoryInput): Promise<Category | null> {
    if (data.name === undefined) return this.findById(id);
    const { rows } = await pool.query(`UPDATE "Category" SET "name" = $1 WHERE "id" = $2 AND "tenantId"=$3 RETURNING *`, [data.name, id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
  async delete(id: string): Promise<Category | null> {
    const { rows } = await pool.query(`DELETE FROM "Category" WHERE "id" = $1 AND "tenantId"=$2 RETURNING *`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
}
