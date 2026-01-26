-- Adicionar novas colunas em support_tickets para SLA e atribuição
ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS first_response_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sla_response_hours integer DEFAULT 24,
ADD COLUMN IF NOT EXISTS sla_resolution_hours integer DEFAULT 72;

-- Criar tabela de notas internas (visíveis apenas para staff)
CREATE TABLE IF NOT EXISTS public.support_ticket_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de configuração de SLA por plano
CREATE TABLE IF NOT EXISTS public.sla_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  category text NOT NULL,
  response_hours integer NOT NULL DEFAULT 24,
  resolution_hours integer NOT NULL DEFAULT 72,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(plan_id, category)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.support_ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para support_ticket_notes
CREATE POLICY "Super admins can manage all notes"
ON public.support_ticket_notes FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Staff can view notes of their assigned tickets"
ON public.support_ticket_notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = support_ticket_notes.ticket_id
    AND (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role))
  )
);

CREATE POLICY "Staff can insert notes"
ON public.support_ticket_notes FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)
);

-- Políticas RLS para sla_configs
CREATE POLICY "Anyone can view SLA configs"
ON public.sla_configs FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage SLA configs"
ON public.sla_configs FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_notes_ticket_id ON public.support_ticket_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_sla_configs_plan_category ON public.sla_configs(plan_id, category);

-- Trigger para updated_at em sla_configs
CREATE TRIGGER update_sla_configs_updated_at
BEFORE UPDATE ON public.sla_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Inserir configurações SLA padrão (para todas as categorias)
INSERT INTO public.sla_configs (plan_id, category, response_hours, resolution_hours)
VALUES 
  (NULL, 'tecnico', 4, 24),
  (NULL, 'financeiro', 8, 48),
  (NULL, 'comercial', 24, 72),
  (NULL, 'ouvidoria', 2, 24),
  (NULL, 'outros', 24, 72)
ON CONFLICT (plan_id, category) DO NOTHING;