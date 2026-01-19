import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; mime_type: string; sha256: string; filename: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  wa_message_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WHATSAPP_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const url = new URL(req.url);

    // GET - Webhook Verification (WhatsApp Challenge)
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      console.log("Webhook verification request:", { mode, token: token?.substring(0, 5) + "..." });

      if (!WHATSAPP_VERIFY_TOKEN) {
        console.error("WHATSAPP_VERIFY_TOKEN not configured");
        return new Response("Webhook token not configured", { status: 503 });
      }

      if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
        console.log("Webhook verified successfully");
        return new Response(challenge, { status: 200 });
      }

      console.error("Webhook verification failed - token mismatch");
      return new Response("Forbidden", { status: 403 });
    }

    // POST - Receive Messages
    if (req.method === "POST") {
      const payload: WhatsAppWebhookPayload = await req.json();

      console.log("Received webhook payload:", JSON.stringify(payload, null, 2).substring(0, 500));

      // Log the webhook
      await supabase.from("webhook_logs").insert({
        provider: "whatsapp",
        event_type: "incoming_message",
        direction: "incoming",
        payload: payload,
      });

      // Process only message events
      if (payload.object !== "whatsapp_business_account") {
        return new Response(JSON.stringify({ status: "ignored" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field !== "messages") continue;

          const value = change.value;
          const phoneNumberId = value.metadata.phone_number_id;
          const messages = value.messages || [];
          const contacts = value.contacts || [];

          if (messages.length === 0) continue;

          // Find ISP by phone number
          const { data: whatsappConfig, error: configError } = await supabase
            .from("whatsapp_configs")
            .select("*, isps(*)")
            .eq("phone_number", value.metadata.display_phone_number)
            .eq("is_connected", true)
            .single();

          if (configError || !whatsappConfig) {
            console.log("ISP not found for phone:", value.metadata.display_phone_number);
            // Return 200 to avoid retries from WhatsApp
            return new Response(JSON.stringify({ status: "isp_not_found" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const ispId = whatsappConfig.isp_id;

          for (const message of messages) {
            const senderPhone = message.from;
            const senderName = contacts.find((c) => c.wa_id === senderPhone)?.profile?.name || "Desconhecido";

            console.log(`Processing message from ${senderName} (${senderPhone})`);

            // Try to find subscriber by phone
            const { data: subscriber } = await supabase
              .from("subscribers")
              .select("id, name")
              .eq("isp_id", ispId)
              .ilike("phone", `%${senderPhone.slice(-9)}%`)
              .single();

            // Find or create conversation
            let { data: conversation } = await supabase
              .from("conversations")
              .select("*")
              .eq("isp_id", ispId)
              .eq("channel", "whatsapp")
              .eq("status", "open")
              .or(`metadata->>wa_id.eq.${senderPhone}`)
              .order("started_at", { ascending: false })
              .limit(1)
              .single();

            if (!conversation) {
              // Create new conversation
              const { data: newConversation, error: createError } = await supabase
                .from("conversations")
                .insert({
                  isp_id: ispId,
                  channel: "whatsapp",
                  subscriber_id: subscriber?.id || null,
                  status: "open",
                  subject: `Conversa WhatsApp - ${senderName}`,
                  messages: [],
                  metadata: {
                    wa_id: senderPhone,
                    phone_number_id: phoneNumberId,
                    profile_name: senderName,
                  },
                  started_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (createError) {
                console.error("Error creating conversation:", createError);
                continue;
              }

              conversation = newConversation;
            }

            // Extract message content
            let messageContent = "";
            let messageType = message.type;

            switch (message.type) {
              case "text":
                messageContent = message.text?.body || "";
                break;
              case "image":
                messageContent = message.image?.caption || "[Imagem recebida]";
                messageType = "image";
                break;
              case "audio":
                messageContent = "[Áudio recebido]";
                messageType = "audio";
                break;
              case "document":
                messageContent = `[Documento: ${message.document?.filename || "arquivo"}]`;
                messageType = "document";
                break;
              case "interactive":
                if (message.interactive?.button_reply) {
                  messageContent = message.interactive.button_reply.title;
                } else if (message.interactive?.list_reply) {
                  messageContent = message.interactive.list_reply.title;
                }
                break;
              default:
                messageContent = `[${message.type}]`;
            }

            // Add message to conversation
            const existingMessages: ConversationMessage[] = (conversation.messages as ConversationMessage[]) || [];
            const newMessage: ConversationMessage = {
              role: "user",
              content: messageContent,
              timestamp: new Date().toISOString(),
              wa_message_id: message.id,
            };

            const updatedMessages = [...existingMessages, newMessage];

            // Update conversation with new message
            await supabase
              .from("conversations")
              .update({ messages: updatedMessages })
              .eq("id", conversation.id);

            // Check if AI agent should respond (only for text messages)
            if (message.type === "text" && messageContent.trim()) {
              await processWithAI(
                supabase,
                whatsappConfig,
                conversation,
                updatedMessages,
                senderPhone,
                ispId
              );
            }
          }
        }
      }

      return new Response(JSON.stringify({ status: "processed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Webhook error:", error);

    // Log error
    await supabase.from("webhook_logs").insert({
      provider: "whatsapp",
      event_type: "error",
      direction: "incoming",
      payload: { error: error instanceof Error ? error.message : "Unknown error" },
      error_message: error instanceof Error ? error.message : "Unknown error",
    });

    // Return 200 to avoid retries
    return new Response(JSON.stringify({ status: "error", message: "Internal error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processWithAI(
  supabase: any,
  whatsappConfig: any,
  conversation: any,
  messages: ConversationMessage[],
  recipientPhone: string,
  ispId: string
) {
  try {
    // Find active AI agent for this ISP (type "atendente")
    const { data: ispSubscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("isp_id", ispId)
      .eq("status", "ativa")
      .single() as { data: { plan_id: string } | null };

    if (!ispSubscription) {
      console.log("No active subscription for ISP");
      return;
    }

    // Get AI limits for the plan
    const { data: aiLimit } = await supabase
      .from("ai_limits")
      .select("*, ai_agents(*)")
      .eq("plan_id", ispSubscription.plan_id)
      .eq("is_enabled", true)
      .eq("ai_agents.type", "atendente")
      .single() as { data: any };

    if (!aiLimit || !aiLimit.ai_agents) {
      console.log("No AI agent available for this ISP");
      // Send fallback message
      await sendWhatsAppMessage(
        whatsappConfig,
        recipientPhone,
        "Obrigado por entrar em contato! Um de nossos atendentes irá responder em breve."
      );
      return;
    }

    const agent = aiLimit.ai_agents;

    // Update conversation with agent
    await (supabase as any)
      .from("conversations")
      .update({ agent_id: agent.id })
      .eq("id", conversation.id);

    // Prepare messages for AI (last 10 messages for context)
    const aiMessages = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call AI chat edge function
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        messages: aiMessages,
        agentId: agent.id,
        ispId: ispId,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI chat error:", await aiResponse.text());
      await sendWhatsAppMessage(
        whatsappConfig,
        recipientPhone,
        "Desculpe, estou com dificuldades no momento. Por favor, tente novamente em alguns instantes."
      );
      return;
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || aiData.content;

    if (!assistantMessage) {
      console.error("No AI response content");
      return;
    }

    // Add AI response to conversation
    const aiConversationMessage: ConversationMessage = {
      role: "assistant",
      content: assistantMessage,
      timestamp: new Date().toISOString(),
    };

    await (supabase as any)
      .from("conversations")
      .update({ 
        messages: [...messages, aiConversationMessage],
        agent_id: agent.id 
      })
      .eq("id", conversation.id);

    // Send response via WhatsApp
    await sendWhatsAppMessage(whatsappConfig, recipientPhone, assistantMessage);

    console.log("AI response sent successfully");
  } catch (error) {
    console.error("Error processing with AI:", error);
    
    // Send fallback message
    await sendWhatsAppMessage(
      whatsappConfig,
      recipientPhone,
      "Obrigado pela mensagem! Estamos processando sua solicitação."
    );
  }
}

async function sendWhatsAppMessage(
  config: any,
  to: string,
  text: string
): Promise<boolean> {
  try {
    const accessToken = config.api_key_encrypted; // In production, decrypt this
    const phoneNumberId = config.instance_name; // Using instance_name as phone_number_id

    if (!accessToken || !phoneNumberId) {
      console.error("WhatsApp config missing access token or phone number ID");
      return false;
    }

    // Split long messages (WhatsApp limit is 4096 chars)
    const maxLength = 4000;
    const messageParts = [];
    
    for (let i = 0; i < text.length; i += maxLength) {
      messageParts.push(text.substring(i, i + maxLength));
    }

    for (const part of messageParts) {
      const response = await fetch(
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
            to: to,
            type: "text",
            text: { 
              preview_url: false,
              body: part 
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("WhatsApp API error:", response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log("Message sent:", result.messages?.[0]?.id);
    }

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
