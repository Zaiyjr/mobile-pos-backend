import { pool } from "../../../shared/infrastructure/database/pool.js";
import { TenantContext } from "../../../shared/infrastructure/context/tenant-context.js";
import type { Product } from "../domain/entities.js";
import type { ProductRepositoryPort } from "../domain/ports.js";

export class ProductRepositoryPg implements ProductRepositoryPort {
  async create(data: Record<string, unknown>): Promise<Product> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const tenantId = TenantContext.getOrThrow();
      const { rows: prodRows } = await client.query(
        `INSERT INTO "Product" ("name","description","categoryId","brandId","tenantId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
        [data.name, (data.description as string | null) ?? null, data.categoryId, data.brandId, tenantId]
      );
      const product = prodRows[0];
      const imagesInput: unknown[] = (() => {
        if (Array.isArray(data.images)) return data.images as unknown[];
        if (data.images && typeof data.images === "object" && "create" in (data.images as Record<string, unknown>)) {
          const c = (data.images as Record<string, unknown>).create;
          return Array.isArray(c) ? c : c ? [c] : [];
        }
        return [];
      })();
      for (const img of imagesInput) {
        const im = img as Record<string, unknown>;
        await client.query(`INSERT INTO "ProductImage" ("productId","imageUrl","isMain","tenantId") VALUES ($1,$2,$3,$4)`, [product.id, im.imageUrl, im.isMain ?? false, tenantId]);
      }
      const variantsInput: unknown[] = (() => {
        if (Array.isArray(data.variants)) return data.variants as unknown[];
        if (data.variants && typeof data.variants === "object" && "create" in (data.variants as Record<string, unknown>)) {
          const c = (data.variants as Record<string, unknown>).create;
          return Array.isArray(c) ? c : c ? [c] : [];
        }
        return [];
      })();
      for (const v of variantsInput) {
        const vari = v as Record<string, unknown>;
        await client.query(`INSERT INTO "ProductVariant" ("productId","color","sku","price","stockQuantity","tenantId") VALUES ($1,$2,$3,$4,$5,$6)`, [product.id, vari.color, vari.sku, vari.price, vari.stockQuantity ?? 0, tenantId]);
      }
      const specsInput: unknown[] = (() => {
        if (Array.isArray(data.specs)) return data.specs as unknown[];
        if (data.specs && typeof data.specs === "object" && "create" in (data.specs as Record<string, unknown>)) {
          const c = (data.specs as Record<string, unknown>).create;
          return Array.isArray(c) ? c : c ? [c] : [];
        }
        return [];
      })();
      for (const s of specsInput) {
        const spec = s as Record<string, unknown>;
        await client.query(`INSERT INTO "ProductSpec" ("productId","attributeId","value","tenantId") VALUES ($1,$2,$3,$4)`, [product.id, spec.attributeId, spec.value, tenantId]);
      }
      await client.query("COMMIT");
      return product;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Product[]> {
    const tenantId = TenantContext.getOrThrow();
    const { rows: products } = await pool.query(
      `SELECT p.*, row_to_json(c) as category, row_to_json(b) as brand FROM "Product" p LEFT JOIN "Category" c ON c."id"=p."categoryId" LEFT JOIN "Brand" b ON b."id"=p."brandId" WHERE p."isDeleted"=false AND p."tenantId"=$1 ORDER BY p."createdAt" DESC`,
      [tenantId]
    );
    for (const p of products) {
      const { rows: imgs } = await pool.query(`SELECT * FROM "ProductImage" WHERE "productId"=$1 AND "isMain"=true AND "tenantId"=$2`, [p.id, tenantId]);
      p.images = imgs;
      const { rows: vars } = await pool.query(`SELECT * FROM "ProductVariant" WHERE "productId"=$1 AND "isDeleted"=false AND "tenantId"=$2`, [p.id, tenantId]);
      p.variants = vars;
    }
    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const tenantId = TenantContext.getOrThrow();
    const { rows } = await pool.query(
      `SELECT p.*, row_to_json(c) as category, row_to_json(b) as brand FROM "Product" p LEFT JOIN "Category" c ON c."id"=p."categoryId" LEFT JOIN "Brand" b ON b."id"=p."brandId" WHERE p."id"=$1 AND p."isDeleted"=false AND p."tenantId"=$2 LIMIT 1`,
      [id, tenantId]
    );
    const product = rows[0];
    if (!product) return null;
    const { rows: images } = await pool.query(`SELECT * FROM "ProductImage" WHERE "productId"=$1 AND "tenantId"=$2`, [id, tenantId]);
    product.images = images;
    const { rows: variants } = await pool.query(`SELECT * FROM "ProductVariant" WHERE "productId"=$1 AND "isDeleted"=false AND "tenantId"=$2`, [id, tenantId]);
    for (const v of variants) {
      const { rows: cnt } = await pool.query(`SELECT COUNT(*)::int as count FROM "StockItem" WHERE "variantId"=$1 AND "status"='AVAILABLE' AND "tenantId"=$2`, [v.id, tenantId]);
      v._count = { stockItems: cnt[0].count };
    }
    product.variants = variants;
    const { rows: specs } = await pool.query(`SELECT ps.*, row_to_json(sa) as attribute FROM "ProductSpec" ps LEFT JOIN "SpecAttribute" sa ON sa."id"=ps."attributeId" WHERE ps."productId"=$1 AND ps."tenantId"=$2`, [id, tenantId]);
    product.specs = specs;
    return product;
  }

  async update(id: string, data: Record<string, unknown>): Promise<Product | null> {
    const allowed = ["name", "description", "categoryId", "brandId"] as const;
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const k of allowed) if (data[k] !== undefined) { fields.push(`"${k}"=$${idx++}`); values.push(data[k]); }
    if (fields.length > 0) {
      fields.push(`"updatedAt"=NOW()`);
      values.push(id);
      values.push(TenantContext.getOrThrow());
      const { rows } = await pool.query(`UPDATE "Product" SET ${fields.join(", ")} WHERE "id"=$${idx} AND "tenantId"=$${idx + 1} RETURNING *`, values);
      return rows[0] ?? null;
    }
    return this.findById(id);
  }

  async softDelete(id: string): Promise<Product | null> {
    const { rows } = await pool.query(`UPDATE "Product" SET "isDeleted"=true,"deletedAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1 AND "tenantId"=$2 RETURNING *`, [id, TenantContext.getOrThrow()]);
    return rows[0] ?? null;
  }
}
