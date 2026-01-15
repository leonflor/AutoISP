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

const comunicacaoClienteFeatures: Feature[] = [
  {
    codigo: "F-CLI-031",
    nome: "Criar Campanha de Disparo em Massa",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Permite criar campanhas para envio de mensagens em massa para um grupo de assinantes.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-111", descricao: "Campanha requer nome, segmento, template e data de envio" },
      { codigo: "RN-CLI-112", descricao: "Segmento pode ser baseado em filtros ou lista importada" },
      { codigo: "RN-CLI-113", descricao: "Template deve estar aprovado pelo WhatsApp Business API" },
      { codigo: "RN-CLI-114", descricao: "Limite de envios conforme plano contratado" },
      { codigo: "RN-CLI-115", descricao: "Respeitar horários de silêncio configurados" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Campanha", campos: ["id", "nome", "segmento_id", "template_id", "scheduled_at", "status"] },
    ],
  },
  {
    codigo: "F-CLI-032",
    nome: "Selecionar Segmento de Destinatários",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Permite definir o público-alvo da campanha através de filtros ou listas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-116", descricao: "Filtros disponíveis: status, plano, cidade, inadimplência" },
      { codigo: "RN-CLI-117", descricao: "Exibir contagem estimada de destinatários" },
      { codigo: "RN-CLI-118", descricao: "Permitir importação de lista CSV com telefones" },
      { codigo: "RN-CLI-119", descricao: "Excluir automaticamente números na blacklist" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Segmento", campos: ["id", "nome", "filtros", "contagem", "created_at"] },
    ],
  },
  {
    codigo: "F-CLI-033",
    nome: "Configurar Template de Mensagem",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Seleciona e configura o template de mensagem a ser usado na campanha.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-120", descricao: "Apenas templates aprovados podem ser selecionados" },
      { codigo: "RN-CLI-121", descricao: "Permitir preview da mensagem com dados de exemplo" },
      { codigo: "RN-CLI-122", descricao: "Variáveis devem ser mapeadas para campos do assinante" },
      { codigo: "RN-CLI-123", descricao: "Validar que todas as variáveis obrigatórias estão mapeadas" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Template", campos: ["id", "nome", "conteudo", "variaveis", "status_aprovacao"] },
    ],
  },
  {
    codigo: "F-CLI-034",
    nome: "Agendar Disparo de Campanha",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Define data e hora para início do disparo da campanha.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-124", descricao: "Disparo pode ser imediato ou agendado" },
      { codigo: "RN-CLI-125", descricao: "Mínimo de 15 minutos para agendamento futuro" },
      { codigo: "RN-CLI-126", descricao: "Considerar timezone do ISP cliente" },
      { codigo: "RN-CLI-127", descricao: "Permitir cancelamento até 5 minutos antes do início" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-035",
    nome: "Visualizar Status de Entrega da Campanha",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Exibe métricas de entrega da campanha em tempo real.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-128", descricao: "Métricas: enviados, entregues, lidos, erros" },
      { codigo: "RN-CLI-129", descricao: "Atualização em tempo real durante o disparo" },
      { codigo: "RN-CLI-130", descricao: "Permitir drill-down nos erros de entrega" },
      { codigo: "RN-CLI-131", descricao: "Calcular taxa de entrega e leitura" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Disparo", campos: ["id", "campanha_id", "destinatario", "status", "delivered_at", "read_at"] },
    ],
  },
  {
    codigo: "F-CLI-036",
    nome: "Configurar Gatilhos Automáticos",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Cria regras para disparo automático de mensagens baseado em eventos.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-132", descricao: "Eventos disponíveis: vencimento, inadimplência, aniversário, boas-vindas" },
      { codigo: "RN-CLI-133", descricao: "Definir antecedência ou atraso em relação ao evento" },
      { codigo: "RN-CLI-134", descricao: "Limite de envios por assinante por período" },
      { codigo: "RN-CLI-135", descricao: "Gatilho pode ter condições adicionais (ex: se não pagou)" },
      { codigo: "RN-CLI-136", descricao: "Horário permitido de disparo configurável" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Gatilho", campos: ["id", "nome", "evento", "template_id", "condicoes", "status"] },
    ],
  },
  {
    codigo: "F-CLI-037",
    nome: "Listar Gatilhos Ativos",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Exibe todos os gatilhos automáticos configurados no sistema.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-137", descricao: "Exibir status (ativo/pausado) de cada gatilho" },
      { codigo: "RN-CLI-138", descricao: "Mostrar contagem de disparos nas últimas 24h" },
      { codigo: "RN-CLI-139", descricao: "Permitir ativação/desativação rápida" },
      { codigo: "RN-CLI-140", descricao: "Ordenar por nome ou data de criação" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-038",
    nome: "Pausar/Ativar Gatilho",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Permite pausar temporariamente ou reativar um gatilho automático.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-141", descricao: "Pausar interrompe imediatamente novos disparos" },
      { codigo: "RN-CLI-142", descricao: "Disparos já na fila são concluídos" },
      { codigo: "RN-CLI-143", descricao: "Registrar log de quem pausou/ativou e quando" },
      { codigo: "RN-CLI-144", descricao: "Notificar administradores sobre alteração de status" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-039",
    nome: "Visualizar Histórico de Disparos do Gatilho",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Exibe log de todos os disparos realizados por um gatilho específico.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-145", descricao: "Exibir data, destinatário, status de cada disparo" },
      { codigo: "RN-CLI-146", descricao: "Filtrar por período e status de entrega" },
      { codigo: "RN-CLI-147", descricao: "Paginação com 50 itens por página" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-040",
    nome: "Gerenciar Biblioteca de Templates",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Área para visualizar e gerenciar todos os templates de mensagem disponíveis.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-148", descricao: "Listar templates com status de aprovação" },
      { codigo: "RN-CLI-149", descricao: "Filtrar por categoria e status" },
      { codigo: "RN-CLI-150", descricao: "Exibir preview do template" },
      { codigo: "RN-CLI-151", descricao: "Indicar templates em uso por campanhas/gatilhos" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Template", campos: ["id", "nome", "categoria", "conteudo", "status", "usage_count"] },
    ],
  },
  {
    codigo: "F-CLI-041",
    nome: "Criar Template de Mensagem",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Permite criar novos templates de mensagem para aprovação no WhatsApp Business API.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-152", descricao: "Template deve seguir diretrizes do WhatsApp" },
      { codigo: "RN-CLI-153", descricao: "Definir categoria: marketing, utility, authentication" },
      { codigo: "RN-CLI-154", descricao: "Suportar variáveis dinâmicas {{1}}, {{2}}, etc" },
      { codigo: "RN-CLI-155", descricao: "Submeter para aprovação do WhatsApp automaticamente" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-042",
    nome: "Visualizar Métricas de Comunicação",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Dashboard com métricas consolidadas de todas as comunicações ativas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-CLI-156", descricao: "Métricas: total enviado, taxa de entrega, taxa de leitura" },
      { codigo: "RN-CLI-157", descricao: "Comparar campanhas vs gatilhos" },
      { codigo: "RN-CLI-158", descricao: "Gráfico de evolução temporal" },
      { codigo: "RN-CLI-159", descricao: "Custo estimado de créditos consumidos" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: false, editar: false, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [],
  },
  {
    codigo: "F-CLI-043",
    nome: "Configurar Horários de Silêncio",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Define períodos em que disparos automáticos não devem ocorrer.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-160", descricao: "Horário padrão: 20h às 8h, sábados após 14h, domingos" },
      { codigo: "RN-CLI-161", descricao: "Personalizável pelo administrador" },
      { codigo: "RN-CLI-162", descricao: "Disparos agendados são adiados para próximo horário permitido" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: false },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Horário Silêncio", campos: ["id", "dia_semana", "hora_inicio", "hora_fim"] },
    ],
  },
  {
    codigo: "F-CLI-044",
    nome: "Gerenciar Blacklist de Contatos",
    modulo: "Comunicação Ativa",
    plataforma: "Painel Cliente",
    descricao: "Lista de números que não devem receber comunicações ativas.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-CLI-163", descricao: "Números adicionados manualmente ou via opt-out" },
      { codigo: "RN-CLI-164", descricao: "Verificação automática antes de qualquer disparo" },
      { codigo: "RN-CLI-165", descricao: "Permitir remoção da blacklist com justificativa" },
      { codigo: "RN-CLI-166", descricao: "Log de inclusão/exclusão com motivo" },
    ],
    permissoes: [
      { perfil: "Administrador ISP", visualizar: true, criar: true, editar: true, excluir: true },
      { perfil: "Operador", visualizar: true, criar: false, editar: false, excluir: false },
    ],
    entidades: [
      { nome: "Blacklist", campos: ["id", "telefone", "motivo", "added_by", "created_at"] },
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

const ComunicacaoClienteFeatures = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        {comunicacaoClienteFeatures.map((feature) => (
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

export default ComunicacaoClienteFeatures;
