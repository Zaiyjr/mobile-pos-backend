import { pool } from "../../../shared/infrastructure/database/pool.js";
import type { Product } from "../domain/entities.js";
import type { ProductRepositoryPort } from "../domain/ports.js";

export class ProductRepositoryPg implements ProductRepositoryPort {
  async create(data: Record<string, unknown>): Promise<Product> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows: prodRows } = await client.query(
        `INSERT INTO "Product" ("name","description","categoryId","brandId","createdAt","updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW()) RETURNING *`,
        [data.name, (data.description as string | null) ?? null, data.categoryId, data.brandId]
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
        await client.query(`INSERT INTO "ProductImage" ("productId","imageUrl","isMain") VALUES ($1,$2,$3)`, [product.id, im.imageUrl, im.isMain ?? false]);
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
        await client.query(`INSERT INTO "ProductVariant" ("productId","color","sku","price","stockQuantity") VALUES ($1,$2,$3,$4,$5)`, [product.id, vari.color, vari.sku, vari.price, vari.stockQuantity ?? 0]);
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
        await client.query(`INSERT INTO "ProductSpec" ("productId","attributeId","value") VALUES ($1,$2,$3)`, [product.id, spec.attributeId, spec.value]);
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
    const { rows: products } = await pool.query(
      `SELECT p.*, row_to_json(c) as category, row_to_json(b) as brand FROM "Product" p LEFT JOIN "Category" c ON c."id"=p."categoryId" LEFT JOIN "Brand" b ON b."id"=p."brandId" WHERE p."isDeleted"=false ORDER BY p."createdAt" DESC`
    );
    for (const p of products) {
      const { rows: imgs } = await pool.query(`SELECT * FROM "ProductImage" WHERE "productId"=$1 AND "isMain"=true`, [p.id]);
      p.images = imgs;
      const { rows: vars } = await pool.query(`SELECT * FROM "ProductVariant" WHERE "productId"=$1 AND "isDeleted"=false`, [p.id]);
      p.variants = vars;
    }
    return products;
  }

  async findById(id: number): Promise<Product | null> {
    const { rows } = await pool.query(
      `SELECT p.*, row_to_json(c) as category, row_to_json(b) as brand FROM "Product" p LEFT JOIN "Category" c ON c."id"=p."categoryId" LEFT JOIN "Brand" b ON b."id"=p."brandId" WHERE p."id"=$1 AND p."isDeleted"=false LIMIT 1`,
      [id]
    );
    const product = rows[0];
    if (!product) return null;
    const { rows: images } = await pool.query(`SELECT * FROM "ProductImage" WHERE "productId"=$1`, [id]);
    product.images = images;
    const { rows: variants } = await pool.query(`SELECT * FROM "ProductVariant" WHERE "productId"=$1 AND "isDeleted"=false`, [id]);
    for (const v of variants) {
      const { rows: cnt } = await pool.query(`SELECT COUNT(*)::int as count FROM "StockItem" WHERE "variantId"=$1 AND "status"='AVAILABLE'`, [v.id]);
      v._count = { stockItems: cnt[0].count };
    }
    product.variants = variants;
    const { rows: specs } = await pool.query(`SELECT ps.*, row_to_json(sa) as attribute FROM "ProductSpec" ps LEFT JOIN "SpecAttribute" sa ON sa."id"=ps."attributeId" WHERE ps."productId"=$1`, [id]);
    product.specs = specs;
    return product;
  }

  async update(id: number, data: Record<string, unknown>): Promise<Product | null> {
    const allowed = ["name", "description", "categoryId", "brandId"] as const;
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const k of allowed) if (data[k] !== undefined) { fields.push(`"${k}"=$${idx++}`); values.push(data[k]); }
    if (fields.length > 0) {
      fields.push(`"updatedAt"=NOW()`);
      values.push(id);
      const { rows } = await pool.query(`UPDATE "Product" SET ${fields.join(", ")} WHERE "id"=$${idx} RETURNING *`, values);
      return rows[0] ?? null;
    }
    return this.findById(id);
  }

  async softDelete(id: number): Promise<Product | null> {
    const { rows } = await pool.query(`UPDATE "Product" SET "isDeleted"=true,"deletedAt"=NOW(),"updatedAt"=NOW() WHERE "id"=$1 RETURNING *`, [id]);
    return rows[0] ?? null;
  }
}
