# Mobile Shop Management System Architecture

The backend is an Express and TypeScript modular monolith. It preserves the mobile-shop domain and the existing HTTP contract while keeping feature policy independent of Express and PostgreSQL adapters.

## Feature layout

```text
src/
  server.ts                         # Runtime entry point
  modules/
    create-module-routers.ts        # Application composition root
    <feature>/
      domain/                       # Entities and repository ports
      application/                  # Use cases and business rules
      infrastructure/               # PostgreSQL and Supabase adapters
      presentation/                 # Controllers and Express router factories
  shared/
    config/                         # Environment configuration
    domain/                         # Shared errors and types
    infrastructure/                 # Database and auth clients
    presentation/                   # HTTP app, middleware and validation
openapi.yaml                        # API contract
```

Features are `auth`, `user`, `role`, `brand`, `category`, `customer`, `product`, `stock`, and `order`. Mobile-shop behavior includes product variants, IMEI stock items, customer lookup, role management, checkout, receipts, and order history.

## Dependency direction

```text
presentation → application → domain ← infrastructure
```

- Domain code does not depend on Express, PostgreSQL, Supabase, or another feature's infrastructure.
- Application services receive repository ports through constructors.
- Infrastructure adapters implement repository ports.
- Router factories receive controllers and only define HTTP routes and middleware.
- `createModuleRouters()` selects concrete adapters and constructs the feature graph when `createApp()` is called. Importing a router module does not create its services or repositories.

## HTTP contract and validation

- `/api/v1` is the canonical prefix. `/api` and the root prefix remain mounted for existing clients.
- JSON response envelopes retain the existing `success`, `message`, and `data` fields. Errors retain `success: false`, `status`, and `message`.
- Zod schemas validate auth, user updates, catalog, customer, role, stock, and checkout bodies before controllers run. Unknown fields remain accepted where legacy request bodies may include them.
- `openapi.yaml` documents the routes, request shapes, security, and error envelope.

## Verification

```sh
npm run build
npm test
```

Unit tests exercise use cases through fake repository ports. API contract tests exercise validation and the versioned and legacy route prefixes.
