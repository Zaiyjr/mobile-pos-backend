import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { StockItem } from "../domain/entities.js";
import type { StockRepositoryPort } from "../domain/ports.js";
export class StockRepositoryPg implements StockRepositoryPort {
  async add(data: { variantId: string; serialNumber: string; status?: string }): Promise<StockItem> {
    const { rows } = await pool.query(`INSERT INTO "StockItem" ("variantId","serialNumber","status","tenantId") VALUES ($1,$2,$3,$4) RETURNING *`, [data.variantId, data.serialNumber, data.status ?? "AVAILABLE", TenantContext.getOrThrow()]);
    return rows[0];
  }
  async findAvailableBySerial(serialNumber: string): Promise<StockItem | null> {
    const { rows } = await pool.query(
      `SELECT si.*, row_to_json(v) as variant, row_to_json(p) as product FROM "StockItem" si LEFT JOIN "ProductVariant" v ON v."id"=si."variantId" LEFT JOIN "Product" p ON p."id"=v."productId" WHERE si."serialNumber"=$1 AND si."status"='AVAILABLE' AND si."tenantId"=$2 LIMIT 1`,
      [serialNumber, TenantContext.getOrThrow()]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return { ...r, variant: r.variant ? { ...r.variant, product: r.product } : null };
  }
  async updateStatus(id: string, status: string): Promise<StockItem | null> {
    const { rows } = await pool.query(`UPDATE "StockItem" SET "status"=$1 WHERE "id"=$2 AND "tenantId"=$3 RETURNING *`, [status, id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
}
