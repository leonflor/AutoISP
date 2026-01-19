-- ============================================================================
-- SAISP - F3: Correções de RLS e Novas Tabelas
-- Versão: 1.0.0
-- Data: Janeiro 2026
-- ============================================================================
-- Este script contém:
-- 1. Correções de segurança em policies existentes
-- 2. Tabelas da Landing Page (leads, contatos, newsletter, viabilidade)
-- 3. Tabelas do Painel Cliente (assinantes, conversas, broadcasts, configs)
-- 4. Helper function adicional
-- 5. Triggers para updated_at
-- ============================================================================

-- ============================================================================
-- FASE 1: CORREÇÕES DE SEGURANÇA
-- ============================================================================

-- 1.1 Corrigir DELETE no Bucket logos
-- Problema: Policy atual permite qualquer autenticado deletar sem verificar ownership
DROP POLICY IF EXISTS "ISP admins can delete own logos" ON storage.objects;

CREATE POLICY "ISP admins can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND public.is_isp_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- 1.2 Remover policies permissivas de INSERT em logs
-- Apenas service_role (Edge Functions) deve poder inserir logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert webhook logs" ON public.webhook_logs;

-- Nota: Sem policy de INSERT = apenas service_role pode inserir
-- Isso garante integridade dos logs de auditoria

-- ============================================================================
-- FASE 2: HELPER FUNCTION ADICIONAL
-- ============================================================================

-- Verifica se usuário tem permissão específica no ISP (preparação para RBAC granular)
CREATE OR REPLACE FUNCTION public.has_isp_permission(
  _user_id uuid,
  _isp_id uuid,
  _permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.isp_users iu
    WHERE iu.user_id = _user_id
      AND iu.isp_id = _isp_id
      AND iu.role IN ('owner', 'admin')
  )
$$;

-- Grant execute para authenticated
GRANT EXECUTE ON FUNCTION public.has_isp_permission(uuid, uuid, text) TO authenticated;

-- ============================================================================
-- FASE 3: TABELAS DA LANDING PAGE (PLAT-01)
-- ============================================================================

-- 3.1 Tabela leads - Captura de leads via formulários
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  source text DEFAULT 'website',
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Anon pode inserir (formulário público)
CREATE POLICY "Anyone can submit leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas super_admin pode ver/gerenciar
CREATE POLICY "Super admins can manage leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 3.2 Tabela contact_messages - Mensagens do formulário de contato
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read);

-- Anon pode inserir
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Super admin pode ver
CREATE POLICY "Super admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admin pode atualizar (marcar como lida)
CREATE POLICY "Super admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 3.3 Tabela newsletter_subscribers - Inscritos na newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscribers(is_active);

-- Anon pode se inscrever
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Super admin pode gerenciar
CREATE POLICY "Super admins can view newsletter"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update newsletter"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete newsletter"
  ON public.newsletter_subscribers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 3.4 Tabela viability_checks - Consultas de viabilidade de cobertura
CREATE TABLE IF NOT EXISTS public.viability_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cep text NOT NULL,
  address text,
  name text,
  phone text,
  email text,
  is_viable boolean,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.viability_checks ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_viability_cep ON public.viability_checks(cep);

-- Anon pode consultar
CREATE POLICY "Anyone can check viability"
  ON public.viability_checks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Super admin pode ver
CREATE POLICY "Super admins can view viability checks"
  ON public.viability_checks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============================================================================
-- FASE 4: TABELAS DO PAINEL CLIENTE (PLAT-03)
-- ============================================================================

-- 4.1 Tabela subscribers - Assinantes do ISP (clientes finais)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid REFERENCES public.isps(id) ON DELETE CASCADE NOT NULL,
  external_id text,
  name text NOT NULL,
  document text,
  email text,
  phone text,
  address jsonb DEFAULT '{}',
  plan_name text,
  status status_cliente DEFAULT 'ativo',
  monthly_value decimal(10,2),
  due_day integer CHECK (due_day IS NULL OR (due_day BETWEEN 1 AND 28)),
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_subscribers_isp ON public.subscribers(isp_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(isp_id, status);
CREATE INDEX IF NOT EXISTS idx_subscribers_external ON public.subscribers(isp_id, external_id);

-- Membros do ISP podem ver assinantes
CREATE POLICY "ISP members can view subscribers"
  ON public.subscribers FOR SELECT
  TO authenticated
  USING (public.is_isp_member(auth.uid(), isp_id));

-- ISP admins podem inserir
CREATE POLICY "ISP admins can insert subscribers"
  ON public.subscribers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_isp_admin(auth.uid(), isp_id));

-- ISP admins podem atualizar
CREATE POLICY "ISP admins can update subscribers"
  ON public.subscribers FOR UPDATE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

-- ISP admins podem deletar
CREATE POLICY "ISP admins can delete subscribers"
  ON public.subscribers FOR DELETE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

