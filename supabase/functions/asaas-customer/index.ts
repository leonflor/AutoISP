import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCustomerRequest {
  isp_id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
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
    console.log(`👤 User ${userId} creating customer`);

    // Parse request body
    const body: CreateCustomerRequest = await req.json();
    
    if (!body.name || !body.email || !body.cpf_cnpj || !body.isp_id) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: name, email, cpf_cnpj, isp_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user belongs to ISP
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
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

    // Determine Asaas API URL (sandbox vs production)
    const ASAAS_ENV = Deno.env.get("ASAAS_ENV") || "sandbox";
    const asaasBaseUrl = ASAAS_ENV === "production" 
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";

    // Create customer in Asaas
    const asaasPayload: Record<string, any> = {
      name: body.name,
      email: body.email,
      cpfCnpj: body.cpf_cnpj.replace(/\D/g, ""),
      phone: body.phone?.replace(/\D/g, ""),
      externalReference: body.isp_id
    };

    // Add address if provided
    if (body.address) {
      asaasPayload.address = body.address.street;
      asaasPayload.addressNumber = body.address.number;
      asaasPayload.complement = body.address.complement;
      asaasPayload.province = body.address.neighborhood;
      asaasPayload.city = body.address.city;
      asaasPayload.state = body.address.state;
      asaasPayload.postalCode = body.address.postal_code.replace(/\D/g, "");
    }

    console.log(`📤 Creating customer in Asaas:`, JSON.stringify(asaasPayload, null, 2));

    const asaasResponse = await fetch(`${asaasBaseUrl}/customers`, {
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
          message: asaasData.errors?.[0]?.description || "Erro ao criar cliente",
          details: asaasData
        }),
        { status: asaasResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Customer created in Asaas: ${asaasData.id}`);

    // Update ISP with customer ID
    const { error: updateError } = await supabaseAdmin
      .from("isps")
      .update({
        asaas_customer_id: asaasData.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", body.isp_id);

    if (updateError) {
      console.error("⚠️ Error updating ISP with customer ID:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        customer_id: asaasData.id,
        message: "Cliente criado com sucesso no gateway de pagamento"
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error creating customer:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
