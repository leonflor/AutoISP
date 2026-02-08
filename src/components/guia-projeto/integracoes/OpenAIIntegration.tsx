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
                <CardTitle className="text-xl">INT-02 — OpenAI API</CardTitle>
                <Badge variant="destructive" className="text-xs">Crítica</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Motor de IA (GPT-4o / GPT-4o-mini) para Agentes Inteligentes dos ISPs
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href="https://platform.openai.com/docs" 
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
                    <h4 className="mb-2 text-sm font-medium text-foreground">API:</h4>
                    <Badge variant="secondary" className="text-sm">OpenAI API (GPT-4o / GPT-4o-mini)</Badge>
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
                    <li><strong>Chat:</strong> POST api.openai.com/v1/chat/completions (streaming + tools)</li>
                    <li><strong>Function Call:</strong> Se IA chamar function → executa ação no ERP</li>
                    <li>Retorna resultado da function para IA continuar</li>
                    <li><strong>Streaming:</strong> Tokens são enviados gradualmente ao usuário</li>
                  </ol>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-4">
                  <h4 className="mb-2 text-sm font-medium text-yellow-600">Fallback — API Indisponível:</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Edge Function detecta falha (timeout, 5xx, 429)</li>
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
                        <TableCell className="font-mono text-xs">OPENAI_API_KEY</TableCell>
                        <TableCell className="text-sm">Chave da API OpenAI</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="border-amber-500/50 text-amber-600 text-xs">
                            Painel Admin → Integrações → OpenAI
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">ENCRYPTION_KEY</TableCell>
                        <TableCell className="text-sm">Chave mestra para criptografia AES-256-GCM</TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 text-xs">
                            Supabase Secret
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="mt-3 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      A chave OpenAI é armazenada criptografada (AES-256-GCM) na tabela <code>platform_config</code> (key: <code>integration_openai</code>). 
                      A descriptografia é feita em runtime nas Edge Functions usando a <code>ENCRYPTION_KEY</code>.
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-medium">Endpoint</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <code className="text-xs">https://api.openai.com/v1/chat/completions</code>
                    <p className="mt-1 text-xs text-muted-foreground">API OpenAI direta — chat completions com streaming e function calling</p>
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
                <span className="font-medium">Function Calling (Tools) — Arquitetura Dinâmica</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    <strong>✓ Implementado:</strong> Arquitetura dinâmica — tools são registradas no banco (<code>ai_agent_tools</code>) e gerenciadas pelo Admin. O <code>ai-chat</code> carrega tools ativas e as injeta como OpenAI functions em runtime.
                  </p>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium">Arquitetura:</h4>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                    <li>Tools são cadastradas na tabela <code className="text-xs">ai_agent_tools</code> via Painel Admin</li>
                    <li>O <code className="text-xs">ai-chat</code> carrega tools ativas do agente e converte para formato OpenAI</li>
                    <li>Handler registry em <code className="text-xs">_shared/tool-handlers.ts</code> mapeia <code>handler_type</code> para funções executáveis</li>
                    <li><strong>Tool Call Loop:</strong> até 3 iterações de function calling antes da resposta final</li>
                    <li>Após resolver todas as tools, streaming da resposta consolidada via SSE</li>
                  </ol>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium">Tools Implementadas:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Handler Type</TableHead>
                        <TableHead>Function Name</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Requer ERP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">erp_search</TableCell>
                        <TableCell className="font-mono text-xs">buscar_contrato_cliente</TableCell>
                        <TableCell className="text-sm">Busca clientes no ERP integrado (IXC/SGP/MK)</TableCell>
                        <TableCell className="text-sm"><Badge variant="outline" className="text-xs">Sim</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">erp_invoice_search</TableCell>
                        <TableCell className="font-mono text-xs">consultar_faturas</TableCell>
                        <TableCell className="text-sm">Lista faturas do cliente (mock)</TableCell>
                        <TableCell className="text-sm"><Badge variant="outline" className="text-xs">Sim</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium">Roadmap de Tools (Futuras):</h4>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {["verificar_conexao", "abrir_chamado", "consultar_plano", "segunda_via_boleto", "agendar_visita"].map((fn) => (
                        <Badge key={fn} variant="secondary" className="font-mono text-xs opacity-60">{fn}</Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Futuramente serão adicionadas como novos handlers no registry e registradas via Admin.
                    </p>
                  </div>
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
                    OPENAI_API_KEY criptografada (AES-256-GCM) em platform_config, nunca exposta no frontend
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
                    Controle por tenant + tratamento de 429 da OpenAI
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
                      <TableCell className="text-sm">OPENAI_API_KEY inválida ou não configurada</TableCell>
                      <TableCell className="text-sm">Verificar configuração no painel Admin → Integrações → OpenAI</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="destructive">429</Badge></TableCell>
                      <TableCell className="text-sm">Rate limit excedido na OpenAI</TableCell>
                      <TableCell className="text-sm">Implementar backoff + exibir mensagem ao usuário</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="destructive">500/503</Badge></TableCell>
                      <TableCell className="text-sm">API OpenAI instável</TableCell>
                      <TableCell className="text-sm">Ativar fallback + notificar admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><Badge variant="secondary">503</Badge></TableCell>
                      <TableCell className="text-sm">Integração OpenAI não configurada</TableCell>
                      <TableCell className="text-sm">Configurar chave no painel Admin → Integrações</TableCell>
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
{`POST https://api.openai.com/v1/chat/completions

Headers:
Authorization: Bearer $OPENAI_API_KEY
Content-Type: application/json

Body:
{
  "model": "gpt-4o-mini",
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
        "name": "buscar_contrato_cliente",
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
                    Cobrança direta pela OpenAI — pay-per-use baseado em tokens consumidos.
                    GPT-4o-mini: ~$0.15/1M input tokens | GPT-4o: ~$2.50/1M input tokens.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm text-amber-600">
                    <strong>Dica:</strong> Use GPT-4o-mini para atendimentos simples (mais rápido e barato)
                    e reserve GPT-4o para análises complexas que exigem maior raciocínio.
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
