-- =============================================================================
-- Phase 1 — Multi-tenancy foundation
-- Adds a "Tenant" table and a "tenantId" discriminator to every tenant-owned
-- table, backfilling all existing rows into a default tenant (id = 1) so no
-- current data is orphaned.
--
-- Run ONCE in the Supabase SQL editor (or psql) BEFORE deploying the branch.
-- Re-runnable: guarded with IF NOT EXISTS / constraint existence checks.
-- =============================================================================

BEGIN;

-- 1. Tenant table ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Tenant" (
  "id"        SERIAL PRIMARY KEY,
  "name"      TEXT        NOT NULL,
  "slug"      TEXT        UNIQUE,                 -- reserved for future subdomain login
  "status"    TEXT        NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "isDeleted" BOOLEAN     NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMPTZ
);

-- 2. Default tenant to adopt all pre-existing (single-tenant) data -----------
INSERT INTO "Tenant" ("id", "name", "slug", "status")
VALUES (1, 'Default Store', 'default', 'ACTIVE')
ON CONFLICT ("id") DO NOTHING;

-- Keep the id sequence ahead of the explicitly-inserted default row.
SELECT setval(
  pg_get_serial_sequence('"Tenant"', 'id'),
  GREATEST((SELECT MAX("id") FROM "Tenant"), 1)
);

-- 3. Add + backfill + enforce "tenantId" on every tenant-owned table ---------
DO $$
DECLARE
  t        TEXT;
  tables   TEXT[] := ARRAY[
    'User', 'Role', 'Customer', 'Category', 'Brand',
    'Product', 'ProductVariant', 'ProductImage', 'ProductSpec', 'SpecAttribute',
    'StockItem', 'Order', 'OrderItem', 'OrderItemItem'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- add column (nullable so we can backfill)
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS "tenantId" INTEGER', t);
    -- adopt existing rows into the default tenant
    EXECUTE format('UPDATE %I SET "tenantId" = 1 WHERE "tenantId" IS NULL', t);
    -- now enforce
    EXECUTE format('ALTER TABLE %I ALTER COLUMN "tenantId" SET NOT NULL', t);
    -- access path used by every scoped list/lookup query
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I ("tenantId")', t || '_tenantId_idx', t);
    -- referential integrity to Tenant (guarded so re-runs do not error)
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = t || '_tenantId_fkey'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")',
        t, t || '_tenantId_fkey'
      );
    END IF;
  END LOOP;
END $$;

-- 4. Composite indexes for the hot scoped queries (list newest, not-deleted) --
CREATE INDEX IF NOT EXISTS "Product_tenant_deleted_idx"  ON "Product"  ("tenantId", "isDeleted");
CREATE INDEX IF NOT EXISTS "User_tenant_deleted_idx"     ON "User"     ("tenantId", "isDeleted");
CREATE INDEX IF NOT EXISTS "Order_tenant_created_idx"    ON "Order"    ("tenantId", "createdAt");
CREATE INDEX IF NOT EXISTS "Customer_tenant_deleted_idx" ON "Customer" ("tenantId", "isDeleted");

COMMIT;

-- NOTE (deferred to a later increment):
--  * "User"."username" stays GLOBALLY unique. Per-tenant usernames would need
--    the unique constraint changed to ("tenantId","username") + subdomain login.
--  * Row Level Security is intentionally NOT enabled here: the pool connects as
--    the table owner (bypasses RLS). RLS defense-in-depth lands in Inc4 with a
--    non-owner role + per-request set_config('app.tenant_id', ...).
