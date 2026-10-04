import { env as cloudflareEnv } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import { configureRuntimeEnvironment } from "./src/shared/config/env.js";
import { createApp } from "./src/shared/presentation/http/app.js";

interface WorkerBindings {
  HYPERDRIVE: { connectionString: string };
  JWT_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CORS_ORIGINS?: string;
}

// Cloudflare exposes Worker bindings through this runtime module. Configure
// the application before composing Express so the API uses the staging
// Hyperdrive connection and the secrets configured for this Worker.
const bindings = cloudflareEnv as unknown as WorkerBindings;
configureRuntimeEnvironment({
  DATABASE_URL: bindings.HYPERDRIVE.connectionString,
  DB_POOL_MAX: "5",
  DB_SSL: "false",
  NODE_ENV: "production",
  JWT_SECRET: bindings.JWT_SECRET,
  SUPABASE_URL: bindings.SUPABASE_URL,
  SUPABASE_ANON_KEY: bindings.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: bindings.SUPABASE_SERVICE_ROLE_KEY,
  CORS_ORIGINS: bindings.CORS_ORIGINS,
});

const app = createApp();
app.listen(3000);

// Export Cloudflare's adapter directly as documented for Express on Workers.
export default httpServerHandler({ port: 3000 });
