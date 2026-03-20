import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runProcedureStep, detectProcedure } from "../_shared/procedure-runner.ts";
import { getOpenAIKey } from "../_shared/context-builder.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============= Decryption Functions =============

async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ciphertextBytes
  );

  return new TextDecoder().decode(decrypted);
}

// Rate limiting: Track message counts per phone number
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(phoneNumber);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(phoneNumber, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    console.warn(`Rate limit exceeded for phone: ${phoneNumber.slice(-4)}`);
    return false;
  }

  entry.count++;
  return true;
}

function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Verify Meta/WhatsApp webhook signature (HMAC-SHA256)
async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  appSecret: string
): Promise<boolean> {
  if (!signature || !appSecret) {
    console.warn("Missing signature or app secret for verification");
    return false;
  }

  const expectedPrefix = "sha256=";
  if (!signature.startsWith(expectedPrefix)) {
    console.warn("Invalid signature format");
    return false;
  }

  const providedHash = signature.slice(expectedPrefix.length);

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(appSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedHash.length !== providedHash.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash.charCodeAt(i) ^ providedHash.charCodeAt(i);
    }

    return result === 0;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

function sanitizePhoneNumber(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 7 || cleaned.length > 15) {
    return null;
  }
  return cleaned;
}

function sanitizeMessageContent(content: string, maxLength: number = 4096): string {
  if (!content || typeof content !== "string") {
    return "";
  }
  let sanitized = content.trim().slice(0, maxLength);
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return sanitized;
}

function validatePayloadStructure(payload: unknown): payload is WhatsAppWebhookPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const p = payload as Record<string, unknown>;
  if (typeof p.object !== "string") {
    return false;
  }
  if (!Array.isArray(p.entry)) {
    return false;
  }
  return true;
}

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

// ============= Escalate to Human =============

