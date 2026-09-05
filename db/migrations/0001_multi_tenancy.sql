-- ============================================================================
-- 0001 — AUTHORITATIVE SCHEMA (UUID keys + multi-tenancy + Supabase Auth)
-- ----------------------------------------------------------------------------
-- Single source of truth. Supersedes the legacy out-of-band integer/serial
-- schema. Run ONCE in the Supabase SQL editor.
--
-- ⚠️  DESTRUCTIVE: DROPs and recreates every table; existing rows are lost.
--     Re-seed included below (default Tenant + base Roles).
--
-- Design:
--   * All PKs/FKs are UUID (gen_random_uuid()) — non-guessable, globally
--     unique, safe across tenants (SaaS requirement).
--   * Authentication is delegated to Supabase Auth: credentials live in
--     auth.users; "User".id IS auth.users.id and there is NO password column.
--     Login identifier is "email" (Supabase-native).
--   * Shared-schema multi-tenancy: every tenant-scoped table carries
--     "tenantId" uuid -> "Tenant"(id). NULLABLE for now so existing
--     repositories keep working; Inc3 populates + enforces + scopes queries,
--     Inc4 adds Postgres RLS.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Drop legacy tables (child-first; CASCADE for safety)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS
  "OrderItemItem", "OrderItem", "Order",
  "StockItem", "ProductSpec", "SpecAttribute",
  "ProductVariant", "ProductImage", "Product",
  "Customer", "User", "Role", "Category", "Brand",
  "Tenant"
CASCADE;

-- ----------------------------------------------------------------------------
-- Tenant (root of tenancy)
-- ----------------------------------------------------------------------------
CREATE TABLE "Tenant" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"      TEXT NOT NULL,
  "slug"      TEXT UNIQUE,
  "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- Catalog / org tables
-- ----------------------------------------------------------------------------
CREATE TABLE "Role" (
  "id"       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"     TEXT NOT NULL,
  "tenantId" UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "Brand" (
  "id"       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"     TEXT NOT NULL,
  "tenantId" UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "Category" (
  "id"       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"     TEXT NOT NULL,
  "tenantId" UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "SpecAttribute" (
  "id"       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"     TEXT NOT NULL,
  "tenantId" UUID REFERENCES "Tenant"("id")
);

-- User: id == auth.users.id (Supabase Auth owns credentials; no password here)
CREATE TABLE "User" (
  "id"        UUID PRIMARY KEY,               -- set from auth.users.id on provisioning
  "email"     TEXT NOT NULL UNIQUE,
  "name"      TEXT NOT NULL,
  "roleId"    UUID NOT NULL REFERENCES "Role"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP,
  "tenantId"  UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "Customer" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"      TEXT NOT NULL,
  "phone"     TEXT NOT NULL,
  "points"    INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP,
  "tenantId"  UUID REFERENCES "Tenant"("id")
);

-- ----------------------------------------------------------------------------
-- Product aggregate
-- ----------------------------------------------------------------------------
CREATE TABLE "Product" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "categoryId"  UUID NOT NULL REFERENCES "Category"("id"),
  "brandId"     UUID NOT NULL REFERENCES "Brand"("id"),
  "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP NOT NULL,
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"   TIMESTAMP,
  "tenantId"    UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "ProductImage" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "imageUrl"  TEXT NOT NULL,
  "isMain"    BOOLEAN NOT NULL DEFAULT false,
  "tenantId"  UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "ProductVariant" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId"     UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "color"         TEXT NOT NULL,
  "sku"           TEXT NOT NULL,
  "price"         NUMERIC NOT NULL,
  "stockQuantity" INTEGER NOT NULL DEFAULT 0,
  "isDeleted"     BOOLEAN NOT NULL DEFAULT false,
  "deletedAt"     TIMESTAMP,
  "tenantId"      UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "ProductSpec" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId"   UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "attributeId" UUID NOT NULL REFERENCES "SpecAttribute"("id"),
  "value"       TEXT NOT NULL,
  "tenantId"    UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "StockItem" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "variantId"    UUID NOT NULL REFERENCES "ProductVariant"("id"),
  "serialNumber" TEXT NOT NULL,
  "status"       TEXT NOT NULL DEFAULT 'AVAILABLE',
  "tenantId"     UUID REFERENCES "Tenant"("id")
);

-- ----------------------------------------------------------------------------
-- Order aggregate
-- ----------------------------------------------------------------------------
CREATE TABLE "Order" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId"  UUID NOT NULL REFERENCES "User"("id"),
  "customerId"  UUID REFERENCES "Customer"("id"),
  "totalAmount" NUMERIC NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'PAID',
  "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP NOT NULL,
  "tenantId"    UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "OrderItem" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId"     UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
  "variantId"   UUID NOT NULL REFERENCES "ProductVariant"("id"),
  "quantity"    INTEGER NOT NULL,
  "priceAtTime" NUMERIC NOT NULL,
  "tenantId"    UUID REFERENCES "Tenant"("id")
);

CREATE TABLE "OrderItemItem" (
  "orderItemId" UUID NOT NULL REFERENCES "OrderItem"("id") ON DELETE CASCADE,
  "stockItemId" UUID NOT NULL REFERENCES "StockItem"("id"),
  "tenantId"    UUID REFERENCES "Tenant"("id"),
  PRIMARY KEY ("orderItemId", "stockItemId")
);

-- ----------------------------------------------------------------------------
-- Indexes (tenancy-first composite lookups)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_tenant      ON "User"("tenantId");
CREATE INDEX IF NOT EXISTS idx_role_tenant      ON "Role"("tenantId");
CREATE INDEX IF NOT EXISTS idx_brand_tenant     ON "Brand"("tenantId");
CREATE INDEX IF NOT EXISTS idx_category_tenant  ON "Category"("tenantId");
CREATE INDEX IF NOT EXISTS idx_customer_tenant  ON "Customer"("tenantId");
CREATE INDEX IF NOT EXISTS idx_product_tenant   ON "Product"("tenantId");
CREATE INDEX IF NOT EXISTS idx_variant_tenant   ON "ProductVariant"("tenantId");
CREATE INDEX IF NOT EXISTS idx_stock_tenant     ON "StockItem"("tenantId");
CREATE INDEX IF NOT EXISTS idx_order_tenant     ON "Order"("tenantId");
CREATE INDEX IF NOT EXISTS idx_order_employee   ON "Order"("employeeId");
CREATE INDEX IF NOT EXISTS idx_orderitem_order  ON "OrderItem"("orderId");

-- ----------------------------------------------------------------------------
-- Seeds: default tenant + base roles (global, tenantId NULL until Inc2)
-- ----------------------------------------------------------------------------
INSERT INTO "Tenant" ("id", "name", "slug", "status", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Store', 'default', 'ACTIVE', NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Role" ("name", "tenantId")
VALUES ('ADMIN', NULL), ('MANAGER', NULL), ('CASHIER', NULL), ('USER', NULL)
ON CONFLICT DO NOTHING;

COMMIT;
