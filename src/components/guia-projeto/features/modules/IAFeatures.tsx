import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RegraNegocio {
  codigo: string;
  descricao: string;
  tipo: string;
}

interface Permissao {
  role: string;
  acoes: string;
}

interface Entidade {
  tabela: string;
  campos: string;
  operacoes: string;
}

interface Feature {
  codigo: string;
  nome: string;
  modulo: string;
  plataforma: string;
  descricao: string;
  criticidade: "alta" | "media" | "baixa";
  regrasNegocio: RegraNegocio[];
  permissoes: Permissao[];
  entidades: Entidade[];
}

const iaFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-108",
    nome: "Listar Templates de Agentes de IA",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Exibe tabela com todos os templates de agentes de IA cadastrados no sistema, incluindo nome, tipo, scope (tenant/platform), status e ações. Permite filtrar por tipo e status.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F108-01", descricao: "Templates com scope 'tenant' são disponibilizados para ISPs ativarem", tipo: "Comportamento" },
      { codigo: "RN-F108-02", descricao: "Templates com scope 'platform' são de uso interno do SaaS", tipo: "Comportamento" },
      { codigo: "RN-F108-03", descricao: "Ordenação alfabética por nome", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar, criar, editar, duplicar, ativar/desativar" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "id, name, slug, type, scope, is_active, sort_order", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-109",
    nome: "Criar Template de Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Permite criar um novo template de agente de IA com configurações de nome, tipo, scope, system prompt, modelo, temperatura e tokens máximos. Inclui abas para configurações básicas, IA, features e status.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F109-01", descricao: "Slug é gerado automaticamente a partir do nome", tipo: "Geração" },
      { codigo: "RN-F109-02", descricao: "System prompt é obrigatório para agentes ativos", tipo: "Validação" },
      { codigo: "RN-F109-03", descricao: "Temperatura padrão: 0.7, Max Tokens padrão: 1000", tipo: "Default" },
      { codigo: "RN-F109-04", descricao: "Feature tags definem capacidades do agente", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar templates de agentes" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "name, slug, type, scope, system_prompt, model, temperature, max_tokens, feature_tags, is_active", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-110",
    nome: "Editar Template de Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Permite editar configurações de um template de agente existente. Alterações afetam novos agentes ativados por ISPs, mas não alteram agentes já ativos.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F110-01", descricao: "Alterações não afetam agentes já ativados por ISPs", tipo: "Comportamento" },
      { codigo: "RN-F110-02", descricao: "Histórico de alterações é registrado em audit_logs", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Editar templates de agentes" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "name, slug, type, scope, system_prompt, model, temperature, max_tokens, feature_tags, is_active", operacoes: "UPDATE" },
      { tabela: "audit_logs", campos: "action, entity_type, entity_id, old_data, new_data", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-111",
    nome: "Duplicar Template de Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Cria uma cópia de um template existente com nome modificado (sufixo 'Cópia'). Útil para criar variações de agentes sem reconfigurar do zero.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F111-01", descricao: "Nome do clone: '{nome_original} (Cópia)'", tipo: "Geração" },
      { codigo: "RN-F111-02", descricao: "Slug é regenerado automaticamente", tipo: "Geração" },
      { codigo: "RN-F111-03", descricao: "Clone inicia com is_active = false", tipo: "Default" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Duplicar templates de agentes" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "*", operacoes: "SELECT, INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-112",
    nome: "Ativar/Desativar Template",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Toggle para ativar ou desativar um template de agente. Templates desativados não aparecem no catálogo de agentes para ISPs.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F112-01", descricao: "Template desativado não aparece no catálogo para ISPs", tipo: "Comportamento" },
      { codigo: "RN-F112-02", descricao: "ISPs com agente já ativo não são afetados imediatamente", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Ativar/desativar templates" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "is_active", operacoes: "UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-113",
    nome: "Gerenciar Cláusulas de Segurança LGPD",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Visualiza e gerencia cláusulas de segurança obrigatórias que são injetadas nos prompts de todos os agentes de IA. Garante conformidade LGPD e políticas de privacidade.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F113-01", descricao: "Cláusulas ativas são injetadas em todos os agentes", tipo: "Comportamento" },
      { codigo: "RN-F113-02", descricao: "Campo 'applies_to' define escopo: all, tenant, platform", tipo: "Configuração" },
      { codigo: "RN-F113-03", descricao: "Ordenação por sort_order determina ordem de injeção", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Gerenciar cláusulas de segurança" },
    ],
    entidades: [
      { tabela: "ai_security_clauses", campos: "id, name, content, applies_to, is_active, sort_order", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-114",
    nome: "Criar Cláusula de Segurança",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Adiciona nova cláusula de segurança que será incluída nos system prompts dos agentes. Permite definir nome, conteúdo, escopo de aplicação e ordem.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F114-01", descricao: "Conteúdo da cláusula é texto markdown", tipo: "Formato" },
      { codigo: "RN-F114-02", descricao: "Nova cláusula inicia como inativa por segurança", tipo: "Default" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar cláusulas de segurança" },
    ],
    entidades: [
      { tabela: "ai_security_clauses", campos: "name, content, applies_to, is_active, sort_order", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-115",
    nome: "Editar Cláusula de Segurança",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Edita uma cláusula de segurança existente. Alterações são aplicadas imediatamente em novas interações com agentes.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F115-01", descricao: "Alterações são aplicadas em tempo real", tipo: "Comportamento" },
      { codigo: "RN-F115-02", descricao: "Histórico mantido em audit_logs", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Editar cláusulas de segurança" },
    ],
    entidades: [
      { tabela: "ai_security_clauses", campos: "name, content, applies_to, is_active, sort_order", operacoes: "UPDATE" },
      { tabela: "audit_logs", campos: "action, entity_type, entity_id, old_data, new_data", operacoes: "INSERT" },
    ],
  },
  // === Novas features implementadas ===
  {
    codigo: "F-ADMIN-116",
    nome: "Listar Tools do Agente",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Aba 'Tools' no formulário do template exibe tabela com todas as tools (functions) registradas para o agente. Cada tool define uma função OpenAI que o agente pode invocar durante o atendimento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F116-01", descricao: "Tools são vinculadas a um agente específico (agent_id)", tipo: "Comportamento" },
      { codigo: "RN-F116-02", descricao: "Apenas tools ativas (is_active) são injetadas no prompt do ai-chat", tipo: "Comportamento" },
      { codigo: "RN-F116-03", descricao: "Tools com requires_erp=true só funcionam se ISP tiver ERP configurado", tipo: "Validação" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar, criar, editar, excluir tools" },
    ],
    entidades: [
      { tabela: "ai_agent_tools", campos: "id, agent_id, name, description, handler_type, is_active, requires_erp, sort_order", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-117",
    nome: "Criar/Editar Tool",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Formulário para criar ou editar uma tool do agente. Define nome, descrição, JSON Schema dos parâmetros, handler_type e handler_config.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F117-01", descricao: "parameters_schema deve ser um JSON Schema válido compatível com OpenAI function calling", tipo: "Validação" },
      { codigo: "RN-F117-02", descricao: "handler_type mapeia para um handler no registry (_shared/tool-handlers.ts)", tipo: "Comportamento" },
      { codigo: "RN-F117-03", descricao: "Handlers implementados: erp_search, erp_invoice_search", tipo: "Referência" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar e editar tools" },
    ],
    entidades: [
      { tabela: "ai_agent_tools", campos: "name, description, parameters_schema, handler_type, handler_config, is_active, requires_erp, sort_order", operacoes: "INSERT, UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-118",
    nome: "Excluir Tool",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Remove uma tool do agente com confirmação obrigatória. Flow steps vinculados perdem a referência.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F118-01", descricao: "Confirmação obrigatória via dialog", tipo: "UX" },
      { codigo: "RN-F118-02", descricao: "Flow steps com tool_id referenciando a tool excluída ficam com tool_id = null", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Excluir tools" },
    ],
    entidades: [
      { tabela: "ai_agent_tools", campos: "id", operacoes: "DELETE" },
    ],
  },
  {
    codigo: "F-ADMIN-119",
    nome: "Listar Fluxos Conversacionais",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Aba 'Fluxos' no formulário do template exibe tabela com fluxos conversacionais (ex: Cobrança, Suporte, Vendas). Cada fluxo define um cenário estruturado com keywords de ativação e etapas sequenciais.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F119-01", descricao: "Fluxos com is_fixed=true não podem ser excluídos", tipo: "Proteção" },
      { codigo: "RN-F119-02", descricao: "trigger_keywords define palavras-chave para ativação automática", tipo: "Comportamento" },
      { codigo: "RN-F119-03", descricao: "trigger_prompt é injetado no system prompt quando o fluxo é ativado", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar, criar, editar, excluir fluxos" },
    ],
    entidades: [
      { tabela: "ai_agent_flows", campos: "id, agent_id, name, slug, description, trigger_keywords, is_active, is_fixed, sort_order", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-120",
    nome: "Criar/Editar Fluxo",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Formulário para criar ou editar um fluxo conversacional com nome, slug, descrição, keywords de ativação, prompt de trigger e status.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F120-01", descricao: "Slug é gerado automaticamente a partir do nome", tipo: "Geração" },
      { codigo: "RN-F120-02", descricao: "trigger_keywords é um array de strings", tipo: "Formato" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar e editar fluxos" },
    ],
    entidades: [
      { tabela: "ai_agent_flows", campos: "name, slug, description, trigger_keywords, trigger_prompt, is_active, is_fixed, sort_order", operacoes: "INSERT, UPDATE" },
    ],
  },
  {
    codigo: "F-ADMIN-121",
    nome: "Gerenciar Etapas do Fluxo",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Editor de etapas sequenciais dentro de um fluxo. Cada etapa define instrução, input esperado, tool associada, condição de avanço e fallback.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F121-01", descricao: "Etapas ordenadas por step_order (reordenável)", tipo: "Comportamento" },
      { codigo: "RN-F121-02", descricao: "tool_auto_execute=true executa a tool sem pedir confirmação", tipo: "Comportamento" },
      { codigo: "RN-F121-03", descricao: "fallback_instruction define resposta caso input não atenda condition_to_advance", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Adicionar, editar, reordenar, remover etapas" },
    ],
    entidades: [
      { tabela: "ai_agent_flow_steps", campos: "flow_id, step_order, name, instruction, expected_input, tool_id, tool_auto_execute, condition_to_advance, fallback_instruction, is_active", operacoes: "SELECT, INSERT, UPDATE, DELETE" },
    ],
  },
  {
    codigo: "F-ADMIN-122",
    nome: "Visualizar Logs de Processamento RAG",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Página para monitorar falhas no pipeline de indexação de documentos. Exibe etapa do erro, código, stack traces e detalhes JSONB. Filtros por ISP, código de erro e período.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F122-01", descricao: "Logs somente leitura — não editáveis", tipo: "Comportamento" },
      { codigo: "RN-F122-02", descricao: "Detalhes exibidos em dialog modal com JSON formatado", tipo: "UX" },
      { codigo: "RN-F122-03", descricao: "Limite de 100 logs por consulta, ordenados por data desc", tipo: "Performance" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar logs de processamento" },
    ],
    entidades: [
      { tabela: "document_processing_logs", campos: "id, document_id, isp_id, isp_agent_id, error_code, error_message, error_details, processing_step, created_at", operacoes: "SELECT" },
      { tabela: "isps", campos: "name", operacoes: "SELECT (join)" },
      { tabela: "knowledge_documents", campos: "name, original_filename", operacoes: "SELECT (join)" },
    ],
  },
  {
    codigo: "F-ADMIN-123",
    nome: "Configurar Personalização do Template",
    modulo: "IA",
    plataforma: "Painel Admin",
    descricao: "Aba 'Personalização' no formulário do template. Define opções de tom de voz (voice_tones) e regras de escalação humana (escalation_options) disponíveis para ISPs.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F123-01", descricao: "voice_tones é um array de objetos {value, label} armazenado como JSONB", tipo: "Formato" },
      { codigo: "RN-F123-02", descricao: "escalation_options define triggers (ex: low_confidence, max_interactions) e ações", tipo: "Comportamento" },
      { codigo: "RN-F123-03", descricao: "ISPs selecionam um voice_tone e configuram escalação ao ativar o agente", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Configurar opções de personalização" },
    ],
    entidades: [
      { tabela: "ai_agents", campos: "voice_tones, escalation_options", operacoes: "UPDATE" },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const variants = {
    alta: "bg-red-500/10 text-red-600 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  const labels = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };
  return (
    <Badge variant="outline" className={variants[criticidade]}>
      {labels[criticidade]}
    </Badge>
  );
};

const IAFeatures = () => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          16 features documentadas para o módulo de Inteligência Artificial
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {iaFeatures.map((feature) => (
          <AccordionItem
            key={feature.codigo}
            value={feature.codigo}
            className="rounded-lg border border-border bg-background px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center gap-3 text-left">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                  {feature.codigo}
                </code>
                <span className="font-medium text-foreground">{feature.nome}</span>
                {getCriticidadeBadge(feature.criticidade)}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-2">
                {/* Descrição */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{feature.descricao}</p>
                </div>

                {/* Regras de Negócio */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Regras de Negócio</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[120px]">Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="w-[120px]">Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.regrasNegocio.map((rn) => (
                          <TableRow key={rn.codigo}>
                            <TableCell className="font-mono text-xs">{rn.codigo}</TableCell>
                            <TableCell className="text-sm">{rn.descricao}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {rn.tipo}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Permissões</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[250px]">Role</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.permissoes.map((perm, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{perm.role}</TableCell>
                            <TableCell className="text-sm">{perm.acoes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Entidades */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-foreground">Dados/Entidades</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[180px]">Tabela</TableHead>
                          <TableHead>Campos</TableHead>
                          <TableHead className="w-[120px]">Operações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feature.entidades.map((ent, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{ent.tabela}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{ent.campos}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {ent.operacoes}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default IAFeatures;