async function escalateToHuman(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  reason: string,
  template: Record<string, unknown>,
  whatsappConfig: Record<string, unknown>,
  recipientPhone: string,
  ispId: string,
): Promise<void> {
  console.log(`[webhook] Escalating conversation ${conversationId}: ${reason}`);

  // 1. Update conversation mode
  await supabase
    .from("conversations")
    .update({
      mode: "human",
      handover_reason: reason,
      handover_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  // 2. Generate handover summary via gpt-4o-mini
  let summary = "";
  try {
    const openaiKey = await getOpenAIKey(supabase);
    if (openaiKey) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(20);

      const historyText = (msgs ?? [])
        .filter((m: Record<string, unknown>) => m.role === "user" || m.role === "assistant")
        .map((m: Record<string, unknown>) => `${m.role}: ${m.content}`)
        .join("\n");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0,
          messages: [
            {
              role: "system",
              content:
                "Resuma em 4 linhas para um atendente humano: 1) Motivo do contato, 2) Dados coletados, 3) O que o bot já fez, 4) Por que escalou.",
            },
            {
              role: "user",
              content: `Motivo da escalação: ${reason}\n\nHistórico:\n${historyText}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        summary = json.choices?.[0]?.message?.content ?? "";
      }
    }
  } catch (err) {
    console.warn("[webhook] Failed to generate handover summary:", err);
  }

  // 3. Save summary
  if (summary) {
    await supabase
      .from("conversations")
      .update({ handover_summary: summary })
      .eq("id", conversationId);
  }

  // 4. Send failure message to user via WhatsApp
  const failureMsg =
    (template.intent_failure_message as string) ??
    "Vou transferir você para um de nossos atendentes. Aguarde um momento, por favor.";

  await sendWhatsAppMessage(whatsappConfig, recipientPhone, failureMsg, supabase, ispId, conversationId);

  // 5. Broadcast Realtime notification
  const { data: conv } = await supabase
    .from("conversations")
    .select("user_phone, isp_id, tenant_agent_id")
    .eq("id", conversationId)
    .single();

  if (conv) {
    const channel = supabase.channel("agent-notifications");
    await channel.send({
      type: "broadcast",
      event: "new_handover",
      payload: {
        conversation_id: conversationId,
        isp_id: conv.isp_id,
        tenant_agent_id: conv.tenant_agent_id,
        user_phone: conv.user_phone,
        reason,
        summary,
      },
    });
    supabase.removeChannel(channel);
  }
}

// ============= Main Handler =============

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WHATSAPP_VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
  const WHATSAPP_APP_SECRET = Deno.env.get("WHATSAPP_APP_SECRET");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  cleanupRateLimits();

  const isTestMode = req.headers.get("X-Test-Mode") === "true";

  try {
    const url = new URL(req.url);

    // GET - Webhook Verification (WhatsApp Challenge)
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      console.log("Webhook verification request:", { mode, tokenPresent: !!token });

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
      const rawBody = await req.text();

      // Verify webhook signature if app secret is configured
      if (WHATSAPP_APP_SECRET && !isTestMode) {
        const signature = req.headers.get("x-hub-signature-256");
        const isValid = await verifyWebhookSignature(rawBody, signature, WHATSAPP_APP_SECRET);

        if (!isValid) {
          console.error("Invalid webhook signature");
          await supabase.from("webhook_logs").insert({
            provider: "whatsapp",
            event_type: "security_error",
            direction: "incoming",
            payload: { error: "Invalid signature", signaturePresent: !!signature },
            error_message: "Webhook signature verification failed",
          });
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (!WHATSAPP_APP_SECRET && !isTestMode) {
        console.warn("WHATSAPP_APP_SECRET not configured - signature verification skipped");
      }

      // Parse and validate payload
      let payload: unknown;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        console.error("Invalid JSON payload");
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!validatePayloadStructure(payload)) {
        console.error("Invalid payload structure");
        return new Response(JSON.stringify({ error: "Invalid payload structure" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const validatedPayload = payload as WhatsAppWebhookPayload;

      // Log the webhook
      await supabase.from("webhook_logs").insert({
        provider: "whatsapp",
        event_type: "incoming_message",
        direction: "incoming",
        payload: validatedPayload,
      });

      if (validatedPayload.object !== "whatsapp_business_account") {
        return new Response(JSON.stringify({ status: "ignored" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Collect test results for test mode
      const testResults: Array<{ reply: string; debug: Record<string, unknown> }> = [];

      for (const entry of validatedPayload.entry) {
        for (const change of entry.changes) {
          if (change.field !== "messages") continue;

          const value = change.value;
          const messages = value.messages || [];
          const contacts = value.contacts || [];
          const statuses = value.statuses || [];

          // Process status updates (kept intact)
          for (const statusUpdate of statuses) {
            const statusMap: Record<string, { status: string; field: string }> = {
              sent: { status: "sent", field: "sent_at" },
              delivered: { status: "delivered", field: "delivered_at" },
              read: { status: "read", field: "read_at" },
              failed: { status: "failed", field: "status_updated_at" },
            };

            const mapped = statusMap[statusUpdate.status];
            if (mapped) {
              const updateData: Record<string, unknown> = {
                status: mapped.status,
                status_updated_at: new Date().toISOString(),
                [mapped.field]: new Date().toISOString(),
              };

              await supabase
                .from("whatsapp_messages")
                .update(updateData)
                .eq("wamid", statusUpdate.id)
                .then(({ error }) => {
                  if (error) console.error("Error updating message status:", error);
                });
            }
          }

          if (messages.length === 0) continue;

          // Find ISP by phone number (kept intact)
          const { data: whatsappConfig, error: configError } = await supabase
            .from("whatsapp_configs")
            .select("*, isps(*)")
            .eq("phone_number", value.metadata.display_phone_number)
            .eq("is_connected", true)
            .single();

          if (configError || !whatsappConfig) {
            console.log("ISP not found for phone:", value.metadata.display_phone_number);
            return new Response(JSON.stringify({ status: "isp_not_found" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const ispId = whatsappConfig.isp_id;

          // ── Resolve tenant_agent_id ──
          const { data: tenantAgent } = await supabase
            .from("tenant_agents")
            .select("*, agent_templates!inner(type, max_intent_attempts, intent_failure_message, intent_failure_action)")
            .eq("isp_id", ispId)
            .eq("is_active", true)
            .eq("agent_templates.type", "atendente")
            .limit(1)
            .single();

          if (!tenantAgent) {
            console.log("No active tenant agent (type=atendente) for ISP:", ispId);
            for (const message of messages) {
              const senderPhone = sanitizePhoneNumber(message.from);
              if (senderPhone && message.type === "text") {
                await sendWhatsAppMessage(
                  whatsappConfig,
                  senderPhone,
                  "Obrigado por entrar em contato! Um de nossos atendentes irá responder em breve.",
                  supabase,
                  ispId,
                );
              }
            }
            continue;
          }

          const template = tenantAgent.agent_templates as Record<string, unknown>;

          for (const message of messages) {
            const senderPhone = sanitizePhoneNumber(message.from);
            if (!senderPhone) {
              console.warn("Invalid sender phone number format");
              continue;
            }

            if (!checkRateLimit(senderPhone)) {
              console.warn(`Rate limited: ${senderPhone.slice(-4)}`);
              continue;
            }

            const senderName = sanitizeMessageContent(
              contacts.find((c) => c.wa_id === message.from)?.profile?.name || "Desconhecido",
              100
            );

            console.log(`Processing message from ${senderName} (${senderPhone.slice(-4)})`);

            // Extract and sanitize message content
            let messageContent = "";
            let messageType = message.type;

            switch (message.type) {
              case "text":
                messageContent = sanitizeMessageContent(message.text?.body || "");
                break;
              case "image":
                messageContent = sanitizeMessageContent(message.image?.caption || "[Imagem recebida]");
                messageType = "image";
                break;
              case "audio":
                messageContent = "[Áudio recebido]";
                messageType = "audio";
                break;
              case "document":
                messageContent = sanitizeMessageContent(
                  `[Documento: ${message.document?.filename || "arquivo"}]`
                );
                messageType = "document";
                break;
              case "interactive":
                if (message.interactive?.button_reply) {
                  messageContent = sanitizeMessageContent(message.interactive.button_reply.title);
                } else if (message.interactive?.list_reply) {
                  messageContent = sanitizeMessageContent(message.interactive.list_reply.title);
                }
                break;
              default:
                messageContent = `[${sanitizeMessageContent(message.type, 50)}]`;
            }

            if (!messageContent.trim()) {
              console.log("Skipping empty message");
              continue;
            }

            // ── Find or create conversation (NEW SCHEMA) ──
            let { data: conversation } = await supabase
              .from("conversations")
              .select("*")
              .eq("user_phone", senderPhone)
              .eq("tenant_agent_id", tenantAgent.id)
              .eq("isp_id", ispId)
              .is("resolved_at", null)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            if (!conversation) {
              const { data: newConversation, error: createError } = await supabase
                .from("conversations")
                .insert({
                  isp_id: ispId,
                  tenant_agent_id: tenantAgent.id,
                  user_phone: senderPhone,
                  channel: "whatsapp",
                  mode: "bot",
                  user_identifier: senderName,
                  collected_context: {},
                  intent_attempts: 0,
                  step_index: 0,
                  turns_on_current_step: 0,
                })
                .select()
                .single();

              if (createError) {
                console.error("Error creating conversation:", createError);
                continue;
              }

              conversation = newConversation;
            }

            // Try to find subscriber by phone
            const { data: subscriber } = await supabase
              .from("subscribers")
              .select("id, name")
              .eq("isp_id", ispId)
              .ilike("phone", `%${senderPhone.slice(-9)}%`)
              .single();

            // Register inbound message in whatsapp_messages
            await supabase
              .from("whatsapp_messages")
              .insert({
                isp_id: ispId,
                wamid: message.id,
                direction: "inbound",
                message_type: messageType,
                recipient_phone: value.metadata.display_phone_number,
                sender_phone: senderPhone,
                content: messageContent,
                status: "delivered",
                status_updated_at: new Date().toISOString(),
                conversation_id: conversation.id,
                subscriber_id: subscriber?.id || null,
                delivered_at: new Date().toISOString(),
              })
              .then(({ error }) => {
                if (error) console.error("Error logging inbound message:", error);
              });

            // ── Check conversation mode ──
            if (conversation.mode === "human") {
              // Save message in normalized table, broadcast to human queue, return
              await supabase.from("messages").insert({
                conversation_id: conversation.id,
                role: "user",
                content: messageContent,
                wamid: message.id,
              });

              const channel = supabase.channel(`human-queue-${ispId}`);
              await channel.send({
                type: "broadcast",
                event: "new_message",
                payload: {
                  conversation_id: conversation.id,
                  user_phone: senderPhone,
                  content: messageContent,
                  sender_name: senderName,
                },
              });
              supabase.removeChannel(channel);

              console.log(`[webhook] Message routed to human queue for conversation ${conversation.id}`);
              continue;
            }

            if (conversation.mode === "paused") {
              await supabase.from("messages").insert({
                conversation_id: conversation.id,
                role: "user",
                content: messageContent,
                wamid: message.id,
              });
              console.log(`[webhook] Conversation ${conversation.id} is paused, message saved only`);
              continue;
            }

            // ── Mode is 'bot' — process with AI engine ──

            // Only process text-based messages with AI
            if (!messageContent.trim() || message.type === "audio") {
              await supabase.from("messages").insert({
                conversation_id: conversation.id,
                role: "user",
                content: messageContent,
                wamid: message.id,
              });
              continue;
            }

            // Check intent_attempts if no active procedure
            if (!conversation.active_procedure_id) {
              const detected = await detectProcedure(
                supabase,
                messageContent,
                template.id as string,
              );

              if (!detected) {
                const currentAttempts = (conversation.intent_attempts ?? 0) + 1;
                const maxAttempts = (template.max_intent_attempts as number) ?? 3;

                await supabase
                  .from("conversations")
                  .update({ intent_attempts: currentAttempts })
                  .eq("id", conversation.id);

                if (currentAttempts >= maxAttempts) {
                  await escalateToHuman(
                    supabase,
                    conversation.id,
                    "max_intent_attempts",
                    template,
                    whatsappConfig,
                    senderPhone,
                    ispId,
                  );
                  continue;
                }
              }
              // If detected, runProcedureStep will handle activation internally
            }

            // Run the procedure engine
            try {
              const result = await runProcedureStep(supabase, conversation.id, messageContent);

              if (isTestMode) {
                testResults.push(result);
              } else {
                // Send reply via WhatsApp
                if (result.reply) {
                  await sendWhatsAppMessage(
                    whatsappConfig,
                    senderPhone,
                    result.reply,
                    supabase,
                    ispId,
                    conversation.id,
                  );
                }
              }

              console.log(`[webhook] AI response processed for conversation ${conversation.id}`);
            } catch (engineError) {
              console.error("[webhook] Engine error:", engineError);

              // Send fallback message
              if (!isTestMode) {
                await sendWhatsAppMessage(
                  whatsappConfig,
                  senderPhone,
                  "Desculpe, estou com dificuldades no momento. Por favor, tente novamente em alguns instantes.",
                  supabase,
                  ispId,
                  conversation.id,
                );
              }
            }
          }
        }
      }

      // If test mode, return results as JSON
      if (isTestMode && testResults.length > 0) {
        return new Response(JSON.stringify({ results: testResults }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ status: "processed" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("Webhook error:", error);

    await supabase.from("webhook_logs").insert({
      provider: "whatsapp",
      event_type: "error",
      direction: "incoming",
      payload: { error: "Internal processing error" },
      error_message: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(JSON.stringify({ status: "error", message: "Internal error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============= Send WhatsApp Message (kept intact) =============

async function sendWhatsAppMessage(
  config: Record<string, unknown>,
  to: string,
  text: string,
  supabaseClient?: ReturnType<typeof createClient>,
  ispId?: string,
  conversationId?: string,
): Promise<boolean> {
  try {
    const phoneNumberId = config.instance_name as string;

    if (!config.api_key_encrypted || !phoneNumberId) {
      console.error("WhatsApp config missing access token or phone number ID");
      return false;
    }

    const ENCRYPTION_KEY = Deno.env.get("ENCRYPTION_KEY");
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
      console.error("ENCRYPTION_KEY not configured or too short");
      return false;
    }

    let accessToken: string;

    if (config.encryption_iv) {
      try {
        accessToken = await decrypt(
          config.api_key_encrypted as string,
          config.encryption_iv as string,
          ENCRYPTION_KEY
        );
        console.log("WhatsApp API key decrypted successfully");
      } catch (decryptError) {
        console.error("Failed to decrypt WhatsApp API key:", decryptError);
        return false;
      }
    } else {
      console.warn("WhatsApp API key not encrypted (missing encryption_iv). Using raw value.");
      accessToken = config.api_key_encrypted as string;
    }

    if (!accessToken) {
      console.error("WhatsApp access token is empty after decryption");
      return false;
    }

    const maxLength = 4000;
    const messageParts = [];

    for (let i = 0; i < text.length; i += maxLength) {
      messageParts.push(text.substring(i, i + maxLength));
    }

    for (const part of messageParts) {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
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
            body: part,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("WhatsApp API error:", response.status, errorText);
        return false;
      }

      const result = await response.json();
      const wamid = result.messages?.[0]?.id;
      console.log("Message sent:", wamid);

      if (supabaseClient && wamid) {
        await supabaseClient
          .from("whatsapp_messages")
          .insert({
            isp_id: ispId || null,
            wamid,
            direction: "outbound",
            message_type: "text",
            recipient_phone: to,
            sender_phone: (config.phone_number as string) || null,
            content: part,
            status: "sent",
            status_updated_at: new Date().toISOString(),
            sent_at: new Date().toISOString(),
            conversation_id: conversationId || null,
          })
          .then(({ error: insertErr }) => {
            if (insertErr) console.error("Error logging outbound message:", insertErr);
          });
      }
    }

    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
