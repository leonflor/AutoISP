-- ============================================================================
-- SAISP - Fase 1: Database e Schema
-- Versão: 1.0.1 (Corrigido)
-- Data: Janeiro 2026
-- ============================================================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Execute este arquivo completo OU seção por seção
-- 4. Verifique se todas as tabelas foram criadas em Database > Tables
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: ENUMS (Tipos Customizados)
-- ============================================================================

-- Roles globais da aplicação (super_admin = acesso total)
create type public.app_role as enum ('super_admin', 'admin', 'support');

-- Roles dentro de um ISP específico
create type public.isp_member_role as enum ('owner', 'admin', 'operator', 'viewer');

-- Status de clientes/assinantes do ISP
create type public.status_cliente as enum ('ativo', 'suspenso', 'cancelado', 'pendente');

-- Status de faturas
create type public.status_fatura as enum ('pendente', 'pago', 'vencido', 'cancelado');

-- Status de assinaturas
create type public.status_assinatura as enum ('trial', 'ativa', 'suspensa', 'cancelada', 'expirada');

-- Tipos de agentes de IA disponíveis
create type public.tipo_agente as enum ('atendente', 'cobrador', 'vendedor', 'analista', 'suporte');

-- ============================================================================
-- SEÇÃO 2: TABELAS CORE
-- ============================================================================
-- IMPORTANTE: As tabelas devem ser criadas ANTES das helper functions
-- para evitar erros de referência a colunas inexistentes.
-- ============================================================================

-- Profiles: Dados públicos do usuário (extensão do auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- User Roles: Roles globais (super_admin, admin, support)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- ISPs: Provedores de internet cadastrados
create table public.isps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  document text unique not null, -- CNPJ
  email text,
  phone text,
  logo_url text,
  address jsonb default '{}',
  settings jsonb default '{}',
  status status_cliente default 'pendente',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.isps enable row level security;

-- ISP Users: Membros de cada ISP (multi-tenant)
create table public.isp_users (
  id uuid primary key default gen_random_uuid(),
  isp_id uuid references public.isps(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role isp_member_role not null default 'viewer',
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (isp_id, user_id)
);

alter table public.isp_users enable row level security;

-- ============================================================================
-- SEÇÃO 3: HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================================
-- IMPORTANTE: Estas funções usam SECURITY DEFINER para evitar recursão infinita
-- nas policies RLS. Elas executam com privilégios do owner.
-- ============================================================================

-- Verifica se usuário tem uma role global específica
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Retorna o ISP_ID do usuário (primeiro ISP encontrado)
create or replace function public.get_user_isp_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select isp_id
  from public.isp_users
  where user_id = _user_id
  limit 1
$$;

-- Verifica se usuário é admin de um ISP específico
create or replace function public.is_isp_admin(_user_id uuid, _isp_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.isp_users
    where user_id = _user_id
      and isp_id = _isp_id
      and role in ('owner', 'admin')
  )
$$;

-- Verifica se usuário é membro de um ISP específico (qualquer role)
create or replace function public.is_isp_member(_user_id uuid, _isp_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.isp_users
    where user_id = _user_id
      and isp_id = _isp_id
  )
$$;

-- Trigger function: Cria profile automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger function: Atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- ============================================================================
-- SEÇÃO 4: TABELAS DE NEGÓCIO
-- ============================================================================

-- Plans: Planos disponíveis para assinatura
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price_monthly decimal(10,2) not null,
  price_yearly decimal(10,2),
  features jsonb default '[]',
  limits jsonb default '{}', -- max_users, max_ai_calls, etc.
  is_active boolean default true,
  is_featured boolean default false,
  trial_days integer default 14,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.plans enable row level security;

-- Subscriptions: Assinaturas dos ISPs
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  isp_id uuid references public.isps(id) on delete cascade not null,
  plan_id uuid references public.plans(id) not null,
  status status_assinatura default 'trial',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  trial_ends_at timestamptz,
  canceled_at timestamptz,
  cancel_reason text,
  payment_method jsonb default '{}',
  external_id text, -- ID no gateway de pagamento (Asaas)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (isp_id) -- Um ISP só pode ter uma assinatura ativa
);

alter table public.subscriptions enable row level security;

-- Invoices: Faturas das assinaturas
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade not null,
  isp_id uuid references public.isps(id) on delete cascade not null,
  amount decimal(10,2) not null,
  status status_fatura default 'pendente',
  due_date date not null,
  paid_at timestamptz,
  payment_method text,
  external_id text, -- ID no gateway de pagamento
  invoice_url text, -- Link para boleto/fatura
  pdf_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.invoices enable row level security;

-- ============================================================================
-- SEÇÃO 5: TABELAS DE IA
-- ============================================================================

-- AI Agents: Agentes de IA disponíveis na plataforma
create table public.ai_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  type tipo_agente not null,
  avatar_url text,
  system_prompt text,
  model text default 'gpt-4o-mini',
  temperature decimal(2,1) default 0.7,
  max_tokens integer default 1000,
  is_active boolean default true,
  is_premium boolean default false,
  features jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ai_agents enable row level security;

-- AI Usage: Registro de uso dos agentes por ISP
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  isp_id uuid references public.isps(id) on delete cascade not null,
  agent_id uuid references public.ai_agents(id) not null,
  user_id uuid references auth.users(id) not null,
  tokens_input integer default 0,
  tokens_output integer default 0,
  tokens_total integer generated always as (tokens_input + tokens_output) stored,
  cost_usd decimal(10,6) default 0,
  duration_ms integer,
  request_type text, -- 'chat', 'completion', 'analysis'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.ai_usage enable row level security;

-- Criar índices para consultas de uso
create index idx_ai_usage_isp_created on public.ai_usage(isp_id, created_at desc);
create index idx_ai_usage_agent on public.ai_usage(agent_id, created_at desc);

-- AI Limits: Limites de uso de IA por plano
create table public.ai_limits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans(id) on delete cascade not null,
  agent_id uuid references public.ai_agents(id) on delete cascade not null,
  daily_limit integer default 100,
  monthly_limit integer default 3000,
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (plan_id, agent_id)
);

