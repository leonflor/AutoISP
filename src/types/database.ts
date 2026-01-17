export type AppRole = 'super_admin' | 'admin' | 'support' | 'viewer';
export type StatusCliente = 'trial' | 'ativo' | 'suspenso' | 'cancelado' | 'inadimplente';
export type StatusFatura = 'pendente' | 'pago' | 'vencido' | 'cancelado' | 'estornado';
export type StatusAssinatura = 'trial' | 'ativa' | 'suspensa' | 'cancelada';
export type TipoAgente = 'atendente' | 'cobrador' | 'vendedor' | 'analista' | 'suporte';

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
    };
    Enums: {
      app_role: AppRole;
      status_cliente: StatusCliente;
      status_fatura: StatusFatura;
      status_assinatura: StatusAssinatura;
      tipo_agente: TipoAgente;
    };
  };
};
