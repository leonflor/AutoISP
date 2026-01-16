import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, CheckCircle2, AlertTriangle, Users, Key, Lock, UserCheck, RefreshCw } from "lucide-react";

const SupabaseAuthIntegration = () => {
  return (
    <div className="space-y-6">
      {/* Identificação */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  INT-04 — Supabase Auth
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    Documentada
                  </Badge>
                </CardTitle>
                <CardDescription>Autenticação e Autorização</CardDescription>
              </div>
            </div>
            <Badge variant="destructive">Criticidade: Crítica</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sistema de autenticação nativo do Supabase com suporte a múltiplos métodos de login, 
            OAuth providers, gerenciamento de sessões e integração completa com Row Level Security (RLS) 
            para controle de acesso granular em arquitetura multi-tenant.
          </p>
        </CardContent>
      </Card>

      {/* Casos de Uso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Casos de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: "Login/Signup", desc: "Email + senha com validação e rate limiting" },
              { icon: Key, title: "OAuth Providers", desc: "Google e GitHub como providers externos" },
              { icon: CheckCircle2, title: "Confirmação de Email", desc: "Verificação obrigatória para ativar conta" },
              { icon: RefreshCw, title: "Reset de Senha", desc: "Fluxo seguro via magic link por email" },
              { icon: Lock, title: "Session Management", desc: "JWT tokens com refresh automático" },
              { icon: UserCheck, title: "RLS Integration", desc: "Policies baseadas em auth.uid() e roles" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Icon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Arquitetura Multi-tenant */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Arquitetura Multi-tenant</CardTitle>
          <CardDescription>Isolamento de dados por tenant usando RLS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE AUTH                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   ISP #1     │    │   ISP #2     │    │   ISP #3     │      │
│  │  tenant_id   │    │  tenant_id   │    │  tenant_id   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    profiles                          │      │
│  │  id | user_id | tenant_id | role | name | ...        │      │
│  └──────────────────────────────────────────────────────┘      │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   user_roles                         │      │
│  │  id | user_id | role (app_role enum)                 │      │
│  └──────────────────────────────────────────────────────┘      │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              RLS Policies (auth.uid())               │      │
│  │  • Cada usuário vê apenas dados do seu tenant        │      │
│  │  • Roles definem permissões dentro do tenant         │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Fluxos de Autenticação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fluxos de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="signup">
              <AccordionTrigger>Fluxo de Signup (Email/Senha)</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│ Browser │────▶│  Supabase   │────▶│   Resend    │────▶│  Email  │
│         │     │    Auth     │     │   (SMTP)    │     │  Inbox  │
└─────────┘     └─────────────┘     └─────────────┘     └─────────┘
     │                 │                                      │
     │  1. signUp()    │                                      │
     │────────────────▶│                                      │
     │                 │  2. Criar usuário                    │
     │                 │  3. Enviar email confirmação         │
     │                 │─────────────────────────────────────▶│
     │  4. Resposta    │                                      │
     │◀────────────────│                                      │
     │                 │                                      │
     │  5. Usuário clica no link                              │
     │◀───────────────────────────────────────────────────────│
     │                 │                                      │
     │  6. Verificar token                                    │
     │────────────────▶│                                      │
     │                 │  7. Ativar conta                     │
     │                 │  8. Trigger: handle_new_user()       │
     │                 │  9. Criar profile + user_role        │
     │  10. Session    │                                      │
     │◀────────────────│                                      │
└─────────────────────────────────────────────────────────────────┘`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="oauth">
              <AccordionTrigger>Fluxo OAuth (Google/GitHub)</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`┌─────────┐     ┌─────────────┐     ┌─────────────┐
│ Browser │────▶│  Supabase   │────▶│   OAuth     │
│         │     │    Auth     │     │  Provider   │
└─────────┘     └─────────────┘     └─────────────┘
     │                 │                   │
     │  1. signInWithOAuth()               │
     │────────────────▶│                   │
     │                 │  2. Redirect URL  │
     │◀────────────────│                   │
     │                 │                   │
     │  3. Redirect to Provider            │
     │─────────────────────────────────────▶
     │                 │                   │
     │  4. User authenticates              │
     │◀─────────────────────────────────────
     │                 │                   │
     │  5. Callback with code              │
     │────────────────▶│                   │
     │                 │  6. Exchange code │
     │                 │──────────────────▶│
     │                 │  7. User data     │
     │                 │◀──────────────────│
     │                 │                   │
     │                 │  8. Create/Update user
     │                 │  9. Trigger: handle_new_user()
     │  10. Session    │                   │
     │◀────────────────│                   │
└─────────────────────────────────────────────────────┘`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="session">
              <AccordionTrigger>Gerenciamento de Sessão</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`┌─────────────────────────────────────────────────────────────────┐
│                    SESSION MANAGEMENT                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Access Token (JWT)                                  │      │
│  │  • Validade: 1 hora (configurável)                   │      │
│  │  • Contém: user_id, email, role, metadata            │      │
│  │  • Armazenado: localStorage (supabase-auth-token)    │      │
│  └──────────────────────────────────────────────────────┘      │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Refresh Token                                       │      │
│  │  • Validade: 7 dias (configurável)                   │      │
│  │  • Usado para renovar access token                   │      │
│  │  • Rotação automática a cada uso                     │      │
│  └──────────────────────────────────────────────────────┘      │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  onAuthStateChange()                                 │      │
│  │  • Listener para mudanças de estado                  │      │
│  │  • Eventos: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED   │      │
│  │  • Sincroniza estado entre abas do navegador         │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reset">
              <AccordionTrigger>Fluxo Reset de Senha</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│ Browser │────▶│  Supabase   │────▶│   Resend    │────▶│  Email  │
│         │     │    Auth     │     │   (SMTP)    │     │  Inbox  │
└─────────┘     └─────────────┘     └─────────────┘     └─────────┘
     │                 │                                      │
     │  1. resetPasswordForEmail()                            │
     │────────────────▶│                                      │
     │                 │  2. Gerar token (1h validade)        │
     │                 │  3. Enviar email com magic link      │
     │                 │─────────────────────────────────────▶│
     │  4. "Email enviado"                                    │
     │◀────────────────│                                      │
     │                 │                                      │
     │  5. Usuário clica no link                              │
     │◀───────────────────────────────────────────────────────│
     │                 │                                      │
     │  6. Redirect para /reset-password                      │
     │  7. updateUser({ password })                           │
     │────────────────▶│                                      │
     │                 │  8. Atualizar hash da senha          │
     │                 │  9. Invalidar token                  │
     │  10. Sucesso    │                                      │
     │◀────────────────│                                      │
└─────────────────────────────────────────────────────────────────┘`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Configuration */}
          <div>
            <h4 className="font-medium mb-3">URL Configuration (Supabase Dashboard)</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Configuração</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">Site URL</TableCell>
                  <TableCell className="font-mono text-xs">https://app.autoisp.com.br</TableCell>
                  <TableCell className="text-xs text-muted-foreground">URL principal da aplicação</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">Redirect URLs</TableCell>
                  <TableCell className="font-mono text-xs">https://app.autoisp.com.br/**</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Padrão wildcard para redirects</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">Redirect URLs (Dev)</TableCell>
                  <TableCell className="font-mono text-xs">http://localhost:5173/**</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Para desenvolvimento local</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* OAuth Providers */}
          <div>
            <h4 className="font-medium mb-3">OAuth Providers</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Callback URL</TableHead>
                  <TableHead>Escopos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Google</TableCell>
                  <TableCell className="font-mono text-xs">GOOGLE_CLIENT_ID</TableCell>
                  <TableCell className="font-mono text-xs">{`{SUPABASE_URL}/auth/v1/callback`}</TableCell>
                  <TableCell className="text-xs">email, profile, openid</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">GitHub</TableCell>
                  <TableCell className="font-mono text-xs">GITHUB_CLIENT_ID</TableCell>
                  <TableCell className="font-mono text-xs">{`{SUPABASE_URL}/auth/v1/callback`}</TableCell>
                  <TableCell className="text-xs">user:email, read:user</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Email Templates */}
          <div>
            <h4 className="font-medium mb-3">Email Templates</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { template: "Confirm signup", desc: "Confirmação de nova conta" },
                { template: "Magic Link", desc: "Login sem senha" },
                { template: "Change Email", desc: "Confirmação de alteração de email" },
                { template: "Reset Password", desc: "Link para redefinir senha" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{item.template}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estrutura de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estrutura de Dados</CardTitle>
          <CardDescription>Tabelas e funções para autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enum app_role */}
          <div>
            <h4 className="font-medium mb-3">Enum: app_role</h4>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
              <pre>{`CREATE TYPE public.app_role AS ENUM (
  'super_admin',    -- Administrador da plataforma (Lovable)
  'admin',          -- Administrador do tenant (ISP)
  'manager',        -- Gerente com acesso a relatórios
  'operator',       -- Operador de atendimento
  'viewer'          -- Apenas visualização
);`}</pre>
            </div>
          </div>

          {/* Tabela profiles */}
          <div>
            <h4 className="font-medium mb-3">Tabela: profiles</h4>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
              <pre>{`CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas perfis do seu tenant
CREATE POLICY "Users can view profiles in their tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );`}</pre>
            </div>
          </div>

          {/* Tabela user_roles */}
          <div>
            <h4 className="font-medium mb-3">Tabela: user_roles</h4>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
              <pre>{`CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Roles em tabela separada para evitar privilege escalation`}</pre>
            </div>
          </div>

          {/* Function has_role */}
          <div>
            <h4 className="font-medium mb-3">Function: has_role (SECURITY DEFINER)</h4>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
              <pre>{`CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Uso em RLS policies
CREATE POLICY "Admins can manage all data"
  ON public.some_table FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));`}</pre>
            </div>
          </div>

          {/* Trigger handle_new_user */}
          <div>
            <h4 className="font-medium mb-3">Trigger: handle_new_user</h4>
            <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
              <pre>{`CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id UUID;
BEGIN
  -- Buscar tenant_id do metadata (passado no signup)
  _tenant_id := (NEW.raw_user_meta_data ->> 'tenant_id')::UUID;
  
  -- Criar profile
  INSERT INTO public.profiles (user_id, tenant_id, full_name)
  VALUES (
    NEW.id,
    _tenant_id,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Atribuir role padrão
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operator');
  
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementação Frontend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Implementação Frontend</CardTitle>
          <CardDescription>Exemplos de código React/TypeScript</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="context">
              <AccordionTrigger>Auth Context Provider</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 2. THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="signup">
              <AccordionTrigger>Sign Up com Tenant</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`// IMPORTANTE: Sempre incluir emailRedirectTo
const signUp = async (
  email: string, 
  password: string, 
  fullName: string,
  tenantId: string
) => {
  const redirectUrl = \`\${window.location.origin}/\`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
        tenant_id: tenantId, // Passado para o trigger
      }
    }
  });
  
  if (error) throw error;
  return data;
};`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="oauth">
              <AccordionTrigger>Sign In com OAuth</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: \`\${window.location.origin}/auth/callback\`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  
  if (error) throw error;
  return data;
};

const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: \`\${window.location.origin}/auth/callback\`,
    }
  });
  
  if (error) throw error;
  return data;
};`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="protected">
              <AccordionTrigger>Protected Route</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
                  <pre>{`// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'operator';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // TODO: Verificar role se necessário
  // if (requiredRole && !hasRole(user.id, requiredRole)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <>{children}</>;
}`}</pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* RLS Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integração com RLS</CardTitle>
          <CardDescription>Exemplos de policies usando auth.uid() e has_role()</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs overflow-x-auto">
            <pre>{`-- Policy 1: Usuários veem apenas dados do seu tenant
CREATE POLICY "tenant_isolation" ON public.subscribers
  FOR ALL TO authenticated
  USING (
    tenant_id = (
      SELECT tenant_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Policy 2: Apenas admins podem deletar
CREATE POLICY "admins_can_delete" ON public.subscribers
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy 3: Operadores podem inserir/atualizar
CREATE POLICY "operators_can_modify" ON public.subscribers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'operator') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Policy 4: Viewers apenas leitura
CREATE POLICY "viewers_readonly" ON public.reports
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'viewer') AND
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
  );`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Features Relacionadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features Relacionadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-medium mb-2">Painel Admin</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ADM-USR — Gestão de Usuários</li>
                <li>• ADM-CFG — Configurações de Autenticação</li>
                <li>• ADM-LOG — Logs de Auditoria (login/logout)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-medium mb-2">Painel Cliente (ISP)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• CLI-USR — Usuários do Tenant</li>
                <li>• CLI-CFG — Configurações de Acesso</li>
                <li>• CLI-LOG — Auditoria de Acessos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Considerações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aspecto</TableHead>
                <TableHead>Implementação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Roles em tabela separada</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Evita privilege escalation se usuário modificar próprio profile
                </TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-600 border-green-500/30">Crítico</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SECURITY DEFINER</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Funções has_role() e handle_new_user() com privilégios elevados
                </TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-600 border-green-500/30">Crítico</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">JWT Validation</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Tokens validados server-side em cada request
                </TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-600 border-green-500/30">Automático</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rate Limiting</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  Supabase aplica rate limits em auth endpoints
                </TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-600 border-green-500/30">Automático</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Password Hashing</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  bcrypt com salt automático pelo Supabase Auth
                </TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-600 border-green-500/30">Automático</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Tenant Isolation</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  RLS policies impedem acesso cross-tenant
                </TableCell>
                <TableCell><Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Requer Config</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Erro</TableHead>
                <TableHead>Causa</TableHead>
                <TableHead>Solução</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">"requested path is invalid"</TableCell>
                <TableCell className="text-sm text-muted-foreground">Site URL ou Redirect URL incorretos</TableCell>
                <TableCell className="text-sm">Verificar Authentication → URL Configuration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">"Email not confirmed"</TableCell>
                <TableCell className="text-sm text-muted-foreground">Usuário não confirmou email</TableCell>
                <TableCell className="text-sm">Reenviar email ou desabilitar confirmação em dev</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">"Invalid login credentials"</TableCell>
                <TableCell className="text-sm text-muted-foreground">Email ou senha incorretos</TableCell>
                <TableCell className="text-sm">Verificar credenciais ou usar reset password</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">"User already registered"</TableCell>
                <TableCell className="text-sm text-muted-foreground">Email já existe no sistema</TableCell>
                <TableCell className="text-sm">Usar login ou recuperar senha</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">"OAuth callback error"</TableCell>
                <TableCell className="text-sm text-muted-foreground">Redirect URL não configurado no provider</TableCell>
                <TableCell className="text-sm">Adicionar callback URL no Google/GitHub Console</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">Sessão não persiste</TableCell>
                <TableCell className="text-sm text-muted-foreground">Listener não configurado corretamente</TableCell>
                <TableCell className="text-sm">Verificar onAuthStateChange antes de getSession</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custos Estimados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano Supabase</TableHead>
                <TableHead>MAU Incluídos</TableHead>
                <TableHead>Custo Adicional</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Free</TableCell>
                <TableCell>50.000 MAU</TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Pro ($25/mês)</TableCell>
                <TableCell>100.000 MAU</TableCell>
                <TableCell>$0.00325 por MAU adicional</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Team ($599/mês)</TableCell>
                <TableCell>100.000 MAU</TableCell>
                <TableCell>$0.00325 por MAU adicional</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-4 text-xs text-muted-foreground">
            * MAU = Monthly Active Users. OAuth providers não têm custo adicional do Supabase, 
            apenas dos próprios providers se aplicável.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseAuthIntegration;
