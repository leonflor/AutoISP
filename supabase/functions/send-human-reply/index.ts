import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface HumanReplyRequest {
  conversation_id: string;
  message: string;
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
    // JWT validation
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: HumanReplyRequest = await req.json();

    if (!body.conversation_id || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing conversation_id or message" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get conversation and validate assignment
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, isp_id, user_phone, assigned_agent_id, mode, tenant_agent_id")
      .eq("id", body.conversation_id)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate: user must be the assigned agent or an ISP admin
    const { data: agentRecord } = await supabase
      .from("human_agents")
      .select("id")
      .eq("user_id", user.id)
      .eq("isp_id", conversation.isp_id)
      .maybeSingle();

    const isAssigned =
      agentRecord && conversation.assigned_agent_id === agentRecord.id;

    if (!isAssigned) {
      // Check if ISP admin
      const { data: ispAccess } = await supabase
        .from("isp_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("isp_id", conversation.isp_id)
        .eq("is_active", true)
        .in("role", ["owner", "admin"])
        .maybeSingle();

      if (!ispAccess) {
        return new Response(
          JSON.stringify({ error: "Not assigned to this conversation" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Insert message with role='agent'
    const { data: insertedMsg, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: body.conversation_id,
        role: "agent",
        content: body.message,
        sent_by_agent_id: agentRecord?.id || null,
      })
      .select("id")
      .single();

    if (msgError) {
      console.error("Message insert error:", msgError);
      return new Response(
        JSON.stringify({ error: "Failed to save message" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send via WhatsApp
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
      // Message saved but WhatsApp not configured — still return success
      return new Response(
        JSON.stringify({
          success: true,
          message_id: insertedMsg.id,
          whatsapp_sent: false,
          reason: "Encryption not configured",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: whatsappConfig } = await supabase
      .from("whatsapp_configs")
      .select("*")
      .eq("isp_id", conversation.isp_id)
      .maybeSingle();

    if (
      !whatsappConfig?.api_key_encrypted ||
      !whatsappConfig?.encryption_iv
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message_id: insertedMsg.id,
          whatsapp_sent: false,
          reason: "WhatsApp not configured for ISP",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = await decrypt(
      whatsappConfig.api_key_encrypted,
      whatsappConfig.encryption_iv,
      ENCRYPTION_KEY
    );

    const settings = whatsappConfig.settings as Record<string, any> | null;
    const phoneNumberId =
      settings?.phone_number_id || whatsappConfig.instance_name || "";

    if (!phoneNumberId) {
      return new Response(
        JSON.stringify({
          success: true,
          message_id: insertedMsg.id,
          whatsapp_sent: false,
          reason: "Phone Number ID not configured",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const waResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.user_phone,
          type: "text",
          text: { preview_url: false, body: body.message },
        }),
      }
    );

    const waResult = await waResponse.json();
    const wamid = waResult.messages?.[0]?.id;

    // Log in whatsapp_messages
    await supabase.from("whatsapp_messages").insert({
      isp_id: conversation.isp_id,
      wamid: wamid || null,
      direction: "outbound",
      message_type: "text",
      recipient_phone: conversation.user_phone,
      sender_phone: whatsappConfig.phone_number || "",
      content: body.message,
      status: waResponse.ok ? "sent" : "failed",
      status_updated_at: new Date().toISOString(),
      sent_at: waResponse.ok ? new Date().toISOString() : null,
      error_message: !waResponse.ok
        ? waResult.error?.message || "API error"
        : null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message_id: insertedMsg.id,
        whatsapp_sent: waResponse.ok,
        wamid: wamid || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("send-human-reply error:", error);
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
