import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  FileText,
  DollarSign,
  Settings,
  Code,
  Bug
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ResendIntegration = () => {
  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
              <Mail className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                INT-03 — Resend
                <Badge variant="outline" className="ml-2 border-yellow-500/50 text-yellow-600">
                  Criticidade Média
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Serviço de envio de emails transacionais com React Email
              </p>
            </div>
          </div>
          <a 
            href="https://resend.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            resend.com <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Accordion type="multiple" defaultValue={["visao-geral"]} className="w-full">
          {/* Visão Geral */}
          <AccordionItem value="visao-geral">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Visão Geral
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="text-sm font-medium text-foreground">Categoria</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Email Transacional</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="text-sm font-medium text-foreground">Tecnologia</h4>
                    <p className="mt-1 text-sm text-muted-foreground">React Email + Edge Functions</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Casos de Uso</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {[
                      { label: "Confirmação de Conta", desc: "Email após cadastro para validar email" },
                      { label: "Reset de Senha", desc: "Link seguro para redefinir senha" },
                      { label: "Alertas de Cobrança", desc: "Notificação de fatura gerada/vencimento" },
                      { label: "Notificações de Sistema", desc: "Alertas importantes do sistema" },
                      { label: "Relatórios Agendados", desc: "Envio periódico de relatórios" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fluxo Detalhado */}
          <AccordionItem value="fluxo">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Fluxo Detalhado
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <pre className="overflow-x-auto text-xs text-muted-foreground">
{`sequenceDiagram
    participant App as Frontend/Auth
    participant EF as Edge Function
    participant RE as React Email
    participant RS as Resend API
    participant U as Usuário

    Note over App,RS: Fluxo 1: Confirmação de Conta (via Supabase Auth Hook)
    App->>EF: Signup trigger (email, token)
    EF->>RE: Renderiza template "confirm-email"
    RE-->>EF: HTML do email
    EF->>RS: POST /emails (to, subject, html)
    RS-->>EF: { id: "email_xxx" }
    RS->>U: Email de confirmação
    U->>App: Clica no link → confirma email

    Note over App,RS: Fluxo 2: Reset de Senha
    App->>EF: Reset password request
    EF->>RE: Renderiza template "reset-password"
    RE-->>EF: HTML do email
    EF->>RS: POST /emails
    RS->>U: Email com link seguro

    Note over App,RS: Fluxo 3: Alerta de Cobrança
    EF->>RE: Renderiza template "invoice-alert"
    EF->>RS: POST /emails
    RS->>U: Notificação de fatura

    Note over EF,RS: Fallback - API Indisponível
    alt Resend API falha
        EF->>EF: Registra em fila de retry
        EF->>EF: Log erro para monitoramento
    end`}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Diagrama Mermaid - Copie para visualizar em mermaid.live
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configuração */}
          <AccordionItem value="configuracao">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Configuração
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Secrets Necessários</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Secret</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Onde Configurar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-sm">RESEND_API_KEY</TableCell>
                        <TableCell>API Key da conta Resend</TableCell>
                        <TableCell>Supabase Secrets</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Variáveis de Ambiente</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variável</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor Padrão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-sm">RESEND_FROM_EMAIL</TableCell>
                        <TableCell>Email remetente (domínio verificado)</TableCell>
                        <TableCell>noreply@seudominio.com</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-sm">RESEND_FROM_NAME</TableCell>
                        <TableCell>Nome do remetente</TableCell>
                        <TableCell>AutoISP</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Domínio Verificado Obrigatório</p>
                      <p className="mt-1 text-xs text-yellow-600/80">
                        Para enviar emails em produção, é necessário verificar um domínio em resend.com/domains.
                        Sem verificação, só é possível enviar para o email do próprio usuário.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Templates */}
          <AccordionItem value="templates">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Templates React Email
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Templates Disponíveis</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead>Trigger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "confirm-email.tsx", uso: "Confirmação de cadastro", trigger: "Supabase Auth Hook" },
                        { name: "reset-password.tsx", uso: "Redefinição de senha", trigger: "Supabase Auth Hook" },
                        { name: "magic-link.tsx", uso: "Login sem senha", trigger: "Supabase Auth Hook" },
                        { name: "invoice-created.tsx", uso: "Fatura gerada", trigger: "Webhook Asaas" },
                        { name: "invoice-due.tsx", uso: "Fatura próxima do vencimento", trigger: "Cron Job (3 dias antes)" },
                        { name: "invoice-overdue.tsx", uso: "Fatura vencida", trigger: "Cron Job (diário)" },
                        { name: "welcome.tsx", uso: "Boas-vindas ao ISP", trigger: "Após primeiro login" },
                        { name: "report-weekly.tsx", uso: "Relatório semanal", trigger: "Cron Job (semanal)" },
                      ].map((template) => (
                        <TableRow key={template.name}>
                          <TableCell className="font-mono text-sm">{template.name}</TableCell>
                          <TableCell>{template.uso}</TableCell>
                          <TableCell className="text-muted-foreground">{template.trigger}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Estrutura de Arquivos</h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <pre className="text-xs text-muted-foreground">
{`supabase/functions/
├── send-email/
│   ├── index.ts              # Handler principal
│   └── _templates/
│       ├── confirm-email.tsx
│       ├── reset-password.tsx
│       ├── magic-link.tsx
│       ├── invoice-created.tsx
│       ├── invoice-due.tsx
│       ├── invoice-overdue.tsx
│       ├── welcome.tsx
│       └── report-weekly.tsx`}
                    </pre>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Features Relacionadas */}
          <AccordionItem value="features">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Features Relacionadas
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Painel Admin (SaaS)</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• F-ADM-015: Gestão de Templates de Email</li>
                    <li>• F-ADM-016: Logs de Emails Enviados</li>
                    <li>• F-ADM-017: Configuração de Domínio/Remetente</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Painel Cliente (ISP)</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• F-CLI-087: Personalizar Templates de Email</li>
                    <li>• F-CLI-088: Ver Histórico de Emails</li>
                    <li>• F-CLI-089: Configurar Notificações por Email</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Supabase Auth</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Confirmação de email (signup)</li>
                    <li>• Reset de senha</li>
                    <li>• Magic link login</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Segurança */}
          <AccordionItem value="seguranca">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Segurança
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { title: "API Key Protegida", desc: "Armazenada em Supabase Secrets, nunca exposta no frontend" },
                  { title: "Domínio Verificado", desc: "SPF/DKIM configurados para evitar spam" },
                  { title: "Rate Limiting", desc: "Limite de emails por minuto para evitar abuso" },
                  { title: "Tokens Seguros", desc: "Links de reset/confirmação com tokens únicos e expiráveis" },
                  { title: "Validação de Email", desc: "Verificar formato antes de enviar" },
                  { title: "Logs de Auditoria", desc: "Registrar todos os envios para rastreabilidade" },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Troubleshooting */}
          <AccordionItem value="troubleshooting">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-primary" />
                Troubleshooting
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Erro</TableHead>
                      <TableHead>Causa</TableHead>
                      <TableHead>Solução</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { erro: "401 Unauthorized", causa: "API Key inválida", solucao: "Verificar/rotacionar key no painel Resend" },
                      { erro: "403 Forbidden", causa: "Domínio não verificado", solucao: "Verificar domínio em resend.com/domains" },
                      { erro: "429 Rate Limit", causa: "Muitos emails/minuto", solucao: "Implementar queue com delay entre envios" },
                      { erro: "Email não chega", causa: "Spam filter", solucao: "Verificar SPF/DKIM, checar spam" },
                      { erro: "Template quebrado", causa: "Erro no React Email", solucao: "Testar template localmente" },
                    ].map((item) => (
                      <TableRow key={item.erro}>
                        <TableCell className="font-mono text-sm text-red-500">{item.erro}</TableCell>
                        <TableCell>{item.causa}</TableCell>
                        <TableCell className="text-muted-foreground">{item.solucao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Como Testar</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Usar onboarding@resend.dev como remetente em dev (não requer domínio)</li>
                    <li>• Testar templates em react.email (preview local)</li>
                    <li>• Verificar logs no Supabase Dashboard → Edge Functions</li>
                    <li>• Monitorar entregas no painel Resend → Emails</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payloads */}
          <AccordionItem value="payloads">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Payloads (Request/Response)
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Request — Enviar Email</h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <pre className="overflow-x-auto text-xs text-muted-foreground">
{`POST https://api.resend.com/emails
Authorization: Bearer re_xxxxxxxxxxxx
Content-Type: application/json

{
  "from": "AutoISP <noreply@autoisp.com.br>",
  "to": ["cliente@email.com"],
  "subject": "Sua fatura foi gerada",
  "html": "<html>...</html>",
  "tags": [
    { "name": "category", "value": "invoice" },
    { "name": "tenant_id", "value": "isp_123" }
  ]
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Response — Sucesso</h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <pre className="overflow-x-auto text-xs text-muted-foreground">
{`{
  "id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Edge Function — Exemplo</h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <pre className="overflow-x-auto text-xs text-muted-foreground">
{`import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import InvoiceEmail from "./_templates/invoice-created.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const html = await renderAsync(
  <InvoiceEmail 
    customerName="João Silva"
    invoiceNumber="FAT-2024-001"
    amount="R$ 99,90"
    dueDate="15/02/2024"
  />
);

const { data, error } = await resend.emails.send({
  from: "AutoISP <noreply@autoisp.com.br>",
  to: [customer.email],
  subject: "Sua fatura foi gerada - FAT-2024-001",
  html,
});`}
                    </pre>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custos */}
          <AccordionItem value="custos">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Custos
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Planos Resend</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plano</TableHead>
                        <TableHead>Emails/mês</TableHead>
                        <TableHead>Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Free</TableCell>
                        <TableCell>3.000</TableCell>
                        <TableCell className="text-green-600">Grátis</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Pro</TableCell>
                        <TableCell>50.000</TableCell>
                        <TableCell>$20/mês</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Enterprise</TableCell>
                        <TableCell>100.000+</TableCell>
                        <TableCell>$80/mês+</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium text-foreground">Estimativa Mensal</h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Por tenant (ISP médio):</strong> ~500 emails/mês</li>
                      <li>• <strong>100 tenants:</strong> ~50.000 emails/mês</li>
                      <li>• <strong>Custo estimado:</strong> $20/mês (Plano Pro)</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Custo-Benefício Excelente</p>
                      <p className="mt-1 text-xs text-green-600/80">
                        Resend oferece excelente deliverability, DX com React Email, 
                        e pricing competitivo comparado a SendGrid/Mailgun.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ResendIntegration;
