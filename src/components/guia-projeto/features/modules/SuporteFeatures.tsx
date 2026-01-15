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
  tipo: "Validação" | "Cálculo" | "Comportamento" | "Segurança" | "Limite" | "Dados" | "UX" | "Configuração" | "Notificação" | "Integração";
}

interface Permissao {
  perfil: string;
  acao: string;
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
  criticidade: "Alta" | "Média" | "Baixa";
  regrasNegocio: RegraNegocio[];
  permissoes: Permissao[];
  entidades: Entidade[];
}

const suporteFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-054",
    nome: "Dashboard de Suporte",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Exibe visão geral do suporte com KPIs: volume de tickets por status, tempo médio de resposta, tempo médio de resolução e performance por atendente.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F054-01", descricao: "Exibir total de tickets abertos, em andamento, aguardando e resolvidos", tipo: "Dados" },
      { codigo: "RN-F054-02", descricao: "Calcular tempo médio de primeira resposta (em horas)", tipo: "Cálculo" },
      { codigo: "RN-F054-03", descricao: "Calcular tempo médio de resolução (em horas)", tipo: "Cálculo" },
      { codigo: "RN-F054-04", descricao: "Ranking de atendentes por volume e satisfação", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Visualizar dashboard completo" },
      { perfil: "Gestor Suporte", acao: "Visualizar dashboard completo" },
      { perfil: "Atendente", acao: "Visualizar apenas próprios indicadores" },
    ],
    entidades: [
      { nome: "Ticket", campos: ["id", "status", "created_at", "first_response_at", "resolved_at"] },
      { nome: "Atendente", campos: ["id", "nome", "tickets_atendidos", "satisfacao_media"] },
    ],
  },
  {
    codigo: "F-ADMIN-055",
    nome: "Listar Tickets",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Exibe listagem de todos os tickets com filtros por status, categoria, prioridade, atendente e período.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F055-01", descricao: "Filtros: status, categoria, prioridade, atendente, cliente", tipo: "UX" },
      { codigo: "RN-F055-02", descricao: "Ordenação padrão: mais recente primeiro", tipo: "Comportamento" },
      { codigo: "RN-F055-03", descricao: "Badge colorido por prioridade (baixa, média, alta)", tipo: "UX" },
      { codigo: "RN-F055-04", descricao: "Indicar tickets próximos de violar SLA", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Visualizar todos os tickets" },
      { perfil: "Gestor Suporte", acao: "Visualizar todos os tickets" },
      { perfil: "Atendente", acao: "Visualizar tickets da própria fila/categoria" },
    ],
    entidades: [
      { nome: "Ticket", campos: ["id", "titulo", "status", "categoria", "prioridade", "atendente_id", "cliente_isp_id", "created_at", "sla_deadline"] },
    ],
  },
  {
    codigo: "F-ADMIN-056",
    nome: "Visualizar Detalhe do Ticket",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Exibe ticket completo com histórico de mensagens, notas internas, arquivos anexos e timeline de ações.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F056-01", descricao: "Exibir conversa em formato de chat", tipo: "UX" },
      { codigo: "RN-F056-02", descricao: "Separar visualmente notas internas (não visíveis ao cliente)", tipo: "UX" },
      { codigo: "RN-F056-03", descricao: "Mostrar timeline de mudanças de status", tipo: "Dados" },
      { codigo: "RN-F056-04", descricao: "Exibir dados do cliente (plano, histórico, SLA aplicável)", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Visualizar qualquer ticket" },
      { perfil: "Gestor Suporte", acao: "Visualizar qualquer ticket" },
      { perfil: "Atendente", acao: "Visualizar tickets atribuídos ou da própria fila" },
    ],
    entidades: [
      { nome: "Ticket", campos: ["id", "titulo", "descricao", "status", "categoria", "prioridade"] },
      { nome: "TicketMensagem", campos: ["id", "ticket_id", "autor_id", "conteudo", "tipo", "created_at"] },
      { nome: "TicketAnexo", campos: ["id", "ticket_id", "mensagem_id", "arquivo_url", "nome_arquivo"] },
    ],
  },
  {
    codigo: "F-ADMIN-057",
    nome: "Responder Ticket",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Permite atendente responder ao cliente com texto, anexos e opção de usar respostas predefinidas.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F057-01", descricao: "Suporte a texto formatado (markdown)", tipo: "UX" },
      { codigo: "RN-F057-02", descricao: "Anexar arquivos (máx 10MB por arquivo)", tipo: "Limite" },
      { codigo: "RN-F057-03", descricao: "Inserir resposta predefinida com um clique", tipo: "UX" },
      { codigo: "RN-F057-04", descricao: "Alterar status do ticket ao responder (opcional)", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Responder qualquer ticket" },
      { perfil: "Gestor Suporte", acao: "Responder qualquer ticket" },
      { perfil: "Atendente", acao: "Responder tickets atribuídos" },
    ],
    entidades: [
      { nome: "TicketMensagem", campos: ["id", "ticket_id", "autor_id", "conteudo", "tipo", "created_at"] },
      { nome: "RespostaPredefinida", campos: ["id", "titulo", "conteudo", "categoria"] },
    ],
  },
  {
    codigo: "F-ADMIN-058",
    nome: "Gerenciar Filas por Categoria",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Permite visualizar e gerenciar tickets separados por categoria: Suporte Técnico, Financeiro, Comercial e Ouvidoria.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F058-01", descricao: "Tabs ou filtro rápido por categoria", tipo: "UX" },
      { codigo: "RN-F058-02", descricao: "Contadores de tickets por categoria", tipo: "Dados" },
      { codigo: "RN-F058-03", descricao: "Transferir ticket entre categorias", tipo: "Comportamento" },
      { codigo: "RN-F058-04", descricao: "Permissão por categoria (atendente vê apenas suas filas)", tipo: "Segurança" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Gerenciar todas as filas" },
      { perfil: "Gestor Suporte", acao: "Gerenciar todas as filas" },
      { perfil: "Atendente", acao: "Visualizar apenas filas permitidas" },
    ],
    entidades: [
      { nome: "CategoriaTicket", campos: ["id", "nome", "descricao", "ativo"] },
      { nome: "AtendenteCategoria", campos: ["atendente_id", "categoria_id"] },
    ],
  },
  {
    codigo: "F-ADMIN-059",
    nome: "Configurar SLA",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Define regras de SLA por plano contratado e por categoria de ticket, com tempos de resposta e resolução.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F059-01", descricao: "SLA diferenciado por plano (básico, profissional, enterprise)", tipo: "Configuração" },
      { codigo: "RN-F059-02", descricao: "SLA diferenciado por categoria (técnico mais urgente que comercial)", tipo: "Configuração" },
      { codigo: "RN-F059-03", descricao: "Tempo de primeira resposta e tempo de resolução configuráveis", tipo: "Configuração" },
      { codigo: "RN-F059-04", descricao: "Alerta visual quando ticket está próximo de violar SLA", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Configurar todas as regras de SLA" },
      { perfil: "Gestor Suporte", acao: "Visualizar regras de SLA" },
    ],
    entidades: [
      { nome: "ConfiguracaoSLA", campos: ["id", "plano_id", "categoria_id", "tempo_resposta_horas", "tempo_resolucao_horas"] },
    ],
  },
  {
    codigo: "F-ADMIN-060",
    nome: "Escalonamento de Tickets",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Gerencia escalonamento automático e manual de tickets, com alertas para gestores quando SLA é violado.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F060-01", descricao: "Escalonamento automático após X horas sem resposta", tipo: "Comportamento" },
      { codigo: "RN-F060-02", descricao: "Atendente pode escalar manualmente para nível 2", tipo: "UX" },
      { codigo: "RN-F060-03", descricao: "Cliente pode solicitar supervisão (via ticket)", tipo: "Comportamento" },
      { codigo: "RN-F060-04", descricao: "Notificar gestor quando SLA é violado", tipo: "Notificação" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Gerenciar escalonamentos" },
      { perfil: "Gestor Suporte", acao: "Receber escalonamentos e gerenciar" },
      { perfil: "Atendente", acao: "Escalar tickets manualmente" },
    ],
    entidades: [
      { nome: "TicketEscalonamento", campos: ["id", "ticket_id", "nivel_origem", "nivel_destino", "motivo", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-061",
    nome: "Ações em Ticket",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Permite realizar ações avançadas: adicionar notas internas, mesclar tickets duplicados, transferir categoria e vincular tickets relacionados.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F061-01", descricao: "Notas internas visíveis apenas para equipe", tipo: "Segurança" },
      { codigo: "RN-F061-02", descricao: "Mesclar tickets mantém histórico completo", tipo: "Comportamento" },
      { codigo: "RN-F061-03", descricao: "Transferir categoria notifica nova fila", tipo: "Notificação" },
      { codigo: "RN-F061-04", descricao: "Vincular tickets relacionados com link bidirecional", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Todas as ações" },
      { perfil: "Gestor Suporte", acao: "Todas as ações" },
      { perfil: "Atendente", acao: "Notas internas e transferir categoria" },
    ],
    entidades: [
      { nome: "TicketMensagem", campos: ["id", "ticket_id", "tipo", "conteudo"] },
      { nome: "TicketRelacionado", campos: ["ticket_id", "ticket_relacionado_id", "tipo_relacao"] },
    ],
  },
  {
    codigo: "F-ADMIN-062",
    nome: "Respostas Predefinidas",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "CRUD de templates de resposta organizados por categoria para agilizar atendimento.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F062-01", descricao: "Organizar respostas por categoria", tipo: "UX" },
      { codigo: "RN-F062-02", descricao: "Suporte a variáveis dinâmicas (nome do cliente, número do ticket)", tipo: "Comportamento" },
      { codigo: "RN-F062-03", descricao: "Busca rápida por palavra-chave", tipo: "UX" },
      { codigo: "RN-F062-04", descricao: "Estatísticas de uso por template", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "CRUD completo" },
      { perfil: "Gestor Suporte", acao: "CRUD completo" },
      { perfil: "Atendente", acao: "Visualizar e usar templates" },
    ],
    entidades: [
      { nome: "RespostaPredefinida", campos: ["id", "titulo", "conteudo", "categoria", "vezes_usada", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-063",
    nome: "Base de Conhecimento (Admin)",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "CRUD de artigos de ajuda organizados por categoria, com sugestão automática ao cliente abrir ticket.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F063-01", descricao: "Artigos organizados por categorias", tipo: "UX" },
      { codigo: "RN-F063-02", descricao: "Editor rich text para conteúdo", tipo: "UX" },
      { codigo: "RN-F063-03", descricao: "Busca por palavras-chave", tipo: "Comportamento" },
      { codigo: "RN-F063-04", descricao: "Sugestão automática de artigos ao cliente criar ticket", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "CRUD completo de artigos" },
      { perfil: "Gestor Suporte", acao: "CRUD completo de artigos" },
      { perfil: "Atendente", acao: "Visualizar e sugerir artigos" },
    ],
    entidades: [
      { nome: "ArtigoConhecimento", campos: ["id", "titulo", "conteudo", "categoria", "tags", "visualizacoes", "publicado"] },
    ],
  },
  {
    codigo: "F-ADMIN-064",
    nome: "Histórico do Cliente",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Exibe contexto completo do cliente: tickets anteriores, plano contratado, status financeiro e interações recentes.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F064-01", descricao: "Listar últimos tickets do cliente", tipo: "Dados" },
      { codigo: "RN-F064-02", descricao: "Exibir plano atual e status (ativo, suspenso)", tipo: "Dados" },
      { codigo: "RN-F064-03", descricao: "Indicar se há faturas em atraso", tipo: "Dados" },
      { codigo: "RN-F064-04", descricao: "Mostrar métricas de satisfação do cliente", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Visualizar histórico completo" },
      { perfil: "Gestor Suporte", acao: "Visualizar histórico completo" },
      { perfil: "Atendente", acao: "Visualizar histórico resumido" },
    ],
    entidades: [
      { nome: "ClienteISP", campos: ["id", "razao_social", "plano_id", "status"] },
      { nome: "Ticket", campos: ["id", "cliente_isp_id", "status", "satisfacao"] },
      { nome: "Fatura", campos: ["id", "cliente_isp_id", "status", "vencimento"] },
    ],
  },
  {
    codigo: "F-ADMIN-065",
    nome: "Integração WhatsApp - Caixa Unificada",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Recebe mensagens do WhatsApp Business e exibe em caixa de entrada unificada, permitindo atendimento direto do painel.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F065-01", descricao: "Receber mensagens via webhook WhatsApp Business API", tipo: "Integração" },
      { codigo: "RN-F065-02", descricao: "Exibir conversas em interface similar a tickets", tipo: "UX" },
      { codigo: "RN-F065-03", descricao: "Responder WhatsApp direto do painel", tipo: "Comportamento" },
      { codigo: "RN-F065-04", descricao: "Converter conversa em ticket quando necessário", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Configurar integração e atender" },
      { perfil: "Gestor Suporte", acao: "Visualizar e atender conversas" },
      { perfil: "Atendente", acao: "Atender conversas atribuídas" },
    ],
    entidades: [
      { nome: "ConversaWhatsApp", campos: ["id", "telefone", "cliente_isp_id", "atendente_id", "status", "created_at"] },
      { nome: "MensagemWhatsApp", campos: ["id", "conversa_id", "direcao", "conteudo", "tipo", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-066",
    nome: "Integração WhatsApp - Chatbot e Notificações",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Chatbot inicial para perguntas frequentes e envio de notificações automáticas sobre tickets via WhatsApp.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F066-01", descricao: "Chatbot responde FAQs automaticamente", tipo: "Integração" },
      { codigo: "RN-F066-02", descricao: "Transferir para atendente humano quando solicitado", tipo: "Comportamento" },
      { codigo: "RN-F066-03", descricao: "Notificar cliente sobre atualizações do ticket", tipo: "Notificação" },
      { codigo: "RN-F066-04", descricao: "Notificar quando ticket é resolvido", tipo: "Notificação" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Configurar chatbot e templates de notificação" },
      { perfil: "Gestor Suporte", acao: "Visualizar configurações" },
    ],
    entidades: [
      { nome: "ChatbotFluxo", campos: ["id", "trigger", "resposta", "proximo_passo", "ativo"] },
      { nome: "TemplateNotificacao", campos: ["id", "evento", "canal", "conteudo"] },
    ],
  },
  {
    codigo: "F-ADMIN-067",
    nome: "Integração Email",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Recebe emails de clientes e cria tickets automaticamente, mantendo sincronização bidirecional.",
    criticidade: "Alta",
    regrasNegocio: [
      { codigo: "RN-F067-01", descricao: "Email recebido cria ticket automaticamente", tipo: "Integração" },
      { codigo: "RN-F067-02", descricao: "Resposta do atendente envia email ao cliente", tipo: "Integração" },
      { codigo: "RN-F067-03", descricao: "Reply do cliente adiciona mensagem ao ticket existente", tipo: "Comportamento" },
      { codigo: "RN-F067-04", descricao: "Identificar cliente pelo email e vincular ao cadastro", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Configurar integração de email" },
      { perfil: "Gestor Suporte", acao: "Visualizar configurações" },
    ],
    entidades: [
      { nome: "ConfiguracaoEmail", campos: ["id", "email_entrada", "servidor_smtp", "ativo"] },
      { nome: "EmailRecebido", campos: ["id", "de", "assunto", "conteudo", "ticket_id", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-068",
    nome: "Avaliação de Atendimento",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Coleta avaliação do cliente ao fechar ticket (1-5 estrelas + comentário) e calcula CSAT automaticamente.",
    criticidade: "Média",
    regrasNegocio: [
      { codigo: "RN-F068-01", descricao: "Solicitar avaliação ao resolver ticket", tipo: "UX" },
      { codigo: "RN-F068-02", descricao: "Escala de 1 a 5 estrelas", tipo: "Comportamento" },
      { codigo: "RN-F068-03", descricao: "Campo opcional para comentário", tipo: "UX" },
      { codigo: "RN-F068-04", descricao: "Calcular CSAT (% de avaliações 4 e 5)", tipo: "Cálculo" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Visualizar todas as avaliações e CSAT" },
      { perfil: "Gestor Suporte", acao: "Visualizar avaliações da equipe" },
      { perfil: "Atendente", acao: "Visualizar próprias avaliações" },
    ],
    entidades: [
      { nome: "AvaliacaoTicket", campos: ["id", "ticket_id", "nota", "comentario", "created_at"] },
    ],
  },
  {
    codigo: "F-ADMIN-069",
    nome: "Pesquisa NPS",
    modulo: "Suporte",
    plataforma: "Painel Admin",
    descricao: "Envia pesquisa NPS periódica aos clientes e consolida resultados em dashboard.",
    criticidade: "Baixa",
    regrasNegocio: [
      { codigo: "RN-F069-01", descricao: "Enviar NPS por email/WhatsApp periodicamente", tipo: "Notificação" },
      { codigo: "RN-F069-02", descricao: "Escala de 0 a 10", tipo: "Comportamento" },
      { codigo: "RN-F069-03", descricao: "Calcular NPS (promotores - detratores)", tipo: "Cálculo" },
      { codigo: "RN-F069-04", descricao: "Dashboard com evolução do NPS ao longo do tempo", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Superadmin", acao: "Configurar e visualizar NPS" },
      { perfil: "Gestor Suporte", acao: "Visualizar resultados NPS" },
    ],
    entidades: [
      { nome: "PesquisaNPS", campos: ["id", "cliente_isp_id", "nota", "comentario", "created_at"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const styles = {
    Alta: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Média: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Baixa: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <Badge variant="outline" className={styles[criticidade]}>
      {criticidade}
    </Badge>
  );
};

const SuporteFeatures = () => {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {suporteFeatures.map((feature) => (
        <AccordionItem
          key={feature.codigo}
          value={feature.codigo}
          className="rounded-lg border border-border bg-background px-4"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-1 items-center gap-3 text-left">
              <span className="font-mono text-xs text-muted-foreground">
                {feature.codigo}
              </span>
              <span className="font-medium">{feature.nome}</span>
              {getCriticidadeBadge(feature.criticidade)}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div>
              <h4 className="mb-1 text-sm font-medium text-foreground">
                Descrição
              </h4>
              <p className="text-sm text-muted-foreground">
                {feature.descricao}
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">
                Regras de Negócio
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[120px]">Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feature.regrasNegocio.map((regra) => (
                    <TableRow key={regra.codigo}>
                      <TableCell className="font-mono text-xs">
                        {regra.codigo}
                      </TableCell>
                      <TableCell className="text-sm">
                        {regra.descricao}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {regra.tipo}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">
                Permissões
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Perfil</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feature.permissoes.map((perm, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {perm.perfil}
                      </TableCell>
                      <TableCell className="text-sm">{perm.acao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">
                Entidades de Dados
              </h4>
              <div className="flex flex-wrap gap-2">
                {feature.entidades.map((ent, idx) => (
                  <div
                    key={idx}
                    className="rounded-md border border-border bg-muted/50 px-3 py-2"
                  >
                    <span className="font-medium text-sm">{ent.nome}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ent.campos.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default SuporteFeatures;
