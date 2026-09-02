import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { Customer, CreateCustomerInput } from "../domain/entities.js";
import type { CustomerRepositoryPort } from "../domain/ports.js";
export class CustomerRepositoryPg implements CustomerRepositoryPort {
  async create(data: CreateCustomerInput): Promise<Customer> {
    const { rows } = await pool.query(
      `INSERT INTO "Customer" ("name","phone","points","createdAt","updatedAt") VALUES ($1,$2,$3,NOW(),NOW()) RETURNING *`,
      [data.name, data.phone, data.points ?? 0]
    );
    return rows[0];
  }
  async findByPhone(phone: string): Promise<Customer | null> {
    const { rows } = await pool.query(`SELECT * FROM "Customer" WHERE "phone"=$1 AND "isDeleted"=false LIMIT 1`, [phone]);
    return rows[0] ?? null;
  }
  async findAll(): Promise<Customer[]> {
    const { rows } = await pool.query(`SELECT * FROM "Customer" WHERE "isDeleted"=false ORDER BY "createdAt" DESC`);
    return rows;
  }
  async updatePoints(id: number, pointsToAdd: number): Promise<Customer> {
    const { rows } = await pool.query(`UPDATE "Customer" SET "points"="points"+$1,"updatedAt"=NOW() WHERE "id"=$2 RETURNING *`, [pointsToAdd, id]);
    return rows[0];
  }
  async softDelete(id: number): Promise<Customer> {
    const { rows } = await pool.query(`UPDATE "Customer" SET "isDeleted"=true,"deletedAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1 RETURNING *`, [id]);
    return rows[0];
  }
}
