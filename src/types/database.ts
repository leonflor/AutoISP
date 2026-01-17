export type AppRole = 'super_admin' | 'admin' | 'support' | 'viewer';
export type StatusCliente = 'trial' | 'ativo' | 'suspenso' | 'cancelado' | 'inadimplente';
export type StatusFatura = 'pendente' | 'pago' | 'vencido' | 'cancelado' | 'estornado';
export type StatusAssinatura = 'trial' | 'ativa' | 'suspensa' | 'cancelada';
export type TipoAgente = 'atendente' | 'cobrador' | 'vendedor' | 'analista' | 'suporte';
export type IspMemberRole = 'owner' | 'admin' | 'operator' | 'viewer';

// ==================== TABELAS EXISTENTES ====================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Isp {
  id: string;
  name: string;
  slug: string;
  document: string;
  email: string;
  phone: string | null;
  status: StatusCliente;
  trial_ends_at: string | null;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IspUser {
  id: string;
  isp_id: string;
  user_id: string;
  role: IspMemberRole;
  is_active: boolean;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
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

export interface Subscription {
  id: string;
  isp_id: string;
  plan_id: string;
  status: StatusAssinatura;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  asaas_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  isp_id: string;
  amount: number;
  status: StatusFatura;
  due_date: string;
  paid_at: string | null;
  asaas_payment_id: string | null;
  payment_method: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
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
    };
    Enums: {
      app_role: AppRole;
      status_cliente: StatusCliente;
      status_fatura: StatusFatura;
      status_assinatura: StatusAssinatura;
      tipo_agente: TipoAgente;
      isp_member_role: IspMemberRole;
    };
  };
};