alter table public.ai_limits enable row level security;

-- ============================================================================
-- SEÇÃO 6: TABELAS DE LOGS
-- ============================================================================

-- Audit Logs: Log de auditoria de ações no sistema
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  isp_id uuid references public.isps(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- 'create', 'update', 'delete', 'login', etc.
  entity_type text not null, -- 'isp', 'user', 'subscription', etc.
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;

-- Criar índices para consultas de auditoria
create index idx_audit_logs_isp on public.audit_logs(isp_id, created_at desc);
create index idx_audit_logs_user on public.audit_logs(user_id, created_at desc);
create index idx_audit_logs_action on public.audit_logs(action, created_at desc);

-- Webhook Logs: Log de webhooks recebidos/enviados
create table public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  isp_id uuid references public.isps(id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  provider text not null, -- 'asaas', 'whatsapp', 'evolution', etc.
  event_type text not null, -- 'payment.received', 'message.incoming', etc.
  payload jsonb not null,
  response jsonb,
  status_code integer,
  processing_time_ms integer,
  error_message text,
  retries integer default 0,
  processed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.webhook_logs enable row level security;

-- Criar índices para consultas de webhooks
create index idx_webhook_logs_isp on public.webhook_logs(isp_id, created_at desc);
create index idx_webhook_logs_provider on public.webhook_logs(provider, created_at desc);

-- ============================================================================
-- SEÇÃO 7: TRIGGERS
-- ============================================================================

-- Trigger: Criar profile ao criar usuário
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Triggers: Atualizar updated_at automaticamente
create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.isps
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.isp_users
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.plans
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.invoices
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.ai_agents
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.ai_limits
  for each row execute procedure public.handle_updated_at();

-- ============================================================================
-- SEÇÃO 8: RLS POLICIES
-- ============================================================================

-- === PROFILES ===
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "Super admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- === USER ROLES ===
create policy "Super admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- === ISPS ===
create policy "Super admins can manage all ISPs"
  on public.isps for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP members can view their ISP"
  on public.isps for select
  to authenticated
  using (public.is_isp_member(auth.uid(), id));

create policy "ISP admins can update their ISP"
  on public.isps for update
  to authenticated
  using (public.is_isp_admin(auth.uid(), id));

-- === ISP USERS ===
create policy "Super admins can manage all ISP users"
  on public.isp_users for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP members can view team"
  on public.isp_users for select
  to authenticated
  using (public.is_isp_member(auth.uid(), isp_id));

create policy "ISP admins can manage team"
  on public.isp_users for all
  to authenticated
  using (public.is_isp_admin(auth.uid(), isp_id));

-- === PLANS ===
create policy "Anyone can view active plans"
  on public.plans for select
  to anon, authenticated
  using (is_active = true);

create policy "Super admins can manage plans"
  on public.plans for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- === SUBSCRIPTIONS ===
create policy "Super admins can manage all subscriptions"
  on public.subscriptions for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP admins can view own subscription"
  on public.subscriptions for select
  to authenticated
  using (public.is_isp_admin(auth.uid(), isp_id));

-- === INVOICES ===
create policy "Super admins can manage all invoices"
  on public.invoices for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP admins can view own invoices"
  on public.invoices for select
  to authenticated
  using (public.is_isp_admin(auth.uid(), isp_id));

-- === AI AGENTS ===
create policy "Anyone can view active agents"
  on public.ai_agents for select
  to anon, authenticated
  using (is_active = true);

create policy "Super admins can manage agents"
  on public.ai_agents for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- === AI USAGE ===
create policy "Super admins can view all usage"
  on public.ai_usage for select
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP members can view own usage"
  on public.ai_usage for select
  to authenticated
  using (public.is_isp_member(auth.uid(), isp_id));

create policy "Authenticated users can insert usage"
  on public.ai_usage for insert
  to authenticated
  with check (user_id = auth.uid());

-- === AI LIMITS ===
create policy "Anyone can view limits"
  on public.ai_limits for select
  to anon, authenticated
  using (true);

create policy "Super admins can manage limits"
  on public.ai_limits for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- === AUDIT LOGS ===
create policy "Super admins can view all audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP admins can view own audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_isp_admin(auth.uid(), isp_id));

create policy "System can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (true);

-- === WEBHOOK LOGS ===
create policy "Super admins can view all webhook logs"
  on public.webhook_logs for select
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "ISP admins can view own webhook logs"
  on public.webhook_logs for select
  to authenticated
  using (public.is_isp_admin(auth.uid(), isp_id));

create policy "System can insert webhook logs"
  on public.webhook_logs for insert
  to authenticated
  with check (true);

-- ============================================================================
-- SEÇÃO 9: STORAGE BUCKETS
-- ============================================================================

-- Bucket para logos (público)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true);

-- Bucket para documentos (privado)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

-- Bucket para faturas/invoices (privado)
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false);

