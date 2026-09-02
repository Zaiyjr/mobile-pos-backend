import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("[YOUR_SUPABASE_DB_PASSWORD]")) {
  console.warn(
    "[db] DATABASE_URL not set or still placeholder. " +
      "Set postgres password in backend/.env — host: db.nmhopxhlwpbcjzhzrvxj.supabase.co db: postgres user: postgres port: 5432"
  );
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export default pool;
