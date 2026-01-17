import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateSubscriptionRequest {
  isp_id: string;
  plan_id: string;
  billing_type: "BOLETO" | "CREDIT_CARD" | "PIX";
  credit_card?: {
    holder_name: string;
    number: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
  };
  credit_card_holder_info?: {
    name: string;
    email: string;
    cpf_cnpj: string;
    postal_code: string;
    address_number: string;
    phone: string;
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

  // Check API key
  const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
  
  if (!ASAAS_API_KEY) {
    console.warn("⚠️ ASAAS_API_KEY not configured - feature disabled");
    return new Response(
      JSON.stringify({
        error: "SERVICE_NOT_CONFIGURED",
        message: "Gateway de pagamento não configurado. Configure a secret ASAAS_API_KEY no Supabase.",
        docs: "https://supabase.com/docs/guides/functions/secrets"
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Token não fornecido" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Validate user token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseAuth.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub;
    console.log(`👤 User ${userId} creating subscription`);

    // Parse request body
    const body: CreateSubscriptionRequest = await req.json();
    
    if (!body.isp_id || !body.plan_id || !body.billing_type) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: isp_id, plan_id, billing_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user belongs to ISP
    const { data: membership } = await supabaseAdmin
      .from("isp_members")
      .select("role")
      .eq("isp_id", body.isp_id)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Usuário não pertence a este ISP" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get ISP data (including asaas_customer_id)
    const { data: isp, error: ispError } = await supabaseAdmin
      .from("isps")
      .select("id, name, asaas_customer_id")
      .eq("id", body.isp_id)
      .single();

    if (ispError || !isp) {
      return new Response(
        JSON.stringify({ error: "Not found", message: "ISP não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isp.asaas_customer_id) {
      return new Response(
        JSON.stringify({ error: "Precondition failed", message: "ISP não possui cliente cadastrado no gateway. Crie o cliente primeiro." }),
        { status: 428, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get plan data
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("id, name, price_monthly, features")
      .eq("id", body.plan_id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Not found", message: "Plano não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine Asaas API URL
    const ASAAS_ENV = Deno.env.get("ASAAS_ENV") || "sandbox";
    const asaasBaseUrl = ASAAS_ENV === "production" 
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Calculate next due date (next month, day 10)
    const now = new Date();
    const nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    // Build Asaas subscription payload
    const asaasPayload: Record<string, any> = {
      customer: isp.asaas_customer_id,
      billingType: body.billing_type,
      value: plan.price_monthly,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description: `Assinatura ${plan.name} - ${isp.name}`,
      externalReference: body.isp_id
    };

    // Add credit card info if paying with card
    if (body.billing_type === "CREDIT_CARD" && body.credit_card) {
      asaasPayload.creditCard = {
        holderName: body.credit_card.holder_name,
        number: body.credit_card.number.replace(/\D/g, ""),
        expiryMonth: body.credit_card.expiry_month,
        expiryYear: body.credit_card.expiry_year,
        ccv: body.credit_card.cvv
      };

      if (body.credit_card_holder_info) {
        asaasPayload.creditCardHolderInfo = {
          name: body.credit_card_holder_info.name,
          email: body.credit_card_holder_info.email,
          cpfCnpj: body.credit_card_holder_info.cpf_cnpj.replace(/\D/g, ""),
          postalCode: body.credit_card_holder_info.postal_code.replace(/\D/g, ""),
          addressNumber: body.credit_card_holder_info.address_number,
          phone: body.credit_card_holder_info.phone.replace(/\D/g, "")
        };
      }
    }

    console.log(`📤 Creating subscription in Asaas:`, JSON.stringify({ ...asaasPayload, creditCard: "[REDACTED]" }, null, 2));

    const asaasResponse = await fetch(`${asaasBaseUrl}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_API_KEY
      },
      body: JSON.stringify(asaasPayload)
    });

    const asaasData = await asaasResponse.json();

    if (!asaasResponse.ok) {
      console.error("❌ Asaas error:", asaasData);
      return new Response(
        JSON.stringify({ 
          error: "Payment gateway error", 
          message: asaasData.errors?.[0]?.description || "Erro ao criar assinatura",
          details: asaasData
        }),
        { status: asaasResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Subscription created in Asaas: ${asaasData.id}`);

    // Create subscription in our database
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        isp_id: body.isp_id,
        plan_id: body.plan_id,
        external_id: asaasData.id,
        status: "pending",
        billing_type: body.billing_type.toLowerCase(),
        current_period_start: new Date().toISOString(),
        next_billing_date: dueDateStr
      })
      .select()
      .single();

    if (subError) {
      console.error("⚠️ Error saving subscription to database:", subError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription?.id,
        external_id: asaasData.id,
        next_due_date: dueDateStr,
        value: plan.price_monthly,
        message: "Assinatura criada com sucesso"
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error creating subscription:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
