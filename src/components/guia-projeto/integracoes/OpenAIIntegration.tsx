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
  MessageSquare
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
                <CardTitle className="text-xl">INT-02 — OpenAI</CardTitle>
                <Badge variant="destructive" className="text-xs">Crítica</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Motor de IA para Agentes Inteligentes dos ISPs (GPT-4o)
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
            <a 
              href="https://status.openai.com" 
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground">Modelo:</h4>
                    <Badge variant="secondary" className="text-sm">GPT-4o (gpt-4o)</Badge>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground">Arquitetura:</h4>
                    <Badge variant="outline" className="text-sm">Edge Functions + Streaming</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Casos de Uso:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Chat com Agentes de IA (atendimento automatizado)</li>
                    <li>Geração automática de respostas</li>
                    <li>Análise de sentimento das conversas</li>
                    <li>Sumarização de conversas/atendimentos</li>
                    <li><strong>Function Calling</strong> para executar ações (consultar faturas, verificar conexão, abrir OS)</li>
                    <li><strong>RAG</strong> com base de conhecimento do provedor</li>
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
                    <li>Monta prompt com contexto + RAG + tools disponíveis</li>
                    <li><strong>Chat:</strong> POST /chat/completions (streaming + tools)</li>
                    <li><strong>Function Call:</strong> Se IA chamar function → executa ação no ERP</li>
                    <li>Retorna resultado da function para IA continuar</li>
                    <li><strong>Streaming:</strong> Tokens são enviados gradualmente ao usuário</li>
                  </ol>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-4">
                  <h4 className="mb-2 text-sm font-medium text-yellow-600">Fallback — API Indisponível:</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Edge Function detecta falha (timeout, 5xx)</li>
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
                        <TableCell className="font-mono text-xs">OPENAI_API_KEY</TableCell>
                        <TableCell className="text-sm">API Key da conta OpenAI</TableCell>
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
                        <TableHead>Valor Padrão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs">OPENAI_MODEL</TableCell>
                        <TableCell className="text-sm">Modelo a utilizar</TableCell>
                        <TableCell className="text-sm"><code className="text-xs">gpt-4o</code></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">OPENAI_EMBEDDING_MODEL</TableCell>
                        <TableCell className="text-sm">Modelo para embeddings</TableCell>
                        <TableCell className="text-sm"><code className="text-xs">text-embedding-3-small</code></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">OPENAI_MAX_TOKENS</TableCell>
                        <TableCell className="text-sm">Limite de tokens por resposta</TableCell>
                        <TableCell className="text-sm"><code className="text-xs">1000</code></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">OPENAI_TEMPERATURE</TableCell>
                        <TableCell className="text-sm">Criatividade (0-1)</TableCell>
                        <TableCell className="text-sm"><code className="text-xs">0.7</code></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Exemplo de Tool Definition:</h4>
                  <pre className="overflow-x-auto rounded bg-background p-3 text-xs">
{`{
  "type": "function",
  "function": {
    "name": "consultar_fatura",
    "description": "Consulta faturas abertas ou pagas do assinante",
    "parameters": {
      "type": "object",
      "properties": {
        "cpf": { "type": "string", "description": "CPF do assinante" },
        "status": { "type": "string", "enum": ["aberta", "paga", "vencida", "todas"] }
      },
      "required": ["cpf"]
    }
  }
}`}
                  </pre>
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
                    <p className="text-sm text-muted-foreground">Lovable AI Gateway</p>
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
                  <h4 className="mb-3 text-sm font-medium">Tipos de Documentos Indexados:</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Atualização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">FAQ</TableCell>
                        <TableCell className="text-sm">Perguntas frequentes do provedor</TableCell>
                        <TableCell className="text-sm">Manual pelo cliente</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Planos</TableCell>
                        <TableCell className="text-sm">Descrição dos planos disponíveis</TableCell>
                        <TableCell className="text-sm">Sync com ERP</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Procedimentos</TableCell>
                        <TableCell className="text-sm">Manuais de troubleshooting</TableCell>
                        <TableCell className="text-sm">Manual pelo cliente</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Políticas</TableCell>
                        <TableCell className="text-sm">Termos, contratos, políticas</TableCell>
                        <TableCell className="text-sm">Manual pelo cliente</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Fluxo de Indexação:</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Cliente faz upload de documento (PDF, TXT, MD)</li>
                    <li>Edge Function extrai texto</li>
                    <li>Chunking (500 tokens com overlap de 50)</li>
                    <li>Gera embeddings via OpenAI</li>
                    <li>Armazena em tabela <code className="text-xs">documents_embeddings</code></li>
                  </ol>
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
                  <h4 className="mb-2 text-sm font-medium text-foreground">Painel Cliente — Agentes de IA:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>F-CLI-045 a F-CLI-060 (Módulo Agentes de IA) — 16 features</li>
                    <li>F-CLI-058: Gerenciar Base de Conhecimento do Agente (RAG)</li>
                    <li>F-CLI-055: Métricas de Performance do Agente</li>
                    <li>F-CLI-104: Relatório de Performance da IA</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Painel Cliente — Atendimentos:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>F-CLI-009 a F-CLI-020 (Atendimentos) — interação com IA</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Painel Admin:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Monitoramento de uso de IA por tenant</li>
                    <li>Configuração de limites por plano</li>
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
                  <h4 className="mb-2 text-sm font-medium">Isolamento de Dados</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada tenant só acessa seu próprio contexto e embeddings
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    Controle por tenant para evitar abuso e custos excessivos
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 text-sm font-medium">Sanitização</h4>
                  <p className="text-sm text-muted-foreground">
                    Remover dados sensíveis (CPF, senhas) antes de enviar à API
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
                      <TableCell>
                        <Badge variant="destructive">401</Badge>
                      </TableCell>
                      <TableCell className="text-sm">API Key inválida</TableCell>
                      <TableCell className="text-sm">Rotacionar chave no painel OpenAI</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="destructive">429</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Muitas requisições</TableCell>
                      <TableCell className="text-sm">Implementar queue + retry com backoff</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="destructive">500/503</Badge>
                      </TableCell>
                      <TableCell className="text-sm">API instável</TableCell>
                      <TableCell className="text-sm">Ativar fallback + notificar admin</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="secondary">Incoerente</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Prompt mal configurado</TableCell>
                      <TableCell className="text-sm">Revisar prompt do agente</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="secondary">Tokens</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Contexto muito grande</TableCell>
                      <TableCell className="text-sm">Truncar histórico, usar sumarização</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="secondary">RAG vazio</Badge>
                      </TableCell>
                      <TableCell className="text-sm">Embedding ruim ou poucos docs</TableCell>
                      <TableCell className="text-sm">Melhorar chunking, adicionar docs</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="secondary">Function</Badge>
                      </TableCell>
                      <TableCell className="text-sm">API do ERP indisponível</TableCell>
                      <TableCell className="text-sm">Retry + resposta alternativa</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="rounded-lg bg-blue-500/10 p-4">
                  <h4 className="mb-2 text-sm font-medium text-blue-600">Como Testar:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Testar prompts no Playground da OpenAI</li>
                    <li>Edge Function com logs detalhados</li>
                    <li>Sandbox para testar functions</li>
                    <li>Monitorar latência e tokens consumidos</li>
                  </ul>
                </div>
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
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "Você é o assistente do provedor XYZ Internet. 
                  Use as ferramentas disponíveis para consultar dados.
                  Contexto RAG: [docs relevantes]"
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
  "stream": true,
  "max_tokens": 1000
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">Response — Function Call (SSE):</h4>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`data: {
  "choices": [{
    "delta": {
      "tool_calls": [{
        "function": {
          "name": "consultar_fatura",
          "arguments": "{\\"cpf\\": \\"12345678900\\"}"
        }
      }]
    }
  }]
}

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
                <div>
                  <h4 className="mb-3 text-sm font-medium">Tabela de Preços (GPT-4o):</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Input tokens</TableCell>
                        <TableCell>$2.50 / 1M tokens</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Output tokens</TableCell>
                        <TableCell>$10.00 / 1M tokens</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Embeddings (3-small)</TableCell>
                        <TableCell>$0.02 / 1M tokens</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="mb-2 text-sm font-medium">Estimativa por Tenant (médio):</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>1.000 atendimentos/mês</li>
                      <li>Média 800 tokens/atendimento</li>
                      <li>800.000 tokens/mês</li>
                      <li className="font-medium text-foreground">~$5-8/mês por tenant</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-4">
                    <h4 className="mb-2 text-sm font-medium text-green-600">Estimativa Total (100 tenants):</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>80M tokens/mês</li>
                      <li className="font-medium text-foreground">~$500-800/mês</li>
                    </ul>
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

export default OpenAIIntegration;
