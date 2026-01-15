import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { 
  CreditCard, 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  Code, 
  DollarSign,
  Link,
  Key,
  Webhook,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

const AsaasIntegration = () => {
  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CreditCard className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">INT-01 — Asaas</CardTitle>
                <Badge variant="destructive" className="text-xs">Crítica</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Gateway de pagamentos brasileiro para cobranças recorrentes
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href="https://docs.asaas.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              Docs <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://status.asaas.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              Status <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="multiple" defaultValue={["visao-geral"]} className="w-full">
          {/* Visão Geral */}
          <AccordionItem value="visao-geral" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Visão Geral</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Para que serve:</h4>
                  <p className="text-sm text-muted-foreground">
                    Gateway de pagamentos brasileiro para cobranças recorrentes (PIX, Boleto, Cartão de Crédito)
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Quando é usado:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Checkout de planos</li>
                    <li>Renovação automática de assinaturas</li>
                    <li>Cobranças avulsas (upgrade)</li>
                    <li>Segunda via de boleto</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive">
                    ⚠️ CRITICIDADE: Sem esta integração não há monetização do SaaS
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fluxo Detalhado */}
          <AccordionItem value="fluxo" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Fluxo Detalhado</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-3 text-sm font-medium">Fluxo de Nova Assinatura:</h4>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                    <li>Usuário seleciona Plano e clica "Assinar"</li>
                    <li>APP → Asaas: POST /customers (cria cliente)</li>
                    <li>Asaas → APP: Retorna customer_id</li>
                    <li>APP → Asaas: POST /subscriptions (cria assinatura)</li>
                    <li>Asaas → APP: Retorna subscription_id + payment_link</li>
                    <li>APP → DB: Salva cliente + assinatura (status: pending)</li>
                    <li>APP → Usuário: Redireciona para checkout Asaas</li>
                  </ol>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-3 text-sm font-medium">Fluxo de Pagamento:</h4>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                    <li>Usuário confirma pagamento (PIX/Boleto/Cartão)</li>
                    <li>Asaas → APP: Webhook (PAYMENT_CONFIRMED)</li>
                    <li>APP → DB: Atualiza assinatura (status: active)</li>
                    <li>APP: Provisiona acesso ao plano</li>
                  </ol>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-3 text-sm font-medium">Renovação Automática:</h4>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                    <li>Asaas gera cobrança mensal automaticamente</li>
                    <li>Asaas → APP: Webhook (PAYMENT_CREATED)</li>
                    <li>Asaas → Usuário: Envia boleto/link PIX</li>
                    <li>Usuário paga</li>
                    <li>Asaas → APP: Webhook (PAYMENT_CONFIRMED)</li>
                    <li>APP → DB: Registra pagamento</li>
                  </ol>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Configuração */}
          <AccordionItem value="configuracao" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Configuração</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4" /> Secrets Necessários
                  </h4>
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
                        <TableCell className="font-mono text-xs">ASAAS_API_KEY</TableCell>
                        <TableCell className="text-sm">API Key da conta Asaas</TableCell>
                        <TableCell className="text-sm">Supabase Secrets</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">ASAAS_WEBHOOK_TOKEN</TableCell>
                        <TableCell className="text-sm">Token para validar webhooks</TableCell>
                        <TableCell className="text-sm">Supabase Secrets</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium">Variáveis de Ambiente</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variável</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">ASAAS_API_URL</TableCell>
                        <TableCell className="text-sm">URL da API</TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            <code className="text-xs">https://api.asaas.com/v3</code> (produção)
                            <br />
                            <code className="text-xs">https://sandbox.asaas.com/api/v3</code> (sandbox)
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Webhook className="h-4 w-4" /> Webhooks
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>URL</TableHead>
                        <TableHead>Eventos</TableHead>
                        <TableHead>Validação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">/functions/v1/asaas-webhook</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-wrap gap-1">
                            {["PAYMENT_CREATED", "PAYMENT_CONFIRMED", "PAYMENT_OVERDUE", "SUBSCRIPTION_CREATED", "SUBSCRIPTION_UPDATED"].map((event) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">Header asaas-access-token</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Features Relacionadas */}
          <AccordionItem value="features" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Features Relacionadas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Painel Admin:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>F-ADMIN-061 a F-ADMIN-076 (Módulo Financeiro)</li>
                    <li>F-ADMIN-037 a F-ADMIN-049 (Assinaturas)</li>
                    <li>Planos (gestão de preços)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Painel Cliente:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>F-CLI-089: Visualizar Informações da Conta/Plano</li>
                    <li>F-CLI-090: Solicitar Upgrade de Plano</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Landing Page:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>F-LANDING-009: Iniciar Trial Gratuito</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Segurança */}
          <AccordionItem value="seguranca" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="font-medium">Segurança</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Proteção de Secrets</h4>
                  <p className="text-sm text-muted-foreground">
                    API Key armazenada em Supabase Secrets, nunca exposta no frontend
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Validação de Webhooks</h4>
                  <p className="text-sm text-muted-foreground">
                    Verificar header asaas-access-token em toda requisição
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    100 requests/minuto — respeitar com queue + backoff
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Fallback</h4>
                  <p className="text-sm text-muted-foreground">
                    Retry com exponential backoff; DLQ para webhooks falhos
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Troubleshooting */}
          <AccordionItem value="troubleshooting" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Troubleshooting</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
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
                      <TableCell>
                        <Badge variant="destructive">401</Badge>
                      </TableCell>
                      <TableCell className="text-sm">API Key inválida ou expirada</TableCell>
                      <TableCell className="text-sm">Rotacionar chave no painel Asaas</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="destructive">400</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Payload inválido</TableCell>
                      <TableCell className="text-sm">Verificar schema da API</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="destructive">429</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Rate limit excedido</TableCell>
                      <TableCell className="text-sm">Implementar queue + retry</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="secondary">Webhook</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Webhook não recebido</TableCell>
                      <TableCell className="text-sm">Verificar logs da Edge Function</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="rounded-lg bg-blue-500/10 p-4">
                  <h4 className="mb-2 text-sm font-medium text-blue-600">Como Testar:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Usar ambiente sandbox: <code className="text-xs">https://sandbox.asaas.com</code></li>
                    <li>CPFs de teste: <code className="text-xs">00000000000</code>, <code className="text-xs">11111111111</code></li>
                    <li>Cartões de teste disponíveis na documentação oficial</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payloads */}
          <AccordionItem value="payloads" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-cyan-500" />
                <span className="font-medium">Payloads (Request/Response)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Headers Necessários:</h4>
                  <pre className="rounded-lg bg-muted p-3 text-xs">
{`Authorization: Bearer $ASAAS_API_KEY
Content-Type: application/json`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Criar Cliente (Request):</h4>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`{
  "name": "Nome do Cliente",
  "cpfCnpj": "12345678900",
  "email": "cliente@email.com",
  "phone": "11999999999",
  "mobilePhone": "11999999999",
  "externalReference": "tenant_123"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Criar Assinatura (Request):</h4>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`{
  "customer": "cus_000005113026",
  "billingType": "BOLETO",
  "value": 199.90,
  "nextDueDate": "2025-02-15",
  "cycle": "MONTHLY",
  "description": "Plano Pro - AutoISP",
  "externalReference": "subscription_456"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Assinatura Criada (Response):</h4>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`{
  "id": "sub_000005113028",
  "customer": "cus_000005113026",
  "value": 199.90,
  "cycle": "MONTHLY",
  "status": "ACTIVE",
  "nextDueDate": "2025-02-15"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Webhook Pagamento Confirmado:</h4>
                  <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto">
{`{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_000005113030",
    "customer": "cus_000005113026",
    "subscription": "sub_000005113028",
    "value": 199.90,
    "status": "CONFIRMED",
    "confirmedDate": "2025-01-15"
  }
}`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custos */}
          <AccordionItem value="custos" className="px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Custos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Método</TableHead>
                      <TableHead>Taxa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Boleto</TableCell>
                      <TableCell>R$ 1,99 por cobrança</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">PIX</TableCell>
                      <TableCell>0,99% (mín. R$ 0,50)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Cartão de Crédito</TableCell>
                      <TableCell>2,99% + R$ 0,49</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Transferência (saque)</TableCell>
                      <TableCell>Gratuita via PIX</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="rounded-lg bg-emerald-500/10 p-4">
                  <h4 className="mb-2 text-sm font-medium text-emerald-600">Plano Gratuito:</h4>
                  <p className="text-sm text-muted-foreground">
                    Não há mensalidade, apenas taxas por transação
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Estimativa Mensal:</h4>
                  <p className="text-sm text-muted-foreground">
                    Base: 100 clientes, plano médio R$ 200 → Receita: R$ 20.000
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Custo estimado: R$ 200 a R$ 400/mês
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AsaasIntegration;
