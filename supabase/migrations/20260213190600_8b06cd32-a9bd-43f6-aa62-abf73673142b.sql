
-- 1a. Coluna settings em whatsapp_configs (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'whatsapp_configs' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.whatsapp_configs ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;

-- 1b. Tabela whatsapp_messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_id UUID REFERENCES public.isps(id) ON DELETE CASCADE,
  wamid TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('template', 'text', 'image', 'audio', 'document', 'video', 'sticker', 'location', 'contact')),
  recipient_phone TEXT,
  sender_phone TEXT,
  template_name TEXT,
  template_params JSONB,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  status_updated_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  conversation_type TEXT CHECK (conversation_type IN ('authentication', 'utility', 'marketing', 'service')),
  cost_usd DECIMAL(10,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Indexes para whatsapp_messages (usar IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_isp_id ON public.whatsapp_messages(isp_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction ON public.whatsapp_messages(direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_wamid ON public.whatsapp_messages(wamid) WHERE wamid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_admin ON public.whatsapp_messages(created_at DESC) WHERE isp_id IS NULL;

-- RLS para whatsapp_messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist from previous failed migration
DROP POLICY IF EXISTS "ISP members can view their messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "ISP admins can insert messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "ISP admins can update messages" ON public.whatsapp_messages;

CREATE POLICY "ISP members can view their messages"
ON public.whatsapp_messages FOR SELECT
USING (
  (isp_id IS NOT NULL AND public.is_isp_member(auth.uid(), isp_id))
  OR
  (isp_id IS NULL AND public.has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "ISP admins can insert messages"
ON public.whatsapp_messages FOR INSERT
WITH CHECK (
  (isp_id IS NOT NULL AND public.is_isp_admin(auth.uid(), isp_id))
  OR
  (isp_id IS NULL AND public.has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "ISP admins can update messages"
ON public.whatsapp_messages FOR UPDATE
USING (
  (isp_id IS NOT NULL AND public.is_isp_admin(auth.uid(), isp_id))
  OR
  (isp_id IS NULL AND public.has_role(auth.uid(), 'super_admin'::app_role))
);

-- 1c. Tabela admin_whatsapp_config
CREATE TABLE IF NOT EXISTS public.admin_whatsapp_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'meta',
  api_url TEXT DEFAULT 'https://graph.facebook.com/v18.0',
  api_key_encrypted TEXT,
  encryption_iv TEXT,
  phone_number TEXT,
  phone_number_id TEXT,
  verify_token TEXT,
  webhook_url TEXT,
  is_connected BOOLEAN DEFAULT false,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para admin_whatsapp_config
ALTER TABLE public.admin_whatsapp_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmins can view admin whatsapp config" ON public.admin_whatsapp_config;
DROP POLICY IF EXISTS "Superadmins can insert admin whatsapp config" ON public.admin_whatsapp_config;
DROP POLICY IF EXISTS "Superadmins can update admin whatsapp config" ON public.admin_whatsapp_config;
DROP POLICY IF EXISTS "Superadmins can delete admin whatsapp config" ON public.admin_whatsapp_config;

CREATE POLICY "Superadmins can view admin whatsapp config"
ON public.admin_whatsapp_config FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Superadmins can insert admin whatsapp config"
ON public.admin_whatsapp_config FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Superadmins can update admin whatsapp config"
ON public.admin_whatsapp_config FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Superadmins can delete admin whatsapp config"
ON public.admin_whatsapp_config FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Trigger updated_at para admin_whatsapp_config
DROP TRIGGER IF EXISTS handle_admin_whatsapp_config_updated_at ON public.admin_whatsapp_config;
CREATE TRIGGER handle_admin_whatsapp_config_updated_at
  BEFORE UPDATE ON public.admin_whatsapp_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
