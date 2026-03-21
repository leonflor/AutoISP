import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { runProcedureStep, detectProcedure } from "../_shared/procedure-runner.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    // Auth — validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userSupabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Admin client for DB operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      tenant_agent_id,
      template_id,
      message,
      conversation_id,
    } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // We need either tenant_agent_id or template_id
    if (!tenant_agent_id && !template_id) {
      return new Response(
        JSON.stringify({ error: "tenant_agent_id or template_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let resolvedTenantAgentId = tenant_agent_id;
    let resolvedIspId: string | null = null;

    // If we have a tenant_agent_id, validate access
    if (tenant_agent_id) {
      const { data: ta, error: taErr } = await supabase
        .from("tenant_agents")
        .select("id, isp_id, template_id")
        .eq("id", tenant_agent_id)
        .single();

      if (taErr || !ta) {
        return new Response(JSON.stringify({ error: "Tenant agent not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      resolvedIspId = ta.isp_id;
    }

    // If only template_id provided (admin testing), find or create a temp tenant_agent
    if (!tenant_agent_id && template_id) {
      // Get user's ISP or use a placeholder for admin
      const { data: ispUser } = await supabase
        .from("isp_users")
        .select("isp_id")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (ispUser) {
        resolvedIspId = ispUser.isp_id;

        // Find existing tenant_agent for this template+isp, or create one
        const { data: existingTa } = await supabase
          .from("tenant_agents")
          .select("id")
          .eq("isp_id", resolvedIspId)
          .eq("template_id", template_id)
          .limit(1)
          .single();

        if (existingTa) {
          resolvedTenantAgentId = existingTa.id;
        } else {
          // For admin simulation without a real tenant_agent, we need at least one ISP
          // Create a temporary tenant_agent
          const { data: newTa, error: newTaErr } = await supabase
            .from("tenant_agents")
            .insert({
              isp_id: resolvedIspId,
              template_id,
              custom_name: "Simulador",
              is_active: true,
            })
            .select("id")
            .single();

          if (newTaErr || !newTa) {
            return new Response(
              JSON.stringify({ error: "Failed to create test agent" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          resolvedTenantAgentId = newTa.id;
        }
      } else {
        // Super admin without ISP — check if they have admin role
        const { data: hasAdmin } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "super_admin",
        });

        if (!hasAdmin) {
          return new Response(
            JSON.stringify({ error: "No ISP membership and not super_admin" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        // Use the first ISP available for simulation
        const { data: firstIsp } = await supabase
          .from("isps")
          .select("id")
          .limit(1)
          .single();

        if (!firstIsp) {
          return new Response(
            JSON.stringify({ error: "No ISPs available for simulation" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }

        resolvedIspId = firstIsp.id;

        const { data: existingTa } = await supabase
          .from("tenant_agents")
          .select("id")
          .eq("isp_id", resolvedIspId)
          .eq("template_id", template_id)
          .limit(1)
          .single();

        if (existingTa) {
          resolvedTenantAgentId = existingTa.id;
        } else {
          const { data: newTa, error: newTaErr } = await supabase
            .from("tenant_agents")
            .insert({
              isp_id: resolvedIspId,
              template_id,
              custom_name: "Simulador",
              is_active: true,
            })
            .select("id")
            .single();

          if (newTaErr || !newTa) {
            return new Response(
              JSON.stringify({ error: "Failed to create test agent" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          resolvedTenantAgentId = newTa.id;
        }
      }
    }

    // Find or create simulator conversation
    let activeConversationId = conversation_id;

    if (activeConversationId) {
      // Validate the conversation exists and belongs to simulator
      const { data: conv } = await supabase
        .from("conversations")
        .select("id, channel")
        .eq("id", activeConversationId)
        .eq("channel", "simulator")
        .single();

      if (!conv) {
        activeConversationId = null;
      }
    }

    if (!activeConversationId) {
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          isp_id: resolvedIspId,
          tenant_agent_id: resolvedTenantAgentId,
          user_phone: `sim_${userId.slice(0, 8)}`,
          channel: "simulator",
          mode: "bot",
          user_identifier: "Simulador",
          collected_context: {},
          intent_attempts: 0,
          step_index: 0,
          turns_on_current_step: 0,
        })
        .select("id")
        .single();

      if (convErr || !newConv) {
        console.error("Error creating simulator conversation:", convErr);
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      activeConversationId = newConv.id;
    }

    // Run the procedure engine (same as webhook, but no WhatsApp sending)
    const result = await runProcedureStep(supabase, activeConversationId, message.trim());

    // Fetch updated conversation state for debug
    const { data: updatedConv } = await supabase
      .from("conversations")
      .select("step_index, active_procedure_id, intent_attempts, mode, collected_context")
      .eq("id", activeConversationId)
      .single();

    let procedureName: string | null = null;
    let stepInstruction: string | null = null;

    if (updatedConv?.active_procedure_id) {
      const { data: proc } = await supabase
        .from("procedures")
        .select("name, definition")
        .eq("id", updatedConv.active_procedure_id)
        .single();

      if (proc) {
        procedureName = proc.name;
        const def = proc.definition as { steps?: Array<{ instruction?: string }> };
        const stepIdx = updatedConv.step_index ?? 0;
        stepInstruction = def?.steps?.[stepIdx]?.instruction ?? null;
      }
    }

    return new Response(
      JSON.stringify({
        reply: result.reply,
        conversation_id: activeConversationId,
        debug: {
          ...result.debug,
          procedure_name: procedureName,
          step_instruction: stepInstruction,
          step_index: updatedConv?.step_index ?? 0,
          mode: updatedConv?.mode ?? "bot",
          intent_attempts: updatedConv?.intent_attempts ?? 0,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[simulate-agent] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
