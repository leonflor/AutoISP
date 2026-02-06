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
  Brain, 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  Code, 
  DollarSign,
  Link,
  Key,
  CheckCircle,
  Info,
  Zap,
  Database,
  MessageSquare,
  Users
} from "lucide-react";

const OpenAIIntegration = () => {
  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Brain className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">INT-02 — Lovable AI Gateway</CardTitle>
                <Badge variant="destructive" className="text-xs">Crítica</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Motor de IA Multi-Modelo para Agentes Inteligentes dos ISPs
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href="https://docs.lovable.dev/features/ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              Docs <ExternalLink className="h-3 w-3" />
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground">Gateway:</h4>
                    <Badge variant="secondary" className="text-sm">Lovable AI Gateway (multi-modelo)</Badge>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground">Arquitetura:</h4>
                    <Badge variant="outline" className="text-sm">Edge Functions + Streaming</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Modelos Suportados:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">GPT-4o</Badge>
                    <Badge variant="secondary">GPT-4o-mini</Badge>
                    <Badge variant="secondary">Gemini 2.5 Flash</Badge>
                    <Badge variant="secondary">Gemini 2.5 Pro</Badge>
                    <Badge variant="outline">+ outros via Gateway</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Casos de Uso:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Chat com Agentes de IA (atendimento automatizado multi-agente)</li>
                    <li>Geração automática de respostas com streaming</li>
                    <li>Análise de sentimento das conversas</li>
                    <li>Sumarização de conversas/atendimentos</li>
                    <li><strong>Function Calling</strong> para executar ações (consultar faturas, verificar conexão, abrir OS)</li>
                    <li><strong>RAG</strong> com base de conhecimento do provedor (pgvector)</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive">
                    ⚠️ CRITICIDADE: É o core do produto — motor de IA dos agentes inteligentes
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Arquitetura de Agentes */}
          <AccordionItem value="agentes" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">Arquitetura de Agentes (3 Camadas)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <h4 className="text-sm font-medium text-primary">1. Templates (Superadmin)</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <code>ai_agents</code> — Define escopo, prompts, modelo. Sincronizado globalmente.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <strong>Nome do Template:</strong> identifica a função (ex: "Atendente N1")
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="text-sm font-medium text-foreground">2. Ativações (ISP)</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <code>isp_agents</code> — Personalizações por tenant (tom, avatar, escalação).
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <strong>Nome de Apresentação:</strong> como se apresenta ao cliente (ex: "Luna"). Opcional, fallback para nome do template.
                    </p>
                  </div>
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <h4 className="text-sm font-medium text-destructive">3. Segurança Global</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <code>ai_security_clauses</code> — Cláusulas LGPD obrigatórias injetadas em todos os prompts.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Prompt Hierárquico (ai-chat):</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Template do Admin (escopo, instruções base)</li>
                    <li>Tom de Voz do ISP (personalização tenant)</li>
                    <li>Documentos RAG relevantes (pgvector)</li>
                    <li>Q&A Manual do agente</li>
                    <li>Cláusulas de Segurança LGPD (obrigatório)</li>
                  </ol>
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
                  <h4 className="mb-3 text-sm font-medium">Fluxo de Atendimento com IA + RAG + Functions:</h4>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                    <li>Assinante envia mensagem via WhatsApp</li>
                    <li>Webhook encaminha para Edge Function</li>
                    <li>Edge Function busca contexto (assinante, histórico, config agente)</li>
                    <li><strong>RAG:</strong> Gera embedding da pergunta → busca docs similares (pgvector)</li>
                    <li>Monta prompt hierárquico (template + tom + RAG + Q&A + segurança)</li>
                    <li><strong>Chat:</strong> POST ai.gateway.lovable.dev/v1/chat/completions (streaming + tools)</li>
                    <li><strong>Function Call:</strong> Se IA chamar function → executa ação no ERP</li>
                    <li>Retorna resultado da function para IA continuar</li>
                    <li><strong>Streaming:</strong> Tokens são enviados gradualmente ao usuário</li>
                  </ol>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-4">
                  <h4 className="mb-2 text-sm font-medium text-yellow-600">Fallback — API Indisponível:</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Edge Function detecta falha (timeout, 5xx, 429, 402)</li>
                    <li>Registra falha no banco</li>
                    <li>Envia mensagem: "Sistema instável, aguarde..."</li>
                    <li>Notifica Admin do SaaS (email/webhook)</li>
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
                    <Shield className="h-4 w-4" /> Secret
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
                        <TableCell className="font-mono text-xs">LOVABLE_API_KEY</TableCell>
                        <TableCell className="text-sm">Chave do Lovable AI Gateway</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 text-xs">Auto-provisionado</Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium">Endpoint</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <code className="text-xs">https://ai.gateway.lovable.dev/v1/chat/completions</code>
                    <p className="mt-1 text-xs text-muted-foreground">API compatível com OpenAI — aceita mesmo formato de payloads</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium">Limites por Tenant</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Configuração</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor Sugerido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">max_tokens_per_request</TableCell>
                        <TableCell className="text-sm">Tokens por requisição</TableCell>
                        <TableCell className="text-sm">2000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">max_requests_per_minute</TableCell>
                        <TableCell className="text-sm">Rate limit por tenant</TableCell>
                        <TableCell className="text-sm">60</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">max_tokens_per_day</TableCell>
                        <TableCell className="text-sm">Limite diário por tenant</TableCell>
                        <TableCell className="text-sm">100.000</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Function Calling */}
          <AccordionItem value="functions" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Function Calling (Tools)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-3 text-sm font-medium">Functions Disponíveis para os Agentes:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Function</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Parâmetros</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">consultar_fatura</TableCell>
                        <TableCell className="text-sm">Busca faturas do assinante</TableCell>
                        <TableCell className="text-sm">cpf, status</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">verificar_conexao</TableCell>
                        <TableCell className="text-sm">Testa conexão do equipamento</TableCell>
                        <TableCell className="text-sm">contrato_id</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">abrir_chamado</TableCell>
                        <TableCell className="text-sm">Cria OS no ERP</TableCell>
                        <TableCell className="text-sm">tipo, descricao, prioridade</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">consultar_plano</TableCell>
                        <TableCell className="text-sm">Retorna dados do plano atual</TableCell>
                        <TableCell className="text-sm">contrato_id</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">segunda_via_boleto</TableCell>
                        <TableCell className="text-sm">Gera link de 2ª via</TableCell>
                        <TableCell className="text-sm">fatura_id</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">agendar_visita</TableCell>
                        <TableCell className="text-sm">Agenda visita técnica</TableCell>
                        <TableCell className="text-sm">data, periodo, motivo</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* RAG / Embeddings */}
          <AccordionItem value="rag" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-500" />
                <span className="font-medium">RAG (Retrieval Augmented Generation)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 mb-4">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    <strong>✓ Implementado:</strong> RAG híbrido operacional com busca semântica em documentos + Q&A manual.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <h4 className="text-sm font-medium">Vector Store</h4>
                    <p className="text-sm text-muted-foreground">Supabase + pgvector</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <h4 className="text-sm font-medium">Embedding</h4>
                    <p className="text-sm text-muted-foreground">text-embedding-3-small</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <h4 className="text-sm font-medium">Dimensões</h4>
                    <p className="text-sm text-muted-foreground">768</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <h4 className="text-sm font-medium">Threshold</h4>
                    <p className="text-sm text-muted-foreground">similarity &gt; 0.7</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border p-3">
                    <h4 className="text-sm font-medium mb-2">Tabelas</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li><code className="rounded bg-muted px-1">knowledge_documents</code> — Metadados dos documentos</li>
                      <li><code className="rounded bg-muted px-1">document_chunks</code> — Chunks com embeddings</li>
                      <li><code className="rounded bg-muted px-1">agent_knowledge_base</code> — Q&A manual</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <h4 className="text-sm font-medium mb-2">Função de Busca</h4>
                    <code className="text-xs bg-muted px-2 py-1 rounded block">match_document_chunks(query_embedding, isp_agent_id, threshold, limit)</code>
                    <p className="mt-2 text-xs text-muted-foreground">Retorna chunks ordenados por similaridade coseno</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium">Fluxo de Indexação:</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Cliente faz upload de documento (PDF, TXT, MD)</li>
                    <li>Edge Function <code className="text-xs">process-document</code> extrai texto</li>
                    <li>Chunking (500 tokens com overlap de 50)</li>
                    <li>Gera embeddings via OpenAI API (text-embedding-3-small, 768 dim)</li>
                    <li>Armazena em tabela <code className="text-xs">document_chunks</code></li>
                  </ol>
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
                    LOVABLE_API_KEY auto-provisionado, nunca exposto no frontend
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Isolamento de Dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada tenant só acessa seu próprio contexto e embeddings
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    Controle por tenant + tratamento de 429/402 do Gateway
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Cláusulas LGPD</h4>
                  <p className="text-sm text-muted-foreground">
                    Injetadas obrigatoriamente via ai_security_clauses
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Fallback</h4>
                  <p className="text-sm text-muted-foreground">
                    Mensagem de instabilidade + notificação ao admin do SaaS
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Function Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Validar retornos das functions antes de executar ações
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
                      <TableCell><Badge variant="destructive">401</Badge></TableCell>
                      <TableCell className="text-sm">LOVABLE_API_KEY inválida</TableCell>
                      <TableCell className="text-sm">Verificar provisionamento no Lovable Cloud</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="destructive">402</Badge></TableCell>
                      <TableCell className="text-sm">Créditos insuficientes</TableCell>
                      <TableCell className="text-sm">Adicionar créditos em Settings → Workspace → Usage</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="destructive">429</Badge></TableCell>
                      <TableCell className="text-sm">Rate limit excedido</TableCell>
                      <TableCell className="text-sm">Implementar backoff + exibir mensagem ao usuário</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="destructive">500/503</Badge></TableCell>
                      <TableCell className="text-sm">Gateway instável</TableCell>
                      <TableCell className="text-sm">Ativar fallback + notificar admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="secondary">Incoerente</Badge></TableCell>
                      <TableCell className="text-sm">Prompt mal configurado</TableCell>
                      <TableCell className="text-sm">Revisar prompt do agente no template</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="secondary">RAG vazio</Badge></TableCell>
                      <TableCell className="text-sm">Embedding ruim ou poucos docs</TableCell>
                      <TableCell className="text-sm">Melhorar chunking, adicionar docs</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Payloads */}
          <AccordionItem value="payloads" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-500" />
                <span className="font-medium">Dados Enviados/Recebidos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Request — Chat com Streaming + Functions + RAG:</h4>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`POST https://ai.gateway.lovable.dev/v1/chat/completions

Headers:
Authorization: Bearer $LOVABLE_API_KEY
Content-Type: application/json

Body:
{
  "model": "google/gemini-2.5-flash",
  "messages": [
    {
      "role": "system",
      "content": "[Template] + [Tom ISP] + [RAG docs] + [Q&A] + [LGPD]"
    },
    { "role": "user", "content": "Qual o valor da minha fatura?" }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "consultar_fatura",
        "parameters": { ... }
      }
    }
  ],
  "stream": true
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Response — Streaming SSE:</h4>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`data: {"choices":[{"delta":{"content":"A sua fatura"}}]}
data: {"choices":[{"delta":{"content":" de janeiro"}}]}
...
data: [DONE]`}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Custos */}
          <AccordionItem value="custos" className="px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-medium">Custos</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Modelo de Custo:</h4>
                  <p className="text-sm text-muted-foreground">
                    Via Lovable AI Gateway — pricing baseado em uso (requests). Inclui uso gratuito mensal.
                    Créditos adicionais podem ser adquiridos em Settings → Workspace → Usage.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm text-amber-600">
                    <strong>Dica:</strong> Use modelos mais leves (Gemini Flash, GPT-4o-mini) para atendimentos simples
                    e reserve modelos maiores (GPT-4o, Gemini Pro) para análises complexas.
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

export default OpenAIIntegration;
