import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const RLSMatrixSection = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Matriz de Row-Level Security (RLS)</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Consolidação completa das políticas RLS aplicadas em todas as tabelas do sistema.
        </p>
      </div>

      {/* Alerta sobre SECURITY DEFINER */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Importante: SECURITY DEFINER Functions
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              Para evitar recursão infinita em políticas RLS que consultam a própria tabela (ex: verificar roles), 
              utilize funções com <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">SECURITY DEFINER</code>.
              Exemplo: <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">public.has_role(user_id, 'admin')</code>
            </p>
          </div>
        </div>
      </div>

      {/* Landing Page Tables */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-amber-500" />
            PLAT-01 — Landing Page (Tabelas Públicas)
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
                  <th className="pb-2 text-left font-medium text-muted-foreground">Owner Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { tabela: "leads", select: "Admin", insert: "anon", update: "Admin", delete: "Nunca", owner: "N/A" },
                  { tabela: "contact_messages", select: "Admin", insert: "anon", update: "Nunca", delete: "Nunca", owner: "N/A" },
                  { tabela: "blog_posts", select: "anon", insert: "Admin", update: "Admin", delete: "Admin", owner: "author_id" },
                  { tabela: "viability_checks", select: "Admin", insert: "anon", update: "Nunca", delete: "Nunca", owner: "N/A" },
                  { tabela: "newsletter_subscribers", select: "Admin", insert: "anon", update: "Nunca", delete: "Admin", owner: "N/A" },
                ].map((row) => (
                  <tr key={row.tabela}>
                    <td className="py-2 font-mono text-xs">{row.tabela}</td>
                    <td className="py-2 text-center">
                      <Badge variant={row.select === "anon" ? "secondary" : "outline"} className="text-xs">
                        {row.select}
                      </Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={row.insert === "anon" ? "secondary" : "outline"} className="text-xs">
                        {row.insert}
                      </Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={row.update === "Nunca" ? "destructive" : "outline"} className="text-xs">
                        {row.update}
                      </Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant={row.delete === "Nunca" ? "destructive" : "outline"} className="text-xs">
                        {row.delete}
                      </Badge>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground font-mono">{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tables */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-emerald-500" />
            PLAT-02 — Painel Admin (Tabelas Internas)
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
                  <th className="pb-2 text-left font-medium text-muted-foreground">Owner Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { tabela: "isps", select: "has_role('admin')", insert: "has_role('admin')", update: "has_role('admin')", delete: "super_admin", owner: "N/A", sensivel: true },
                  { tabela: "plans", select: "authenticated", insert: "has_role('admin')", update: "has_role('admin')", delete: "super_admin", owner: "N/A", sensivel: false },
                  { tabela: "subscriptions", select: "has_role('admin')", insert: "service_role", update: "has_role('admin')", delete: "soft_delete", owner: "isp_id", sensivel: true },
                  { tabela: "invoices", select: "has_role('admin')", insert: "service_role", update: "service_role", delete: "após 5 anos", owner: "isp_id", sensivel: true },
                  { tabela: "admin_users", select: "super_admin", insert: "super_admin", update: "own OR super_admin", delete: "super_admin", owner: "user_id = auth.uid()", sensivel: true },
                  { tabela: "user_roles", select: "super_admin", insert: "super_admin", update: "super_admin", delete: "super_admin", owner: "N/A", sensivel: true },
                  { tabela: "audit_logs", select: "has_role('auditor')", insert: "service_role", update: "false", delete: "após 6 meses", owner: "N/A", sensivel: false },
                ].map((row) => (
                  <tr key={row.tabela} className={row.sensivel ? "bg-red-500/5" : ""}>
                    <td className="py-2 font-mono text-xs">
                      {row.tabela}
                      {row.sensivel && (
                        <Badge variant="outline" className="ml-2 text-xs border-red-500/50 text-red-600">
                          PII/Sensível
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.select}</code>
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.insert}</code>
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.update}</code>
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.delete}</code>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground font-mono">{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cliente Tables (Multi-tenant) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" />
            PLAT-03 — Painel Cliente (Multi-tenant por isp_id)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-lg bg-primary/10 p-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <p className="text-xs text-primary">
                <strong>Isolamento Multi-tenant:</strong> Todas as políticas incluem <code className="bg-muted px-1 rounded">isp_id = get_user_isp_id(auth.uid())</code>
              </p>
            </div>
          </div>
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
                  { tabela: "subscribers", select: "same_isp", insert: "same_isp", update: "same_isp", delete: "soft", nota: "PII de assinantes", sensivel: true },
                  { tabela: "conversations", select: "same_isp", insert: "same_isp", update: "same_isp", delete: "soft", nota: "Histórico de atendimento", sensivel: false },
                  { tabela: "ai_agents", select: "same_isp", insert: "isp_admin", update: "isp_admin", delete: "isp_admin", nota: "Configurações de IA", sensivel: false },
                  { tabela: "agent_prompts", select: "same_isp", insert: "isp_admin", update: "isp_admin", delete: "isp_admin", nota: "Prompts customizados", sensivel: false },
                  { tabela: "broadcasts", select: "same_isp", insert: "has_permission", update: "has_permission", delete: "soft", nota: "Campanhas de mensagem", sensivel: false },
                  { tabela: "broadcast_logs", select: "same_isp", insert: "service_role", update: "false", delete: "após 6 meses", nota: "Logs de disparo", sensivel: false },
                  { tabela: "assets", select: "same_isp", insert: "service_role", update: "same_isp", delete: "soft", nota: "Ativos de rede", sensivel: false },
                  { tabela: "isp_users", select: "same_isp", insert: "isp_admin", update: "isp_admin", delete: "soft", nota: "Usuários do painel", sensivel: true },
                  { tabela: "isp_user_roles", select: "same_isp", insert: "isp_admin", update: "isp_admin", delete: "isp_admin", nota: "Roles por ISP", sensivel: true },
                  { tabela: "erp_configs", select: "isp_admin", insert: "isp_admin", update: "isp_admin", delete: "isp_admin", nota: "Credenciais ERP (criptografadas)", sensivel: true },
                  { tabela: "whatsapp_configs", select: "isp_admin", insert: "isp_admin", update: "isp_admin", delete: "isp_admin", nota: "Config WhatsApp Business", sensivel: true },
                  { tabela: "isp_audit_logs", select: "same_isp", insert: "service_role", update: "false", delete: "após 6 meses", nota: "Logs imutáveis", sensivel: false },
                ].map((row) => (
                  <tr key={row.tabela} className={row.sensivel ? "bg-red-500/5" : ""}>
                    <td className="py-2 font-mono text-xs">
                      {row.tabela}
                      {row.sensivel && (
                        <Badge variant="outline" className="ml-2 text-xs border-red-500/50 text-red-600">
                          Sensível
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.select}</code>
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.insert}</code>
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.update}</code>
                    </td>
                    <td className="py-2 text-center">
                      <code className="text-xs bg-muted px-1 rounded">{row.delete}</code>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{row.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Helper Functions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Helper Functions (SECURITY DEFINER)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <code className="text-xs font-mono text-foreground block whitespace-pre-wrap">{`-- Verifica se usuário tem determinada role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;`}</code>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <code className="text-xs font-mono text-foreground block whitespace-pre-wrap">{`-- Retorna o isp_id do usuário autenticado
CREATE OR REPLACE FUNCTION public.get_user_isp_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT isp_id FROM public.isp_users
  WHERE user_id = _user_id
  LIMIT 1
$$;`}</code>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <code className="text-xs font-mono text-foreground block whitespace-pre-wrap">{`-- Verifica se usuário é admin do ISP
CREATE OR REPLACE FUNCTION public.is_isp_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.isp_user_roles
    WHERE user_id = _user_id AND role = 'isp_admin'
  )
$$;`}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Políticas</p>
              <div className="space-y-1 text-xs">
                <p><code className="bg-muted px-1 rounded">anon</code> — Usuário anônimo (público)</p>
                <p><code className="bg-muted px-1 rounded">authenticated</code> — Qualquer usuário logado</p>
                <p><code className="bg-muted px-1 rounded">service_role</code> — Apenas via Edge Function</p>
                <p><code className="bg-muted px-1 rounded">same_isp</code> — Mesmo ISP (multi-tenant)</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Roles</p>
              <div className="space-y-1 text-xs">
                <p><code className="bg-muted px-1 rounded">super_admin</code> — Admin AutoISP</p>
                <p><code className="bg-muted px-1 rounded">has_role('X')</code> — Verifica role dinâmica</p>
                <p><code className="bg-muted px-1 rounded">isp_admin</code> — Admin do ISP cliente</p>
                <p><code className="bg-muted px-1 rounded">has_permission</code> — Permissão no módulo</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Ações Especiais</p>
              <div className="space-y-1 text-xs">
                <p><code className="bg-muted px-1 rounded">soft</code> — Soft delete (flag deleted)</p>
                <p><code className="bg-muted px-1 rounded">false</code> — Bloqueado (imutável)</p>
                <p><code className="bg-muted px-1 rounded">após X</code> — Limpeza automática</p>
                <p><code className="bg-muted px-1 rounded">own</code> — Apenas próprio registro</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RLSMatrixSection;
