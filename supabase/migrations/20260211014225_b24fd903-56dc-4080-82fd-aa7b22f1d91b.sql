
-- ============================================
-- 1. Tabelas de Procedimentos
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_procedures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text DEFAULT 'file-text',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_procedure_tools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  procedure_id uuid NOT NULL REFERENCES public.ai_procedures(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.ai_agent_tools(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (procedure_id, tool_id)
);

CREATE TABLE IF NOT EXISTS public.ai_procedure_flows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  procedure_id uuid NOT NULL REFERENCES public.ai_procedures(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.ai_agent_flows(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (procedure_id, flow_id)
);

CREATE TABLE IF NOT EXISTS public.ai_agent_procedures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  procedure_id uuid NOT NULL REFERENCES public.ai_procedures(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (agent_id, procedure_id)
);

-- ============================================
-- 2. RLS
-- ============================================

ALTER TABLE public.ai_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_procedure_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_procedure_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_procedures ENABLE ROW LEVEL SECURITY;

-- ai_procedures
CREATE POLICY "authenticated_read_procedures" ON public.ai_procedures FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "super_admin_manage_procedures" ON public.ai_procedures FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- ai_procedure_tools
CREATE POLICY "authenticated_read_procedure_tools" ON public.ai_procedure_tools FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "super_admin_manage_procedure_tools" ON public.ai_procedure_tools FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- ai_procedure_flows
CREATE POLICY "authenticated_read_procedure_flows" ON public.ai_procedure_flows FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "super_admin_manage_procedure_flows" ON public.ai_procedure_flows FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- ai_agent_procedures
CREATE POLICY "authenticated_read_agent_procedures" ON public.ai_agent_procedures FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "super_admin_manage_agent_procedures" ON public.ai_agent_procedures FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- ============================================
-- 3. Trigger updated_at
-- ============================================

CREATE TRIGGER update_ai_procedures_updated_at
  BEFORE UPDATE ON public.ai_procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 4. Seed: Procedimento "Cobranca e Financeiro"
-- ============================================

INSERT INTO public.ai_procedures (id, name, slug, description, icon, is_active, sort_order)
VALUES (
  'b1a2c3d4-e5f6-7890-abcd-ef1234567890',
  'Cobrança e Financeiro',
  'cobranca-financeiro',
  'Procedimento completo para identificação de clientes, consulta de faturas em aberto e negociação de débitos.',
  'receipt',
  true,
  1
) ON CONFLICT (slug) DO NOTHING;

-- Vincular ferramentas
INSERT INTO public.ai_procedure_tools (procedure_id, tool_id, sort_order) VALUES
  ('b1a2c3d4-e5f6-7890-abcd-ef1234567890', 'fa533441-439f-4f4d-afdb-9f78749ff2de', 1),
  ('b1a2c3d4-e5f6-7890-abcd-ef1234567890', '26bd11d1-3909-48ad-869c-280ddabc8daf', 2)
ON CONFLICT (procedure_id, tool_id) DO NOTHING;

-- Vincular fluxo
INSERT INTO public.ai_procedure_flows (procedure_id, flow_id, sort_order) VALUES
  ('b1a2c3d4-e5f6-7890-abcd-ef1234567890', 'ea447503-8a62-467b-b0de-4fb76822a917', 1)
ON CONFLICT (procedure_id, flow_id) DO NOTHING;

-- Vincular agentes
INSERT INTO public.ai_agent_procedures (agent_id, procedure_id, sort_order) VALUES
  ('599bcd52-350c-47e7-8f96-b919a5e2a8a1', 'b1a2c3d4-e5f6-7890-abcd-ef1234567890', 1),
  ('8e08ca74-2cd1-4a11-8b62-c8c3e99b422a', 'b1a2c3d4-e5f6-7890-abcd-ef1234567890', 2)
ON CONFLICT (agent_id, procedure_id) DO NOTHING;