-- RLS Policies para Storage

-- Logos: qualquer um pode ver, autenticados podem fazer upload
create policy "Anyone can view logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Authenticated users can upload logos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos');

create policy "ISP admins can delete own logos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'logos' 
    and auth.uid() is not null
  );

-- Documents: apenas membros do ISP podem acessar
create policy "ISP members can access documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select isp_id from public.isp_users where user_id = auth.uid()
    )
  );

create policy "ISP members can upload documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1]::uuid in (
      select isp_id from public.isp_users where user_id = auth.uid()
    )
  );

-- Invoices: apenas admins do ISP podem acessar
create policy "ISP admins can access invoices"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'invoices'
    and public.is_isp_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- ============================================================================
-- SEÇÃO 10: SEEDS (DADOS INICIAIS)
-- ============================================================================

-- Planos padrão
insert into public.plans (name, slug, description, price_monthly, price_yearly, features, limits, is_featured, trial_days, sort_order) values
(
  'Starter',
  'starter',
  'Ideal para provedores iniciantes com até 500 assinantes',
  149.90,
  1499.00,
  '["Até 500 assinantes", "2 usuários", "Agente IA de Atendimento", "Suporte por email", "Relatórios básicos"]',
  '{"max_subscribers": 500, "max_users": 2, "ai_calls_monthly": 1000}',
  false,
  14,
  1
),
(
  'Professional',
  'professional',
  'Para provedores em crescimento com até 2.000 assinantes',
  349.90,
  3499.00,
  '["Até 2.000 assinantes", "5 usuários", "Todos os Agentes IA", "Suporte prioritário", "Relatórios avançados", "Integração WhatsApp", "API access"]',
  '{"max_subscribers": 2000, "max_users": 5, "ai_calls_monthly": 5000}',
  true,
  14,
  2
),
(
  'Enterprise',
  'enterprise',
  'Para grandes provedores com necessidades customizadas',
  799.90,
  7999.00,
  '["Assinantes ilimitados", "Usuários ilimitados", "Todos os Agentes IA", "Suporte 24/7", "Relatórios customizados", "White-label", "API ilimitada", "Gerente de conta dedicado"]',
  '{"max_subscribers": -1, "max_users": -1, "ai_calls_monthly": -1}',
  false,
  30,
  3
);

