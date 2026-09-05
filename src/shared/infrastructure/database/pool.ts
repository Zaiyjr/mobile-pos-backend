import "dotenv/config";
import pg from "pg";
import { env } from "../../config/env.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

/** True only for a parseable postgres(ql):// connection string. */
function isValidPgUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "postgres:" || u.protocol === "postgresql:";
  } catch {
    return false;
  }
}

// Treat missing, bracketed placeholders, AND any non-postgres-URL value (e.g.
// the literal "Your Database URL") as "not configured", so we never hand pg a
// garbage connection string (which crashes with a cryptic "Invalid URL").
const isPlaceholder =
  !connectionString ||
  connectionString.includes("[YOUR_SUPABASE_DB_PASSWORD]") ||
  connectionString.includes("[YOUR_") ||
  !isValidPgUrl(connectionString);

if (isPlaceholder) {
  console.warn(
    "[db] DATABASE_URL is missing or not a valid postgres connection string — DB queries will fail fast with a clear error; /health still responds. Set a real Supabase DATABASE_URL in .env."
  );
}

// Lazy pool — do not fail import if env missing. Vercel cold start needs instant response for / .
let _pool: InstanceType<typeof Pool> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (_pool) return _pool;
  if (isPlaceholder) {
    // Fail fast with a clear, actionable error instead of handing pg an
    // unparseable connection string (which surfaces as a cryptic "Invalid URL").
    // / and /health never call getPool, so they still respond without a DB.
    throw new Error(
      "[db] DATABASE_URL is missing or is not a valid postgres connection string " +
        "(expected postgresql://…). Set a real Supabase connection string in .env " +
        "(see .env.example) before calling the database."
    );
  }
  _pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: env.pgRejectUnauthorized } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // fail fast on Vercel
  });
  _pool.on("error", (err) => console.error("[db] pool error", err.message));
  return _pool;
}

export const pool = new Proxy({} as InstanceType<typeof Pool>, {
  get(_target, prop) {
    const p = getPool() as unknown as Record<string, unknown>;
    const v = p[prop as string];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(p) : v;
  },
}) as InstanceType<typeof Pool>;

export const query = (text: string, params?: unknown[]) => getPool().query(text, params);

if (process.env.NODE_ENV !== "production") {
  process.on("SIGINT", async () => {
    try {
      await getPool().end();
    } catch {}
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    try {
      await getPool().end();
    } catch {}
    process.exit(0);
  });
}

export default pool;
