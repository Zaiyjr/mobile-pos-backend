import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "../domain/entities.js";
import type { BrandRepositoryPort } from "../domain/ports.js";

export class BrandRepositoryPg implements BrandRepositoryPort {
  async create(data: CreateBrandInput): Promise<Brand> {
    const { rows } = await pool.query(`INSERT INTO "Brand" ("name") VALUES ($1) RETURNING *`, [data.name]);
    return rows[0];
  }
  async findAll(): Promise<Brand[]> {
    const { rows } = await pool.query(`SELECT * FROM "Brand" ORDER BY "id" ASC`);
    return rows;
  }
  async findById(id: number): Promise<Brand | null> {
    const { rows } = await pool.query(`SELECT * FROM "Brand" WHERE "id" = $1`, [id]);
    return rows[0] ?? null;
  }
  async update(id: number, data: UpdateBrandInput): Promise<Brand | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (data.name !== undefined) {
      fields.push(`"name" = $${idx++}`);
      values.push(data.name);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    const { rows } = await pool.query(`UPDATE "Brand" SET ${fields.join(", ")} WHERE "id" = $${idx} RETURNING *`, values);
    return rows[0] ?? null;
  }
  async delete(id: number): Promise<Brand | null> {
    const { rows } = await pool.query(`DELETE FROM "Brand" WHERE "id" = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
  }
}
