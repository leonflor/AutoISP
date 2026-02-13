import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle, 
  Clock,
  Eye,
  FileText,
  Bell,
  Zap,
  UserCog,
  Database,
  MonitorSmartphone
} from "lucide-react";

const ClienteSecuritySection = () => {
  return (
    <div className="space-y-6">
      {/* Header da Plataforma */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-emerald-500" />
          <h2 className="text-xl font-semibold text-foreground">PLAT-03 — Painel Cliente (ISP)</h2>
          <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600">
            100% Interna
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Painel de gestão para provedores de internet. Acesso por convite/assinatura.
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
                  Dados de assinantes (PII: nome, CPF, endereço, telefone)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Credenciais de integração ERP (tokens criptografados)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Histórico de conversas e atendimentos
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Configurações de agentes IA e prompts
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-xs text-primary">
                <strong>Multi-tenant:</strong> Isolamento total por <code className="bg-muted px-1 rounded">isp_id</code> em todas as tabelas.
              </p>
            </div>
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Rota de Login:</strong> <code className="bg-background px-1 rounded">/auth</code> → 
                Verifica <code className="bg-background px-1 rounded">isp_users</code> → 
                Redireciona <code className="bg-background px-1 rounded">/painel</code>
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
                { label: "2FA/MFA", valor: "Configurável pelo Admin do ISP (por perfil)" },
                { label: "Complexidade Senha", valor: "Min 8 chars, 1 maiúsc., 1 núm., 1 especial" },
                { label: "Bloqueio", valor: "5 tentativas falhas → 15 min bloqueio" },
                { label: "Sessão Padrão", valor: "1 hora de inatividade → logout" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between rounded-lg bg-muted/50 p-2">
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  <span className="text-xs text-foreground text-right max-w-[200px]">{item.valor}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Exceção:</strong> Dashboard de Monitoramento não expira a sessão (uso em painéis fixos).
                </p>
              </div>
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
                <p className="text-xs font-medium uppercase text-muted-foreground">Roles do ISP</p>
                <div className="space-y-2">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary">Admin do ISP</Badge>
                      <span className="text-xs text-muted-foreground">Master</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Acesso total ao painel. Criado automaticamente no signup.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Perfis Híbridos</Badge>
                      <span className="text-xs text-muted-foreground">Template + Custom</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Baseados no plano contratado, personalizáveis pelo Admin.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Módulos com Permissões</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Dashboard", "Atendimentos", "Assinantes", "Comunicação",
                    "Agentes IA", "Monitoramento", "Usuários", "Configurações",
                    "Integrações", "Relatórios", "Logs", "Help Center"
                  ].map((modulo) => (
                    <Badge key={modulo} variant="outline" className="text-xs">
                      {modulo}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Permissões:</strong> view, create, edit, delete por módulo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RLS Multi-tenant */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-primary" />
              Row-Level Security (RLS) — Multi-tenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                <strong>Isolamento:</strong> Todas as tabelas possuem <code className="bg-muted px-1 rounded">isp_id</code> como tenant_id. 
                Políticas garantem que ISP só acessa seus próprios dados.
              </p>
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
                    { tabela: "subscribers", select: "Mesmo ISP", insert: "Mesmo ISP", update: "Mesmo ISP", delete: "Soft", nota: "Assinantes PII" },
                    { tabela: "conversations", select: "Mesmo ISP", insert: "Mesmo ISP", update: "Mesmo ISP", delete: "Soft", nota: "Histórico chat" },
                    { tabela: "ai_agents", select: "Mesmo ISP", insert: "Admin ISP", update: "Admin ISP", delete: "Admin ISP", nota: "Configs de IA" },
                    { tabela: "broadcasts", select: "Mesmo ISP", insert: "Role", update: "Role", delete: "Soft", nota: "Campanhas" },
                    { tabela: "assets", select: "Mesmo ISP", insert: "Sistema", update: "Mesmo ISP", delete: "Soft", nota: "Ativos de rede" },
                    { tabela: "isp_users", select: "Mesmo ISP", insert: "Admin ISP", update: "Admin ISP", delete: "Soft", nota: "Usuários do painel" },
                    { tabela: "erp_configs", select: "Admin ISP", insert: "Admin ISP", update: "Admin ISP", delete: "Admin ISP", nota: "Credenciais ERP" },
                    { tabela: "isp_audit_logs", select: "Mesmo ISP", insert: "Sistema", update: "Nunca", delete: "6 meses", nota: "Logs imutáveis" },
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
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Segredos por ISP (Criptografados)</p>
                {[
                  { nome: "ERP_API_TOKEN", uso: "Sincronização SGP/IXC/MK/Hubsoft" },
                  { nome: "WHATSAPP_TOKEN", uso: "WhatsApp Business API" },
                ].map((secret) => (
                  <div key={secret.nome} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-foreground">{secret.nome}</code>
                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">AES-256</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{secret.uso}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Segredos Globais</p>
                {[
                  { nome: "OPENAI_API_KEY", local: "Supabase Secrets" },
                  { nome: "SMS_API_KEY", local: "Supabase Secrets" },
                ].map((secret) => (
                  <div key={secret.nome} className="rounded-lg bg-muted/50 p-2">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-foreground">{secret.nome}</code>
                      <Badge variant="secondary" className="text-xs">{secret.local}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-primary/10 p-3">
              <p className="text-xs text-primary">
                <strong>Criptografia:</strong> AES-256-GCM. Decriptação apenas em Edge Functions.
              </p>
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
                { form: "Configuração ERP", validacoes: "URL format, teste de conexão" },
                { form: "Agente IA", validacoes: "Prompt max 10000 chars, nome único" },
                { form: "Template mensagem", validacoes: "Variáveis válidas, max 1000 chars" },
                { form: "Criar usuário", validacoes: "Email único no ISP, role válido" },
                { form: "Disparo em massa", validacoes: "Limite por plano, validar segmento" },
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
                { logica: "Sincronização ERP", validacao: "Credenciais decriptadas no servidor" },
                { logica: "Disparo WhatsApp", validacao: "Credenciais criptografadas (AES-256-GCM), config via Edge Function, rate limit" },
                { logica: "Config WhatsApp", validacao: "Edge Function (save-whatsapp-config), teste server-side" },
                { logica: "Respostas da IA", validacao: "Sanitizar antes de exibir" },
                { logica: "Transferência humano", validacao: "Validar operador ativo" },
                { logica: "Ações monitoramento", validacao: "Validar asset pertence ao ISP" },
              ].map((item) => (
                <div key={item.logica} className="rounded-lg border border-border bg-background p-2">
                  <span className="text-xs font-medium text-foreground">{item.logica}</span>
                  <p className="text-xs text-muted-foreground">{item.validacao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-primary" />
              Integrações & Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { integracao: "ERP (SGP/IXC/MK/Hubsoft)", autenticacao: "Token por ISP", webhook: "HMAC quando disponível" },
                { integracao: "WhatsApp Business", autenticacao: "Bearer Token", webhook: "Meta signature" },
                { integracao: "OpenAI", autenticacao: "API Key global", webhook: "N/A" },
                { integracao: "SMS Provider", autenticacao: "API Key", webhook: "Callback com token" },
                { integracao: "Push (FCM/OneSignal)", autenticacao: "Server Key", webhook: "Token validation" },
              ].map((item) => (
                <div key={item.integracao} className="rounded-lg bg-muted/50 p-2">
                  <span className="text-xs font-medium text-foreground">{item.integracao}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{item.autenticacao}</Badge>
                    <span className="text-xs text-muted-foreground">{item.webhook}</span>
                  </div>
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
                { evento: "Configuração agente", dados: "agent_id, changes" },
                { evento: "Disparo mensagem", dados: "template_id, segment, count" },
                { evento: "Sincronização ERP", dados: "registros sincronizados, erros" },
                { evento: "Ação monitoramento", dados: "asset_id, action, resultado" },
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
                { evento: "3+ falhas login", canal: "Email", destinatario: "Admin ISP" },
                { evento: "Falha sincronização ERP", canal: "In-app + Email", destinatario: "Admin ISP" },
                { evento: "Limite IA atingido", canal: "In-app", destinatario: "Admin ISP" },
                { evento: "Webhook falhando", canal: "Email", destinatario: "Admin ISP" },
                { evento: "Novo usuário criado", canal: "In-app", destinatario: "Admin ISP" },
              ].map((alerta) => (
                <div key={alerta.evento} className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
                  <span className="text-xs text-foreground">{alerta.evento}</span>
                  <Badge variant="outline" className="text-xs">{alerta.canal}</Badge>
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
                  ameaca: "Acesso a dados de outro ISP", 
                  risco: "Crítico", 
                  mitigacao: "RLS por isp_id em 100% das tabelas" 
                },
                { 
                  ameaca: "Exposição de credenciais ERP", 
                  risco: "Alto", 
                  mitigacao: "Criptografia AES-256, decript em Edge Functions" 
                },
                { 
                  ameaca: "Escalada de privilégios", 
                  risco: "Alto", 
                  mitigacao: "Roles em tabela separada, validação server-side" 
                },
                { 
                  ameaca: "IA vazando dados sensíveis", 
                  risco: "Médio", 
                  mitigacao: "Sanitização, não expor dados de outros assinantes" 
                },
                { 
                  ameaca: "Disparo em massa abusivo", 
                  risco: "Médio", 
                  mitigacao: "Rate limit por plano, aprovação para segmentos grandes" 
                },
                { 
                  ameaca: "Webhook ERP malicioso", 
                  risco: "Médio", 
                  mitigacao: "Validação de origem, HMAC quando disponível" 
                },
              ].map((item) => (
                <div key={item.ameaca} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.ameaca}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.risco === "Crítico" 
                          ? "border-red-600/50 text-red-600 bg-red-500/10" 
                          : item.risco === "Alto"
                          ? "border-red-500/50 text-red-500"
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

export default ClienteSecuritySection;
