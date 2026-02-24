import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GitBranch, Lock, Shuffle, Lightbulb, Route, Layers } from "lucide-react";

const FluxosConversacionaisSection = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Fluxos Conversacionais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Arquitetura completa dos fluxos que orientam o comportamento dos agentes de IA durante as conversas
        </p>
      </div>

      {/* Bloco 1 — Visão Geral da Hierarquia */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Hierarquia do Sistema</CardTitle>
          </div>
          <CardDescription>
            Cadeia de montagem do system prompt no <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ai-chat/index.ts</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Badge variant="outline" className="px-3 py-1">Agente</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="px-3 py-1">Fluxos <span className="ml-1 text-xs text-muted-foreground">(via flow_links)</span></Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="px-3 py-1">Etapas</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="px-3 py-1">Ferramenta <span className="ml-1 text-xs text-muted-foreground">(tool_handler)</span></Badge>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">1.</strong> O endpoint <code className="rounded bg-muted px-1 text-xs">ai-chat</code> recebe o agente ativo do ISP e carrega seu <code className="rounded bg-muted px-1 text-xs">system_prompt</code> base.
            </p>
            <p>
              <strong className="text-foreground">2.</strong> Consulta <code className="rounded bg-muted px-1 text-xs">ai_agent_flow_links</code> para obter os fluxos vinculados (ativos, ordenados por <code className="rounded bg-muted px-1 text-xs">sort_order</code>).
            </p>
            <p>
              <strong className="text-foreground">3.</strong> Para cada fluxo, carrega as etapas de <code className="rounded bg-muted px-1 text-xs">ai_agent_flow_steps</code> e monta um bloco Markdown com nome, instrução, input esperado, ferramenta e condição de avanço.
            </p>
            <p>
              <strong className="text-foreground">4.</strong> O <code className="rounded bg-muted px-1 text-xs">trigger_prompt</code> do fluxo é injetado como instrução de ativação, e as <code className="rounded bg-muted px-1 text-xs">trigger_keywords</code> permitem ativação automática.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bloco 2 — Campos do Fluxo */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Campos do Fluxo</CardTitle>
          </div>
          <CardDescription>
            Tabela <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ai_agent_flows</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Campo</TableHead>
                <TableHead className="w-[100px]">Tipo</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { campo: "name", tipo: "text", desc: "Nome exibido no admin e injetado como título no prompt" },
                { campo: "description", tipo: "text", desc: "Descrição interna — não é injetada no prompt" },
                { campo: "trigger_keywords", tipo: "text[]", desc: "Palavras-chave que ativam o fluxo automaticamente quando detectadas na mensagem" },
                { campo: "trigger_prompt", tipo: "text", desc: "Instrução injetada no system prompt quando o fluxo é ativado" },
                { campo: "is_fixed", tipo: "boolean", desc: "Roteiro fixo (sequencial rígido) vs flexível (adaptável pela IA)" },
                { campo: "is_active", tipo: "boolean", desc: "Se o fluxo está disponível para vinculação a agentes" },
                { campo: "sort_order", tipo: "integer", desc: "Ordem de exibição no admin e no prompt" },
              ].map((row) => (
                <TableRow key={row.campo}>
                  <TableCell className="font-mono text-xs">{row.campo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.tipo}</TableCell>
                  <TableCell className="text-sm">{row.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bloco 3 — Campos da Etapa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Campos da Etapa</CardTitle>
          </div>
          <CardDescription>
            Tabela <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ai_agent_flow_steps</code> — cada campo e seu impacto no prompt montado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Campo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[280px]">Impacto no Prompt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { campo: "name", desc: "Nome da etapa (ex: IDENTIFICAÇÃO)", impacto: "Título em maiúsculo no bloco Markdown" },
                { campo: "instruction", desc: "Comando imperativo para a IA seguir", impacto: 'Linha "Instrução:" no prompt' },
                { campo: "expected_input", desc: "Dado esperado do usuário nesta etapa", impacto: 'Linha "Input esperado:"' },
                { campo: "tool_handler", desc: "String do catálogo de tools (ex: erp_invoice_search)", impacto: 'Linha "Ferramenta:" — só aparece se a tool existir no catálogo' },
                { campo: "tool_auto_execute", desc: "Executar a ferramenta automaticamente sem confirmação", impacto: "Sem interação manual do usuário" },
                { campo: "condition_to_advance", desc: "Condição para avançar ao próximo passo", impacto: 'Linha "Avance quando:"' },
                { campo: "fallback_instruction", desc: "Orientação se a etapa falhar ou não conseguir avançar", impacto: "Existe na tabela, ainda não injetado no prompt" },
              ].map((row) => (
                <TableRow key={row.campo}>
                  <TableCell className="font-mono text-xs">{row.campo}</TableCell>
                  <TableCell className="text-sm">{row.desc}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.impacto}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bloco 4 — Fixo vs Flexível */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Roteiro Fixo</CardTitle>
            </div>
            <CardDescription>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">is_fixed: true</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground">Instrução injetada no prompt:</p>
              <p className="mt-1 italic text-muted-foreground">"Siga as etapas na ordem. Não pule etapas."</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Ideal para:</p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Cobrança e faturamento</li>
                <li>Compliance e regulatório</li>
                <li>Onboarding de clientes</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              A IA não pode alterar a sequência — segue etapa por etapa na ordem numérica definida.
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-accent-foreground" />
              <CardTitle className="text-lg">Roteiro Flexível</CardTitle>
            </div>
            <CardDescription>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">is_fixed: false</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium text-foreground">Instrução injetada no prompt:</p>
              <p className="mt-1 italic text-muted-foreground">"Use as etapas como guia, adaptando conforme a conversa."</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Ideal para:</p>
              <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                <li>Suporte técnico</li>
                <li>Vendas consultivas</li>
                <li>Atendimento geral</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              A IA pode pular ou reordenar etapas conforme o contexto da conversa.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bloco 5 — Boas Práticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
            <CardTitle className="text-lg">Boas Práticas de Instrução</CardTitle>
          </div>
          <CardDescription>Recomendações para preencher os campos das etapas de forma eficaz</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {[
              {
                id: "1",
                title: "Use imperativo com restrições negativas",
                content: 'Exemplo: "Solicite o CPF do cliente. NÃO prossiga sem validar." — Comandos imperativos com negativas explícitas reduzem alucinações.',
              },
              {
                id: "2",
                title: "Uma ferramenta por etapa",
                content: "Evita ambiguidade na escolha de tools. Se a etapa precisa de duas ferramentas, divida em duas etapas.",
              },
              {
                id: "3",
                title: "condition_to_advance concreto",
                content: '"Pelo menos 1 resultado retornado" em vez de "Cliente encontrado". Condições vagas permitem que a IA avance prematuramente.',
              },
              {
                id: "4",
                title: "trigger_keywords específicos",
                content: '"2via, segunda via, boleto" em vez de "pagamento". Keywords genéricas causam ativações indesejadas.',
              },
              {
                id: "5",
                title: "expected_input tipado",
                content: '"CPF (11 dígitos) ou CNPJ (14 dígitos)" em vez de "documento". Ajuda a IA a validar o formato.',
              },
              {
                id: "6",
                title: "fallback_instruction explícito",
                content: '"Se não conseguir identificar, pergunte novamente informando o formato esperado." — Evita loops ou encerramento prematuro.',
              },
            ].map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {item.id}
                    </Badge>
                    {item.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Bloco 6 — Rotas Condicionais (Planejado) */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Rotas Condicionais</CardTitle>
            <Badge variant="outline" className="ml-2 text-xs">Planejado</Badge>
          </div>
          <CardDescription>
            Campo <code className="rounded bg-muted px-1.5 py-0.5 text-xs">conditional_routes</code> (JSONB) na tabela <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ai_agent_flow_steps</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Estrutura do JSON:</p>
            <pre className="overflow-x-auto rounded bg-muted p-3 text-xs text-muted-foreground">
{`[
  { "condition": "ONU offline", "goto_step": 4, "label": "Ir para Suporte Técnico" },
  { "condition": "Sinal normal", "goto_step": null, "label": "Seguir próximo" }
]`}
            </pre>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Impacto no modo fixo:</p>
              <p className="text-muted-foreground">
                Progresso linear <strong>com saltos explícitos</strong>. A IA segue a ordem, mas pode saltar para uma etapa específica quando a condição é atendida.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Impacto no modo flexível:</p>
              <p className="text-muted-foreground">
                As rotas funcionam como <strong>sugestões fortes de navegação</strong>, orientando a IA sobre o melhor caminho sem impor rigidez.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <p className="mb-2 font-medium text-foreground">Exemplo prático — Diagnóstico ONU:</p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <p>2. DIAGNÓSTICO ONU</p>
              <p className="ml-3">Ferramenta: fetch_onu_signal</p>
              <p className="ml-3">Rotas:</p>
              <p className="ml-6">- Se ONU offline → Ir para etapa 4 (Procedimento Offline)</p>
              <p className="ml-6">- Se sinal fraco (rx {"<"} -25dBm) → Ir para etapa 5 (Sinal Degradado)</p>
              <p className="ml-6">- Se sinal normal → Seguir para etapa 3</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxosConversacionaisSection;
