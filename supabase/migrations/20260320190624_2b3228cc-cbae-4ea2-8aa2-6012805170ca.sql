-- ============================================================
-- AI Agent System — Full Schema Migration
-- ============================================================

-- 1. Extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Helper function: get isp_id from conversation
CREATE OR REPLACE FUNCTION public.get_conversation_isp_id(_conversation_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT isp_id FROM public.conversations WHERE id = _conversation_id
$$;

-- ============================================================
-- 3. agent_templates (admin-managed, service_role writes)
-- ============================================================
CREATE TABLE public.agent_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('atendente_geral','suporte_n2','financeiro','comercial')),
  system_prompt_base text NOT NULL,
  temperature numeric(3,2) NOT NULL DEFAULT 0.4,
  tone text NOT NULL DEFAULT 'professional',
  default_name text NOT NULL,
  default_avatar_url text,
  max_intent_attempts int NOT NULL DEFAULT 3,
  intent_failure_action text DEFAULT 'human',
  intent_failure_message text,
  version int NOT NULL DEFAULT 1,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active agent templates"
  ON public.agent_templates FOR SELECT TO authenticated
  USING (is_active = true);

-- ============================================================
-- 4. tenant_agents (ISP customizes over template)
-- ============================================================
CREATE TABLE public.tenant_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid NOT NULL REFERENCES public.isps(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.agent_templates(id),
  custom_name text,
  custom_avatar_url text,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.tenant_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP members can view tenant agents"
  ON public.tenant_agents FOR SELECT TO authenticated
  USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "ISP admins can insert tenant agents"
  ON public.tenant_agents FOR INSERT TO authenticated
  WITH CHECK (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can update tenant agents"
  ON public.tenant_agents FOR UPDATE TO authenticated
  USING (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can delete tenant agents"
  ON public.tenant_agents FOR DELETE TO authenticated
  USING (is_isp_admin(auth.uid(), isp_id));

-- ============================================================
-- 5. procedures (linked to template, service_role writes)
-- ============================================================
CREATE TABLE public.procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.agent_templates(id),
  name text NOT NULL,
  description text,
  version int NOT NULL DEFAULT 1,
  is_current bool NOT NULL DEFAULT true,
  definition jsonb NOT NULL,
  is_active bool DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_procedures_current
  ON public.procedures (template_id, name) WHERE is_current = true;

ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active procedures"
  ON public.procedures FOR SELECT TO authenticated
  USING (is_active = true);

-- ============================================================
-- 6. conversations (DROP existing + recreate)
-- ============================================================
DROP TABLE IF EXISTS public.conversations CASCADE;

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid NOT NULL REFERENCES public.isps(id) ON DELETE CASCADE,
  tenant_agent_id uuid NOT NULL REFERENCES public.tenant_agents(id),
  user_phone text NOT NULL,
  user_identifier text,
  channel text DEFAULT 'whatsapp',
  mode text NOT NULL DEFAULT 'bot' CHECK (mode IN ('bot','human','paused')),
  active_procedure_id uuid REFERENCES public.procedures(id),
  step_index int DEFAULT 0,
  intent_attempts int DEFAULT 0,
  collected_context jsonb DEFAULT '{}',
  turns_on_current_step int DEFAULT 0,
  handover_reason text,
  handover_at timestamptz,
  handover_summary text,
  assigned_agent_id uuid,
  resolved_at timestamptz,
  resolved_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP members can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "ISP members can insert conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "ISP members can update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (is_isp_member(auth.uid(), isp_id));

CREATE INDEX idx_conversations_human
  ON public.conversations (isp_id, mode) WHERE mode = 'human';

CREATE INDEX idx_conversations_phone_agent
  ON public.conversations (user_phone, tenant_agent_id);

CREATE TRIGGER handle_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 7. messages
-- ============================================================
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','agent','tool')),
  content text,
  tool_call_id text,
  tool_name text,
  tool_result jsonb,
  sent_by_agent_id uuid,
  wamid text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their ISP conversations"
  ON public.messages FOR SELECT TO authenticated
  USING (is_isp_member(auth.uid(), get_conversation_isp_id(conversation_id)));

CREATE POLICY "Users can insert messages in their ISP conversations"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (is_isp_member(auth.uid(), get_conversation_isp_id(conversation_id)));

CREATE INDEX idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);

-- ============================================================
-- 8. human_agents
-- ============================================================
CREATE TABLE public.human_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_id uuid NOT NULL REFERENCES public.isps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  display_name text NOT NULL,
  is_available bool DEFAULT false,
  max_concurrent_chats int DEFAULT 3,
  current_chat_count int DEFAULT 0,
  last_seen_at timestamptz
);

ALTER TABLE public.human_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP members can view human agents"
  ON public.human_agents FOR SELECT TO authenticated
  USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "ISP admins can insert human agents"
  ON public.human_agents FOR INSERT TO authenticated
  WITH CHECK (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can update human agents"
  ON public.human_agents FOR UPDATE TO authenticated
  USING (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can delete human agents"
  ON public.human_agents FOR DELETE TO authenticated
  USING (is_isp_admin(auth.uid(), isp_id));

-- ============================================================
-- 9. quick_replies
-- ============================================================
CREATE TABLE public.quick_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.agent_templates(id),
  isp_id uuid REFERENCES public.isps(id) ON DELETE CASCADE,
  text text NOT NULL,
  category text,
  sort_order int DEFAULT 0
);

ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view template quick replies"
  ON public.quick_replies FOR SELECT TO authenticated
  USING (template_id IS NOT NULL AND isp_id IS NULL);

CREATE POLICY "ISP members can view their quick replies"
  ON public.quick_replies FOR SELECT TO authenticated
  USING (isp_id IS NOT NULL AND is_isp_member(auth.uid(), isp_id));

CREATE POLICY "ISP admins can insert quick replies"
  ON public.quick_replies FOR INSERT TO authenticated
  WITH CHECK (isp_id IS NOT NULL AND is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can update quick replies"
  ON public.quick_replies FOR UPDATE TO authenticated
  USING (isp_id IS NOT NULL AND is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP admins can delete quick replies"
  ON public.quick_replies FOR DELETE TO authenticated
  USING (isp_id IS NOT NULL AND is_isp_admin(auth.uid(), isp_id));

-- ============================================================
-- 10. knowledge_bases (vector embeddings)
-- ============================================================
CREATE TABLE public.knowledge_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_agent_id uuid NOT NULL REFERENCES public.tenant_agents(id) ON DELETE CASCADE,
  source_type text CHECK (source_type IN ('faq','document','url')),
  title text,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP members can view knowledge bases"
  ON public.knowledge_bases FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tenant_agents ta
    WHERE ta.id = knowledge_bases.tenant_agent_id
      AND is_isp_member(auth.uid(), ta.isp_id)
  ));

CREATE POLICY "ISP admins can insert knowledge bases"
  ON public.knowledge_bases FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tenant_agents ta
    WHERE ta.id = knowledge_bases.tenant_agent_id
      AND is_isp_admin(auth.uid(), ta.isp_id)
  ));

CREATE POLICY "ISP admins can update knowledge bases"
  ON public.knowledge_bases FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tenant_agents ta
    WHERE ta.id = knowledge_bases.tenant_agent_id
      AND is_isp_admin(auth.uid(), ta.isp_id)
  ));

CREATE POLICY "ISP admins can delete knowledge bases"
  ON public.knowledge_bases FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tenant_agents ta
    WHERE ta.id = knowledge_bases.tenant_agent_id
      AND is_isp_admin(auth.uid(), ta.isp_id)
  ));