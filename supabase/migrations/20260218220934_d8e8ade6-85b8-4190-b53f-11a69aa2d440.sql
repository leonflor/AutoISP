
-- 1. Flows passam a ser globais
ALTER TABLE ai_agent_flows ALTER COLUMN agent_id DROP NOT NULL;

-- 2. Tabela junction Agent <-> Flow (M:N)
CREATE TABLE public.ai_agent_flow_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES ai_agent_flows(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id, flow_id)
);

ALTER TABLE public.ai_agent_flow_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_manage_flow_links"
  ON public.ai_agent_flow_links FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "authenticated_read_flow_links"
  ON public.ai_agent_flow_links FOR SELECT
  USING (auth.role() = 'authenticated'::text);

-- 3. Steps referenciam tools pelo handler_type
ALTER TABLE ai_agent_flow_steps ADD COLUMN tool_handler text;

-- 4. Migrar dados existentes: tool_id -> tool_handler
UPDATE ai_agent_flow_steps fs
SET tool_handler = t.handler_type
FROM ai_agent_tools t
WHERE fs.tool_id = t.id AND fs.tool_id IS NOT NULL;

-- 5. Migrar vinculos existentes: procedures -> flow_links
INSERT INTO ai_agent_flow_links (agent_id, flow_id)
SELECT DISTINCT ap.agent_id, pf.flow_id
FROM ai_agent_procedures ap
JOIN ai_procedure_flows pf ON pf.procedure_id = ap.procedure_id
WHERE ap.is_active = true
ON CONFLICT DO NOTHING;
