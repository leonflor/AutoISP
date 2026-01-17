import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Users, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Eye,
  FileText,
  Bell,
  Zap,
  UserCog
} from "lucide-react";

const AdminSecuritySection = () => {
  return (
    <div className="space-y-6">
      {/* Header da Plataforma */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-emerald-500" />
          <h2 className="text-xl font-semibold text-foreground">PLAT-02 — Painel Admin (AutoISP)</h2>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600">
            100% Interna
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestão completa da plataforma SaaS. Acesso apenas para equipe interna AutoISP.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visão Geral */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-primary" />
              Visão Geral da Postura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Dados Sensíveis Manipulados:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Dados de ISPs clientes (razão social, CNPJ, contatos)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Dados financeiros (faturamento, assinaturas, faturas)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Credenciais de integração (API keys)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Logs de auditoria e operações
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                <strong>Nível de Exposição:</strong> 100% interna. Apenas <code className="bg-muted px-1 rounded">/admin/login</code> é acessível sem autenticação.
              </p>
            </div>
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Rota de Login:</strong> <code className="bg-background px-1 rounded">/admin/login</code> → 
                Redireciona para <code className="bg-background px-1 rounded">/admin</code> após validação de <code className="bg-primary/20 text-primary px-1 rounded">super_admin</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Autenticação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Método", valor: "Email/Senha via Supabase Auth" },
                { label: "2FA/MFA", valor: "Configurável (Super Admin define obrigatoriedade)" },
                { label: "Complexidade Senha", valor: "Min 8 chars, 1 maiúsc., 1 núm., 1 especial" },
                { label: "Bloqueio", valor: "5 tentativas falhas → 15 min bloqueio" },
                { label: "Verificação Email", valor: "Obrigatório" },
                { label: "Sessão", valor: "1 hora de inatividade → logout automático" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between rounded-lg bg-muted/50 p-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <span className="text-xs text-foreground text-right max-w-[200px]">{item.valor}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Usuário Master:</strong> Criado via seed com variáveis de ambiente (MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Autorização / Roles */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="h-4 w-4 text-primary" />
              Autorização / Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Roles do Sistema</p>
                <div className="space-y-2">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary">Super Admin</Badge>
                      <span className="text-xs text-muted-foreground">Fixo</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Acesso irrestrito a todos os módulos. Pode criar roles dinâmicos e delegar permissões.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Roles Dinâmicos</Badge>
                      <span className="text-xs text-muted-foreground">Configurável</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      RBAC granular por módulo: view, create, edit, delete
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Módulos com Permissões</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Dashboard", "Clientes", "Planos", "Assinaturas", 
                    "Financeiro", "Usuários", "Agentes IA", 
                    "Configurações", "Relatórios", "Logs"
                  ].map((modulo) => (
                    <Badge key={modulo} variant="outline" className="text-xs">
                      {modulo}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Delegação:</strong> Super Admin pode criar outros admins com permissões específicas por módulo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RLS */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-primary" />
              Row-Level Security (RLS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">Tabela</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">SELECT</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">INSERT</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">UPDATE</th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">DELETE</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { tabela: "isps", select: "Role", insert: "Role", update: "Role", delete: "Super Admin", nota: "Clientes ISP" },
                    { tabela: "plans", select: "Auth", insert: "Role", update: "Role", delete: "Super Admin", nota: "Planos SaaS" },
                    { tabela: "subscriptions", select: "Role", insert: "Sistema", update: "Role", delete: "Soft", nota: "Assinaturas" },
                    { tabela: "invoices", select: "Role", insert: "Webhook", update: "Sistema", delete: "5 anos", nota: "Faturas Asaas" },
                    { tabela: "admin_users", select: "Super Admin", insert: "Super Admin", update: "Próprio/SA", delete: "Super Admin", nota: "Usuários admin" },
                    { tabela: "user_roles", select: "Super Admin", insert: "Super Admin", update: "Super Admin", delete: "Super Admin", nota: "Tabela separada" },
                    { tabela: "audit_logs", select: "SA/Auditor", insert: "Sistema", update: "Nunca", delete: "6 meses", nota: "Imutável" },
                  ].map((row) => (
                    <tr key={row.tabela}>
                      <td className="py-2 font-mono text-xs">{row.tabela}</td>
                      <td className="py-2 text-center">
                        <Badge variant="outline" className="text-xs">{row.select}</Badge>
                      </td>
                      <td className="py-2 text-center">
                        <Badge variant="outline" className="text-xs">{row.insert}</Badge>
                      </td>
                      <td className="py-2 text-center">
                        <Badge variant="outline" className="text-xs">{row.update}</Badge>
                      </td>
                      <td className="py-2 text-center">
                        <Badge variant="outline" className="text-xs">{row.delete}</Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">{row.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Segredos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4 text-primary" />
              Gestão de Segredos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { nome: "ASAAS_API_KEY", uso: "Cobranças e faturas", local: "Supabase Secrets" },
                { nome: "OPENAI_API_KEY", uso: "Agentes IA template", local: "Supabase Secrets" },
                { nome: "RESEND_API_KEY", uso: "Emails transacionais", local: "Supabase Secrets" },
                { nome: "MASTER_ADMIN_EMAIL", uso: "Seed inicial", local: "Env vars (deploy)" },
                { nome: "MASTER_ADMIN_PASSWORD", uso: "Seed inicial", local: "Env vars (deploy)" },
              ].map((secret) => (
                <div key={secret.nome} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono text-foreground">{secret.nome}</code>
                    <Badge variant="secondary" className="text-xs">{secret.local}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{secret.uso}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validação de Inputs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Validação de Inputs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { form: "Login", validacoes: "Email format, senha não vazia" },
                { form: "Criar ISP", validacoes: "CNPJ dígito, email, telefone" },
                { form: "Criar Plano", validacoes: "Nome único, preços positivos" },
                { form: "Criar Usuário", validacoes: "Email único, role válida" },
                { form: "Configurações", validacoes: "URLs válidas, API keys format" },
              ].map((item) => (
                <div key={item.form} className="flex items-start justify-between rounded-lg bg-muted/50 p-2">
                  <span className="text-xs font-medium text-foreground">{item.form}</span>
                  <span className="text-xs text-muted-foreground text-right max-w-[180px]">{item.validacoes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lógica Sensível */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              Lógica Sensível (Edge Functions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { logica: "Cálculo de preços/descontos", onde: "Edge Function" },
                { logica: "Geração de faturas", onde: "Edge Function (Asaas webhook)" },
                { logica: "Alteração de planos", onde: "Edge Function" },
                { logica: "CRUD de roles", onde: "Edge Function (Super Admin)" },
              ].map((item) => (
                <div key={item.logica} className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                  <span className="text-xs text-foreground">{item.logica}</span>
                  <Badge variant="outline" className="text-xs">{item.onde}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                ✓ Toda lógica de negócio crítica roda no servidor, nunca no frontend.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Integrações e Webhooks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Integrações & Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { 
                  integracao: "Asaas", 
                  autenticacao: "Bearer Token", 
                  webhook: "SHA-256 + IP whitelist" 
                },
                { 
                  integracao: "OpenAI", 
                  autenticacao: "Bearer Token", 
                  webhook: "N/A (outbound)" 
                },
                { 
                  integracao: "Resend", 
                  autenticacao: "API Key Header", 
                  webhook: "N/A (outbound)" 
                },
              ].map((item) => (
                <div key={item.integracao} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.integracao}</span>
                    <Badge variant="secondary" className="text-xs">{item.autenticacao}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Webhook: {item.webhook}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auditoria */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Auditoria & Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { evento: "Login/Logout", dados: "user_id, timestamp, IP, user_agent" },
                { evento: "Tentativa falha", dados: "email, timestamp, IP, motivo" },
                { evento: "CRUD ISPs", dados: "action, entity_id, old/new value" },
                { evento: "Financeiro", dados: "invoice_id, action, valor" },
                { evento: "Alteração de roles", dados: "target_user, role_antes/depois" },
              ].map((log) => (
                <div key={log.evento} className="rounded-lg bg-muted/50 p-2">
                  <span className="text-xs font-medium text-foreground">{log.evento}</span>
                  <p className="text-xs text-muted-foreground">{log.dados}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Retenção: 6 meses (cleanup automático)
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" />
              Alertas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { evento: "3+ falhas login", canal: "Email", destinatario: "Super Admin" },
                { evento: "Role alterado", canal: "In-app + Email", destinatario: "Super Admin" },
                { evento: "Pagamento recebido", canal: "In-app", destinatario: "Financeiro" },
                { evento: "Webhook Asaas falhou", canal: "Email + Slack", destinatario: "Super Admin" },
              ].map((alerta) => (
                <div key={alerta.evento} className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                  <span className="text-xs text-foreground">{alerta.evento}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{alerta.canal}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modelo de Ameaças */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Modelo de Ameaças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { 
                  ameaca: "Escalada de privilégios", 
                  risco: "Alto", 
                  mitigacao: "Roles em tabela separada, RLS, validação server-side" 
                },
                { 
                  ameaca: "Exposição de segredos", 
                  risco: "Alto", 
                  mitigacao: "Apenas em Edge Functions, nunca no frontend" 
                },
                { 
                  ameaca: "Acesso indevido a dados ISP", 
                  risco: "Alto", 
                  mitigacao: "RLS por tenant, audit logs completos" 
                },
                { 
                  ameaca: "Webhook malicioso", 
                  risco: "Médio", 
                  mitigacao: "Validação SHA-256, IP whitelist Asaas" 
                },
                { 
                  ameaca: "Brute force login", 
                  risco: "Médio", 
                  mitigacao: "Bloqueio 5 tentativas, 2FA opcional" 
                },
              ].map((item) => (
                <div key={item.ameaca} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.ameaca}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.risco === "Alto" 
                          ? "border-red-500/50 text-red-600" 
                          : "border-amber-500/50 text-amber-600"
                      }`}
                    >
                      {item.risco}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.mitigacao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSecuritySection;
