import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============= Decryption =============

async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

async function decrypt(
  ciphertext: string,
  iv: string,
  masterKey: string
): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), (c) =>
    c.charCodeAt(0)
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ciphertextBytes
  );

  return new TextDecoder().decode(decrypted);
}

interface SendRequest {
  to: string;
  message?: string;
  template_name?: string;
  template_language?: string;
  template_params?: Record<string, string>[];
  isp_id?: string; // optional, for admin context detection
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ENCRYPTION_KEY = Deno.env.get("ENCRYPTION_KEY");

  try {
    // Manual JWT validation
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SendRequest = await req.json();

    if (!body.to) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' phone number" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body.message && !body.template_name) {
      return new Response(
        JSON.stringify({ error: "Missing 'message' or 'template_name'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
      return new Response(
        JSON.stringify({ error: "Server encryption not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine context: ISP or Admin
    let ispId: string | null = null;
    let accessToken: string;
    let phoneNumberId: string;
    let senderPhone: string;

    // Check if user is super_admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    const isSuperAdmin = !!roleData;

    // If super_admin and no isp_id provided, use admin config
    if (isSuperAdmin && !body.isp_id) {
      const { data: adminConfig, error: configError } = await supabase
        .from("admin_whatsapp_config")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (configError || !adminConfig) {
        return new Response(
          JSON.stringify({
            error: "Admin WhatsApp not configured",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!adminConfig.api_key_encrypted || !adminConfig.phone_number_id) {
        return new Response(
          JSON.stringify({ error: "Admin WhatsApp credentials incomplete" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Decrypt admin token
      if (adminConfig.encryption_iv) {
        accessToken = await decrypt(
          adminConfig.api_key_encrypted,
          adminConfig.encryption_iv,
          ENCRYPTION_KEY
        );
      } else {
        accessToken = adminConfig.api_key_encrypted;
      }

      phoneNumberId = adminConfig.phone_number_id;
      senderPhone = adminConfig.phone_number || "";
    } else {
      // ISP context
      if (body.isp_id) {
        ispId = body.isp_id;
      } else {
        // Get ISP from user membership
        const { data: membership } = await supabase
          .from("isp_users")
          .select("isp_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1)
          .maybeSingle();

        if (!membership) {
          return new Response(
            JSON.stringify({ error: "User not associated with any ISP" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        ispId = membership.isp_id;
      }

      // Verify user has admin access to this ISP (or is super_admin)
      if (!isSuperAdmin) {
        const { data: ispAccess } = await supabase
          .from("isp_users")
          .select("role")
          .eq("user_id", user.id)
          .eq("isp_id", ispId)
          .eq("is_active", true)
          .in("role", ["owner", "admin"])
          .maybeSingle();

        if (!ispAccess) {
          return new Response(
            JSON.stringify({ error: "Insufficient permissions" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      // Get ISP WhatsApp config
      const { data: whatsappConfig, error: configError } = await supabase
        .from("whatsapp_configs")
        .select("*")
        .eq("isp_id", ispId)
        .maybeSingle();

      if (configError || !whatsappConfig) {
        return new Response(
          JSON.stringify({ error: "WhatsApp not configured for this ISP" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!whatsappConfig.api_key_encrypted) {
        return new Response(
          JSON.stringify({ error: "WhatsApp credentials incomplete" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get phone_number_id from settings or instance_name
      const settings = whatsappConfig.settings as Record<string, any> | null;
      phoneNumberId =
        settings?.phone_number_id || whatsappConfig.instance_name || "";

      if (!phoneNumberId) {
        return new Response(
          JSON.stringify({ error: "Phone Number ID not configured" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Decrypt ISP token
      if (whatsappConfig.encryption_iv) {
        accessToken = await decrypt(
          whatsappConfig.api_key_encrypted,
          whatsappConfig.encryption_iv,
          ENCRYPTION_KEY
        );
      } else {
        accessToken = whatsappConfig.api_key_encrypted;
      }

      senderPhone = whatsappConfig.phone_number || "";
    }

    // Build WhatsApp API payload
    let waPayload: Record<string, unknown>;

    if (body.template_name) {
      // Template message
      const components: Record<string, unknown>[] = [];
      if (body.template_params && body.template_params.length > 0) {
        components.push({
          type: "body",
          parameters: body.template_params.map((p) => ({
            type: "text",
            text: Object.values(p)[0],
          })),
        });
      }

      waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: body.to,
        type: "template",
        template: {
          name: body.template_name,
          language: { code: body.template_language || "pt_BR" },
          ...(components.length > 0 ? { components } : {}),
        },
      };
    } else {
      // Text message
      waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: body.to,
        type: "text",
        text: {
          preview_url: false,
          body: body.message,
        },
      };
    }

    // Send via WhatsApp Cloud API
    const waResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(waPayload),
      }
    );

    const waResult = await waResponse.json();

    if (!waResponse.ok) {
      console.error("WhatsApp API error:", waResult);

      // Log failed message
      await supabase.from("whatsapp_messages").insert({
        isp_id: ispId,
        direction: "outbound",
        message_type: body.template_name ? "template" : "text",
        recipient_phone: body.to,
        sender_phone: senderPhone,
        template_name: body.template_name || null,
        template_params: body.template_params || null,
        content: body.message || `[Template: ${body.template_name}]`,
        status: "failed",
        status_updated_at: new Date().toISOString(),
        error_code: waResult.error?.code?.toString() || null,
        error_message: waResult.error?.message || "API error",
      });

      return new Response(
        JSON.stringify({
          error: waResult.error?.message || "Failed to send message",
          details: waResult.error,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const wamid = waResult.messages?.[0]?.id;

    // Log sent message
    await supabase.from("whatsapp_messages").insert({
      isp_id: ispId,
      wamid: wamid || null,
      direction: "outbound",
      message_type: body.template_name ? "template" : "text",
      recipient_phone: body.to,
      sender_phone: senderPhone,
      template_name: body.template_name || null,
      template_params: body.template_params || null,
      content: body.message || `[Template: ${body.template_name}]`,
      status: "sent",
      status_updated_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        wamid,
        message_id: wamid,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("send-whatsapp error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
