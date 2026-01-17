export type AppRole = 'super_admin' | 'admin' | 'support' | 'viewer';
export type StatusCliente = 'trial' | 'ativo' | 'suspenso' | 'cancelado' | 'inadimplente';
export type StatusFatura = 'pendente' | 'pago' | 'vencido' | 'cancelado' | 'estornado';
export type StatusAssinatura = 'trial' | 'ativa' | 'suspensa' | 'cancelada';
export type TipoAgente = 'atendente' | 'cobrador' | 'vendedor' | 'analista' | 'suporte';
export type IspMemberRole = 'owner' | 'admin' | 'operator' | 'viewer';

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
