import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"]);
}

async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const encryptedData = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivData }, key, encryptedData);
  return new TextDecoder().decode(decrypted);
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, message: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const { context, isp_id }: { context: "admin" | "isp"; isp_id?: string } = await req.json();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const masterKey = Deno.env.get("ENCRYPTION_KEY");

    if (!masterKey || masterKey.length < 32) {
      return new Response(
        JSON.stringify({ success: false, message: "ENCRYPTION_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let phoneNumberId: string;
    let accessToken: string;
    let configId: string;
    let tableName: string;

    if (context === "admin") {
      // Check super_admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!roles?.some((r: { role: string }) => r.role === "super_admin")) {
        return new Response(
          JSON.stringify({ success: false, message: "Acesso negado" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: config } = await supabaseAdmin
        .from("admin_whatsapp_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!config?.api_key_encrypted || !config?.encryption_iv || !config?.phone_number_id) {
        return new Response(
          JSON.stringify({ success: false, message: "Credenciais não configuradas" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      accessToken = await decrypt(config.api_key_encrypted, config.encryption_iv, masterKey);
      phoneNumberId = config.phone_number_id;
      configId = config.id;
      tableName = "admin_whatsapp_config";
    } else {
      if (!isp_id) {
        return new Response(
          JSON.stringify({ success: false, message: "isp_id é obrigatório" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check ISP membership
      const { data: membership } = await supabaseAdmin
        .from("isp_users")
        .select("role")
        .eq("user_id", userId)
        .eq("isp_id", isp_id)
        .eq("is_active", true)
        .maybeSingle();

      if (!membership) {
        return new Response(
          JSON.stringify({ success: false, message: "Acesso negado ao ISP" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: config } = await supabaseAdmin
        .from("whatsapp_configs")
        .select("*")
        .eq("isp_id", isp_id)
        .maybeSingle();

      if (!config?.api_key_encrypted || !config?.encryption_iv) {
        return new Response(
          JSON.stringify({ success: false, message: "Credenciais não configuradas" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const settings = (config.settings as Record<string, string>) || {};
      if (!settings.phone_number_id) {
        return new Response(
          JSON.stringify({ success: false, message: "Phone Number ID não configurado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      accessToken = await decrypt(config.api_key_encrypted, config.encryption_iv, masterKey);
      phoneNumberId = settings.phone_number_id;
      configId = config.id;
      tableName = "whatsapp_configs";
    }

    // Test connection to Meta API
    console.log(`[test-whatsapp-connection] Testing ${context} phoneNumberId=${phoneNumberId}`);

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMsg = error.error?.message || `Erro HTTP ${response.status}`;

      await supabaseAdmin
        .from(tableName)
        .update({ is_connected: false })
        .eq("id", configId);

      return new Response(
        JSON.stringify({ success: false, message: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await response.json(); // consume body

    // Update connection status
    await supabaseAdmin
      .from(tableName)
      .update({ is_connected: true, connected_at: new Date().toISOString() })
      .eq("id", configId);

    return new Response(
      JSON.stringify({ success: true, message: "Conexão estabelecida com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[test-whatsapp-connection] Erro:", error);
    return new Response(
      JSON.stringify({ success: false, message: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
