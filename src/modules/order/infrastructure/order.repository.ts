import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { CreateOrderDTO, Order } from "../domain/entities.js";
import type { OrderRepositoryPort } from "../domain/ports.js";

export class OrderRepositoryPg implements OrderRepositoryPort {
  async create(data: CreateOrderDTO): Promise<Order> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const tenantId = TenantContext.getOrThrow();
      const { rows: orderRows } = await client.query(
        `INSERT INTO "Order" ("employeeId","customerId","totalAmount","status","tenantId","createdAt","updatedAt") VALUES ($1,$2,$3,'PAID',$4,NOW(),NOW()) RETURNING *`,
        [data.employeeId, data.customerId ?? null, data.totalAmount, tenantId]
      );
      const order = orderRows[0];
      for (const item of data.items) {
        const { rows: oiRows } = await client.query(
          `INSERT INTO "OrderItem" ("orderId","variantId","quantity","priceAtTime","tenantId") VALUES ($1,$2,$3,$4,$5) RETURNING *`,
          [order.id, item.variantId, item.quantity, item.priceAtTime, tenantId]
        );
        const orderItem = oiRows[0];
        if (item.stockItemIds?.length) {
          for (const sid of item.stockItemIds) {
            await client.query(`INSERT INTO "OrderItemItem" ("orderItemId","stockItemId","tenantId") VALUES ($1,$2,$3)`, [orderItem.id, sid, tenantId]);
          }
          await client.query(`UPDATE "StockItem" SET "status"='SOLD' WHERE "id"=ANY($1::uuid[]) AND "tenantId"=$2`, [item.stockItemIds, tenantId]);
        }
        await client.query(`UPDATE "ProductVariant" SET "stockQuantity"="stockQuantity"-$1 WHERE "id"=$2 AND "tenantId"=$3`, [item.quantity, item.variantId, tenantId]);
      }
      await client.query("COMMIT");
      return order;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Order[]> {
    const tenantId = TenantContext.getOrThrow();
    const { rows: orders } = await pool.query(
      `SELECT o.*, json_build_object('name',u."name") as employee, CASE WHEN c."id" IS NOT NULL THEN json_build_object('name',c."name",'phone',c."phone") ELSE NULL END as customer
       FROM "Order" o LEFT JOIN "User" u ON u."id"=o."employeeId" LEFT JOIN "Customer" c ON c."id"=o."customerId" WHERE o."tenantId"=$1 ORDER BY o."createdAt" DESC`,
      [tenantId]
    );
    for (const o of orders) {
      const { rows: items } = await pool.query(
        `SELECT oi.*, row_to_json(v) as variant, row_to_json(p) as product FROM "OrderItem" oi LEFT JOIN "ProductVariant" v ON v."id"=oi."variantId" LEFT JOIN "Product" p ON p."id"=v."productId" WHERE oi."orderId"=$1`,
        [o.id]
      );
      o.items = items.map((it: Record<string, unknown>) => ({ ...it, variant: it.variant ? { ...(it.variant as Record<string, unknown>), product: it.product } : null }));
    }
    return orders;
  }

  async findById(id: string): Promise<Order | null> {
    const { rows } = await pool.query(
      `SELECT o.*, row_to_json(u) as employee, row_to_json(c) as customer FROM "Order" o LEFT JOIN "User" u ON u."id"=o."employeeId" LEFT JOIN "Customer" c ON c."id"=o."customerId" WHERE o."id"=$1 AND o."tenantId"=$2 LIMIT 1`,
      [id, TenantContext.getOrThrow()]
    );
    const order = rows[0];
    if (!order) return null;
    const { rows: items } = await pool.query(
      `SELECT oi.*, row_to_json(v) as variant, row_to_json(p) as product FROM "OrderItem" oi LEFT JOIN "ProductVariant" v ON v."id"=oi."variantId" LEFT JOIN "Product" p ON p."id"=v."productId" WHERE oi."orderId"=$1`,
      [id]
    );
    for (const it of items) {
      const { rows: sold } = await pool.query(`SELECT oii.*, row_to_json(si) as stockItem FROM "OrderItemItem" oii LEFT JOIN "StockItem" si ON si."id"=oii."stockItemId" WHERE oii."orderItemId"=$1`, [it.id]);
      it.soldItems = sold;
      it.variant = it.variant ? { ...(it.variant as Record<string, unknown>), product: it.product } : null;
    }
    order.items = items;
    return order;
  }

  async cancel(id: string): Promise<Order | null> {
    const { rows } = await pool.query(`UPDATE "Order" SET "status"='CANCELLED',"updatedAt"=NOW() WHERE "id"=$1 AND "tenantId"=$2 RETURNING *`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
}
