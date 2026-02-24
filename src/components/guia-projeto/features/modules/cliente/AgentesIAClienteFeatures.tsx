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
}

interface Permissao {
  perfil: string;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

interface Entidade {
  nome: string;
  campos: string[];
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

const agentesIAClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-045",
    nome: "Catálogo de Agentes Disponíveis",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Exibe catálogo de templates de agentes de IA disponíveis para ativação pelo ISP, com cards mostrando nome, descrição, features e status (ativo/inativo). Agentes já ativados são exibidos com configurações de personalização.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-167", descricao: "Catálogo lista apenas templates com scope='tenant' e is_active=true" },
      { codigo: "RN-CLI-168", descricao: "Disponibilidade controlada por ai_limits.is_enabled (se não houver registro, todos disponíveis)" },
      { codigo: "RN-CLI-169", descricao: "Agentes já ativados (isp_agents) exibem status is_enabled e personalização" },
      { codigo: "RN-CLI-170", descricao: "Separação visual: 'Agentes Ativos' e 'Catálogo Disponível'" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "ai_agents", campos: ["id", "name", "slug", "type", "scope", "description", "avatar_url", "is_active"] },
      { nome: "isp_agents", campos: ["id", "agent_id", "isp_id", "display_name", "is_enabled"] },
      { nome: "ai_limits", campos: ["agent_id", "plan_id", "is_enabled"] },
    ],
  },
  {
    codigo: "F-CLI-046",
    nome: "Ativar Agente do Catálogo",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "ISP ativa um agente a partir do catálogo de templates. Cria registro em isp_agents com personalização básica (display_name, avatar, voice_tone). Não há wizard — ativação direta com dialog de configuração.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-171", descricao: "Ativação cria registro em isp_agents vinculando agent_id ao isp_id" },
      { codigo: "RN-CLI-172", descricao: "Limite de agentes ativos conforme plano (ai_limits.max_agents_active)" },
      { codigo: "RN-CLI-173", descricao: "Agente ativado inicia com is_enabled=true" },
      { codigo: "RN-CLI-174", descricao: "ISP não edita system_prompt, tools nem fluxos — vêm do template" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "isp_agents", campos: ["id", "agent_id", "isp_id", "display_name", "avatar_url", "voice_tone", "escalation_config", "is_enabled"] },
    ],
  },
  {
    codigo: "F-CLI-048",
    nome: "Configurar Persona do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define personalização do agente ativado: nome de apresentação (display_name), avatar, tom de voz (selecionado das opções do template) e configuração de escalação humana.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-181", descricao: "display_name é como o agente se apresenta ao cliente final (ex: 'Luna')" },
      { codigo: "RN-CLI-182", descricao: "voice_tone selecionado dentre as opções definidas no template (voice_tones JSONB)" },
      { codigo: "RN-CLI-183", descricao: "Avatar opcional com upload e crop de imagem" },
      { codigo: "RN-CLI-184", descricao: "escalation_config define regras de transferência para humano" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "isp_agents", campos: ["display_name", "avatar_url", "voice_tone", "escalation_config", "chunk_size"] },
    ],
  },
  {
    codigo: "F-CLI-052",
    nome: "Testar Agente via Chat",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Dialog de teste com chat simples para simular conversas com o agente. Utiliza a Edge Function ai-chat com o contexto real do ISP (RAG, Q&A, tools via catálogo hardcoded e fluxos vinculados).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-200", descricao: "Chat de teste usa a mesma Edge Function ai-chat do atendimento real" },
      { codigo: "RN-CLI-201", descricao: "Contexto inclui RAG docs, Q&A, cláusulas LGPD e tools do agente" },
      { codigo: "RN-CLI-202", descricao: "Respostas renderizadas com markdown (react-markdown)" },
      { codigo: "RN-CLI-203", descricao: "Streaming de tokens via SSE para resposta gradual" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "ai_usage", campos: ["id", "agent_id", "isp_id", "user_id", "tokens_total", "cost_usd"] },
    ],
  },
  {
    codigo: "F-CLI-053",
    nome: "Ativar/Desativar Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Controla se o agente está ativo e atendendo. Toggle simples no card do agente ativo.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-204", descricao: "Toggle altera is_enabled no isp_agents" },
      { codigo: "RN-CLI-205", descricao: "Desativar remove o agente do atendimento imediatamente" },
      { codigo: "RN-CLI-206", descricao: "Atendimentos em andamento continuam até conclusão" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "isp_agents", campos: ["is_enabled"] },
    ],
  },
  {
    codigo: "F-CLI-057",
    nome: "Configurar Escalação para Humano",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define regras de transferência do atendimento para operador humano, selecionadas dentre as opções definidas no template (escalation_options).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-219", descricao: "Opções de escalação vêm do template (escalation_options JSONB)" },
      { codigo: "RN-CLI-220", descricao: "ISP configura quais triggers ativar e personaliza mensagem" },
      { codigo: "RN-CLI-221", descricao: "Configuração salva no campo escalation_config do isp_agents" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "isp_agents", campos: ["escalation_config"] },
    ],
  },
  {
    codigo: "F-CLI-058",
    nome: "Gerenciar Base de Conhecimento do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Upload e gestão de documentos que alimentam o conhecimento do agente via RAG (Retrieval Augmented Generation). Inclui também Q&A manual (agent_knowledge_base).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-224", descricao: "Suportar PDF, DOCX, TXT, ODT (até 25MB)" },
      { codigo: "RN-CLI-225", descricao: "Processamento assíncrono via Edge Function process-document" },
      { codigo: "RN-CLI-226", descricao: "Limite de documentos conforme plano (ai_limits.max_documents_per_agent)" },
      { codigo: "RN-CLI-227", descricao: "Q&A manual: pares pergunta/resposta em agent_knowledge_base" },
      { codigo: "RN-CLI-228", descricao: "Status de processamento: pending → processing → indexed ou error" },
      { codigo: "RN-CLI-228a", descricao: "Chunk size configurável por agente (250-1000 tokens)" },
      { codigo: "RN-CLI-228b", descricao: "Chunks com overlap de 10% para manter contexto" },
      { codigo: "RN-CLI-228c", descricao: "Embeddings: text-embedding-3-small, 768 dimensões" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "knowledge_documents", campos: ["id", "isp_agent_id", "isp_id", "name", "original_filename", "storage_path", "size_bytes", "mime_type", "status", "error_message", "chunk_count", "indexed_at"] },
      { nome: "document_chunks", campos: ["id", "document_id", "isp_agent_id", "isp_id", "content", "embedding (vector 768)", "metadata", "chunk_index"] },
      { nome: "agent_knowledge_base", campos: ["id", "isp_agent_id", "question", "answer", "category", "is_active", "sort_order"] },
    ],
  },
  {
    codigo: "F-CLI-061",
    nome: "Visualizar Uso de Tokens (AI Usage)",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Exibe estatísticas de consumo de IA do mês corrente: total de tokens, requisições, custo estimado (USD) e uso por agente. Dados da tabela ai_usage filtrados pelo ISP.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-236", descricao: "Estatísticas calculadas para o mês corrente" },
      { codigo: "RN-CLI-237", descricao: "Limites de tokens/requisições vêm do plano (plans.limits)" },
      { codigo: "RN-CLI-238", descricao: "Agrupamento por agente mostra consumo individual" },
      { codigo: "RN-CLI-239", descricao: "Custo estimado em USD baseado em cost_usd registrado por requisição" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "ai_usage", campos: ["id", "agent_id", "isp_id", "user_id", "tokens_input", "tokens_output", "tokens_total", "cost_usd", "request_type", "duration_ms"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const styles = {
    alta: "bg-red-500/10 text-red-500 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  const labels = { alta: "Alta", media: "Média", baixa: "Baixa" };
  return <Badge className={styles[criticidade]}>{labels[criticidade]}</Badge>;
};

const AgentesIAClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {agentesIAClienteFeatures.map((feature) => (
          <AccordionItem
            key={feature.codigo}
            value={feature.codigo}
            className="rounded-lg border border-border bg-card/50 px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                  {feature.codigo}
                </code>
                <span className="font-medium">{feature.nome}</span>
                {getCriticidadeBadge(feature.criticidade)}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{feature.descricao}</p>

              {feature.regrasNegocio.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Regras de Negócio</h4>
                  <ul className="space-y-1">
                    {feature.regrasNegocio.map((rn) => (
                      <li key={rn.codigo} className="flex gap-2 text-sm">
                        <code className="shrink-0 text-xs text-primary">{rn.codigo}</code>
                        <span className="text-muted-foreground">{rn.descricao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.permissoes.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Permissões</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="text-center">Visualizar</TableHead>
                        <TableHead className="text-center">Criar</TableHead>
                        <TableHead className="text-center">Editar</TableHead>
                        <TableHead className="text-center">Excluir</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feature.permissoes.map((perm) => (
                        <TableRow key={perm.perfil}>
                          <TableCell>{perm.perfil}</TableCell>
                          <TableCell className="text-center">{perm.visualizar ? "✓" : "—"}</TableCell>
                          <TableCell className="text-center">{perm.criar ? "✓" : "—"}</TableCell>
                          <TableCell className="text-center">{perm.editar ? "✓" : "—"}</TableCell>
                          <TableCell className="text-center">{perm.excluir ? "✓" : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {feature.entidades.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Entidades de Dados</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.entidades.map((ent) => (
                      <Badge key={ent.nome} variant="outline" className="font-mono text-xs">
                        {ent.nome}: {ent.campos.join(", ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AgentesIAClienteFeatures;
