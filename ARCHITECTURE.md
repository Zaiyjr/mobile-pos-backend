# Clean Modular Architecture — Mobile POS Backend

> Supabase `pg` (no Prisma) • Modular monolith • Clean Architecture • Deep modules

## Principles (from `codebase-design` skill)

- **Module** = interface + implementation (function/class/package/slice). Each feature slice (`auth`, `product`, …) is a Module.
- **Interface** = everything a caller must know (types + invariants + errors + perf). Kept small.
- **Implementation** = hidden behind interface. Can have **internal seams** for tests.
- **Seam** = place where you can alter behaviour without editing in that place.
- **Adapter** = concrete at a seam (e.g., `BrandRepositoryPg`).
- **Depth** = leverage per interface unit. Deep = small interface, large hidden behaviour.
- **Leverage** for callers, **Locality** for maintainers.

---

## Structure

```
src/
  server.ts                — thin bootstrap (composition root)
  shared/                  — cross-cutting kernel (no feature logic)
    infrastructure/database/
      pool.ts              — pg Pool (Supabase pooler, SSL)
      supabase.ts          — @supabase/supabase-js anon/service_role
    presentation/
      middlewares/async.ts, auth.ts, error.ts
      http/app.ts          — createApp(): assembles all module routers
    domain/
      errors/AppError.ts   — AppError, NotFound, Conflict, Unauthorized…
      types/express.d.ts   — Request.user augmentation
  modules/<feature>/       — one deep module per bounded context
    domain/
      entities.ts          — pure types (Brand, Product, Order…)
      ports.ts             — Repository Port INTERFACE (seam)
    application/
      <feature>.service.ts — use-cases, depends ONLY on Port
    infrastructure/
      <feature>.repository.ts — Pg Adapter implements Port
    presentation/
      <feature>.controller.ts — HTTP adapter, depends on Service
      <feature>.routes.ts    — wiring + Router (module’s public seam)
  prisma/
    seed.ts                — pg-based seeder (no PrismaClient)
    clear-mock.ts
```

### 9 Modules

| Module | Port | Adapter | Service depth |
|--------|------|---------|---------------|
| `auth` | `AuthRepositoryPort` | `AuthRepositoryPg` | register (role resolution + hash), login (jwt) |
| `user` | `UserRepositoryPort` | `UserRepositoryPg` | getAll/getById/update/delete (hash) |
| `role` | `RoleRepositoryPort` | `RoleRepositoryPg` | CRUD + upper-case invariant |
| `brand` | `BrandRepositoryPort` | `BrandRepositoryPg` | CRUD + duplicate check |
| `category` | `CategoryRepositoryPort` | `CategoryRepositoryPg` | CRUD |
| `customer` | `CustomerRepositoryPort` | `CustomerRepositoryPg` | findByPhone + points increment |
| `product` | `ProductRepositoryPort` | `ProductRepositoryPg` | nested create (product+images+variants+specs tx), findAll/findById (joins + _count) |
| `stock` | `StockRepositoryPort` | `StockRepositoryPg` | add/checkIMEI (join variant→product) |
| `order` | `OrderRepositoryPort` | `OrderRepositoryPg` | create transaction (Order+OrderItem+OrderItemItem+Stock SOLD+decrement), findAll/findById (joins) |

**Seam placement:**
- `Service → RepositoryPort` is the domain seam. Service is tested against a fake in-memory adapter (internal seam), controller is tested through Service interface. Two adapters (Pg + Fake) = real seam.
- `Routes` is the module’s public seam. Small: `router.get/post/put/delete` only. Hides all SQL/transaction complexity.

**Deletion test:** Delete `ProductRepositoryPg` — 200 lines of SQL + transaction vanish, not reappear in controllers. Delete `OrderService` — checkout transaction logic vanishes. Modules earn their keep → deep.

---

## Dependency Rule

```
presentation → application → domain ← infrastructure
```

- `presentation` knows `application`
- `application` knows `domain/ports` (interface)
- `infrastructure` implements `domain/ports`
- `domain` knows nothing
- `shared` never imports `modules`

Wiring is in `*.routes.ts` (composition root for that module) and `shared/presentation/http/app.ts` (global composition).

```ts
// modules/brand/presentation/brand.routes.ts (wiring)
const repo = new BrandRepositoryPg();      // adapter
const service = new BrandService(repo);     // depends on Port
const controller = new BrandController(service);
export const brandRouter = Router() // public seam
  .get("/", controller.getAll)
  .post("/", authenticateJWT, controller.create) // ...
```

Swap `BrandRepositoryPg` with `BrandRepositoryMemory` for tests without touching `BrandService`.

---

## Scalability & Maintainability

- **Locality:** Feature change touches 1 folder (`modules/product/...`) not 4 flat folders. Fix product stock count once, fixed everywhere.
- **Leverage:** `createApp()` exposes 9 routers (small interface) behind which 4700+ lines of SQL/transactions hide.
- **Testability:** `application` has no Express/pg creation, receives `Port` via constructor → unit test with fake. `asyncHandler` + `AppError` give consistent error surface.
- **Independent evolution:** Add `discount` module under `modules/discount/...` without touching existing modules. Share `pool.ts` seam, not implementation.
- **No ORM lock-in:** Direct `pg` with quoted identifiers (`"Brand"`) matches Supabase Postgres. No `prisma generate` in build (`npm run build` → `tsc` only).

---

## Supabase (no Prisma)

- `DATABASE_URL` = pooler `postgres.nmhopxhlwpbcjzhzrvxj:%2BJ6v.7dVsrhbn28@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` (direct `db...supabase.co` ENOTFOUND, verified).
- `pool.ts` handles SSL, graceful shutdown, `query()` helper.
- Schema pushed via `migrate diff --script` → `pool.query(sql)` (14 tables, quoted).
- Seed: `npm run seed` (`tsx prisma/seed.ts` → `pg`, not `PrismaClient`).

---

## HTTP Seams

```
GET  /                  → Welcome
POST /auth/register, /auth/login
GET  /users, /roles, /brands, /categories, /customers, /products, /stocks/check/:serial, /orders
POST /products, /brands, /stocks/add, /orders (checkout)
... also mounted under /api/* for legacy clients
```

All via `shared/presentation/http/app.ts:createApp()`.

---

## Verification

```bash
npx tsc --noEmit          # OK
npm run build             # OK (dist/modules + dist/shared)
npm run seed              # OK
curl POST /auth/login     # OK (admin/admin123 → JWT)
# test-clean.ts via pg repos: brand/category/product/stock/order transaction PASS
```

---

## Next deepening opportunities

- Extract `ProductVariant`/`StockItem` invariant (status flow) into domain value object.
- Introduce `Order` domain service for stock decrement + points, tested past `OrderRepositoryPort` seam.
- Add `spec` module for `SpecAttribute` to avoid product knowing specs.

