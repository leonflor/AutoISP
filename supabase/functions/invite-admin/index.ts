import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "support" | "viewer";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Verify requesting user is admin
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Token de autenticação necessário" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Validate the requesting user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: requestingUser }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Usuário não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user has admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: userRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id);

    const hasAdminAccess = userRoles?.some(r => 
      r.role === "super_admin" || r.role === "admin"
    );

    if (!hasAdminAccess) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Apenas administradores podem convidar usuários" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body: InviteRequest = await req.json();

    if (!body.email || !body.full_name || !body.role) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: email, full_name, role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role
    const validRoles = ["super_admin", "admin", "support", "viewer"];
    if (!validRoles.includes(body.role)) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Perfil inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📩 Inviting admin: ${body.email} as ${body.role}`);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === body.email.toLowerCase());

    let userId: string;

    if (existingUser) {
      // User already exists, just add the role
      userId = existingUser.id;
      console.log(`👤 User already exists: ${userId}`);
    } else {
      // Create new user with a random password (they'll reset it)
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: body.email.toLowerCase(),
        password: tempPassword,
        email_confirm: true, // Mark email as confirmed
        user_metadata: {
          full_name: body.full_name
        }
      });

      if (createError) {
        console.error("❌ Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Create error", message: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      console.log(`✅ User created: ${userId}`);

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          email: body.email.toLowerCase(),
          full_name: body.full_name
        });

      if (profileError) {
        console.error("⚠️ Error creating profile:", profileError);
        // Continue anyway, profile might be created by trigger
      }
    }

    // Check if role already exists
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", body.role)
      .maybeSingle();

    if (existingRole) {
      return new Response(
        JSON.stringify({ error: "Conflict", message: "Este usuário já possui esse perfil" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        role: body.role
      });

    if (roleError) {
      console.error("❌ Error adding role:", roleError);
      return new Response(
        JSON.stringify({ error: "Role error", message: roleError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Role ${body.role} added to user ${userId}`);

    // Generate password reset link for the user to set their password
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: body.email.toLowerCase(),
      options: {
        redirectTo: `${req.headers.get("origin") || supabaseUrl}/reset-password`
      }
    });

    if (linkError) {
      console.error("⚠️ Error generating link:", linkError);
      // Still return success, user can use forgot password
      return new Response(
        JSON.stringify({
          success: true,
          user_id: userId,
          message: "Usuário criado com sucesso. Link de convite não pôde ser gerado - usuário pode usar 'Esqueci minha senha'."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send invite email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      try {
        // Call the send-email function
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            to: body.email,
            template: "admin-invite",
            data: {
              full_name: body.full_name,
              role_label: getRoleLabel(body.role),
              invite_url: linkData.properties?.action_link || `${req.headers.get("origin")}/reset-password`,
              platform_name: "Sistema de Gestão"
            }
          })
        });

        if (!emailResponse.ok) {
          console.warn("⚠️ Email service returned error:", await emailResponse.text());
        } else {
          console.log("📧 Invite email sent successfully");
        }
      } catch (emailError) {
        console.warn("⚠️ Failed to send invite email:", emailError);
      }
    } else {
      console.warn("⚠️ RESEND_API_KEY not configured - skipping email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        invite_url: linkData.properties?.action_link,
        message: existingUser 
          ? "Perfil adicionado ao usuário existente. Email de convite enviado."
          : "Usuário criado e convidado com sucesso."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error in invite-admin:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: "Super Administrador",
    admin: "Administrador",
    support: "Suporte",
    viewer: "Visualizador"
  };
  return labels[role] || role;
}
