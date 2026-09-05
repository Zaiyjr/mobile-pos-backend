import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { Customer, CreateCustomerInput } from "../domain/entities.js";
import type { CustomerRepositoryPort } from "../domain/ports.js";
export class CustomerRepositoryPg implements CustomerRepositoryPort {
  async create(data: CreateCustomerInput): Promise<Customer> {
    const { rows } = await pool.query(
      `INSERT INTO "Customer" ("name","phone","points","tenantId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW()) RETURNING *`,
      [data.name, data.phone, data.points ?? 0, TenantContext.getOrThrow()]
    );
    return rows[0];
  }
  async findByPhone(phone: string): Promise<Customer | null> {
    const { rows } = await pool.query(`SELECT * FROM "Customer" WHERE "phone"=$1 AND "isDeleted"=false AND "tenantId"=$2 LIMIT 1`, [phone, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
  async findAll(): Promise<Customer[]> {
    const { rows } = await pool.query(`SELECT * FROM "Customer" WHERE "isDeleted"=false AND "tenantId"=$1 ORDER BY "createdAt" DESC`, [TenantContext.getOrThrow()]);
    return rows;
  }
  async updatePoints(id: string, pointsToAdd: number): Promise<Customer> {
    const { rows } = await pool.query(`UPDATE "Customer" SET "points"="points"+$1,"updatedAt"=NOW() WHERE "id"=$2 AND "tenantId"=$3 RETURNING *`, [pointsToAdd, id, TenantContext.getOrThrow()]);
    return rows[0];
  }
  async softDelete(id: string): Promise<Customer> {
    const { rows } = await pool.query(`UPDATE "Customer" SET "isDeleted"=true,"deletedAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1 AND "tenantId"=$2 RETURNING *`, [id, TenantContext.getOrThrow()]);
    return rows[0];
  }
}
