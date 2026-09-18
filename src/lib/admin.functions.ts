import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data) };
  });

export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => ({ code: String(input.code ?? "").trim() }))
  .handler(async ({ data, context }) => {
    const expected = process.env["ADMIN_ACCESS_CODE"];
    if (!expected || data.code !== expected) return { ok: false as const, message: "That access code is not valid." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: "Admin abilities granted to this account." };
  });

export const grantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string }) => ({ email: String(input.email ?? "").trim().toLowerCase() }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase
      .rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) return { ok: false as const, message: "Only an admin can hand out admin abilities." };
    if (!data.email.includes("@")) return { ok: false as const, message: "Enter a valid email address." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let target: { id: string; email?: string | undefined } | null = null;
    for (let page = 1; page <= 10 && !target; page += 1) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) return { ok: false as const, message: error.message };
      target = list.users.find((user) => user.email?.toLowerCase() === data.email) ?? null;
      if (list.users.length < 200) break;
    }
    if (!target) return { ok: false as const, message: "No account found with that email." };

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const, message: `${data.email} now has admin abilities.` };
  });

export const listAdmins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { admins: [] as { id: string; email: string }[] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    const ids = new Set((rows ?? []).map((row) => row.user_id));
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const admins = (list?.users ?? [])
      .filter((user) => ids.has(user.id))
      .map((user) => ({ id: user.id, email: user.email ?? "unknown" }));
    return { admins };
  });
