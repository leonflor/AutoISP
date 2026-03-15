/**
 * State Machine Module — controls conversation flow via backend-driven states.
 * 
 * Core functions:
 * - getOrCreateSession(): load or init a conversation session
 * - getCurrentStateDefinition(): fetch the active state from flow_state_definitions
 * - evaluateTransition(): check transition_rules against current context
 * - advanceState(): move session to next state
 * - validateToolCall(): guardrail — validate tool before execution
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TOOL_CATALOG } from "./tool-catalog.ts";

// ── Types ──

export interface TransitionRule {
  type: "tool_success" | "user_input" | "option_selected" | "switch_flow" | "auto";
  tool_name?: string;
  pattern?: string; // regex for user_input
  options?: string[]; // for option_selected
  target_flow_slug?: string; // for switch_flow
  goto_state: string; // target state_key
}

export interface StateDefinition {
  id: string;
  flow_id: string;
  state_key: string;
  step_order: number;
  objective: string;
  allowed_tools: string[];
  transition_rules: TransitionRule[];
  fallback_message: string | null;
  max_attempts: number;
  is_active: boolean;
}

export interface ConversationSession {
  id: string;
  isp_id: string;
  isp_agent_id: string;
  flow_id: string | null;
  user_id: string;
  current_state: string;
  step: number;
  context: SessionContext;
  status: "active" | "completed" | "expired" | "escalated";
  attempts: number;
}

export interface SessionContext {
  [key: string]: unknown;
  executed_tools?: ExecutedToolEntry[];
  action_log?: ActionLogEntry[];
}

export interface ExecutedToolEntry {
  tool: string;
  state: string;
  success: boolean;
  timestamp: string;
}

export interface ActionLogEntry {
  action: string;
  state: string;
  tool?: string;
  result?: string;
  timestamp: string;
}

// ── getOrCreateSession ──

export async function getOrCreateSession(
  supabase: SupabaseClient,
  ispId: string,
  ispAgentId: string,
  userId: string,
  agentTemplateId: string,
  conversationId?: string,
): Promise<ConversationSession> {
  // If conversationId provided, try to load existing session
  if (conversationId) {
    const { data: existing } = await supabase
      .from("conversation_sessions")
      .select("*")
      .eq("id", conversationId)
      .eq("status", "active")
      .single();

    if (existing) {
      return existing as ConversationSession;
    }
  }

  // Find default flow: first active flow linked to this agent
  const { data: flowLinks } = await supabase
    .from("ai_agent_flow_links")
    .select("flow_id")
    .eq("agent_id", agentTemplateId)
    .eq("is_active", true)
    .order("sort_order")
    .limit(1);

  const defaultFlowId = flowLinks?.[0]?.flow_id || null;
  let initialState = "init";

  // If we have a flow, get the first state
  if (defaultFlowId) {
    const { data: firstState } = await supabase
      .from("flow_state_definitions")
      .select("state_key")
      .eq("flow_id", defaultFlowId)
      .eq("is_active", true)
      .order("step_order")
      .limit(1)
      .single();

    if (firstState) {
      initialState = firstState.state_key;
    }
  }

  // Create new session
  const { data: session, error } = await supabase
    .from("conversation_sessions")
    .insert({
      isp_id: ispId,
      isp_agent_id: ispAgentId,
      flow_id: defaultFlowId,
      user_id: userId,
      current_state: initialState,
      step: 1,
      context: { executed_tools: [], action_log: [] },
      status: "active",
      attempts: 0,
    })
    .select()
    .single();

  if (error || !session) {
    throw new Error(`Failed to create session: ${error?.message}`);
  }

  return session as ConversationSession;
}

// ── getCurrentStateDefinition ──

export async function getCurrentStateDefinition(
  supabase: SupabaseClient,
  flowId: string | null,
  stateKey: string,
): Promise<StateDefinition | null> {
  if (!flowId) return null;

  const { data } = await supabase
    .from("flow_state_definitions")
    .select("*")
    .eq("flow_id", flowId)
    .eq("state_key", stateKey)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  return {
    ...data,
    transition_rules: Array.isArray(data.transition_rules) ? data.transition_rules : [],
  } as StateDefinition;
}

// ── evaluateTransition ──

export function evaluateTransition(
  rules: TransitionRule[],
  event: {
    type: "tool_success" | "user_input" | "option_selected";
    tool_name?: string;
    user_message?: string;
    selected_option?: string;
  },
): string | null {
  for (const rule of rules) {
    if (rule.type !== event.type) continue;

    switch (rule.type) {
      case "tool_success":
        if (rule.tool_name && rule.tool_name === event.tool_name) {
          return rule.goto_state;
        }
        if (!rule.tool_name) {
          // Generic tool_success — any tool
          return rule.goto_state;
        }
        break;

      case "user_input":
        if (rule.pattern && event.user_message) {
          try {
            const regex = new RegExp(rule.pattern, "i");
            if (regex.test(event.user_message)) {
              return rule.goto_state;
            }
          } catch {
            // Invalid regex, skip
          }
        }
        if (!rule.pattern) {
          // Any user input triggers transition
          return rule.goto_state;
        }
        break;

      case "option_selected":
        if (rule.options && event.selected_option) {
          if (rule.options.includes(event.selected_option)) {
            return rule.goto_state;
          }
        }
        break;
    }
  }

  return null; // No transition matched
}

// ── advanceState ──

export async function advanceState(
  supabase: SupabaseClient,
  sessionId: string,
  newStateKey: string,
  newStep: number,
  context: SessionContext,
): Promise<void> {
  // Reset attempts and executed_tools for new state
  const updatedContext: SessionContext = {
    ...context,
    executed_tools: [],
    // Keep action_log growing
  };

  const { error } = await supabase
    .from("conversation_sessions")
    .update({
      current_state: newStateKey,
      step: newStep,
      context: updatedContext,
      attempts: 0,
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Failed to advance state:", error);
  }
}

// ── completeSession ──

export async function completeSession(
  supabase: SupabaseClient,
  sessionId: string,
  status: "completed" | "escalated" = "completed",
): Promise<void> {
  await supabase
    .from("conversation_sessions")
    .update({ status })
    .eq("id", sessionId);
}

// ── validateToolCall ── (Tool Guardrail)

export interface ToolValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateToolCall(
  toolName: string,
  allowedTools: string[],
  executedTools: ExecutedToolEntry[],
  hasActiveErp: boolean,
): ToolValidationResult {
  // 1. Check if tool is in allowed_tools for current state
  if (allowedTools.length > 0 && !allowedTools.includes(toolName)) {
    return { valid: false, reason: `Tool "${toolName}" não permitida no estado atual` };
  }

  // 2. Check if tool exists in catalog
  const catalogEntry = TOOL_CATALOG[toolName];
  if (!catalogEntry) {
    return { valid: false, reason: `Tool "${toolName}" não existe no catálogo` };
  }

  // 3. Check ERP requirement
  if (catalogEntry.requires_erp && !hasActiveErp) {
    return { valid: false, reason: `Tool "${toolName}" requer ERP ativo` };
  }

  // 4. Block repeated successful execution in same state
  const alreadyExecuted = executedTools.some(
    (e) => e.tool === toolName && e.success,
  );
  if (alreadyExecuted) {
    return { valid: false, reason: `Tool "${toolName}" já executada com sucesso neste estado` };
  }

  return { valid: true };
}

// ── incrementAttempts ──

export async function incrementAttempts(
  supabase: SupabaseClient,
  sessionId: string,
  currentAttempts: number,
  context: SessionContext,
): Promise<void> {
  await supabase
    .from("conversation_sessions")
    .update({
      attempts: currentAttempts + 1,
      context,
    })
    .eq("id", sessionId);
}

// ── logAction ──

export function logAction(
  context: SessionContext,
  action: string,
  state: string,
  tool?: string,
  result?: string,
): SessionContext {
  const log: ActionLogEntry = {
    action,
    state,
    tool,
    result,
    timestamp: new Date().toISOString(),
  };

  return {
    ...context,
    action_log: [...(context.action_log || []), log],
  };
}

// ── recordToolExecution ──

export function recordToolExecution(
  context: SessionContext,
  tool: string,
  state: string,
  success: boolean,
): SessionContext {
  const entry: ExecutedToolEntry = {
    tool,
    state,
    success,
    timestamp: new Date().toISOString(),
  };

  return {
    ...context,
    executed_tools: [...(context.executed_tools || []), entry],
  };
}

// ── getAllStatesForFlow ──

export async function getAllStatesForFlow(
  supabase: SupabaseClient,
  flowId: string,
): Promise<StateDefinition[]> {
  const { data } = await supabase
    .from("flow_state_definitions")
    .select("*")
    .eq("flow_id", flowId)
    .eq("is_active", true)
    .order("step_order");

  return (data || []).map((d: any) => ({
    ...d,
    transition_rules: Array.isArray(d.transition_rules) ? d.transition_rules : [],
  })) as StateDefinition[];
}
