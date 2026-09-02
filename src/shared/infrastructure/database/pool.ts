import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

const isPlaceholder =
  !connectionString ||
  connectionString.includes("[YOUR_SUPABASE_DB_PASSWORD]") ||
  connectionString.includes("[YOUR_");

if (isPlaceholder) {
  console.warn(
    "[db] DATABASE_URL missing or placeholder — pool will be lazy and /health will still work. Set DATABASE_URL in Vercel env."
  );
}

// Lazy pool — do not fail import if env missing. Vercel cold start needs instant response for / .
let _pool: InstanceType<typeof Pool> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (_pool) return _pool;
  if (isPlaceholder) {
    // Dummy pool that throws on query but does not hang on construction.
    // This lets / and /health respond even without DB.
    console.error("[db] Attempted DB query without DATABASE_URL — returning error");
    // Create a pool with an invalid connection that fails fast (not hanging DNS)
    _pool = new Pool({
      connectionString: "postgresql://invalid:invalid@127.0.0.1:5432/invalid",
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 2000,
      max: 1,
    });
    // Prevent actual connection attempts from hanging Vercel
    _pool.on("error", () => {});
    return _pool;
  }
  _pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
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
