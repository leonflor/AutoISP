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

const atendimentosClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-009",
    nome: "Listar Atendimentos",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Exibe lista paginada de todos os atendimentos do ISP, com informações resumidas de cada conversa.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-028", descricao: "Lista deve atualizar em tempo real quando novos atendimentos chegarem" },
      { codigo: "RN-CLI-029", descricao: "Ordenação padrão por data de criação decrescente" },
      { codigo: "RN-CLI-030", descricao: "Exibir indicador visual de atendimentos não lidos" },
      { codigo: "RN-CLI-031", descricao: "Mostrar tempo de espera para atendimentos em fila" },
      { codigo: "RN-CLI-032", descricao: "Paginação com 20 itens por página" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Atendimento", campos: ["id", "assinante_id", "status", "canal", "operador_id", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-010",
    nome: "Filtrar Atendimentos por Status/Canal/Data",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Permite filtrar a lista de atendimentos por múltiplos critérios simultaneamente.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-033", descricao: "Filtros podem ser combinados (AND)" },
      { codigo: "RN-CLI-034", descricao: "Status disponíveis: aberto, em_andamento, aguardando, encerrado" },
      { codigo: "RN-CLI-035", descricao: "Canais disponíveis: whatsapp, telegram, webchat" },
      { codigo: "RN-CLI-036", descricao: "Filtros devem persistir durante a sessão" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-011",
    nome: "Visualizar Histórico de Conversa",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Exibe o histórico completo de mensagens trocadas em um atendimento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-037", descricao: "Mensagens devem ser exibidas em ordem cronológica" },
      { codigo: "RN-CLI-038", descricao: "Diferenciar visualmente mensagens do cliente, IA e operador" },
      { codigo: "RN-CLI-039", descricao: "Exibir horário de cada mensagem" },
      { codigo: "RN-CLI-040", descricao: "Suportar visualização de mídias (imagens, áudios, documentos)" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Mensagem", campos: ["id", "atendimento_id", "remetente_tipo", "conteudo", "tipo_midia", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-012",
    nome: "Assumir Atendimento (Transferência Humana)",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Permite que um operador humano assuma um atendimento que estava sendo conduzido pela IA.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-041", descricao: "Operador deve ter permissão de atendimento" },
      { codigo: "RN-CLI-042", descricao: "IA deve ser notificada para pausar interações" },
      { codigo: "RN-CLI-043", descricao: "Registrar log de transferência com motivo" },
      { codigo: "RN-CLI-044", descricao: "Cliente deve ser notificado da transferência" },
      { codigo: "RN-CLI-045", descricao: "Atendimento muda status para 'em_andamento'" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: true, excluir: false },
    ],
    entidades: [
      { nome: "Atendimento", campos: ["id", "operador_id", "status", "transferred_at"] },
      { nome: "Transferência Log", campos: ["id", "atendimento_id", "motivo", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-013",
    nome: "Encerrar Atendimento",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Finaliza um atendimento, registrando resolução e métricas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-046", descricao: "Exigir classificação/tag ao encerrar" },
      { codigo: "RN-CLI-047", descricao: "Calcular e registrar tempo total de atendimento" },
      { codigo: "RN-CLI-048", descricao: "Disparar pesquisa de satisfação se configurado" },
      { codigo: "RN-CLI-049", descricao: "Atendimento encerrado não pode receber novas mensagens" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: true, excluir: false },
    ],
    entidades: [
      { nome: "Atendimento", campos: ["id", "status", "resolved_at", "duration", "resolution_tag"] },
    ],
  },
  {
    codigo: "F-CLI-014",
    nome: "Classificar Atendimento com Tags",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Permite adicionar tags de classificação ao atendimento para categorização e análise.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-050", descricao: "Tags devem ser predefinidas pelo administrador" },
      { codigo: "RN-CLI-051", descricao: "Permitir múltiplas tags por atendimento" },
      { codigo: "RN-CLI-052", descricao: "Tags são usadas para relatórios e métricas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: true, excluir: false },
    ],
    entidades: [
      { nome: "Tag", campos: ["id", "nome", "cor"] },
      { nome: "Atendimento Tag", campos: ["atendimento_id", "tag_id"] },
    ],
  },
  {
    codigo: "F-CLI-015",
    nome: "Visualizar OS Vinculadas ao Atendimento",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Exibe ordens de serviço do ERP relacionadas ao atendimento ou assinante.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-053", descricao: "OS devem ser buscadas em tempo real do ERP" },
      { codigo: "RN-CLI-054", descricao: "Exibir status, tipo e data de abertura da OS" },
      { codigo: "RN-CLI-055", descricao: "Permitir abrir detalhes da OS em nova aba do ERP" },
      { codigo: "RN-CLI-056", descricao: "Indicar se a OS foi criada a partir do atendimento" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Ordem Serviço", campos: ["id_erp", "tipo", "status", "created_at", "assinante_id"] },
    ],
  },
  {
    codigo: "F-CLI-016",
    nome: "Enviar Mensagem Manual",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Permite ao operador enviar mensagens de texto diretamente ao cliente no atendimento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-057", descricao: "Mensagem é enviada pelo canal original do atendimento" },
      { codigo: "RN-CLI-058", descricao: "Operador deve ter assumido o atendimento" },
      { codigo: "RN-CLI-059", descricao: "Suportar emojis e formatação básica" },
      { codigo: "RN-CLI-060", descricao: "Exibir confirmação de entrega quando disponível" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Mensagem", campos: ["id", "atendimento_id", "remetente_tipo", "conteudo", "status_entrega"] },
    ],
  },
  {
    codigo: "F-CLI-017",
    nome: "Enviar Anexos no Atendimento",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Permite enviar arquivos como imagens, documentos e áudios durante o atendimento.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-061", descricao: "Limite de tamanho: 10MB por arquivo" },
      { codigo: "RN-CLI-062", descricao: "Formatos permitidos: jpg, png, pdf, doc, mp3, mp4" },
      { codigo: "RN-CLI-063", descricao: "Arquivos são armazenados no storage com link temporário" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Anexo", campos: ["id", "mensagem_id", "tipo", "url", "tamanho"] },
    ],
  },
  {
    codigo: "F-CLI-018",
    nome: "Visualizar Dados do Assinante no Atendimento",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Painel lateral que exibe informações do assinante durante o atendimento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-064", descricao: "Dados são carregados do cache de sincronização do ERP" },
      { codigo: "RN-CLI-065", descricao: "Exibir: nome, CPF, plano, status financeiro, endereço" },
      { codigo: "RN-CLI-066", descricao: "Mostrar histórico resumido de atendimentos anteriores" },
      { codigo: "RN-CLI-067", descricao: "Permitir atualização manual dos dados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Assinante", campos: ["id", "nome", "cpf", "plano", "status", "endereco"] },
    ],
  },
  {
    codigo: "F-CLI-019",
    nome: "Registrar Nota Interna no Atendimento",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Permite adicionar notas internas visíveis apenas para operadores, não enviadas ao cliente.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-068", descricao: "Notas são destacadas visualmente como 'internas'" },
      { codigo: "RN-CLI-069", descricao: "Registrar autor e data da nota" },
      { codigo: "RN-CLI-070", descricao: "Notas não aparecem no canal do cliente" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Nota Interna", campos: ["id", "atendimento_id", "autor_id", "conteudo", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-020",
    nome: "Solicitar Avaliação CSAT",
    modulo: "Atendimentos",
    plataforma: "Painel Cliente",
    descricao: "Dispara pesquisa de satisfação para o cliente ao final do atendimento.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-071", descricao: "Pode ser configurado para disparo automático ou manual" },
      { codigo: "RN-CLI-072", descricao: "Escala de 1 a 5 estrelas com comentário opcional" },
      { codigo: "RN-CLI-073", descricao: "Resultado é vinculado ao atendimento e operador" },
      { codigo: "RN-CLI-074", descricao: "Não disparar se cliente já avaliou nos últimos 7 dias" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: true, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Avaliação CSAT", campos: ["id", "atendimento_id", "nota", "comentario", "created_at"] },
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

const AtendimentosClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {atendimentosClienteFeatures.map((feature) => (
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

export default AtendimentosClienteFeatures;
