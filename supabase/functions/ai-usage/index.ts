import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept GET
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Get query parameters
    const url = new URL(req.url);
    const ispId = url.searchParams.get("isp_id");
    const period = url.searchParams.get("period") || "monthly"; // monthly, daily, all

    if (!ispId) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Parâmetro isp_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user belongs to ISP
    const { data: membership } = await supabaseAdmin
      .from("isp_members")
      .select("role")
      .eq("isp_id", ispId)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Usuário não pertence a este ISP" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📊 AI usage query from user ${userId} for ISP ${ispId}, period: ${period}`);

    // Calculate date range
    const now = new Date();
    let startDate: string;
    let periodLabel: string;

    switch (period) {
      case "daily":
        startDate = now.toISOString().split("T")[0];
        periodLabel = startDate;
        break;
      case "all":
        startDate = "2020-01-01";
        periodLabel = "all_time";
        break;
      case "monthly":
      default:
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
        periodLabel = startDate.slice(0, 7);
    }

    // Get usage data
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from("ai_usage")
      .select(`
        id,
        agent_id,
        tokens_used,
        prompt_tokens,
        completion_tokens,
        model,
        created_at
      `)
      .eq("isp_id", ispId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });

    if (usageError) {
      console.error("Error fetching usage:", usageError);
      return new Response(
        JSON.stringify({ error: "Database error", message: "Erro ao buscar dados de uso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get agents for grouping
    const { data: agents } = await supabaseAdmin
      .from("ai_agents")
      .select("id, name")
      .eq("isp_id", ispId);

    const agentMap = new Map(agents?.map(a => [a.id, a.name]) || []);

    // Calculate totals
    const totalTokens = usageData?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
    const totalRequests = usageData?.length || 0;

    // Group by agent
    const byAgent: Record<string, { tokens: number; requests: number }> = {};
    usageData?.forEach(u => {
      const agentName = agentMap.get(u.agent_id) || "Desconhecido";
      if (!byAgent[agentName]) {
        byAgent[agentName] = { tokens: 0, requests: 0 };
      }
      byAgent[agentName].tokens += u.tokens_used || 0;
      byAgent[agentName].requests += 1;
    });

    const byAgentArray = Object.entries(byAgent).map(([agent, data]) => ({
      agent,
      tokens: data.tokens,
      requests: data.requests
    }));

    // Get limits
    const { data: limits } = await supabaseAdmin
      .from("ai_limits")
      .select("monthly_token_limit, daily_request_limit")
      .eq("isp_id", ispId)
      .single();

    const monthlyLimit = limits?.monthly_token_limit || 100000;
    const usedPercentage = Math.round((totalTokens / monthlyLimit) * 100);

    return new Response(
      JSON.stringify({
        period: periodLabel,
        total_tokens: totalTokens,
        total_requests: totalRequests,
        by_agent: byAgentArray,
        limit: {
          monthly_tokens: monthlyLimit,
          used_percentage: Math.min(usedPercentage, 100)
        },
        recent_usage: usageData?.slice(0, 10).map(u => ({
          agent: agentMap.get(u.agent_id) || "Desconhecido",
          tokens: u.tokens_used,
          model: u.model,
          date: u.created_at
        }))
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error fetching AI usage:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
