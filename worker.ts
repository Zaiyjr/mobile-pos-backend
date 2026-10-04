import { httpServerHandler } from "cloudflare:node";
import { configureRuntimeEnvironment } from "./src/shared/config/env.js";

interface WorkerBindings {
  HYPERDRIVE: { connectionString: string };
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CORS_ORIGINS?: string;
}

let appInitialization: Promise<void> | undefined;
const nodeHandler = httpServerHandler({ port: 3000 });

function initializeApp(bindings: WorkerBindings): Promise<void> {
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

  appInitialization ??= import("./src/shared/presentation/http/app.js").then(({ createApp }) => {
    createApp().listen(3000);
  });
  return appInitialization;
}

export default {
  async fetch(request: Request, bindings: WorkerBindings, context: ExecutionContext): Promise<Response> {
    // Hyperdrive connection details are request-scoped runtime bindings. Read
    // them inside the handler, never while the Worker module is initializing.
    await initializeApp(bindings);
    // Use Cloudflare's documented Node HTTP server adapter so Express receives
    // the original URL path, method, headers, and body through its Node server.
    return nodeHandler.fetch!(
      request as Parameters<NonNullable<typeof nodeHandler.fetch>>[0],
      bindings,
      context,
    );
  },
};
