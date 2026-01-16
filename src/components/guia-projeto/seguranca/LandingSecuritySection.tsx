import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Key, 
  Eye,
  Clock,
  Lock,
  Zap
} from "lucide-react";

const LandingSecuritySection = () => {
  return (
    <div className="space-y-6">
      {/* Header da Plataforma */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-foreground">PLAT-01 — Landing Page</h2>
          <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-600">
            100% Pública
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Site institucional e conversão de leads. Sem autenticação requerida.
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
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Dados de leads (nome, email, telefone, CNPJ)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Mensagens de contato
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Conversas do chatbot IA
                </li>
              </ul>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Nível de Exposição:</strong> 100% pública. Todas as rotas são acessíveis sem login.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Captcha e Proteções */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Proteções Anti-Abuso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">reCAPTCHA v3</span>
              </div>
              <Badge variant="secondary" className="text-xs">Invisível</Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Ativo em todos os formulários
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Rate limit: 5 requisições/min/IP
              </p>
              <p className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Honeypot fields como fallback
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Validação de Inputs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Validação & Sanitização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { form: "Formulário de Lead", validacoes: "Zod schema, CNPJ regex, email format" },
                { form: "Formulário de Contato", validacoes: "Max 2000 chars, sanitização HTML" },
                { form: "Formulário Trial", validacoes: "Campos obrigatórios, validação telefone" },
                { form: "Newsletter", validacoes: "Email format, unique check" },
                { form: "Viabilidade", validacoes: "CEP format, campos obrigatórios" },
              ].map((item) => (
                <div key={item.form} className="flex items-start justify-between rounded-lg border border-border bg-background p-3">
                  <span className="text-sm font-medium text-foreground">{item.form}</span>
                  <span className="text-xs text-muted-foreground text-right max-w-[180px]">{item.validacoes}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                ✓ Mitigações: XSS, SQL Injection (Supabase client), Rate Limiting
              </p>
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
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Segredos Privados (Edge Functions)</p>
                {[
                  { nome: "OPENAI_API_KEY", uso: "Chatbot IA" },
                  { nome: "RESEND_API_KEY", uso: "Notificações email" },
                ].map((secret) => (
                  <div key={secret.nome} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                    <code className="text-xs font-mono text-foreground">{secret.nome}</code>
                    <span className="text-xs text-muted-foreground">{secret.uso}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Chaves Públicas (Frontend)</p>
                {[
                  { nome: "GA_MEASUREMENT_ID", uso: "Google Analytics" },
                  { nome: "META_PIXEL_ID", uso: "Meta Pixel" },
                ].map((secret) => (
                  <div key={secret.nome} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                    <code className="text-xs font-mono text-foreground">{secret.nome}</code>
                    <span className="text-xs text-muted-foreground">{secret.uso}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RLS */}
        <Card>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { tabela: "leads", select: "Admin", insert: "Público" },
                    { tabela: "contact_messages", select: "Admin", insert: "Público" },
                    { tabela: "blog_posts", select: "Público", insert: "Admin" },
                    { tabela: "viability_checks", select: "Admin", insert: "Público" },
                  ].map((row) => (
                    <tr key={row.tabela}>
                      <td className="py-2 font-mono text-xs">{row.tabela}</td>
                      <td className="py-2 text-center">
                        <Badge variant={row.select === "Público" ? "secondary" : "outline"} className="text-xs">
                          {row.select}
                        </Badge>
                      </td>
                      <td className="py-2 text-center">
                        <Badge variant={row.insert === "Público" ? "secondary" : "outline"} className="text-xs">
                          {row.insert}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                { funcao: "chatbot-response", descricao: "Processa mensagens IA, sanitiza resposta" },
                { funcao: "send-lead-notification", descricao: "Envia email via Resend" },
                { funcao: "create-crm-lead", descricao: "Integra com CRM externo (futuro)" },
              ].map((fn) => (
                <div key={fn.funcao} className="rounded-lg border border-border bg-background p-3">
                  <code className="text-xs font-mono text-primary">{fn.funcao}</code>
                  <p className="mt-1 text-xs text-muted-foreground">{fn.descricao}</p>
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
            <div className="space-y-3">
              {[
                { evento: "Leads criados", retencao: "12 meses" },
                { evento: "Formulários submetidos", retencao: "6 meses" },
                { evento: "Interações chatbot", retencao: "3 meses" },
                { evento: "Erros de Edge Functions", retencao: "30 dias" },
              ].map((log) => (
                <div key={log.evento} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{log.evento}</span>
                  <Badge variant="outline" className="text-xs">{log.retencao}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modelo de Ameaças */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Modelo de Ameaças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { ameaca: "Spam em formulários", risco: "Médio", mitigacao: "reCAPTCHA v3, rate limit, honeypot" },
                { ameaca: "Scraping de conteúdo", risco: "Baixo", mitigacao: "Rate limit, robots.txt" },
                { ameaca: "XSS via chatbot", risco: "Médio", mitigacao: "Sanitização de resposta IA" },
                { ameaca: "Exposição de API keys", risco: "Alto", mitigacao: "Apenas em Edge Functions" },
              ].map((item) => (
                <div key={item.ameaca} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.ameaca}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.risco === "Alto" 
                          ? "border-red-500/50 text-red-600" 
                          : item.risco === "Médio"
                          ? "border-amber-500/50 text-amber-600"
                          : "border-emerald-500/50 text-emerald-600"
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

export default LandingSecuritySection;
