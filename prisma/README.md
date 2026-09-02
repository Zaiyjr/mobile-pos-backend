# Prisma removed — now using Supabase pg (no ORM)

This folder previously held `schema.prisma`. Prisma has been fully removed.

- `seed.ts` — now uses `pg` Pool (`src/config/db.ts`) to seed Supabase, not PrismaClient. Run via `npm run seed`.
- `clear-mock.ts` — pg-based truncate for test data.
- DB schema is already pushed to Supabase (see Supabase Dashboard → Database → Tables). SQL dump is in `/tmp/schema2.sql` if you need it, or re-create from git history.

Connection: `DATABASE_URL` = Supabase pooler `postgresql://postgres.nmhopxhlwpbcjzhzrvxj:%2BJ6v.7dVsrhbn28@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
