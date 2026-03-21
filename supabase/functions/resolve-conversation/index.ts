import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversation_id, return_to_bot } = await req.json();

    if (!conversation_id) {
      return new Response(JSON.stringify({ error: "Missing conversation_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, isp_id, user_phone, assigned_agent_id, mode, tenant_agent_id")
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (conversation.mode !== "human") {
      return new Response(JSON.stringify({ error: "Conversation is not in human mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify permission: assigned agent or ISP admin
    const { data: agentRecord } = await supabase
      .from("human_agents")
      .select("id")
      .eq("user_id", user.id)
      .eq("isp_id", conversation.isp_id)
      .maybeSingle();

    const isAssigned = agentRecord && conversation.assigned_agent_id === agentRecord.id;

    if (!isAssigned) {
      const { data: ispAccess } = await supabase
        .from("isp_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("isp_id", conversation.isp_id)
        .eq("is_active", true)
        .in("role", ["owner", "admin"])
        .maybeSingle();

      if (!ispAccess) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update conversation
    await supabase
      .from("conversations")
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: "human",
        assigned_agent_id: null,
        mode: return_to_bot ? "bot" : "human",
      })
      .eq("id", conversation_id);

    // Decrement agent chat count
    if (conversation.assigned_agent_id) {
      const { data: agent } = await supabase
        .from("human_agents")
        .select("current_chat_count")
        .eq("id", conversation.assigned_agent_id)
        .single();

      if (agent) {
        await supabase
          .from("human_agents")
          .update({ current_chat_count: Math.max(0, (agent.current_chat_count || 1) - 1) })
          .eq("id", conversation.assigned_agent_id);
      }
    }

    // Send closing message via WhatsApp if returning to bot
    if (return_to_bot && ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 32) {
      const { data: whatsappConfig } = await supabase
        .from("whatsapp_configs")
        .select("*")
        .eq("isp_id", conversation.isp_id)
        .maybeSingle();

      if (whatsappConfig?.api_key_encrypted && whatsappConfig?.encryption_iv) {
        const accessToken = await decrypt(
          whatsappConfig.api_key_encrypted,
          whatsappConfig.encryption_iv,
          ENCRYPTION_KEY
        );

        const settings = whatsappConfig.settings as Record<string, any> | null;
        const phoneNumberId = settings?.phone_number_id || whatsappConfig.instance_name || "";

        if (phoneNumberId) {
          const closingMessage = "Atendimento encerrado. Se precisar de mais ajuda, é só enviar uma mensagem! 😊";

          // Insert closing message in DB
          await supabase.from("messages").insert({
            conversation_id,
            role: "agent",
            content: closingMessage,
          });

          // Send via WhatsApp
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
                text: { preview_url: false, body: closingMessage },
              }),
            }
          );

          const waResult = await waResponse.json();

          await supabase.from("whatsapp_messages").insert({
            isp_id: conversation.isp_id,
            wamid: waResult.messages?.[0]?.id || null,
            direction: "outbound",
            message_type: "text",
            recipient_phone: conversation.user_phone,
            sender_phone: whatsappConfig.phone_number || "",
            content: closingMessage,
            status: waResponse.ok ? "sent" : "failed",
            status_updated_at: new Date().toISOString(),
            sent_at: waResponse.ok ? new Date().toISOString() : null,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("resolve-conversation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
