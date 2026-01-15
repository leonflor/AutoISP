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

const clientesFeatures: Feature[] = [
  {
    codigo: "F-ADMIN-010",
    nome: "Listar Clientes ISP",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Exibe listagem paginada de todos os Clientes ISP com colunas: Nome, Email, Plano e Status. Ordenação padrão por nome (A-Z), 25 itens por página.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F010-01", descricao: "Ordenação padrão: nome crescente (A-Z)", tipo: "Comportamento" },
      { codigo: "RN-F010-02", descricao: "Paginação: 25 itens por página", tipo: "Limite" },
      { codigo: "RN-F010-03", descricao: "Exibir badge colorido conforme status (Ativo=verde, Trial=azul, Suspenso=amarelo, Cancelado=vermelho)", tipo: "UX" },
      { codigo: "RN-F010-04", descricao: "Permitir ordenar por qualquer coluna clicando no cabeçalho", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Acesso total à listagem" },
      { role: "Roles com permissão de clientes", acoes: "Visualizar listagem" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "id, nome, email, cnpj, status, created_at", operacoes: "SELECT" },
      { tabela: "assinatura", campos: "cliente_id, plano_id, status", operacoes: "SELECT (join)" },
      { tabela: "plano", campos: "id, nome", operacoes: "SELECT (join)" },
    ],
  },
  {
    codigo: "F-ADMIN-011",
    nome: "Buscar Clientes ISP",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Permite buscar clientes por Nome, Email ou CNPJ através de campo de busca unificado. Busca é case-insensitive e com match parcial.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F011-01", descricao: "Busca unificada em 3 campos: nome, email, CNPJ", tipo: "Comportamento" },
      { codigo: "RN-F011-02", descricao: "Busca case-insensitive e com match parcial (ILIKE)", tipo: "Comportamento" },
      { codigo: "RN-F011-03", descricao: "Mínimo 3 caracteres para iniciar busca", tipo: "Validação" },
    ],
    permissoes: [
      { role: "Todos os roles com acesso a Clientes", acoes: "Executar busca" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "nome, email, cnpj", operacoes: "SELECT (filtrado)" },
    ],
  },
  {
    codigo: "F-ADMIN-012",
    nome: "Filtrar Clientes ISP",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Permite filtrar a listagem por Status (Ativo, Trial, Suspenso, Cancelado), Plano (Starter, Pro, Enterprise) e Inadimplência (com faturas vencidas).",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F012-01", descricao: "Filtros são cumulativos (AND)", tipo: "Comportamento" },
      { codigo: "RN-F012-02", descricao: "Inadimplente = possui fatura vencida há mais de 5 dias", tipo: "Definição" },
      { codigo: "RN-F012-03", descricao: "Exibir contador de resultados após aplicar filtros", tipo: "UX" },
      { codigo: "RN-F012-04", descricao: "Botão para limpar todos os filtros", tipo: "UX" },
    ],
    permissoes: [
      { role: "Todos os roles com acesso a Clientes", acoes: "Aplicar filtros" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "status", operacoes: "SELECT (filtrado)" },
      { tabela: "assinatura", campos: "plano_id", operacoes: "SELECT (filtrado)" },
      { tabela: "fatura", campos: "status, vencimento", operacoes: "SELECT (filtrado)" },
    ],
  },
  {
    codigo: "F-ADMIN-013",
    nome: "Executar Ações em Lote",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Permite selecionar múltiplos clientes e executar: Enviar comunicado, Exportar selecionados (CSV/Excel), Alterar plano em lote.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F013-01", descricao: "Checkbox para seleção individual e 'selecionar todos'", tipo: "Comportamento" },
      { codigo: "RN-F013-02", descricao: "Máximo 100 clientes por ação em lote", tipo: "Limite" },
      { codigo: "RN-F013-03", descricao: "Alteração de plano em lote requer confirmação", tipo: "Validação" },
      { codigo: "RN-F013-04", descricao: "Exportação gera arquivo CSV com dados da listagem", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Todas as ações em lote" },
      { role: "Roles com permissão de clientes", acoes: "Exportar e enviar comunicado" },
      { role: "Roles com permissão financeira", acoes: "Alterar plano em lote" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "id, nome, email", operacoes: "SELECT, UPDATE (lote)" },
      { tabela: "assinatura", campos: "cliente_id, plano_id", operacoes: "UPDATE (lote)" },
      { tabela: "comunicado", campos: "destinatarios, mensagem, created_at", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-014",
    nome: "Criar Cliente ISP Manualmente",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Permite ao admin cadastrar um novo Cliente ISP manualmente, preenchendo todos os dados cadastrais, endereço, personalização e dados de aquisição.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F014-01", descricao: "Campos obrigatórios: Nome, Email, CNPJ, Telefone", tipo: "Validação" },
      { codigo: "RN-F014-02", descricao: "Email deve ser único no sistema", tipo: "Validação" },
      { codigo: "RN-F014-03", descricao: "CNPJ deve ser válido e único", tipo: "Validação" },
      { codigo: "RN-F014-04", descricao: "Cliente criado inicia com status 'Ativo' ou 'Trial' conforme selecionado", tipo: "Comportamento" },
      { codigo: "RN-F014-05", descricao: "Enviar email de boas-vindas ao cliente após criação", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Criar cliente manualmente" },
      { role: "Roles com permissão de clientes (escrita)", acoes: "Criar cliente manualmente" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "todos os campos", operacoes: "INSERT" },
      { tabela: "assinatura", campos: "cliente_id, plano_id, status", operacoes: "INSERT" },
      { tabela: "usuario", campos: "cliente_id, email, role", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-015",
    nome: "Visualizar Dados Cadastrais do Cliente",
    modulo: "Clientes ISP > Detalhe",
    plataforma: "Painel Admin",
    descricao: "Aba que exibe informações de contato (nome, email, telefone, CNPJ), endereço completo, dados de personalização/branding (logo, cores, domínio) e dados de aquisição (data cadastro, origem, indicador).",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F015-01", descricao: "Admin pode editar todos os campos", tipo: "Permissão" },
      { codigo: "RN-F015-02", descricao: "Alterações são registradas no log de atividade", tipo: "Auditoria" },
      { codigo: "RN-F015-03", descricao: "Logo deve ter limite de 2MB e formatos JPG/PNG", tipo: "Validação" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar e editar todos os campos" },
      { role: "Roles com permissão de clientes", acoes: "Visualizar dados cadastrais" },
      { role: "Roles com permissão de clientes (escrita)", acoes: "Editar dados cadastrais" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "nome, email, telefone, cnpj, endereco, logo, cores, dominio, origem, indicador", operacoes: "SELECT, UPDATE" },
      { tabela: "log_atividade", campos: "tipo, descricao, usuario_id, created_at", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-016",
    nome: "Visualizar Assinatura do Cliente",
    modulo: "Clientes ISP > Detalhe",
    plataforma: "Painel Admin",
    descricao: "Dentro da aba de Dados Cadastrais ou aba dedicada, exibe: plano atual, valor da assinatura, data de início, próxima cobrança, método de pagamento.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F016-01", descricao: "Exibir histórico de mudanças de plano", tipo: "Comportamento" },
      { codigo: "RN-F016-02", descricao: "Mostrar valor com e sem desconto (se houver)", tipo: "UX" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar todos os dados de assinatura" },
      { role: "Roles com permissão financeira", acoes: "Visualizar dados de assinatura" },
    ],
    entidades: [
      { tabela: "assinatura", campos: "plano_id, valor, status, created_at, proxima_cobranca, metodo_pagamento", operacoes: "SELECT" },
      { tabela: "plano", campos: "id, nome, valor", operacoes: "SELECT (join)" },
      { tabela: "historico_plano", campos: "cliente_id, plano_anterior, plano_novo, created_at", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-017",
    nome: "Gerenciar Plano do Cliente",
    modulo: "Clientes ISP > Detalhe",
    plataforma: "Painel Admin",
    descricao: "Permite Upgrade, Downgrade de plano, ajuste de preço individual e aplicação de créditos/bônus. Todas as operações requerem confirmação.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F017-01", descricao: "Upgrade é imediato, cobra diferença proporcional", tipo: "Comportamento" },
      { codigo: "RN-F017-02", descricao: "Downgrade aplica no próximo ciclo de cobrança", tipo: "Comportamento" },
      { codigo: "RN-F017-03", descricao: "Ajuste de preço pode ser desconto (%) ou valor fixo", tipo: "Comportamento" },
      { codigo: "RN-F017-04", descricao: "Créditos são aplicados como desconto nas próximas faturas", tipo: "Comportamento" },
      { codigo: "RN-F017-05", descricao: "Alteração de plano requer confirmação", tipo: "Validação" },
      { codigo: "RN-F017-06", descricao: "Todas as alterações registradas no log", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Todas as operações de gerenciamento de plano" },
      { role: "Roles com permissão financeira", acoes: "Upgrade, downgrade e ajustes" },
    ],
    entidades: [
      { tabela: "assinatura", campos: "plano_id, valor, desconto", operacoes: "UPDATE" },
      { tabela: "historico_plano", campos: "cliente_id, plano_anterior, plano_novo, operador_id", operacoes: "INSERT" },
      { tabela: "credito", campos: "cliente_id, valor, motivo, created_at", operacoes: "INSERT" },
      { tabela: "log_atividade", campos: "tipo, descricao, usuario_id", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-018",
    nome: "Visualizar Faturas do Cliente",
    modulo: "Clientes ISP > Detalhe > Faturas",
    plataforma: "Painel Admin",
    descricao: "Aba que exibe listagem de faturas, resumo financeiro (total pago, inadimplência, último pagamento), histórico de pagamentos e permite download de PDF das faturas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F018-01", descricao: "Listagem ordenada por vencimento (mais recente primeiro)", tipo: "Comportamento" },
      { codigo: "RN-F018-02", descricao: "Faturas vencidas destacadas em vermelho", tipo: "UX" },
      { codigo: "RN-F018-03", descricao: "Resumo calcula total pago nos últimos 12 meses", tipo: "Cálculo" },
      { codigo: "RN-F018-04", descricao: "Download gera PDF com dados da fatura", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar e baixar todas as faturas" },
      { role: "Roles com permissão financeira", acoes: "Visualizar e baixar faturas" },
    ],
    entidades: [
      { tabela: "fatura", campos: "id, cliente_id, valor, status, vencimento, paid_at", operacoes: "SELECT" },
      { tabela: "pagamento", campos: "fatura_id, metodo, valor, created_at", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-019",
    nome: "Gerenciar Pagamentos do Cliente",
    modulo: "Clientes ISP > Detalhe > Faturas",
    plataforma: "Painel Admin",
    descricao: "Permite registrar pagamento manual (dar baixa em fatura) e estornar/cancelar fatura. Estorno requer confirmação com motivo obrigatório.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F019-01", descricao: "Registrar pagamento atualiza status da fatura para 'Pago'", tipo: "Comportamento" },
      { codigo: "RN-F019-02", descricao: "Pagamento manual requer seleção de método e data", tipo: "Validação" },
      { codigo: "RN-F019-03", descricao: "Estorno requer confirmação + motivo obrigatório", tipo: "Validação" },
      { codigo: "RN-F019-04", descricao: "Estorno registrado no log de atividade", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Registrar pagamento e estornar" },
      { role: "Roles com permissão financeira", acoes: "Registrar pagamento manual" },
    ],
    entidades: [
      { tabela: "fatura", campos: "status, paid_at", operacoes: "UPDATE" },
      { tabela: "pagamento", campos: "fatura_id, metodo, valor, operador_id", operacoes: "INSERT" },
      { tabela: "estorno", campos: "fatura_id, motivo, operador_id, created_at", operacoes: "INSERT" },
      { tabela: "log_atividade", campos: "tipo, descricao, usuario_id", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-020",
    nome: "Visualizar Uso de IA do Cliente",
    modulo: "Clientes ISP > Detalhe > Uso de IA",
    plataforma: "Painel Admin",
    descricao: "Aba que exibe consumo total de tokens/requisições, consumo por agente de IA, gráfico temporal de evolução e percentual do limite utilizado.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-F020-01", descricao: "Consumo exibido em tokens e em reais (custo estimado)", tipo: "UX" },
      { codigo: "RN-F020-02", descricao: "Gráfico mostra últimos 30 dias por padrão", tipo: "Comportamento" },
      { codigo: "RN-F020-03", descricao: "Alerta visual quando consumo ultrapassa 80% do limite", tipo: "UX" },
      { codigo: "RN-F020-04", descricao: "Detalhar uso por agente: Atendente, Cobrador, Vendedor, etc.", tipo: "Comportamento" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar uso de IA de todos os clientes" },
      { role: "Roles com permissão de IA", acoes: "Visualizar uso de IA" },
    ],
    entidades: [
      { tabela: "uso_ia", campos: "cliente_id, agente, tokens, custo, created_at", operacoes: "SELECT" },
      { tabela: "limite_ia", campos: "cliente_id, limite_mensal", operacoes: "SELECT" },
    ],
  },
  {
    codigo: "F-ADMIN-021",
    nome: "Visualizar Logs de Atividade do Cliente",
    modulo: "Clientes ISP > Detalhe > Logs",
    plataforma: "Painel Admin",
    descricao: "Aba que exibe timeline de eventos do cliente: logins de usuários, alterações de dados, operações financeiras e interações com IA.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-F021-01", descricao: "Logs ordenados do mais recente para mais antigo", tipo: "Comportamento" },
      { codigo: "RN-F021-02", descricao: "Filtro por tipo de evento", tipo: "UX" },
      { codigo: "RN-F021-03", descricao: "Cada log exibe: tipo, descrição, usuário, IP, timestamp", tipo: "Dados" },
      { codigo: "RN-F021-04", descricao: "Paginação de 50 eventos por página", tipo: "Limite" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Visualizar todos os logs" },
      { role: "Roles com permissão de auditoria", acoes: "Visualizar logs de atividade" },
    ],
    entidades: [
      { tabela: "log_atividade", campos: "id, tipo, descricao, usuario_id, ip, created_at", operacoes: "SELECT" },
      { tabela: "usuario", campos: "id, nome", operacoes: "SELECT (join)" },
    ],
  },
  {
    codigo: "F-ADMIN-022",
    nome: "Suspender Cliente ISP",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Suspende o acesso do cliente, bloqueando login de todos os usuários e suspendendo cobranças. Requer confirmação antes de executar.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F022-01", descricao: "Bloqueia login de todos os usuários do ISP", tipo: "Comportamento" },
      { codigo: "RN-F022-02", descricao: "Suspende geração de novas cobranças", tipo: "Comportamento" },
      { codigo: "RN-F022-03", descricao: "Mantém dados e histórico intactos", tipo: "Comportamento" },
      { codigo: "RN-F022-04", descricao: "Requer confirmação antes de executar", tipo: "Validação" },
      { codigo: "RN-F022-05", descricao: "Status alterado para 'Suspenso'", tipo: "Comportamento" },
      { codigo: "RN-F022-06", descricao: "Registrar motivo e operador no log", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Suspender cliente" },
      { role: "Roles com permissão de clientes (admin)", acoes: "Suspender cliente" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "status, suspenso_em, suspenso_por", operacoes: "UPDATE" },
      { tabela: "usuario", campos: "cliente_id, bloqueado", operacoes: "UPDATE (lote)" },
      { tabela: "assinatura", campos: "status", operacoes: "UPDATE" },
      { tabela: "log_atividade", campos: "tipo, descricao, usuario_id, motivo", operacoes: "INSERT" },
    ],
  },
  {
    codigo: "F-ADMIN-023",
    nome: "Cancelar Cliente ISP",
    modulo: "Clientes ISP",
    plataforma: "Painel Admin",
    descricao: "Cancela a assinatura do cliente definitivamente. Notifica o ISP sobre o cancelamento e mantém dados históricos (sem exclusão). Requer confirmação com motivo obrigatório.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-F023-01", descricao: "Requer confirmação + motivo obrigatório", tipo: "Validação" },
      { codigo: "RN-F023-02", descricao: "Envia email de notificação ao ISP", tipo: "Comportamento" },
      { codigo: "RN-F023-03", descricao: "Status alterado para 'Cancelado'", tipo: "Comportamento" },
      { codigo: "RN-F023-04", descricao: "Dados do ISP são mantidos permanentemente", tipo: "Comportamento" },
      { codigo: "RN-F023-05", descricao: "Bloqueia login e encerra cobranças futuras", tipo: "Comportamento" },
      { codigo: "RN-F023-06", descricao: "Registrar motivo, operador e data no log", tipo: "Auditoria" },
    ],
    permissoes: [
      { role: "Super Admin", acoes: "Cancelar cliente" },
    ],
    entidades: [
      { tabela: "cliente_isp", campos: "status, cancelado_em, cancelado_por, motivo_cancelamento", operacoes: "UPDATE" },
      { tabela: "assinatura", campos: "status, canceled_at", operacoes: "UPDATE" },
      { tabela: "usuario", campos: "cliente_id, bloqueado", operacoes: "UPDATE (lote)" },
      { tabela: "log_atividade", campos: "tipo, descricao, usuario_id, motivo", operacoes: "INSERT" },
      { tabela: "email_enviado", campos: "destinatario, template, created_at", operacoes: "INSERT" },
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

const ClientesFeatures = () => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          14 features documentadas para o módulo Clientes ISP
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {clientesFeatures.map((feature) => (
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

export default ClientesFeatures;
