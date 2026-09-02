import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../domain/entities.js";
import type { CategoryRepositoryPort } from "../domain/ports.js";
export class CategoryRepositoryPg implements CategoryRepositoryPort {
  async create(data: CreateCategoryInput): Promise<Category> {
    const { rows } = await pool.query(`INSERT INTO "Category" ("name") VALUES ($1) RETURNING *`, [data.name]);
    return rows[0];
  }
  async findAll(): Promise<Category[]> {
    const { rows } = await pool.query(`SELECT * FROM "Category" ORDER BY "id" ASC`);
    return rows;
  }
  async findById(id: number): Promise<Category | null> {
    const { rows } = await pool.query(`SELECT * FROM "Category" WHERE "id" = $1`, [id]);
    return rows[0] ?? null;
  }
  async update(id: number, data: UpdateCategoryInput): Promise<Category | null> {
    if (data.name === undefined) return this.findById(id);
    const { rows } = await pool.query(`UPDATE "Category" SET "name" = $1 WHERE "id" = $2 RETURNING *`, [data.name, id]);
    return rows[0] ?? null;
  }
  async delete(id: number): Promise<Category | null> {
    const { rows } = await pool.query(`DELETE FROM "Category" WHERE "id" = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
  }
}
