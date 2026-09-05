import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-request tenant context backed by AsyncLocalStorage.
 *
 * Multi-tenancy is enforced by scoping every repository query with the current
 * tenantId. Rather than threading a `tenantId` parameter through every port,
 * service, controller and repository signature, the authenticated request's
 * tenant is stored here once (inside `authenticateJWT`) and read by the
 * infrastructure layer via {@link TenantContext.getOrThrow}.
 *
 * `getOrThrow` fails loudly if a repository is ever reached outside a tenant
 * request, so a missing scope can never silently return cross-tenant data.
 */
interface TenantStore {
  tenantId: number;
}

const storage = new AsyncLocalStorage<TenantStore>();

export class TenantContext {
  /** Run `fn` (and everything it awaits) with `tenantId` as the current tenant. */
  static run<T>(tenantId: number, fn: () => T): T {
    return storage.run({ tenantId }, fn);
  }

  /** Current tenant id, or undefined when outside a tenant request. */
  static get(): number | undefined {
    return storage.getStore()?.tenantId;
  }

  /** Current tenant id, throwing if there is none (used by repositories). */
  static getOrThrow(): number {
    const id = storage.getStore()?.tenantId;
    if (id === undefined) {
      throw new Error(
        "[tenant] No tenant in context — repositories must be called within an " +
          "authenticated request that carries a tenantId claim.",
      );
    }
    return id;
  }
}

export default TenantContext;
