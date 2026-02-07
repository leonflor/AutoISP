
-- ============================================================
-- ai_agent_tools: funções que o agente pode invocar via OpenAI Function Calling
-- ============================================================
CREATE TABLE public.ai_agent_tools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  parameters_schema jsonb NOT NULL DEFAULT '{"type":"object","properties":{}}'::jsonb,
  handler_type text NOT NULL DEFAULT 'erp_search',
  handler_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  requires_erp boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_agent_tools_name_agent_unique UNIQUE (agent_id, name)
);

-- ============================================================
-- ai_agent_flows: fluxos conversacionais do agente
-- ============================================================
CREATE TABLE public.ai_agent_flows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  trigger_keywords text[] DEFAULT '{}',
  trigger_prompt text,
  is_active boolean NOT NULL DEFAULT true,
  is_fixed boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_agent_flows_slug_agent_unique UNIQUE (agent_id, slug)
);

-- ============================================================
-- ai_agent_flow_steps: etapas sequenciais de cada fluxo
-- ============================================================
CREATE TABLE public.ai_agent_flow_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id uuid NOT NULL REFERENCES public.ai_agent_flows(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 1,
  name text NOT NULL,
  instruction text NOT NULL,
  expected_input text,
  tool_id uuid REFERENCES public.ai_agent_tools(id) ON DELETE SET NULL,
  tool_auto_execute boolean NOT NULL DEFAULT false,
  condition_to_advance text,
  fallback_instruction text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_ai_agent_tools_agent ON public.ai_agent_tools(agent_id);
CREATE INDEX idx_ai_agent_flows_agent ON public.ai_agent_flows(agent_id);
CREATE INDEX idx_ai_agent_flow_steps_flow ON public.ai_agent_flow_steps(flow_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.ai_agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_flow_steps ENABLE ROW LEVEL SECURITY;

-- Tools RLS
CREATE POLICY "super_admin_manage_tools"
  ON public.ai_agent_tools FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "authenticated_read_tools"
  ON public.ai_agent_tools FOR SELECT
  USING (auth.role() = 'authenticated');

-- Flows RLS
CREATE POLICY "super_admin_manage_flows"
  ON public.ai_agent_flows FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "authenticated_read_flows"
  ON public.ai_agent_flows FOR SELECT
  USING (auth.role() = 'authenticated');

-- Flow Steps RLS
CREATE POLICY "super_admin_manage_flow_steps"
  ON public.ai_agent_flow_steps FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "authenticated_read_flow_steps"
  ON public.ai_agent_flow_steps FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Triggers updated_at
-- ============================================================
CREATE TRIGGER handle_ai_agent_tools_updated_at
  BEFORE UPDATE ON public.ai_agent_tools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_ai_agent_flows_updated_at
  BEFORE UPDATE ON public.ai_agent_flows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_ai_agent_flow_steps_updated_at
  BEFORE UPDATE ON public.ai_agent_flow_steps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
