import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

interface AsaasEvent {
  event: string;
  payment?: {
    id: string;
    customer: string;
    subscription?: string;
    value: number;
    netValue: number;
    status: string;
    billingType: string;
    dueDate: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    pixTransaction?: {
      qrCodeUrl?: string;
      pixCopiaECola?: string;
    };
  };
  subscription?: {
    id: string;
    customer: string;
    status: string;
    value: number;
    nextDueDate: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check webhook token
  const WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
  
  if (!WEBHOOK_TOKEN) {
    console.warn("⚠️ ASAAS_WEBHOOK_TOKEN not configured - webhook disabled");
    return new Response(
      JSON.stringify({
        error: "SERVICE_NOT_CONFIGURED",
        message: "Webhook Asaas não configurado. Configure a secret ASAAS_WEBHOOK_TOKEN no Supabase.",
        docs: "https://supabase.com/docs/guides/functions/secrets"
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate webhook token from header
  const receivedToken = req.headers.get("asaas-access-token");
  if (receivedToken !== WEBHOOK_TOKEN) {
    console.error("❌ Invalid webhook token received");
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Token inválido" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const event: AsaasEvent = await req.json();
    console.log(`📥 Webhook received: ${event.event}`, JSON.stringify(event, null, 2));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log webhook event
    await supabase.from("webhook_logs").insert({
      source: "asaas",
      event_type: event.event,
      payload: event,
      processed: false
    });

    // Process based on event type
    switch (event.event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED":
        await handlePaymentConfirmed(supabase, event);
        break;

      case "PAYMENT_CREATED":
        await handlePaymentCreated(supabase, event);
        break;

      case "PAYMENT_OVERDUE":
        await handlePaymentOverdue(supabase, event);
        break;

      case "PAYMENT_DELETED":
      case "PAYMENT_REFUNDED":
        await handlePaymentCanceled(supabase, event);
        break;

      case "SUBSCRIPTION_UPDATED":
        await handleSubscriptionUpdated(supabase, event);
        break;

      case "SUBSCRIPTION_DELETED":
        await handleSubscriptionDeleted(supabase, event);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.event}`);
    }

    // Mark as processed
    await supabase
      .from("webhook_logs")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("payload->payment->id", event.payment?.id || "")
      .eq("event_type", event.event);

    return new Response(
      JSON.stringify({ success: true, event: event.event }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error processing webhook:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Handler functions
async function handlePaymentConfirmed(supabase: any, event: AsaasEvent) {
  const payment = event.payment!;
  console.log(`✅ Payment confirmed: ${payment.id}`);

  // Update invoice status
  const { error: invoiceError } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("external_id", payment.id);

  if (invoiceError) {
    console.error("Error updating invoice:", invoiceError);
  }

  // Update subscription status if linked
  if (payment.subscription) {
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        updated_at: new Date().toISOString()
      })
      .eq("external_id", payment.subscription);

    if (subError) {
      console.error("Error updating subscription:", subError);
    }
  }
}

async function handlePaymentCreated(supabase: any, event: AsaasEvent) {
  const payment = event.payment!;
  console.log(`📄 Payment created: ${payment.id}`);

  // Find subscription by external_id
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, isp_id")
    .eq("external_id", payment.subscription)
    .single();

  if (!subscription) {
    console.warn(`⚠️ Subscription not found for payment: ${payment.subscription}`);
    return;
  }

  // Create invoice
  const { error } = await supabase.from("invoices").insert({
    subscription_id: subscription.id,
    isp_id: subscription.isp_id,
    external_id: payment.id,
    amount: payment.value,
    due_date: payment.dueDate,
    status: "pending",
    billing_type: payment.billingType.toLowerCase(),
    invoice_url: payment.invoiceUrl,
    boleto_url: payment.bankSlipUrl,
    pix_qrcode: payment.pixTransaction?.qrCodeUrl,
    pix_copy_paste: payment.pixTransaction?.pixCopiaECola
  });

  if (error) {
    console.error("Error creating invoice:", error);
  }
}

async function handlePaymentOverdue(supabase: any, event: AsaasEvent) {
  const payment = event.payment!;
  console.log(`⚠️ Payment overdue: ${payment.id}`);

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "overdue",
      updated_at: new Date().toISOString()
    })
    .eq("external_id", payment.id);

  if (error) {
    console.error("Error updating invoice to overdue:", error);
  }
}

async function handlePaymentCanceled(supabase: any, event: AsaasEvent) {
  const payment = event.payment!;
  console.log(`❌ Payment canceled/refunded: ${payment.id}`);

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString()
    })
    .eq("external_id", payment.id);

  if (error) {
    console.error("Error updating invoice to canceled:", error);
  }
}

async function handleSubscriptionUpdated(supabase: any, event: AsaasEvent) {
  const subscription = event.subscription!;
  console.log(`🔄 Subscription updated: ${subscription.id}`);

  // Map Asaas status to our status
  const statusMap: Record<string, string> = {
    ACTIVE: "active",
    INACTIVE: "canceled",
    EXPIRED: "expired"
  };

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: statusMap[subscription.status] || subscription.status.toLowerCase(),
      next_billing_date: subscription.nextDueDate,
      updated_at: new Date().toISOString()
    })
    .eq("external_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
  }
}

async function handleSubscriptionDeleted(supabase: any, event: AsaasEvent) {
  const subscription = event.subscription!;
  console.log(`🗑️ Subscription deleted: ${subscription.id}`);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("external_id", subscription.id);

  if (error) {
    console.error("Error canceling subscription:", error);
  }
}
