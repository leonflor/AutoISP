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
    nome: "Listar Agentes de IA Configurados",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Exibe todos os agentes de IA configurados pelo ISP cliente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-167", descricao: "Exibir status de cada agente (ativo, pausado, em teste)" },
      { codigo: "RN-CLI-168", descricao: "Mostrar canal vinculado ao agente" },
      { codigo: "RN-CLI-169", descricao: "Indicar volume de atendimentos nas últimas 24h" },
      { codigo: "RN-CLI-170", descricao: "Ordenar por nome ou volume de uso" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Agente IA", campos: ["id", "nome", "canal", "status", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-046",
    nome: "Criar Novo Agente de IA",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Inicia o processo de criação de um novo agente de IA com wizard guiado.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-171", descricao: "Wizard com etapas: nome, persona, prompt, regras, ferramentas" },
      { codigo: "RN-CLI-172", descricao: "Limite de agentes conforme plano contratado" },
      { codigo: "RN-CLI-173", descricao: "Agente começa em status 'rascunho'" },
      { codigo: "RN-CLI-174", descricao: "Validar configurações mínimas antes de ativar" },
      { codigo: "RN-CLI-175", descricao: "Permitir salvar e continuar depois" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-047",
    nome: "Configurar Prompt do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define o prompt principal que orienta o comportamento do agente de IA.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-176", descricao: "Editor de texto com highlighting de variáveis" },
      { codigo: "RN-CLI-177", descricao: "Templates pré-configurados disponíveis como base" },
      { codigo: "RN-CLI-178", descricao: "Limite de 4000 tokens para o prompt" },
      { codigo: "RN-CLI-179", descricao: "Versionar alterações do prompt" },
      { codigo: "RN-CLI-180", descricao: "Sugerir melhorias baseadas em best practices" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Prompt", campos: ["id", "agente_id", "conteudo", "versao", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-048",
    nome: "Configurar Persona do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define nome, tom de voz e características de personalidade do agente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-181", descricao: "Nome do agente exibido nas conversas" },
      { codigo: "RN-CLI-182", descricao: "Tom de voz: formal, amigável, técnico, casual" },
      { codigo: "RN-CLI-183", descricao: "Avatar opcional para o agente" },
      { codigo: "RN-CLI-184", descricao: "Definir idioma principal e secundários" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Persona", campos: ["id", "agente_id", "nome_exibido", "tom_voz", "avatar_url"] },
    ],
  },
  {
    codigo: "F-CLI-049",
    nome: "Configurar Regras de Negócio do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define regras específicas que o agente deve seguir durante atendimentos.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-185", descricao: "Regras definidas em linguagem natural" },
      { codigo: "RN-CLI-186", descricao: "Categorizar regras: obrigatórias, condicionais, proibições" },
      { codigo: "RN-CLI-187", descricao: "Limite de 50 regras por agente" },
      { codigo: "RN-CLI-188", descricao: "Priorizar regras em caso de conflito" },
      { codigo: "RN-CLI-189", descricao: "Testar aplicação de regras no sandbox" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Regra Agente", campos: ["id", "agente_id", "tipo", "descricao", "prioridade"] },
    ],
  },
  {
    codigo: "F-CLI-050",
    nome: "Configurar Ferramentas Disponíveis ao Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Seleciona quais ferramentas (consultas, ações) o agente pode utilizar.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-190", descricao: "Ferramentas: consultar_fatura, consultar_status, abrir_os, etc" },
      { codigo: "RN-CLI-191", descricao: "Cada ferramenta pode ter permissões granulares" },
      { codigo: "RN-CLI-192", descricao: "Configurar parâmetros específicos por ferramenta" },
      { codigo: "RN-CLI-193", descricao: "Log de uso de cada ferramenta pelo agente" },
      { codigo: "RN-CLI-194", descricao: "Ferramentas dependem de integrações configuradas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ferramenta Agente", campos: ["id", "agente_id", "ferramenta_id", "config", "ativo"] },
    ],
  },
  {
    codigo: "F-CLI-051",
    nome: "Configurar Fluxos de Conversa",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define fluxos estruturados para cenários específicos de atendimento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-195", descricao: "Editor visual de fluxograma drag-and-drop" },
      { codigo: "RN-CLI-196", descricao: "Nós disponíveis: mensagem, decisão, ação, espera" },
      { codigo: "RN-CLI-197", descricao: "Fluxos podem ser acionados por palavras-chave" },
      { codigo: "RN-CLI-198", descricao: "Permitir sub-fluxos reutilizáveis" },
      { codigo: "RN-CLI-199", descricao: "Validar consistência do fluxo antes de salvar" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Fluxo Conversa", campos: ["id", "agente_id", "nome", "gatilho", "nodes_json"] },
    ],
  },
  {
    codigo: "F-CLI-052",
    nome: "Testar Agente em Sandbox",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Ambiente de teste para simular conversas com o agente antes de ativar.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-200", descricao: "Sandbox isolado que não afeta dados reais" },
      { codigo: "RN-CLI-201", descricao: "Simular diferentes perfis de assinante" },
      { codigo: "RN-CLI-202", descricao: "Visualizar raciocínio do agente (chain of thought)" },
      { codigo: "RN-CLI-203", descricao: "Salvar conversas de teste para análise" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Teste Sandbox", campos: ["id", "agente_id", "conversa_json", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-053",
    nome: "Ativar/Desativar Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Controla se o agente está ativo e atendendo no canal configurado.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-204", descricao: "Validar configurações mínimas antes de ativar" },
      { codigo: "RN-CLI-205", descricao: "Desativar redireciona novos atendimentos para fila humana" },
      { codigo: "RN-CLI-206", descricao: "Atendimentos em andamento continuam até conclusão" },
      { codigo: "RN-CLI-207", descricao: "Log de quem ativou/desativou e quando" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-054",
    nome: "Duplicar Configuração de Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Cria cópia de um agente existente para usar como base de um novo.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-208", descricao: "Duplicar todas as configurações exceto canal" },
      { codigo: "RN-CLI-209", descricao: "Novo agente inicia em status rascunho" },
      { codigo: "RN-CLI-210", descricao: "Permitir selecionar quais componentes duplicar" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: false, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-055",
    nome: "Visualizar Métricas de Performance do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Dashboard com indicadores de desempenho do agente de IA.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-211", descricao: "Métricas: taxa resolução, tempo médio, escalações" },
      { codigo: "RN-CLI-212", descricao: "Comparar com período anterior" },
      { codigo: "RN-CLI-213", descricao: "Identificar tópicos com maior taxa de escalação" },
      { codigo: "RN-CLI-214", descricao: "Sugerir melhorias baseadas nos dados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-056",
    nome: "Configurar Horário de Funcionamento do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define em quais horários o agente deve atender.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-215", descricao: "Pode ser 24/7 ou horário comercial" },
      { codigo: "RN-CLI-216", descricao: "Fora do horário, exibir mensagem configurável" },
      { codigo: "RN-CLI-217", descricao: "Considerar feriados se configurados" },
      { codigo: "RN-CLI-218", descricao: "Timezone do ISP cliente" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Horário Agente", campos: ["id", "agente_id", "dia_semana", "hora_inicio", "hora_fim"] },
    ],
  },
  {
    codigo: "F-CLI-057",
    nome: "Configurar Escalação para Humano",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define regras e gatilhos para transferência do atendimento para operador humano.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-219", descricao: "Gatilhos: palavra-chave, sentimento negativo, loops, timeout" },
      { codigo: "RN-CLI-220", descricao: "Definir mensagem ao escalar" },
      { codigo: "RN-CLI-221", descricao: "Prioridade na fila ao escalar" },
      { codigo: "RN-CLI-222", descricao: "Limite de tentativas antes de escalar automaticamente" },
      { codigo: "RN-CLI-223", descricao: "Notificar operadores sobre escalação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Regra Escalação", campos: ["id", "agente_id", "gatilho", "config", "mensagem"] },
    ],
  },
  {
    codigo: "F-CLI-058",
    nome: "Gerenciar Base de Conhecimento do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Upload e gestão de documentos que alimentam o conhecimento do agente via RAG (Retrieval Augmented Generation).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-224", descricao: "Suportar PDF, DOCX, TXT, ODT (até 25MB)" },
      { codigo: "RN-CLI-225", descricao: "Processar e indexar automaticamente via Edge Function" },
      { codigo: "RN-CLI-226", descricao: "Limite de documentos conforme plano (max_documents_per_agent)" },
      { codigo: "RN-CLI-227", descricao: "Permitir adicionar FAQs manualmente (Q&A)" },
      { codigo: "RN-CLI-228", descricao: "Atualizar conhecimento sem reiniciar agente" },
      { codigo: "RN-CLI-228a", descricao: "Documentos são processados de forma assíncrona" },
      { codigo: "RN-CLI-228b", descricao: "Status de processamento: pending → processing → indexed ou error" },
      { codigo: "RN-CLI-228c", descricao: "Chunks com overlap de 10% para manter contexto" },
      { codigo: "RN-CLI-228d", descricao: "Limite de 25MB por arquivo" },
      { codigo: "RN-CLI-228e", descricao: "Chunk size configurável por agente (250-1000 tokens)" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "knowledge_documents", campos: ["id", "isp_agent_id", "isp_id", "name", "original_filename", "storage_path", "size_bytes", "mime_type", "status", "error_message", "chunk_count", "indexed_at"] },
      { nome: "document_chunks", campos: ["id", "document_id", "isp_agent_id", "isp_id", "content", "embedding (vector 768)", "metadata", "chunk_index"] },
    ],
  },
  {
    codigo: "F-CLI-059",
    nome: "Configurar Idiomas do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Define idiomas suportados e comportamento de detecção automática.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-229", descricao: "Idioma primário: português brasileiro" },
      { codigo: "RN-CLI-230", descricao: "Idiomas secundários opcionais" },
      { codigo: "RN-CLI-231", descricao: "Detectar idioma do cliente automaticamente" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-060",
    nome: "Visualizar Logs de Conversa do Agente",
    modulo: "Agentes de IA",
    plataforma: "Painel Cliente",
    descricao: "Acesso detalhado às conversas realizadas pelo agente para análise.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-232", descricao: "Filtrar por data, status, resultado" },
      { codigo: "RN-CLI-233", descricao: "Visualizar chain of thought do agente" },
      { codigo: "RN-CLI-234", descricao: "Identificar falhas e oportunidades de melhoria" },
      { codigo: "RN-CLI-235", descricao: "Exportar conversas para análise externa" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Log Conversa", campos: ["id", "agente_id", "atendimento_id", "reasoning", "resultado"] },
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
