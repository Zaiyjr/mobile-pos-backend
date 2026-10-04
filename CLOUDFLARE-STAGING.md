# Cloudflare staging deployment

This setup deploys the frontend and API from their respective `dev` branches. The
frontend uses Cloudflare Pages, the API uses Cloudflare Workers, and both connect
to a separate Supabase staging project. Do not point this deployment at the
production Supabase project.

## 1. Create a staging Supabase project

Create a new Supabase project for staging. Run
`db/migrations/0001_multi_tenancy.sql` only against that new, empty database: the
migration drops and recreates application tables. Create a staging staff account
through Supabase Auth and use synthetic products, variants, customers, and IMEI
stock for checkout testing. Do not copy production sales or customer data.

## 2. Connect the Worker to staging PostgreSQL

From this backend repository, create a Hyperdrive configuration using the
staging project's PostgreSQL connection string:

```sh
npx wrangler hyperdrive create mobile-pos-staging \
  --connection-string="<STAGING_POSTGRES_CONNECTION_STRING>"
```

Copy the returned Hyperdrive ID into `wrangler.jsonc` in the
`HYPERDRIVE` binding. The connection string is sent to Cloudflare during
provisioning and must not be committed to Git.

## 3. Configure Worker secrets and deploy

Set these secrets on the `mobile-pos-api-dev` Worker using the Cloudflare
dashboard or `wrangler secret put`:

- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is server-only. Never add any of these values to
`wrangler.jsonc`, `.dev.vars.example`, frontend variables, or Git. Deploy from
the backend `dev` branch with `npm run worker:deploy`. The staging API is
available at the Worker URL shown by Cloudflare (`workers.dev`).

For local Worker development, copy `.dev.vars.example` to `.dev.vars`, fill in
staging-only values, and provide a staging direct connection string through
`CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` before running
`npm run worker:dev`. `.dev.vars` and connection strings are ignored by Git.

## 4. Configure Pages

Create a Cloudflare Pages project connected to the frontend repository:

- Root directory: repository root (`frontend` repository).
- Production branch: `main` (left unchanged).
- Build command: `npm run build`.
- Build output directory: `dist`.
- Build environment variable: `VITE_API_URL` set to the staging Worker URL.

Connect the frontend `dev` branch as a preview deployment. Set
`CORS_ORIGINS` on the Worker to the exact `dev` preview origin shown by Pages.
The default project URLs use `pages.dev`; no custom domain is required or
purchased. The Pages project name can be changed if the proposed name is
unavailable; update the corresponding CORS origin in that case.

## 5. Verify staging

Check `/health`, then test login, product and variant loading, IMEI stock checks,
checkout, receipts, sale history, and reports. Confirm a checkout changes only
the staging database. Worker free-tier allowances currently include 100,000
requests per day and 10 ms CPU per request; Hyperdrive includes 100,000 database
queries per day. These limits apply to staging traffic as well.