-- 4.2 Tabela conversations - Histórico de Conversas
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid REFERENCES public.isps(id) ON DELETE CASCADE NOT NULL,
  subscriber_id uuid REFERENCES public.subscribers(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'chat', 'email', 'phone')),
  agent_id uuid REFERENCES public.ai_agents(id),
  user_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  subject text,
  messages jsonb DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_conversations_isp ON public.conversations(isp_id);
CREATE INDEX IF NOT EXISTS idx_conversations_subscriber ON public.conversations(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(isp_id, status);

-- Membros do ISP podem ver conversas
CREATE POLICY "ISP members can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (public.is_isp_member(auth.uid(), isp_id));

-- Membros podem criar conversas
CREATE POLICY "ISP members can insert conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_isp_member(auth.uid(), isp_id));

-- Membros podem atualizar conversas
CREATE POLICY "ISP members can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (public.is_isp_member(auth.uid(), isp_id));

-- 4.3 Tabela broadcasts - Campanhas de Comunicação
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid REFERENCES public.isps(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  template text,
  content text,
  filters jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  total_recipients integer DEFAULT 0,
  delivered_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_broadcasts_isp ON public.broadcasts(isp_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON public.broadcasts(isp_id, status);

-- Membros do ISP podem ver broadcasts
CREATE POLICY "ISP members can view broadcasts"
  ON public.broadcasts FOR SELECT
  TO authenticated
  USING (public.is_isp_member(auth.uid(), isp_id));

-- ISP admins podem inserir
CREATE POLICY "ISP admins can insert broadcasts"
  ON public.broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_isp_admin(auth.uid(), isp_id));

-- ISP admins podem atualizar
CREATE POLICY "ISP admins can update broadcasts"
  ON public.broadcasts FOR UPDATE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

-- ISP admins podem deletar
CREATE POLICY "ISP admins can delete broadcasts"
  ON public.broadcasts FOR DELETE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

-- 4.4 Tabela erp_configs - Configurações ERP (Dados Sensíveis)
CREATE TABLE IF NOT EXISTS public.erp_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid REFERENCES public.isps(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider text NOT NULL CHECK (provider IN ('mk_solutions', 'ixc', 'sgp', 'hubsoft', 'other')),
  api_url text,
  api_key_encrypted text,
  username text,
  password_encrypted text,
  sync_enabled boolean DEFAULT false,
  last_sync_at timestamptz,
  sync_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.erp_configs ENABLE ROW LEVEL SECURITY;

-- Apenas ISP admin pode acessar (dados sensíveis)
CREATE POLICY "ISP admins can view ERP configs"
  ON public.erp_configs FOR SELECT
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can insert ERP configs"
  ON public.erp_configs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can update ERP configs"
  ON public.erp_configs FOR UPDATE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can delete ERP configs"
  ON public.erp_configs FOR DELETE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

-- 4.5 Tabela whatsapp_configs - Configurações WhatsApp (Dados Sensíveis)
CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid REFERENCES public.isps(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider text NOT NULL CHECK (provider IN ('evolution', 'z_api', 'wppconnect', 'baileys')),
  instance_name text,
  api_url text,
  api_key_encrypted text,
  webhook_url text,
  phone_number text,
  is_connected boolean DEFAULT false,
  connected_at timestamptz,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;

-- Apenas ISP admin pode acessar (dados sensíveis)
CREATE POLICY "ISP admins can view WhatsApp configs"
  ON public.whatsapp_configs FOR SELECT
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can insert WhatsApp configs"
  ON public.whatsapp_configs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can update WhatsApp configs"
  ON public.whatsapp_configs FOR UPDATE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can delete WhatsApp configs"
  ON public.whatsapp_configs FOR DELETE
  TO authenticated
  USING (public.is_isp_admin(auth.uid(), isp_id));

-- ============================================================================
-- FASE 5: TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Trigger para leads
DROP TRIGGER IF EXISTS set_updated_at ON public.leads;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para subscribers
DROP TRIGGER IF EXISTS set_updated_at ON public.subscribers;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para broadcasts
DROP TRIGGER IF EXISTS set_updated_at ON public.broadcasts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.broadcasts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para erp_configs
DROP TRIGGER IF EXISTS set_updated_at ON public.erp_configs;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.erp_configs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para whatsapp_configs
DROP TRIGGER IF EXISTS set_updated_at ON public.whatsapp_configs;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.whatsapp_configs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================================
-- RESUMO DAS MUDANÇAS
-- ============================================================================
-- ✅ 3 policies corrigidas (DELETE logos, INSERT audit_logs, INSERT webhook_logs)
-- ✅ 1 helper function nova (has_isp_permission)
-- ✅ 7 tabelas novas com RLS completo
-- ✅ 5 triggers para updated_at
-- ============================================================================
