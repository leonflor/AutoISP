import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SaveWhatsAppRequest {
  context: "admin" | "isp";
  isp_id?: string;
  phone_number_id: string;
  access_token?: string; // empty = keep existing
  phone_number: string;
  verify_token?: string; // empty = keep existing
}

async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["encrypt"]);
}

async function encrypt(text: string, masterKey: string): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterKey);
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

function maskToken(token: string): string {
  if (token.length <= 12) return "****";
  return token.substring(0, 4) + "..." + token.slice(-4);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, message: "Token de autenticação ausente" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, message: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const body: SaveWhatsAppRequest = await req.json();
    const { context, isp_id, phone_number_id, access_token, phone_number, verify_token } = body;

    console.log(`[save-whatsapp-config] context=${context}, user=${userId}`);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Authorization check
    if (context === "admin") {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!roles?.some((r: { role: string }) => r.role === "super_admin")) {
        return new Response(
          JSON.stringify({ success: false, message: "Acesso negado - requer super_admin" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (context === "isp") {
      if (!isp_id) {
        return new Response(
          JSON.stringify({ success: false, message: "isp_id é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: membership } = await supabaseAdmin
        .from("isp_users")
        .select("role")
        .eq("user_id", userId)
        .eq("isp_id", isp_id)
        .eq("is_active", true)
        .maybeSingle();

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        return new Response(
          JSON.stringify({ success: false, message: "Acesso negado ao ISP" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "context deve ser 'admin' ou 'isp'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Encryption key
    const masterKey = Deno.env.get("ENCRYPTION_KEY");
    if (!masterKey || masterKey.length < 32) {
      return new Response(
        JSON.stringify({ success: false, message: "ENCRYPTION_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const projectId = "zvxcwwhsjtdliihlvvof";

    if (context === "admin") {
      // Get existing config
      const { data: existing } = await supabaseAdmin
        .from("admin_whatsapp_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/whatsapp-webhook?admin=true`;

      const configData: Record<string, unknown> = {
        provider: "meta",
        api_url: "https://graph.facebook.com/v18.0",
        phone_number,
        phone_number_id,
        webhook_url: webhookUrl,
        updated_at: new Date().toISOString(),
      };

      // Encrypt access_token if provided
      if (access_token && access_token.trim()) {
        const encrypted = await encrypt(access_token, masterKey);
        configData.api_key_encrypted = encrypted.ciphertext;
        configData.encryption_iv = encrypted.iv;
      }

      // Encrypt verify_token if provided
      if (verify_token && verify_token.trim()) {
        configData.verify_token = verify_token;
      }

      let maskedKey = existing?.api_key_encrypted ? "••••••••" : null;
      if (access_token && access_token.trim()) {
        maskedKey = maskToken(access_token);
      }

      if (existing?.id) {
        const { error } = await supabaseAdmin
          .from("admin_whatsapp_config")
          .update(configData)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from("admin_whatsapp_config")
          .insert(configData);
        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ success: true, message: "Configuração salva com sucesso", masked_key: maskedKey }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // ISP context
      const { data: existing } = await supabaseAdmin
        .from("whatsapp_configs")
        .select("*")
        .eq("isp_id", isp_id)
        .maybeSingle();

      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/whatsapp-webhook?isp=${isp_id}`;

      const configData: Record<string, unknown> = {
        isp_id,
        provider: "meta",
        api_url: "https://graph.facebook.com/v18.0",
        phone_number,
        webhook_url: webhookUrl,
        updated_at: new Date().toISOString(),
      };

      // Encrypt access_token if provided
      if (access_token && access_token.trim()) {
        const encrypted = await encrypt(access_token, masterKey);
        configData.api_key_encrypted = encrypted.ciphertext;
        configData.encryption_iv = encrypted.iv;
      }

      // Build settings (phone_number_id + encrypted verify_token)
      const existingSettings = (existing?.settings as Record<string, unknown>) || {};
      const settings: Record<string, unknown> = {
        ...existingSettings,
        phone_number_id,
      };

      if (verify_token && verify_token.trim()) {
        const vtEncrypted = await encrypt(verify_token, masterKey);
        settings.verify_token_encrypted = vtEncrypted.ciphertext;
        settings.verify_token_iv = vtEncrypted.iv;
        // Remove plaintext verify_token if it existed
        delete settings.verify_token;
      }

      configData.settings = settings;

      let maskedKey = existing?.api_key_encrypted ? "••••••••" : null;
      if (access_token && access_token.trim()) {
        maskedKey = maskToken(access_token);
      }

      if (existing?.id) {
        const { error } = await supabaseAdmin
          .from("whatsapp_configs")
          .update(configData)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from("whatsapp_configs")
          .insert(configData);
        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ success: true, message: "Configuração salva com sucesso", masked_key: maskedKey }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[save-whatsapp-config] Erro:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
