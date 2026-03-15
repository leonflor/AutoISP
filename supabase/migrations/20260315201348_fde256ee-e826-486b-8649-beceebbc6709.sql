
-- Drop the legacy flow steps table (CASCADE removes FK constraints)
DROP TABLE IF EXISTS public.ai_agent_flow_steps CASCADE;

-- Create flow_state_definitions (replaces ai_agent_flow_steps)
CREATE TABLE public.flow_state_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES public.ai_agent_flows(id) ON DELETE CASCADE,
  state_key text NOT NULL,
  step_order integer NOT NULL DEFAULT 1,
  objective text NOT NULL,
  allowed_tools text[] NOT NULL DEFAULT '{}',
  transition_rules jsonb NOT NULL DEFAULT '[]',
  fallback_message text,
  max_attempts integer NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (flow_id, state_key)
);

-- Create conversation_sessions (runtime state machine)
CREATE TABLE public.conversation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid NOT NULL REFERENCES public.isps(id) ON DELETE CASCADE,
  isp_agent_id uuid NOT NULL REFERENCES public.isp_agents(id) ON DELETE CASCADE,
  flow_id uuid REFERENCES public.ai_agent_flows(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  current_state text NOT NULL DEFAULT 'init',
  step integer NOT NULL DEFAULT 1,
  context jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'escalated')),
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flow_state_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS for flow_state_definitions
CREATE POLICY "authenticated_read_state_definitions"
  ON public.flow_state_definitions FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "super_admin_manage_state_definitions"
  ON public.flow_state_definitions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS for conversation_sessions
CREATE POLICY "isp_members_read_own_sessions"
  ON public.conversation_sessions FOR SELECT
  TO authenticated
  USING (public.is_isp_member(auth.uid(), isp_id));

CREATE POLICY "isp_members_insert_sessions"
  ON public.conversation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_isp_member(auth.uid(), isp_id));

CREATE POLICY "isp_members_update_sessions"
  ON public.conversation_sessions FOR UPDATE
  TO authenticated
  USING (public.is_isp_member(auth.uid(), isp_id));

CREATE POLICY "super_admin_manage_sessions"
  ON public.conversation_sessions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Indexes
CREATE INDEX idx_flow_state_definitions_flow_id ON public.flow_state_definitions(flow_id);
CREATE INDEX idx_flow_state_definitions_state_key ON public.flow_state_definitions(flow_id, state_key);
CREATE INDEX idx_conversation_sessions_isp_agent ON public.conversation_sessions(isp_agent_id, status);
CREATE INDEX idx_conversation_sessions_user ON public.conversation_sessions(user_id, status);

-- Updated_at triggers
CREATE TRIGGER handle_updated_at_flow_state_definitions
  BEFORE UPDATE ON public.flow_state_definitions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_conversation_sessions
  BEFORE UPDATE ON public.conversation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
