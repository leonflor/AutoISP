-- =========================================================================
-- F2: PLATFORM CONFIGURATION TABLE
-- Tabela para armazenar configurações globais da plataforma
-- =========================================================================

-- ==================== TABELA PLATFORM_CONFIG ====================

create table if not exists public.platform_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}',
  category text not null check (category in ('platform', 'security', 'system', 'integrations')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.platform_config enable row level security;

-- ==================== RLS POLICIES ====================

-- Admins podem visualizar todas as configurações
create policy "Admins can view platform config"
  on public.platform_config for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'super_admin') 
    or public.has_role(auth.uid(), 'admin')
  );

-- Apenas super_admin pode inserir
create policy "Super admins can insert platform config"
  on public.platform_config for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Apenas super_admin pode atualizar
create policy "Super admins can update platform config"
  on public.platform_config for update
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Apenas super_admin pode deletar
create policy "Super admins can delete platform config"
  on public.platform_config for delete
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- ==================== TRIGGER PARA UPDATED_AT ====================

create trigger update_platform_config_updated_at
  before update on public.platform_config
  for each row execute function public.handle_updated_at();

-- ==================== DADOS INICIAIS ====================

insert into public.platform_config (key, value, category, description) values
  -- Configurações de Plataforma
  ('platform_name', '{"value": "AutoISP"}', 'platform', 'Nome da plataforma'),
  ('support_email', '{"value": "suporte@autoisp.com.br"}', 'platform', 'Email de suporte'),
  ('site_url', '{"value": "https://autoisp.com.br"}', 'platform', 'URL do site'),
  ('primary_color', '{"value": "#3b82f6"}', 'platform', 'Cor primária'),
  ('secondary_color', '{"value": "#10b981"}', 'platform', 'Cor secundária'),
  ('logo_url', '{"value": null}', 'platform', 'URL do logo da plataforma'),
  
  -- Configurações de Segurança
  ('require_2fa', '{"value": true}', 'security', 'Exigir 2FA para admins'),
  ('session_timeout', '{"value": 30}', 'security', 'Timeout de sessão em minutos'),
  ('max_sessions', '{"value": 3}', 'security', 'Máximo de sessões simultâneas'),
  ('min_password_length', '{"value": 8}', 'security', 'Tamanho mínimo de senha'),
  
  -- Configurações de Sistema
  ('maintenance_mode', '{"value": false}', 'system', 'Modo de manutenção ativo'),
  ('log_retention_days', '{"value": 90}', 'system', 'Dias de retenção de logs'),
  
  -- Configurações de Integrações (apenas status)
  ('integration_openai', '{"configured": true, "tested_at": null}', 'integrations', 'Status da integração OpenAI'),
  ('integration_resend', '{"configured": false, "tested_at": null}', 'integrations', 'Status da integração Resend'),
  ('integration_asaas', '{"configured": true, "tested_at": null}', 'integrations', 'Status da integração Asaas'),
  ('integration_push', '{"configured": false, "tested_at": null}', 'integrations', 'Status da integração Push Notifications')
on conflict (key) do nothing;