-- Agentes de IA padrão
insert into public.ai_agents (name, slug, description, type, system_prompt, model, is_active, is_premium) values
(
  'Atendente Virtual',
  'atendente',
  'Agente especializado em atendimento ao cliente. Responde dúvidas, abre chamados e encaminha solicitações.',
  'atendente',
  'Você é um atendente virtual de um provedor de internet. Seja cordial, objetivo e ajude o cliente com suas dúvidas sobre planos, faturas, suporte técnico e serviços.',
  'gpt-4o-mini',
  true,
  false
),
(
  'Cobrador Inteligente',
  'cobrador',
  'Agente especializado em cobrança amigável. Envia lembretes, negocia dívidas e registra promessas de pagamento.',
  'cobrador',
  'Você é um agente de cobrança amigável. Seu objetivo é lembrar o cliente sobre faturas pendentes e negociar formas de pagamento de maneira respeitosa e profissional.',
  'gpt-4o-mini',
  true,
  false
),
(
  'Vendedor Digital',
  'vendedor',
  'Agente especializado em vendas. Apresenta planos, faz upgrade de serviços e converte leads.',
  'vendedor',
  'Você é um vendedor digital especializado em planos de internet. Apresente os benefícios dos planos, compare opções e ajude o cliente a escolher a melhor opção para suas necessidades.',
  'gpt-4o-mini',
  true,
  true
),
(
  'Analista de Dados',
  'analista',
  'Agente especializado em análise de dados. Gera insights sobre métricas, identifica padrões e sugere melhorias.',
  'analista',
  'Você é um analista de dados especializado em provedores de internet. Analise métricas de negócio, identifique tendências e sugira ações para melhorar os resultados.',
  'gpt-4o',
  true,
  true
),
(
  'Suporte Técnico',
  'suporte',
  'Agente especializado em suporte técnico de primeiro nível. Diagnostica problemas de conexão e orienta soluções.',
  'suporte',
  'Você é um técnico de suporte especializado em internet. Ajude o cliente a diagnosticar problemas de conexão, oriente sobre configurações de equipamentos e escalone para suporte presencial quando necessário.',
  'gpt-4o-mini',
  true,
  false
);

-- ============================================================================
-- FIM DO SCRIPT F1
-- ============================================================================
-- Próximos passos:
-- 1. Verificar se todas as tabelas foram criadas em Database > Tables
-- 2. Testar as RLS policies com diferentes usuários
-- 3. Verificar os buckets de storage em Storage
-- 4. Executar scripts da F2 quando estiver pronto
-- ============================================================================
