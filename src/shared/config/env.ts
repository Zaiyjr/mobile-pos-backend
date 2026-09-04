import "dotenv/config";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "https://frontend-eta-jade-32.vercel.app",
  "https://mobile-pos-frontend-hr6v.vercel.app",
];

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
    const value = process.env.JWT_SECRET;
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
    const raw = process.env.CORS_ORIGINS;
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
    return process.env.PG_REJECT_UNAUTHORIZED !== "false";
  }

  get supabaseUrl(): string {
    const value = process.env.SUPABASE_URL;
    if (!value || value.includes("[YOUR_")) {
      throw new Error("[env] SUPABASE_URL is not set (see .env.example).");
    }
    return value;
  }

  get supabaseAnonKey(): string {
    const value = process.env.SUPABASE_ANON_KEY;
    if (!value || value.includes("[YOUR_")) {
      throw new Error("[env] SUPABASE_ANON_KEY is not set (see .env.example).");
    }
    return value;
  }

  get supabaseServiceRoleKey(): string | null {
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
