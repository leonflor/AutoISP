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
  perfil: string;
  acoes: string[];
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

const financeiroFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-036",
    nome: "Dashboard Financeiro",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Exibe visão geral financeira com KPIs principais (MRR, ARR, ticket médio) e gráfico de evolução de receita por mês/trimestre.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F036-01", descricao: "Calcular MRR com base em assinaturas ativas", tipo: "Cálculo" },
      { codigo: "RN-F036-02", descricao: "ARR = MRR x 12", tipo: "Cálculo" },
      { codigo: "RN-F036-03", descricao: "Ticket médio = Receita total / Número de clientes", tipo: "Cálculo" },
      { codigo: "RN-F036-04", descricao: "Gráfico exibe últimos 12 meses por padrão", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Visualizar dashboard", "Exportar dados"] },
      { perfil: "Financeiro", acoes: ["Visualizar dashboard", "Exportar dados"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["valor_total", "status", "data_pagamento"] },
      { nome: "Assinatura", campos: ["valor_mensal", "status", "data_inicio"] },
    ],
  },
  {
    codigo: "F-ADMIN-037",
    nome: "Listar Faturas",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Exibe listagem de todas as faturas com filtros por status (paga, pendente, vencida, cancelada), cliente e período.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F037-01", descricao: "Ordenação padrão: mais recente primeiro", tipo: "Comportamento" },
      { codigo: "RN-F037-02", descricao: "Filtros: status, cliente, período, método de pagamento", tipo: "UX" },
      { codigo: "RN-F037-03", descricao: "Exibir badge de status colorido por situação", tipo: "UX" },
      { codigo: "RN-F037-04", descricao: "Paginação de 25 faturas por página", tipo: "Limite" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Visualizar", "Filtrar", "Exportar"] },
      { perfil: "Financeiro", acoes: ["Visualizar", "Filtrar", "Exportar"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["id", "cliente_id", "valor_total", "status", "data_vencimento", "data_pagamento"] },
    ],
  },
  {
    codigo: "F-ADMIN-038",
    nome: "Visualizar Detalhe da Fatura",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Exibe composição detalhada da fatura: valor do plano, excedentes de uso de IA, descontos aplicados e taxas/ajustes.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F038-01", descricao: "Exibir breakdown: plano + excedentes - descontos + taxas", tipo: "Dados" },
      { codigo: "RN-F038-02", descricao: "Mostrar histórico de tentativas de cobrança", tipo: "Dados" },
      { codigo: "RN-F038-03", descricao: "Link para baixar PDF da fatura", tipo: "UX" },
      { codigo: "RN-F038-04", descricao: "Exibir nota fiscal vinculada (quando emitida)", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Visualizar detalhes", "Baixar PDF"] },
      { perfil: "Financeiro", acoes: ["Visualizar detalhes", "Baixar PDF"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["valor_plano", "valor_excedentes", "valor_descontos", "valor_taxas", "valor_total"] },
      { nome: "ItemFatura", campos: ["descricao", "quantidade", "valor_unitario", "valor_total"] },
      { nome: "NotaFiscal", campos: ["numero", "url_pdf", "data_emissao"] },
    ],
  },
  {
    codigo: "F-ADMIN-039",
    nome: "Cancelar/Estornar Fatura",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Permite cancelar fatura pendente ou solicitar estorno de fatura paga via gateway Asaas.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F039-01", descricao: "Cancelamento disponível apenas para faturas pendentes", tipo: "Validação" },
      { codigo: "RN-F039-02", descricao: "Estorno envia solicitação ao Asaas", tipo: "Integração" },
      { codigo: "RN-F039-03", descricao: "Registrar motivo do cancelamento/estorno", tipo: "Auditoria" },
      { codigo: "RN-F039-04", descricao: "Requer confirmação antes de executar", tipo: "Validação" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Cancelar", "Solicitar estorno"] },
      { perfil: "Financeiro", acoes: ["Cancelar", "Solicitar estorno"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["status", "motivo_cancelamento", "data_cancelamento"] },
      { nome: "LogAuditoria", campos: ["acao", "usuario_id", "motivo", "data_hora"] },
    ],
  },
  {
    codigo: "F-ADMIN-040",
    nome: "Aplicar Desconto em Fatura",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Permite aplicar desconto pontual em fatura pendente (percentual ou valor fixo).",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F040-01", descricao: "Desconto pode ser % ou valor fixo", tipo: "Comportamento" },
      { codigo: "RN-F040-02", descricao: "Desconto não pode exceder valor total da fatura", tipo: "Validação" },
      { codigo: "RN-F040-03", descricao: "Registrar motivo do desconto no log", tipo: "Auditoria" },
      { codigo: "RN-F040-04", descricao: "Atualizar valor no gateway Asaas", tipo: "Integração" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Aplicar desconto"] },
      { perfil: "Financeiro", acoes: ["Aplicar desconto"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["valor_desconto", "tipo_desconto", "motivo_desconto"] },
    ],
  },
  {
    codigo: "F-ADMIN-041",
    nome: "Registrar Pagamento Manual",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Permite registrar baixa manual de pagamento para casos especiais (depósito, transferência externa).",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F041-01", descricao: "Informar método de pagamento e data", tipo: "Dados" },
      { codigo: "RN-F041-02", descricao: "Anexar comprovante (opcional)", tipo: "UX" },
      { codigo: "RN-F041-03", descricao: "Marcar fatura como paga", tipo: "Comportamento" },
      { codigo: "RN-F041-04", descricao: "Disparar emissão de NF automaticamente", tipo: "Integração" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Registrar pagamento manual"] },
      { perfil: "Financeiro", acoes: ["Registrar pagamento manual"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["status", "metodo_pagamento", "data_pagamento", "comprovante_url"] },
    ],
  },
  {
    codigo: "F-ADMIN-042",
    nome: "Configurar Ciclo de Cobrança",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Define dia fixo do mês para cobrança de todos os clientes (ex: dia 5, 10, 15).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F042-01", descricao: "Configuração global para novos clientes", tipo: "Comportamento" },
      { codigo: "RN-F042-02", descricao: "Pro-rata no primeiro mês se necessário", tipo: "Cálculo" },
      { codigo: "RN-F042-03", descricao: "Permitir exceção por cliente", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Configurar ciclo global", "Definir exceção por cliente"] },
    ],
    entidades: [
      { nome: "ConfiguracaoFinanceira", campos: ["dia_cobranca_padrao"] },
      { nome: "Cliente", campos: ["dia_cobranca_personalizado"] },
    ],
  },
  {
    codigo: "F-ADMIN-043",
    nome: "Visualizar Inadimplência",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Exibe listagem de clientes inadimplentes com valor em atraso, dias de atraso e status da conta.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F043-01", descricao: "Ordenar por dias de atraso (maior primeiro)", tipo: "Comportamento" },
      { codigo: "RN-F043-02", descricao: "Exibir valor total em atraso consolidado", tipo: "Dados" },
      { codigo: "RN-F043-03", descricao: "Indicar se conta está suspensa", tipo: "UX" },
      { codigo: "RN-F043-04", descricao: "Ações rápidas: contatar, suspender, negociar", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Visualizar", "Suspender conta", "Contatar cliente"] },
      { perfil: "Financeiro", acoes: ["Visualizar", "Contatar cliente"] },
    ],
    entidades: [
      { nome: "Cliente", campos: ["status_conta", "valor_em_atraso", "dias_em_atraso"] },
      { nome: "Fatura", campos: ["status", "data_vencimento", "valor_total"] },
    ],
  },
  {
    codigo: "F-ADMIN-044",
    nome: "Configurar Regras de Inadimplência",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Define regras automáticas: prazo para alertas, suspensão automática (X dias configurável por plano/cliente).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F044-01", descricao: "Prazo de suspensão configurável globalmente", tipo: "Configuração" },
      { codigo: "RN-F044-02", descricao: "Exceção de prazo por cliente específico", tipo: "Comportamento" },
      { codigo: "RN-F044-03", descricao: "Alertas enviados em D+1, D+3, D+7 (configurável)", tipo: "Notificação" },
      { codigo: "RN-F044-04", descricao: "Suspensão automática ao atingir prazo", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Configurar regras globais", "Definir exceções"] },
    ],
    entidades: [
      { nome: "ConfiguracaoInadimplencia", campos: ["dias_alerta_1", "dias_alerta_2", "dias_alerta_3", "dias_suspensao"] },
      { nome: "Cliente", campos: ["prazo_suspensao_personalizado"] },
    ],
  },
  {
    codigo: "F-ADMIN-045",
    nome: "Previsão de Receita",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Exibe forecast de receita baseado em assinaturas ativas, considerando churn estimado e upgrades.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-F045-01", descricao: "Projeção para próximos 3, 6 e 12 meses", tipo: "Cálculo" },
      { codigo: "RN-F045-02", descricao: "Considerar taxa de churn histórica", tipo: "Cálculo" },
      { codigo: "RN-F045-03", descricao: "Exibir gráfico de projeção", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Visualizar previsão"] },
      { perfil: "Financeiro", acoes: ["Visualizar previsão"] },
    ],
    entidades: [
      { nome: "Assinatura", campos: ["valor_mensal", "status", "data_inicio"] },
      { nome: "MetricasChurn", campos: ["taxa_churn_mensal", "taxa_churn_anual"] },
    ],
  },
  {
    codigo: "F-ADMIN-046",
    nome: "Emissão Automática de NF",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Integra com sistema de NFS-e para emissão automática após confirmação de pagamento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F046-01", descricao: "Emitir NF automaticamente após pagamento confirmado", tipo: "Integração" },
      { codigo: "RN-F046-02", descricao: "Vincular NF à fatura", tipo: "Dados" },
      { codigo: "RN-F046-03", descricao: "Enviar NF por email ao cliente", tipo: "Notificação" },
      { codigo: "RN-F046-04", descricao: "Armazenar PDF da NF no sistema", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Configurar integração NF", "Reemitir NF"] },
      { perfil: "Financeiro", acoes: ["Visualizar NF", "Reemitir NF"] },
    ],
    entidades: [
      { nome: "NotaFiscal", campos: ["numero", "fatura_id", "url_pdf", "data_emissao", "status"] },
      { nome: "ConfiguracaoNF", campos: ["provedor", "cnpj", "inscricao_municipal"] },
    ],
  },
  {
    codigo: "F-ADMIN-047",
    nome: "Webhook Asaas - Confirmação Pagamento",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Recebe webhook do Asaas para atualizar status da fatura automaticamente quando pagamento é confirmado.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F047-01", descricao: "Validar assinatura do webhook (segurança)", tipo: "Segurança" },
      { codigo: "RN-F047-02", descricao: "Atualizar status da fatura para 'Paga'", tipo: "Comportamento" },
      { codigo: "RN-F047-03", descricao: "Disparar emissão de NF", tipo: "Integração" },
      { codigo: "RN-F047-04", descricao: "Registrar data/hora do pagamento", tipo: "Auditoria" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["Processar webhook"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["status", "data_pagamento", "gateway_transaction_id"] },
      { nome: "WebhookLog", campos: ["evento", "payload", "processado", "data_recebimento"] },
    ],
  },
  {
    codigo: "F-ADMIN-048",
    nome: "Webhook Asaas - Vencimento/Falha",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Recebe webhooks de vencimento de fatura e falha de cobrança para atualizar status e disparar alertas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F048-01", descricao: "Marcar fatura como 'Vencida' quando aplicável", tipo: "Comportamento" },
      { codigo: "RN-F048-02", descricao: "Registrar motivo da falha de cobrança", tipo: "Dados" },
      { codigo: "RN-F048-03", descricao: "Disparar alerta para ISP e admin", tipo: "Notificação" },
      { codigo: "RN-F048-04", descricao: "Iniciar contagem para suspensão automática", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["Processar webhook"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["status", "motivo_falha", "tentativas_cobranca"] },
      { nome: "WebhookLog", campos: ["evento", "payload", "processado"] },
    ],
  },
  {
    codigo: "F-ADMIN-049",
    nome: "Webhook Asaas - Estornos/Chargebacks",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Processa webhooks de estornos e chargebacks, atualizando fatura e notificando admin.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F049-01", descricao: "Reverter status da fatura para 'Estornada'", tipo: "Comportamento" },
      { codigo: "RN-F049-02", descricao: "Registrar motivo do estorno/chargeback", tipo: "Auditoria" },
      { codigo: "RN-F049-03", descricao: "Notificar admin imediatamente", tipo: "Notificação" },
      { codigo: "RN-F049-04", descricao: "Suspender conta se chargeback confirmado", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["Processar webhook"] },
      { perfil: "Admin", acoes: ["Visualizar estornos", "Contestar chargeback"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["status", "motivo_estorno", "data_estorno"] },
      { nome: "Chargeback", campos: ["fatura_id", "motivo", "status_contestacao", "data_limite"] },
    ],
  },
  {
    codigo: "F-ADMIN-050",
    nome: "Relatório de Receita",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Gera relatório detalhado de receita por plano, por cliente e por período, com opção de exportação.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F050-01", descricao: "Filtros: período, plano, cliente, método de pagamento", tipo: "UX" },
      { codigo: "RN-F050-02", descricao: "Agrupamento por plano ou cliente", tipo: "Comportamento" },
      { codigo: "RN-F050-03", descricao: "Exportar em CSV e Excel", tipo: "UX" },
      { codigo: "RN-F050-04", descricao: "Incluir totalizadores no rodapé", tipo: "Dados" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Gerar relatório", "Exportar"] },
      { perfil: "Financeiro", acoes: ["Gerar relatório", "Exportar"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["valor_total", "data_pagamento", "cliente_id", "plano_id"] },
    ],
  },
  {
    codigo: "F-ADMIN-051",
    nome: "Relatório de Inadimplência",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Gera relatório detalhado de inadimplência com aging (faixas de atraso) e valores por cliente.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F051-01", descricao: "Aging: 1-7 dias, 8-15 dias, 16-30 dias, 30+ dias", tipo: "Dados" },
      { codigo: "RN-F051-02", descricao: "Totalizador por faixa de atraso", tipo: "Cálculo" },
      { codigo: "RN-F051-03", descricao: "Exportar em CSV e Excel", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Gerar relatório", "Exportar"] },
      { perfil: "Financeiro", acoes: ["Gerar relatório", "Exportar"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["status", "data_vencimento", "valor_total", "cliente_id"] },
    ],
  },
  {
    codigo: "F-ADMIN-052",
    nome: "Análise de Crescimento",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Exibe comparativo de receita entre períodos, churn financeiro e taxa de crescimento MoM/YoY.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-F052-01", descricao: "Comparativo mês atual vs anterior", tipo: "Cálculo" },
      { codigo: "RN-F052-02", descricao: "Comparativo ano atual vs anterior (YoY)", tipo: "Cálculo" },
      { codigo: "RN-F052-03", descricao: "Calcular churn financeiro (receita perdida)", tipo: "Cálculo" },
      { codigo: "RN-F052-04", descricao: "Exibir gráficos comparativos", tipo: "UX" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Visualizar análise"] },
      { perfil: "Financeiro", acoes: ["Visualizar análise"] },
    ],
    entidades: [
      { nome: "Fatura", campos: ["valor_total", "data_pagamento"] },
      { nome: "Assinatura", campos: ["valor_mensal", "status", "data_cancelamento"] },
    ],
  },
  {
    codigo: "F-ADMIN-053",
    nome: "Conciliação Bancária",
    modulo: "Financeiro",
    plataforma: "Painel Admin",
    descricao: "Compara pagamentos do Asaas com extrato bancário, identificando diferenças automaticamente e permitindo revisão manual.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F053-01", descricao: "Importar extrato bancário (CSV/OFX)", tipo: "UX" },
      { codigo: "RN-F053-02", descricao: "Match automático por valor e data", tipo: "Comportamento" },
      { codigo: "RN-F053-03", descricao: "Listar diferenças para revisão manual", tipo: "UX" },
      { codigo: "RN-F053-04", descricao: "Marcar conciliação como finalizada", tipo: "Comportamento" },
    ],
    permissoes: [
      { perfil: "Admin", acoes: ["Importar extrato", "Revisar diferenças", "Finalizar conciliação"] },
      { perfil: "Financeiro", acoes: ["Importar extrato", "Revisar diferenças", "Finalizar conciliação"] },
    ],
    entidades: [
      { nome: "ExtratoBancario", campos: ["arquivo_url", "data_importacao", "periodo"] },
      { nome: "ItemConciliacao", campos: ["fatura_id", "transacao_banco", "status_match", "diferenca"] },
    ],
  },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const config = {
    alta: { label: "Alta", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    media: { label: "Média", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    baixa: { label: "Baixa", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  };
  const { label, className } = config[criticidade];
  return <Badge className={className}>{label}</Badge>;
};

const FinanceiroFeatures = () => {
  return (
    <Accordion type="single" collapsible className="w-full space-y-3">
      {financeiroFeatures.map((feature) => (
        <AccordionItem
          key={feature.codigo}
          value={feature.codigo}
          className="rounded-lg border border-border bg-background px-4"
        >
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex flex-1 items-center gap-3 text-left">
              <span className="font-mono text-xs text-muted-foreground">
                {feature.codigo}
              </span>
              <span className="font-medium text-foreground">{feature.nome}</span>
              {getCriticidadeBadge(feature.criticidade)}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              {/* Descrição */}
              <div>
                <h4 className="mb-1 text-sm font-medium text-foreground">Descrição</h4>
                <p className="text-sm text-muted-foreground">{feature.descricao}</p>
              </div>

              {/* Regras de Negócio */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Regras de Negócio</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-28">Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feature.regrasNegocio.map((regra) => (
                      <TableRow key={regra.codigo}>
                        <TableCell className="font-mono text-xs">{regra.codigo}</TableCell>
                        <TableCell className="text-sm">{regra.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {regra.tipo}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Permissões */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Permissões</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Perfil</TableHead>
                      <TableHead>Ações Permitidas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feature.permissoes.map((perm, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{perm.perfil}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {perm.acoes.map((acao, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {acao}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Entidades */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Entidades de Dados</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Entidade</TableHead>
                      <TableHead>Campos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feature.entidades.map((ent, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{ent.nome}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {ent.campos.map((campo, i) => (
                              <Badge key={i} variant="outline" className="font-mono text-xs">
                                {campo}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FinanceiroFeatures;
