import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  isp_id: string;
  agent_id: string;
  messages: ChatMessage[];
  stream?: boolean;
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

  // Check API key (Lovable AI Gateway)
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.warn("⚠️ LOVABLE_API_KEY not configured - AI feature disabled");
    return new Response(
      JSON.stringify({
        error: "SERVICE_NOT_CONFIGURED",
        message: "Gateway de IA não configurado. A LOVABLE_API_KEY deve ser provisionada automaticamente.",
        docs: "https://docs.lovable.dev/features/ai-gateway"
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

    // Parse request body
    const body: ChatRequest = await req.json();
    
    if (!body.isp_id || !body.agent_id || !body.messages?.length) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: isp_id, agent_id, messages" }),
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

    // Get agent configuration
    const { data: agent, error: agentError } = await supabaseAdmin
      .from("ai_agents")
      .select("*")
      .eq("id", body.agent_id)
      .eq("isp_id", body.isp_id)
      .single();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: "Not found", message: "Agente de IA não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!agent.is_active) {
      return new Response(
        JSON.stringify({ error: "Unavailable", message: "Este agente está desativado" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check AI usage limits
    const { data: limits } = await supabaseAdmin
      .from("ai_limits")
      .select("*")
      .eq("isp_id", body.isp_id)
      .single();

    if (limits) {
      // Get current month usage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const { data: usage } = await supabaseAdmin
        .from("ai_usage")
        .select("tokens_used")
        .eq("isp_id", body.isp_id)
        .gte("created_at", `${currentMonth}-01`)
        .lt("created_at", `${currentMonth}-32`);

      const totalTokens = usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;

      if (totalTokens >= limits.monthly_token_limit) {
        return new Response(
          JSON.stringify({ 
            error: "Limit exceeded", 
            message: `Limite mensal de ${limits.monthly_token_limit.toLocaleString()} tokens atingido. Contate o suporte para aumentar.`,
            usage: { current: totalTokens, limit: limits.monthly_token_limit }
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`🤖 AI Chat request from user ${userId} for agent ${agent.name}`);

    // Build messages with system prompt
    const messages: ChatMessage[] = [
      { role: "system", content: agent.system_prompt || "Você é um assistente útil." },
      ...body.messages
    ];

    // Map model name for Lovable AI Gateway
    const modelMap: Record<string, string> = {
      "gpt-4o": "openai/gpt-4o",
      "gpt-4o-mini": "openai/gpt-4o-mini",
      "gemini-flash": "google/gemini-2.5-flash-preview",
      "gemini-pro": "google/gemini-2.5-pro-preview",
      "claude-sonnet": "anthropic/claude-sonnet-4"
    };

    const model = modelMap[agent.model] || "google/gemini-2.5-flash-preview";

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: agent.temperature || 0.7,
        max_tokens: agent.max_tokens || 1000,
        stream: body.stream || false
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error("❌ AI Gateway error:", errorData);
      return new Response(
        JSON.stringify({ 
          error: "AI Gateway error", 
          message: errorData.error?.message || "Erro ao processar requisição de IA"
        }),
        { status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle streaming response
    if (body.stream) {
      return new Response(aiResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      });
    }

    // Non-streaming response
    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || "";
    const tokensUsed = aiData.usage?.total_tokens || 0;

    console.log(`✅ AI response generated, tokens: ${tokensUsed}`);

    // Log usage
    await supabaseAdmin.from("ai_usage").insert({
      isp_id: body.isp_id,
      agent_id: body.agent_id,
      user_id: userId,
      tokens_used: tokensUsed,
      prompt_tokens: aiData.usage?.prompt_tokens || 0,
      completion_tokens: aiData.usage?.completion_tokens || 0,
      model: model
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: assistantMessage,
        usage: {
          tokens_used: tokensUsed,
          prompt_tokens: aiData.usage?.prompt_tokens || 0,
          completion_tokens: aiData.usage?.completion_tokens || 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error in AI chat:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
