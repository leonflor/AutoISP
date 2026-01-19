// Types aligned with actual Supabase schema (src/integrations/supabase/types.ts)
export type AppRole = 'super_admin' | 'admin' | 'support';
export type StatusCliente = 'ativo' | 'suspenso' | 'cancelado' | 'pendente';
export type StatusFatura = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type StatusAssinatura = 'trial' | 'ativa' | 'suspensa' | 'cancelada' | 'expirada';
export type TipoAgente = 'atendente' | 'cobrador' | 'vendedor' | 'analista' | 'suporte';
export type IspMemberRole = 'owner' | 'admin' | 'operator' | 'viewer';

// ==================== TABELAS EXISTENTES ====================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string | null;
}

// Isp matches actual DB schema (no trial_ends_at column)
export interface Isp {
  id: string;
  name: string;
  slug: string;
  document: string;
  email: string | null;
  phone: string | null;
  status: StatusCliente | null;
  logo_url: string | null;
  address: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// IspUser matches actual DB schema
export interface IspUser {
  id: string;
  isp_id: string;
  user_id: string;
  role: IspMemberRole;
  invited_by: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// ==================== TABELAS F1 - NEGÓCIO ====================

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  is_active: boolean;
  features: Record<string, unknown>;
  limits: Record<string, number>;
  created_at: string;
  updated_at: string;
}

// Subscription matches actual DB schema
export interface Subscription {
  id: string;
  isp_id: string;
  plan_id: string;
  status: StatusAssinatura | null;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  cancel_reason: string | null;
  canceled_at: string | null;
  external_id: string | null;
  payment_method: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// Invoice matches actual DB schema
export interface Invoice {
  id: string;
  subscription_id: string;
  isp_id: string;
  amount: number;
  status: StatusFatura | null;
  due_date: string;
  paid_at: string | null;
  external_id: string | null;
  payment_method: string | null;
  invoice_url: string | null;
  pdf_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// ==================== TABELAS F1 - IA ====================

export interface AiAgent {
  id: string;
  name: string;
  slug: string;
  type: TipoAgente;
  description: string | null;
  system_prompt: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiUsage {
  id: string;
  isp_id: string;
  agent_id: string;
  user_id: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  created_at: string;
}

export interface AiLimit {
  id: string;
  plan_id: string;
  agent_type: TipoAgente;
  monthly_tokens: number;
  monthly_requests: number;
  created_at: string;
  updated_at: string;
}

// ==================== TABELAS F1 - LOGS ====================

export interface AuditLog {
  id: string;
  isp_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  source: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processed' | 'failed';
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export type PlatformConfigCategory = 'platform' | 'security' | 'system' | 'integrations';

export interface PlatformConfig {
  id: string;
  key: string;
  value: Record<string, unknown>;
  category: PlatformConfigCategory;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== TABELAS F3 - LANDING PAGE ====================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface ViabilityCheck {
  id: string;
  cep: string;
  address: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  is_viable: boolean | null;
  notes: string | null;
  created_at: string;
}

// ==================== TABELAS F3 - PAINEL CLIENTE ====================

export interface Subscriber {
  id: string;
  isp_id: string;
  external_id: string | null;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  plan_name: string | null;
  status: StatusCliente;
  monthly_value: number | null;
  due_day: number | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ConversationChannel = 'whatsapp' | 'chat' | 'email' | 'phone';
export type ConversationStatus = 'open' | 'closed' | 'pending';

export interface Conversation {
  id: string;
  isp_id: string;
  subscriber_id: string | null;
  channel: ConversationChannel;
  agent_id: string | null;
  user_id: string | null;
  status: ConversationStatus;
  subject: string | null;
  messages: unknown[];
  started_at: string;
  closed_at: string | null;
  metadata: Record<string, unknown>;
}

export type BroadcastChannel = 'whatsapp' | 'sms' | 'email' | 'push';
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

export interface Broadcast {
  id: string;
  isp_id: string;
  created_by: string;
  name: string;
  channel: BroadcastChannel;
  template: string | null;
  content: string | null;
  filters: Record<string, unknown>;
  status: BroadcastStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  delivered_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export type ErpProvider = 'mk_solutions' | 'ixc' | 'sgp' | 'hubsoft' | 'other';

export interface ErpConfig {
  id: string;
  isp_id: string;
  provider: ErpProvider;
  api_url: string | null;
  api_key_encrypted: string | null;
  username: string | null;
  password_encrypted: string | null;
  sync_enabled: boolean;
  last_sync_at: string | null;
  sync_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type WhatsAppProvider = 'evolution' | 'z_api' | 'wppconnect' | 'baileys';

export interface WhatsAppConfig {
  id: string;
  isp_id: string;
  provider: WhatsAppProvider;
  instance_name: string | null;
  api_url: string | null;
  api_key_encrypted: string | null;
  webhook_url: string | null;
  phone_number: string | null;
  is_connected: boolean;
  connected_at: string | null;
  qr_code: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== DATABASE TYPE ====================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserRole, 'id' | 'user_id'>>;
      };
      isps: {
        Row: Isp;
        Insert: Omit<Isp, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Isp, 'id'>>;
      };
      isp_users: {
        Row: IspUser;
        Insert: Omit<IspUser, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<IspUser, 'id'>>;
      };
      plans: {
        Row: Plan;
        Insert: Omit<Plan, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Plan, 'id'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscription, 'id'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Invoice, 'id'>>;
      };
      ai_agents: {
        Row: AiAgent;
        Insert: Omit<AiAgent, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AiAgent, 'id'>>;
      };
      ai_usage: {
        Row: AiUsage;
        Insert: Omit<AiUsage, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AiUsage, 'id'>>;
      };
      ai_limits: {
        Row: AiLimit;
        Insert: Omit<AiLimit, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AiLimit, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AuditLog, 'id'>>;
      };
      webhook_logs: {
        Row: WebhookLog;
        Insert: Omit<WebhookLog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<WebhookLog, 'id'>>;
      };
      platform_config: {
        Row: PlatformConfig;
        Insert: Omit<PlatformConfig, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PlatformConfig, 'id' | 'key'>>;
      };
      // F3 - Landing Page Tables
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'source'> & {
          id?: string;
          status?: LeadStatus;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Lead, 'id'>>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'> & {
          id?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<ContactMessage, 'id'>>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, 'id' | 'subscribed_at' | 'is_active'> & {
          id?: string;
          is_active?: boolean;
          subscribed_at?: string;
        };
        Update: Partial<Omit<NewsletterSubscriber, 'id'>>;
      };
      viability_checks: {
        Row: ViabilityCheck;
        Insert: Omit<ViabilityCheck, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ViabilityCheck, 'id'>>;
      };
      // F3 - Client Panel Tables
      subscribers: {
        Row: Subscriber;
        Insert: Omit<Subscriber, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscriber, 'id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'started_at'> & {
          id?: string;
          started_at?: string;
        };
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      broadcasts: {
        Row: Broadcast;
        Insert: Omit<Broadcast, 'id' | 'created_at' | 'updated_at' | 'total_recipients' | 'delivered_count' | 'failed_count'> & {
          id?: string;
          total_recipients?: number;
          delivered_count?: number;
          failed_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Broadcast, 'id'>>;
      };
      erp_configs: {
        Row: ErpConfig;
        Insert: Omit<ErpConfig, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ErpConfig, 'id'>>;
      };
      whatsapp_configs: {
        Row: WhatsAppConfig;
        Insert: Omit<WhatsAppConfig, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<WhatsAppConfig, 'id'>>;
      };
    };
    Enums: {
      app_role: AppRole;
      status_cliente: StatusCliente;
      status_fatura: StatusFatura;
      status_assinatura: StatusAssinatura;
      tipo_agente: TipoAgente;
      isp_member_role: IspMemberRole;
      platform_config_category: PlatformConfigCategory;
      lead_status: LeadStatus;
      conversation_channel: ConversationChannel;
      conversation_status: ConversationStatus;
      broadcast_channel: BroadcastChannel;
      broadcast_status: BroadcastStatus;
      erp_provider: ErpProvider;
      whatsapp_provider: WhatsAppProvider;
    };
  };
};
