import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Missing authorization header" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Invalid session" }, 401);

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .in("role", ["admin", "super_admin"]);
    if (!roles || roles.length === 0) return json({ error: "Not authorized" }, 403);

    const { full_name, mobile, password, date_of_birth, panchayath_id, ward_id } = await req.json();

    if (!full_name || !mobile || !/^\d{10}$/.test(String(mobile)) || !password || String(password).length < 6) {
      return json({ error: "Provide a name, valid 10-digit mobile and a password of at least 6 characters." }, 400);
    }

    const email = `${mobile}@cloudshelf.app`;
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, mobile },
    });
    if (createError || !created.user) {
      return json({ error: createError?.message || "Could not create the user." }, 400);
    }

    const newUserId = created.user.id;

    await admin.from("profiles").update({
      full_name,
      mobile,
      date_of_birth: date_of_birth || null,
      panchayath_id: panchayath_id || null,
      ward_id: ward_id || null,
    }).eq("id", newUserId);

    const { error: roleError } = await admin.from("user_roles").insert({ user_id: newUserId, role: "delivery" });
    if (roleError && !roleError.message.includes("duplicate")) {
      return json({ error: roleError.message }, 400);
    }

    return json({ success: true, user_id: newUserId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
