-- Adicionar coluna is_active na tabela isp_users
ALTER TABLE public.isp_users 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Comentário para documentação
COMMENT ON COLUMN public.isp_users.is_active IS 'Indica se o usuário está ativo no ISP. Permite desativar sem remover.';

-- Atualizar função is_isp_member para verificar apenas membros ativos
CREATE OR REPLACE FUNCTION public.is_isp_member(_user_id uuid, _isp_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.isp_users
    WHERE user_id = _user_id
      AND isp_id = _isp_id
      AND is_active = true
  )
$$;

-- Atualizar função is_isp_admin para verificar apenas membros ativos
CREATE OR REPLACE FUNCTION public.is_isp_admin(_user_id uuid, _isp_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.isp_users
    WHERE user_id = _user_id
      AND isp_id = _isp_id
      AND role IN ('owner', 'admin')
      AND is_active = true
  )
$$;