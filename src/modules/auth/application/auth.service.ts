import { ConflictError, NotFoundError, UnauthorizedError } from "../../../shared/domain/errors/AppError.js";
import { getSupabase, getSupabaseAdmin } from "../../../shared/infrastructure/database/supabase.js";
import type { AuthRepositoryPort } from "../domain/ports.js";

/** Fallback tenant until Inc2 (self-serve tenant provisioning) lands. */
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export class AuthService {
  constructor(private readonly repo: AuthRepositoryPort) {}

  /**
   * Provision a staff account: create the credential in Supabase Auth
   * (service-role, auto-confirmed) then mirror a profile row in our "User"
   * table keyed by the auth user id. We never store or hash passwords here.
   */
  async register(data: { email: string; password: string; name: string; roleId?: string; tenantId?: string }) {
    const admin = getSupabaseAdmin();
    if (!admin) {
      throw new Error("[auth] SUPABASE_SERVICE_ROLE_KEY is required to provision users (see .env.example).");
    }
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new ConflictError("ອີເມວນີ້ແລ້ວມີໃນລະບົບ");
    const defaultRole = await this.repo.findRoleByName("USER");
    const fallback = await this.repo.findRoleByName("CASHIER");
    const roleId = data.roleId || defaultRole?.id || fallback?.id;
    if (!roleId) throw new NotFoundError("ບໍ່ພົບ role ສລັບການສະໝັກບັນຊີ");
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new UnauthorizedError(error?.message ?? "ສ້າງບັນຊີ Supabase ບໍ່ສຳເລັດ");
    const tenantId = data.tenantId ?? DEFAULT_TENANT_ID;
    return this.repo.createUser({ id: created.user.id, email: data.email, name: data.name, roleId, tenantId });
  }

  /**
   * Login via Supabase Auth; returns the Supabase access token as `token`.
   * Downstream requests present it as a Bearer token and the auth middleware
   * re-validates it with supabase.auth.getUser(token).
   */
  async login(email: string, password: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new UnauthorizedError("ອີເມວຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
    const profile = await this.repo.findById(data.user.id);
    if (!profile) throw new UnauthorizedError("ບໍ່ພົບໂປຣໄລ໌ູ້ໃຊ້ໃນລະບົບ");
    return { user: profile, token: data.session.access_token };
  }
}
