import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Globe, 
  Settings, 
  Users, 
  CheckCircle2, 
  XCircle,
  Key,
  Lock,
  AlertTriangle,
  Clock,
  Eye
} from "lucide-react";

const SecurityOverviewSection = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Visão Geral de Segurança</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Consolidação das políticas de segurança aplicadas em todas as plataformas do sistema AutoISP.
        </p>
      </div>

      {/* Resumo das Plataformas */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            id: "PLAT-01",
            nome: "Landing Page",
            icon: Globe,
            exposicao: "100% Pública",
            cor: "amber",
            destaque: "reCAPTCHA v3 + Rate Limit"
          },
          {
            id: "PLAT-02",
            nome: "Painel Admin",
            icon: Settings,
            exposicao: "100% Interna",
            cor: "emerald",
            destaque: "Super Admin + Roles Dinâmicos"
          },
          {
            id: "PLAT-03",
            nome: "Painel Cliente",
            icon: Users,
            exposicao: "100% Interna",
            cor: "emerald",
            destaque: "Multi-tenant por isp_id"
          },
        ].map((plat) => {
          const Icon = plat.icon;
          return (
            <Card key={plat.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${plat.cor === "amber" ? "bg-amber-500" : "bg-emerald-500"}`} />
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${plat.cor === "amber" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                    <Icon className={`h-5 w-5 ${plat.cor === "amber" ? "text-amber-500" : "text-emerald-500"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{plat.id}</p>
                    <p className="font-medium text-foreground">{plat.nome}</p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs ${plat.cor === "amber" ? "border-amber-500/50 text-amber-600" : "border-emerald-500/50 text-emerald-600"}`}
                    >
                      {plat.exposicao}
                    </Badge>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{plat.destaque}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configurações Globais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Configurações Globais de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                label: "Captcha", 
                valor: "reCAPTCHA v3", 
                detalhe: "Invisível em todos os formulários públicos",
                ativo: true 
              },
              { 
                label: "2FA/MFA", 
                valor: "Configurável", 
                detalhe: "Super Admin/Admin ISP define obrigatoriedade por role",
                ativo: true 
              },
              { 
                label: "Bloqueio Login", 
                valor: "5 tentativas → 15 min", 
                detalhe: "Proteção contra brute force",
                ativo: true 
              },
              { 
                label: "Sessão", 
                valor: "1 hora inatividade", 
                detalhe: "Exceto Dashboard Monitoramento",
                ativo: true 
              },
            ].map((config) => (
              <div key={config.label} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                  {config.ativo ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-1 text-sm text-primary">{config.valor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{config.detalhe}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Segredos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4 text-primary" />
            Matriz de Segredos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Segredo</th>
                  <th className="pb-2 text-center font-medium text-muted-foreground">Tipo</th>
                  <th className="pb-2 text-center font-medium text-muted-foreground">Escopo</th>
                  <th className="pb-2 text-center font-medium text-muted-foreground">Armazenamento</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Uso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { nome: "ASAAS_API_KEY", tipo: "Privado", escopo: "Global", local: "Supabase Secrets", uso: "Cobranças e faturas" },
                  { nome: "OPENAI_API_KEY", tipo: "Privado", escopo: "Global", local: "Supabase Secrets", uso: "Agentes IA" },
                  { nome: "RESEND_API_KEY", tipo: "Privado", escopo: "Global", local: "Supabase Secrets", uso: "Emails transacionais" },
                  { nome: "SMS_API_KEY", tipo: "Privado", escopo: "Global", local: "Supabase Secrets", uso: "Disparos SMS" },
                  { nome: "ERP_API_TOKEN", tipo: "Privado", escopo: "Por ISP", local: "DB (AES-256)", uso: "Sincronização ERP" },
                  { nome: "WHATSAPP_TOKEN", tipo: "Privado", escopo: "Por ISP", local: "DB (AES-256)", uso: "WhatsApp Business" },
                  { nome: "GA_MEASUREMENT_ID", tipo: "Público", escopo: "Global", local: "Frontend", uso: "Google Analytics" },
                  { nome: "META_PIXEL_ID", tipo: "Público", escopo: "Global", local: "Frontend", uso: "Meta Pixel" },
                ].map((secret) => (
                  <tr key={secret.nome}>
                    <td className="py-2 font-mono text-xs">{secret.nome}</td>
                    <td className="py-2 text-center">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${secret.tipo === "Privado" ? "border-red-500/50 text-red-600" : "border-emerald-500/50 text-emerald-600"}`}
                      >
                        {secret.tipo}
                      </Badge>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant="secondary" className="text-xs">{secret.escopo}</Badge>
                    </td>
                    <td className="py-2 text-center text-xs text-muted-foreground">{secret.local}</td>
                    <td className="py-2 text-xs text-muted-foreground">{secret.uso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checklist de Segurança */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" />
            Checklist de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Autenticação & Autorização</p>
              {[
                { item: "Senhas com complexidade mínima", status: "ok" },
                { item: "2FA/MFA disponível e configurável", status: "ok" },
                { item: "Bloqueio por tentativas falhas", status: "ok" },
                { item: "Sessão com timeout por inatividade", status: "ok" },
                { item: "Roles em tabela separada (não no profile)", status: "ok" },
                { item: "Validação de roles server-side", status: "ok" },
              ].map((check) => (
                <div key={check.item} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs text-foreground">{check.item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Dados & Infraestrutura</p>
              {[
                { item: "RLS ativo em todas as tabelas sensíveis", status: "ok" },
                { item: "Multi-tenant com isolamento por isp_id", status: "ok" },
                { item: "Segredos apenas em Edge Functions", status: "ok" },
                { item: "Credenciais ERP criptografadas (AES-256)", status: "ok" },
                { item: "Sanitização de inputs em todos os forms", status: "ok" },
                { item: "Webhooks validados por assinatura", status: "ok" },
              ].map((check) => (
                <div key={check.item} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs text-foreground">{check.item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modelo de Ameaças Consolidado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Modelo de Ameaças Consolidado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-xs font-medium uppercase text-red-600 mb-3">Risco Crítico/Alto</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    Acesso cross-tenant (dados de outro ISP)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    Escalada de privilégios
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    Exposição de segredos/API keys
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    Exposição de credenciais ERP
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-xs font-medium uppercase text-amber-600 mb-3">Risco Médio</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    Brute force em login
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    Webhook malicioso
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    XSS via chatbot IA
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    Disparo em massa abusivo
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <p className="text-xs font-medium uppercase text-emerald-600 mb-3">Mitigações Implementadas</p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    RLS com isp_id em todas as tabelas
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    Roles em tabela separada
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    Segredos em Edge Functions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    Criptografia AES-256 para ERP
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Políticas de Retenção */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-primary" />
            Políticas de Retenção de Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { tipo: "Leads e Contatos", retencao: "12 meses", plataforma: "Landing" },
              { tipo: "Audit Logs", retencao: "6 meses", plataforma: "Admin/Cliente" },
              { tipo: "Conversas Chatbot", retencao: "3 meses", plataforma: "Landing" },
              { tipo: "Erros Edge Functions", retencao: "30 dias", plataforma: "Todas" },
            ].map((pol) => (
              <div key={pol.tipo} className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-medium text-foreground">{pol.tipo}</p>
                <p className="mt-1 text-lg font-semibold text-primary">{pol.retencao}</p>
                <Badge variant="secondary" className="mt-2 text-xs">{pol.plataforma}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityOverviewSection;
