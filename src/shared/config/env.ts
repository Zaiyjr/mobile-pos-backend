const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "https://dev.mobile-pos-frontend.pages.dev",

];

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

let runtimeEnvironment: RuntimeEnvironment | undefined;

/** Install deployment bindings before composing the application. */
export function configureRuntimeEnvironment(values: RuntimeEnvironment): void {
  runtimeEnvironment = values;
}

function readEnvironmentValue(name: string): string | undefined {
  return runtimeEnvironment?.[name] ?? process.env[name];
}

/**
 * Central, fail-fast environment access.
 *
 * Secrets are NEVER given insecure fallbacks: reading a missing required
 * value throws a descriptive error instead of silently weakening security
 * (e.g. signing JWTs with a hard-coded dev secret).
 */
class EnvConfig {
  /** JWT signing/verification secret. Throws if not configured. */
  get jwtSecret(): string {
    const value = readEnvironmentValue("JWT_SECRET");
    if (!value || value.trim().length === 0) {
      throw new Error(
        "[env] JWT_SECRET is not set. Refusing to sign/verify tokens with a " +
          "fallback secret. Set JWT_SECRET in your environment (see .env.example).",
      );
    }
    return value;
  }

  /** Allowed CORS origins; override with a comma-separated CORS_ORIGINS. */
  get corsOrigins(): string[] {
    const raw = readEnvironmentValue("CORS_ORIGINS");
    if (raw && raw.trim().length > 0) {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return DEFAULT_CORS_ORIGINS;
  }

  /**
   * Whether to verify the DB server TLS certificate in production.
   * Defaults to TRUE (secure). Set PG_REJECT_UNAUTHORIZED=false only as a
   * documented escape-hatch for poolers with unverifiable certs.
   */
  get pgRejectUnauthorized(): boolean {
    return readEnvironmentValue("PG_REJECT_UNAUTHORIZED") !== "false";
  }

  get databaseUrl(): string | undefined {
    return readEnvironmentValue("DATABASE_URL");
  }

  get databasePoolMax(): number {
    const value = Number(readEnvironmentValue("DB_POOL_MAX"));
    return Number.isInteger(value) && value > 0 ? value : 10;
  }

  get databaseSslEnabled(): boolean {
    const value = readEnvironmentValue("DB_SSL");
    if (value === "false") return false;
    if (value === "true") return true;
    return this.nodeEnv === "production";
  }

  get nodeEnv(): string | undefined {
    return readEnvironmentValue("NODE_ENV");
  }

  get supabaseUrl(): string {
    const value = readEnvironmentValue("SUPABASE_URL");
    if (!value || value.includes("[YOUR_")) {
      throw new Error("[env] SUPABASE_URL is not set (see .env.example).");
    }
    let protocol = "";
    try {
      protocol = new URL(value).protocol;
    } catch {
      throw new Error("[env] SUPABASE_URL is not a valid http(s) URL (see .env.example).");
    }
    if (protocol !== "http:" && protocol !== "https:") {
      throw new Error("[env] SUPABASE_URL must be an http(s) URL (see .env.example).");
    }
    return value;
  }

  get supabaseAnonKey(): string {
    const value = readEnvironmentValue("SUPABASE_ANON_KEY");
    if (!value || value.includes("[YOUR_")) {
      throw new Error("[env] SUPABASE_ANON_KEY is not set (see .env.example).");
    }
    return value;
  }

  get supabaseServiceRoleKey(): string | null {
    const value = readEnvironmentValue("SUPABASE_SERVICE_ROLE_KEY");
    if (!value || value.includes("[YOUR_")) return null;
    return value;
  }

  /** Eagerly validate required secrets. Call at long-running server boot. */
  assertRequired(): void {
    // Accessing the getter throws when missing.
    void this.jwtSecret;
  }
}

export const env = new EnvConfig();
export default env;
