import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { conversation_id, to_agent_id } = await req.json();

    if (!conversation_id || !to_agent_id) {
      return new Response(JSON.stringify({ error: "Missing conversation_id or to_agent_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, isp_id, assigned_agent_id, mode")
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

    // Verify permission: must be assigned agent or ISP admin
    const { data: fromAgent } = await supabase
      .from("human_agents")
      .select("id, current_chat_count")
      .eq("user_id", user.id)
      .eq("isp_id", conversation.isp_id)
      .maybeSingle();

    const isAssigned = fromAgent && conversation.assigned_agent_id === fromAgent.id;

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

    // Validate target agent capacity
    const { data: toAgent, error: toError } = await supabase
      .from("human_agents")
      .select("id, is_available, current_chat_count, max_concurrent_chats")
      .eq("id", to_agent_id)
      .eq("isp_id", conversation.isp_id)
      .single();

    if (toError || !toAgent) {
      return new Response(JSON.stringify({ error: "Target agent not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!toAgent.is_available) {
      return new Response(JSON.stringify({ error: "Target agent is not available" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const currentCount = toAgent.current_chat_count || 0;
    const maxChats = toAgent.max_concurrent_chats || 3;

    if (currentCount >= maxChats) {
      return new Response(JSON.stringify({ error: "Target agent has reached max concurrent chats" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transfer: update conversation
    await supabase
      .from("conversations")
      .update({ assigned_agent_id: to_agent_id })
      .eq("id", conversation_id);

    // Decrement from_agent count
    if (fromAgent) {
      await supabase
        .from("human_agents")
        .update({ current_chat_count: Math.max(0, (fromAgent.current_chat_count || 1) - 1) })
        .eq("id", fromAgent.id);
    }

    // Increment to_agent count
    await supabase
      .from("human_agents")
      .update({ current_chat_count: currentCount + 1 })
      .eq("id", to_agent_id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("transfer-conversation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
