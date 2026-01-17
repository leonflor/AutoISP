import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  LayoutDashboard,
  Building2,
  CreditCard,
  FileText,
  Users,
  Bot,
  Settings,
  BarChart3,
  ClipboardList,
  Bell,
  Route,
} from "lucide-react";

interface Jornada {
  id: string;
  titulo: string;
  modulo: string;
  resumo: string;
  fluxo: string;
  regras: { id: string; descricao: string; criticidade: "Alta" | "Média" | "Baixa" }[];
}

interface CategoriaJornadas {
  id: string;
  titulo: string;
  icon: React.ElementType;
  jornadas: Jornada[];
}

const categoriasJornadas: CategoriaJornadas[] = [
  {
    id: "autenticacao",
    titulo: "Autenticação",
    icon: Lock,
    jornadas: [
      {
        id: "JA-01",
        titulo: "Login com Email/Senha (Super Admin)",
        modulo: "Auth",
        resumo: "Administrador SaaS acessa o sistema via rota exclusiva /admin/login.",
        fluxo: `Acessa /admin/login → Preenche email + senha → Valida credenciais → Verifica role super_admin → Redireciona /admin`,
        regras: [
          { id: "RNA-01-01", descricao: "Email deve ser válido e existir no sistema", criticidade: "Alta" },
          { id: "RNA-01-02", descricao: "Usuário deve possuir role super_admin na tabela user_roles", criticidade: "Alta" },
          { id: "RNA-01-03", descricao: "Senha mínimo 8 caracteres com complexidade", criticidade: "Alta" },
          { id: "RNA-01-04", descricao: "Bloquear após 3 tentativas falhas por 5 minutos", criticidade: "Alta" },
          { id: "RNA-01-05", descricao: "Sessão expira em 30 minutos de inatividade", criticidade: "Média" },
          { id: "RNA-01-06", descricao: "Se não for super_admin, exibir erro 'Acesso restrito a administradores'", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-02",
        titulo: "Login com 2FA (Google Authenticator)",
        modulo: "Auth",
        resumo: "Validação de segundo fator após login com email/senha.",
        fluxo: `Login válido → Sistema solicita código TOTP → Usuário insere código → Valida código → Acesso concedido`,
        regras: [
          { id: "RNA-02-01", descricao: "Código TOTP válido por 30 segundos", criticidade: "Alta" },
          { id: "RNA-02-02", descricao: "Máximo 3 tentativas de código por sessão", criticidade: "Alta" },
          { id: "RNA-02-03", descricao: "Bloquear conta após 5 falhas consecutivas de 2FA", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-03",
        titulo: "Logout Manual",
        modulo: "Auth",
        resumo: "Usuário encerra sessão voluntariamente.",
        fluxo: `Clica Logout → Invalida sessão → Limpa tokens → Redireciona login`,
        regras: [
          { id: "RNA-03-01", descricao: "Invalidar token JWT no servidor", criticidade: "Alta" },
          { id: "RNA-03-02", descricao: "Limpar dados locais (localStorage/cookies)", criticidade: "Média" },
        ],
      },
      {
        id: "JA-04",
        titulo: "Logout por Inatividade (30min)",
        modulo: "Auth",
        resumo: "Sistema encerra sessão automaticamente após período de inatividade.",
        fluxo: `30min sem ação → Sistema detecta → Invalida sessão → Exibe modal → Redireciona login`,
        regras: [
          { id: "RNA-04-01", descricao: "Timer reinicia a cada ação do usuário", criticidade: "Média" },
          { id: "RNA-04-02", descricao: "Exibir aviso 5 minutos antes de expirar", criticidade: "Baixa" },
          { id: "RNA-04-03", descricao: "Registrar logout automático em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JA-05",
        titulo: "Recuperação de Senha por Email",
        modulo: "Auth",
        resumo: "Usuário solicita redefinição de senha via email.",
        fluxo: `Clica Esqueci senha → Informa email → Sistema envia link → Clica link → Define nova senha`,
        regras: [
          { id: "RNA-05-01", descricao: "Link válido por 1 hora", criticidade: "Alta" },
          { id: "RNA-05-02", descricao: "Link de uso único (invalida após uso)", criticidade: "Alta" },
          { id: "RNA-05-03", descricao: "Não revelar se email existe no sistema", criticidade: "Alta" },
          { id: "RNA-05-04", descricao: "Nova senha não pode ser igual às 3 últimas", criticidade: "Média" },
        ],
      },
      {
        id: "JA-06",
        titulo: "Recuperação de Senha por SMS",
        modulo: "Auth",
        resumo: "Usuário solicita código de recuperação via SMS.",
        fluxo: `Clica Esqueci senha → Escolhe SMS → Informa telefone → Recebe código → Valida código → Define nova senha`,
        regras: [
          { id: "RNA-06-01", descricao: "Código SMS válido por 10 minutos", criticidade: "Alta" },
          { id: "RNA-06-02", descricao: "Máximo 3 tentativas de código", criticidade: "Alta" },
          { id: "RNA-06-03", descricao: "Limite de 5 solicitações por dia", criticidade: "Média" },
        ],
      },
      {
        id: "JA-07",
        titulo: "Bloqueio por Tentativas Falhas",
        modulo: "Auth",
        resumo: "Sistema bloqueia acesso após múltiplas tentativas incorretas.",
        fluxo: `3 tentativas falhas → Bloqueia 5 min → Usuário aguarda → Tenta novamente → 5 falhas → Bloqueia 24h + notifica`,
        regras: [
          { id: "RNA-07-01", descricao: "Primeiro bloqueio: 5 minutos", criticidade: "Alta" },
          { id: "RNA-07-02", descricao: "Segundo bloqueio: 24 horas", criticidade: "Alta" },
          { id: "RNA-07-03", descricao: "Notificar admin em bloqueio de 24h", criticidade: "Média" },
          { id: "RNA-07-04", descricao: "Admin pode desbloquear manualmente", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "dashboard",
    titulo: "Dashboard",
    icon: LayoutDashboard,
    jornadas: [
      {
        id: "JA-08",
        titulo: "Visualizar KPIs com Filtro de Período",
        modulo: "Dashboard",
        resumo: "Admin visualiza métricas principais com filtros temporais.",
        fluxo: `Acessa Dashboard → Visualiza KPIs padrão → Seleciona período → Sistema recalcula → Exibe dados atualizados`,
        regras: [
          { id: "RNA-08-01", descricao: "Períodos disponíveis: Hoje, 7d, 30d, Custom", criticidade: "Média" },
          { id: "RNA-08-02", descricao: "Cache de 5 minutos para performance", criticidade: "Baixa" },
          { id: "RNA-08-03", descricao: "Comparativo com período anterior", criticidade: "Baixa" },
        ],
      },
      {
        id: "JA-09",
        titulo: "Drill-down de KPI para Módulo",
        modulo: "Dashboard",
        resumo: "Admin clica em KPI para ver detalhes no módulo relacionado.",
        fluxo: `Clica no card KPI → Redireciona para módulo → Aplica filtro do período → Exibe dados detalhados`,
        regras: [
          { id: "RNA-09-01", descricao: "Manter contexto de filtro ao navegar", criticidade: "Média" },
          { id: "RNA-09-02", descricao: "Cada KPI mapeia para um módulo específico", criticidade: "Média" },
        ],
      },
      {
        id: "JA-10",
        titulo: "Customizar Cards do Dashboard",
        modulo: "Dashboard",
        resumo: "Admin personaliza quais métricas aparecem no dashboard.",
        fluxo: `Clica Customizar → Abre modal → Seleciona/ordena cards → Salva preferência → Dashboard atualiza`,
        regras: [
          { id: "RNA-10-01", descricao: "Mínimo 4 cards visíveis", criticidade: "Baixa" },
          { id: "RNA-10-02", descricao: "Máximo 12 cards", criticidade: "Baixa" },
          { id: "RNA-10-03", descricao: "Preferência salva por usuário", criticidade: "Média" },
        ],
      },
      {
        id: "JA-11",
        titulo: "Visualizar Alertas do Sistema",
        modulo: "Dashboard",
        resumo: "Admin vê alertas e notificações importantes no dashboard.",
        fluxo: `Acessa Dashboard → Sistema exibe alertas ativos → Admin clica alerta → Navega para contexto → Pode dispensar`,
        regras: [
          { id: "RNA-11-01", descricao: "Alertas ordenados por criticidade", criticidade: "Média" },
          { id: "RNA-11-02", descricao: "Alertas críticos não podem ser dispensados", criticidade: "Alta" },
          { id: "RNA-11-03", descricao: "Histórico de alertas disponível", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "clientes",
    titulo: "Clientes (ISPs)",
    icon: Building2,
    jornadas: [
      {
        id: "JA-12",
        titulo: "Criar ISP Manualmente",
        modulo: "Clientes",
        resumo: "Admin cadastra novo provedor de internet no sistema.",
        fluxo: `Clica Novo Cliente → Preenche formulário → Valida CNPJ único → Salva com status Pendente → Cria tenant_id → Notifica equipe`,
        regras: [
          { id: "RNA-12-01", descricao: "CNPJ deve ser único e válido (algoritmo)", criticidade: "Alta" },
          { id: "RNA-12-02", descricao: "Email deve ser único no sistema", criticidade: "Alta" },
          { id: "RNA-12-03", descricao: "Criar tenant_id automaticamente (UUID)", criticidade: "Alta" },
          { id: "RNA-12-04", descricao: "Status inicial = Pendente", criticidade: "Média" },
          { id: "RNA-12-05", descricao: "Registrar criação em log de auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JA-13",
        titulo: "ISP Self-Service (Landing Page)",
        modulo: "Clientes",
        resumo: "ISP se cadastra pela landing page com validação automática.",
        fluxo: `Acessa landing → Preenche formulário → Valida CNPJ → Cria conta Pendente → Envia email confirmação → Ativa após validação`,
        regras: [
          { id: "RNA-13-01", descricao: "Validar CNPJ via API Receita", criticidade: "Alta" },
          { id: "RNA-13-02", descricao: "Email de confirmação obrigatório", criticidade: "Alta" },
          { id: "RNA-13-03", descricao: "Token de confirmação válido por 24h", criticidade: "Média" },
          { id: "RNA-13-04", descricao: "Plano Trial automático de 14 dias", criticidade: "Média" },
        ],
      },
      {
        id: "JA-14",
        titulo: "Listar e Filtrar ISPs",
        modulo: "Clientes",
        resumo: "Admin visualiza lista de clientes com filtros e busca.",
        fluxo: `Acessa Clientes → Visualiza lista paginada → Aplica filtros → Busca por nome/CNPJ → Resultados atualizados`,
        regras: [
          { id: "RNA-14-01", descricao: "Paginação de 20 itens por página", criticidade: "Baixa" },
          { id: "RNA-14-02", descricao: "Filtros: Status, Plano, Data cadastro", criticidade: "Média" },
          { id: "RNA-14-03", descricao: "Busca com debounce de 300ms", criticidade: "Baixa" },
        ],
      },
      {
        id: "JA-15",
        titulo: "Visualizar Detalhes do ISP",
        modulo: "Clientes",
        resumo: "Admin acessa página com todas as informações do cliente.",
        fluxo: `Clica no ISP → Abre página de detalhes → Visualiza dados, assinatura, faturas, usuários → Pode navegar entre abas`,
        regras: [
          { id: "RNA-15-01", descricao: "Exibir resumo financeiro", criticidade: "Média" },
          { id: "RNA-15-02", descricao: "Mostrar histórico de alterações", criticidade: "Baixa" },
          { id: "RNA-15-03", descricao: "Acesso rápido às ações principais", criticidade: "Média" },
        ],
      },
      {
        id: "JA-16",
        titulo: "Editar Dados do ISP",
        modulo: "Clientes",
        resumo: "Admin altera informações cadastrais do cliente.",
        fluxo: `Acessa detalhes → Clica Editar → Altera campos → Valida dados → Salva alterações → Registra em auditoria`,
        regras: [
          { id: "RNA-16-01", descricao: "CNPJ não pode ser alterado", criticidade: "Alta" },
          { id: "RNA-16-02", descricao: "Email alterado requer nova validação", criticidade: "Média" },
          { id: "RNA-16-03", descricao: "Registrar todas alterações em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JA-17",
        titulo: "Alterar Status do ISP",
        modulo: "Clientes",
        resumo: "Admin ativa, suspende ou bloqueia cliente.",
        fluxo: `Acessa detalhes → Clica Alterar Status → Seleciona novo status → Confirma ação → Sistema aplica regras → Notifica ISP`,
        regras: [
          { id: "RNA-17-01", descricao: "Suspensão bloqueia acesso ao painel", criticidade: "Alta" },
          { id: "RNA-17-02", descricao: "Suspensão não interrompe cobranças", criticidade: "Alta" },
          { id: "RNA-17-03", descricao: "Bloqueio total interrompe tudo", criticidade: "Alta" },
          { id: "RNA-17-04", descricao: "Notificar ISP por email sobre mudança", criticidade: "Média" },
        ],
      },
      {
        id: "JA-18",
        titulo: "Soft Delete (Cancelar ISP)",
        modulo: "Clientes",
        resumo: "Admin marca cliente como cancelado sem excluir dados.",
        fluxo: `Acessa detalhes → Clica Cancelar → Confirma ação → Sistema aplica soft delete → Dados mantidos → Auditoria registrada`,
        regras: [
          { id: "RNA-18-01", descricao: "Soft delete: campo deleted_at preenchido", criticidade: "Alta" },
          { id: "RNA-18-02", descricao: "Dados mantidos por compliance", criticidade: "Alta" },
          { id: "RNA-18-03", descricao: "ISP não aparece em listagens padrão", criticidade: "Média" },
          { id: "RNA-18-04", descricao: "Cancelar assinaturas ativas", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "planos",
    titulo: "Planos",
    icon: CreditCard,
    jornadas: [
      {
        id: "JA-19",
        titulo: "Criar Plano SaaS",
        modulo: "Planos",
        resumo: "Admin cria novo plano de assinatura com limites e preços.",
        fluxo: `Clica Novo Plano → Preenche nome, descrição → Define preço e ciclo → Configura limites → Salva → Plano disponível`,
        regras: [
          { id: "RNA-19-01", descricao: "Nome do plano deve ser único", criticidade: "Alta" },
          { id: "RNA-19-02", descricao: "Preço mínimo R$ 0,00 (plano gratuito)", criticidade: "Média" },
          { id: "RNA-19-03", descricao: "Ciclos: Mensal ou Anual", criticidade: "Média" },
          { id: "RNA-19-04", descricao: "Definir limites de recursos (usuários, etc)", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-20",
        titulo: "Listar e Filtrar Planos",
        modulo: "Planos",
        resumo: "Admin visualiza todos os planos disponíveis.",
        fluxo: `Acessa Planos → Visualiza lista → Filtra por status → Ordena por preço/nome`,
        regras: [
          { id: "RNA-20-01", descricao: "Exibir quantidade de assinantes por plano", criticidade: "Média" },
          { id: "RNA-20-02", descricao: "Destacar plano mais popular", criticidade: "Baixa" },
        ],
      },
      {
        id: "JA-21",
        titulo: "Editar Plano",
        modulo: "Planos",
        resumo: "Admin altera configurações de um plano existente.",
        fluxo: `Seleciona plano → Clica Editar → Altera campos → Salva → Alterações aplicadas`,
        regras: [
          { id: "RNA-21-01", descricao: "Alteração de preço não afeta assinantes atuais", criticidade: "Alta" },
          { id: "RNA-21-02", descricao: "Alteração de limites afeta próximo ciclo", criticidade: "Alta" },
          { id: "RNA-21-03", descricao: "Notificar assinantes sobre mudanças", criticidade: "Média" },
        ],
      },
      {
        id: "JA-22",
        titulo: "Inativar/Ocultar Plano",
        modulo: "Planos",
        resumo: "Admin desativa plano para novas assinaturas.",
        fluxo: `Seleciona plano → Clica Inativar → Confirma → Plano oculto para novos → Assinantes atuais mantidos`,
        regras: [
          { id: "RNA-22-01", descricao: "Plano inativo não aparece para novos clientes", criticidade: "Alta" },
          { id: "RNA-22-02", descricao: "Assinantes atuais continuam normalmente", criticidade: "Alta" },
          { id: "RNA-22-03", descricao: "Pode reativar a qualquer momento", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "assinaturas",
    titulo: "Assinaturas",
    icon: FileText,
    jornadas: [
      {
        id: "JA-23",
        titulo: "Criar Assinatura (Pós-Pagamento)",
        modulo: "Assinaturas",
        resumo: "Admin cria assinatura para cliente com cobrança recorrente.",
        fluxo: `Acessa cliente → Clica Nova Assinatura → Seleciona plano → Define data início → Cria assinatura no Asaas → Ativa recursos`,
        regras: [
          { id: "RNA-23-01", descricao: "Gerar assinatura no Asaas automaticamente", criticidade: "Alta" },
          { id: "RNA-23-02", descricao: "Primeira fatura gerada pro-rata", criticidade: "Média" },
          { id: "RNA-23-03", descricao: "Liberar recursos imediatamente", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-24",
        titulo: "Upgrade de Plano (Pro-rata Imediato)",
        modulo: "Assinaturas",
        resumo: "Admin ou cliente muda para plano superior com cobrança proporcional.",
        fluxo: `Acessa assinatura → Clica Upgrade → Seleciona plano → Sistema calcula pro-rata → Gera cobrança → Aplica upgrade imediato`,
        regras: [
          { id: "RNA-24-01", descricao: "Calcular dias restantes do ciclo atual", criticidade: "Alta" },
          { id: "RNA-24-02", descricao: "Cobrar diferença proporcional via Asaas", criticidade: "Alta" },
          { id: "RNA-24-03", descricao: "Efeito imediato após confirmação", criticidade: "Alta" },
          { id: "RNA-24-04", descricao: "Manter histórico de mudanças", criticidade: "Média" },
        ],
      },
      {
        id: "JA-25",
        titulo: "Downgrade de Plano (Próximo Ciclo)",
        modulo: "Assinaturas",
        resumo: "Admin ou cliente muda para plano inferior, efetivo no próximo ciclo.",
        fluxo: `Acessa assinatura → Clica Downgrade → Seleciona plano → Agenda para próximo ciclo → Mantém plano atual até fim`,
        regras: [
          { id: "RNA-25-01", descricao: "Downgrade efetivo apenas no próximo ciclo", criticidade: "Alta" },
          { id: "RNA-25-02", descricao: "Não há reembolso de diferença", criticidade: "Alta" },
          { id: "RNA-25-03", descricao: "Cliente pode cancelar downgrade agendado", criticidade: "Média" },
        ],
      },
      {
        id: "JA-26",
        titulo: "Cancelar Assinatura (Fim do Ciclo)",
        modulo: "Assinaturas",
        resumo: "Admin ou cliente solicita cancelamento para fim do período pago.",
        fluxo: `Acessa assinatura → Clica Cancelar → Seleciona motivo → Confirma → Agenda cancelamento → Acesso até fim do ciclo`,
        regras: [
          { id: "RNA-26-01", descricao: "Acesso mantido até fim do ciclo pago", criticidade: "Alta" },
          { id: "RNA-26-02", descricao: "Motivo de cancelamento obrigatório", criticidade: "Média" },
          { id: "RNA-26-03", descricao: "Pode reverter antes do fim do ciclo", criticidade: "Média" },
          { id: "RNA-26-04", descricao: "Soft delete dos dados após 30 dias", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-27",
        titulo: "Renovação Automática",
        modulo: "Assinaturas",
        resumo: "Sistema renova assinatura automaticamente no vencimento.",
        fluxo: `Data vencimento → Sistema gera nova fatura → Envia para Asaas → Notifica cliente → Aguarda pagamento`,
        regras: [
          { id: "RNA-27-01", descricao: "Gerar fatura 5 dias antes do vencimento", criticidade: "Alta" },
          { id: "RNA-27-02", descricao: "Notificar cliente por email", criticidade: "Média" },
          { id: "RNA-27-03", descricao: "Tolerância de 7 dias para pagamento", criticidade: "Alta" },
          { id: "RNA-27-04", descricao: "Suspender após tolerância", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    titulo: "Financeiro",
    icon: CreditCard,
    jornadas: [
      {
        id: "JA-28",
        titulo: "Gerar Fatura Automática",
        modulo: "Financeiro",
        resumo: "Sistema gera faturas automaticamente baseado no ciclo.",
        fluxo: `Job diário → Identifica vencimentos → Gera fatura → Envia para Asaas → Disponibiliza boleto/PIX → Notifica cliente`,
        regras: [
          { id: "RNA-28-01", descricao: "Fatura gerada 5 dias antes do vencimento", criticidade: "Alta" },
          { id: "RNA-28-02", descricao: "Métodos: Boleto, PIX, Cartão", criticidade: "Alta" },
          { id: "RNA-28-03", descricao: "Email automático com dados de pagamento", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-29",
        titulo: "Gerar Fatura Manual",
        modulo: "Financeiro",
        resumo: "Admin cria fatura avulsa para cobrança específica.",
        fluxo: `Acessa cliente → Clica Nova Fatura → Define valor e descrição → Gera fatura → Envia para Asaas → Notifica cliente`,
        regras: [
          { id: "RNA-29-01", descricao: "Descrição obrigatória para fatura avulsa", criticidade: "Média" },
          { id: "RNA-29-02", descricao: "Registrar justificativa em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JA-30",
        titulo: "Reenviar Fatura",
        modulo: "Financeiro",
        resumo: "Admin reenvia email com dados de pagamento.",
        fluxo: `Acessa fatura → Clica Reenviar → Sistema reenvia email → Registra ação`,
        regras: [
          { id: "RNA-30-01", descricao: "Limite de 3 reenvios por fatura", criticidade: "Baixa" },
          { id: "RNA-30-02", descricao: "Intervalo mínimo de 1 hora entre reenvios", criticidade: "Baixa" },
        ],
      },
      {
        id: "JA-31",
        titulo: "Cancelar Fatura",
        modulo: "Financeiro",
        resumo: "Admin cancela fatura pendente.",
        fluxo: `Acessa fatura → Clica Cancelar → Confirma motivo → Sistema cancela no Asaas → Atualiza status → Registra auditoria`,
        regras: [
          { id: "RNA-31-01", descricao: "Apenas faturas Pendentes podem ser canceladas", criticidade: "Alta" },
          { id: "RNA-31-02", descricao: "Motivo de cancelamento obrigatório", criticidade: "Média" },
          { id: "RNA-31-03", descricao: "Cancelar correspondente no Asaas", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-32",
        titulo: "Processar Webhook de Pagamento (Asaas)",
        modulo: "Financeiro",
        resumo: "Sistema recebe e processa confirmação de pagamento do Asaas.",
        fluxo: `Asaas envia webhook → Sistema valida assinatura → Atualiza status fatura → Libera/mantém recursos → Notifica cliente`,
        regras: [
          { id: "RNA-32-01", descricao: "Validar assinatura HMAC do webhook", criticidade: "Alta" },
          { id: "RNA-32-02", descricao: "Idempotência: processar apenas uma vez", criticidade: "Alta" },
          { id: "RNA-32-03", descricao: "Retry automático em caso de falha", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-33",
        titulo: "Estornar Pagamento",
        modulo: "Financeiro",
        resumo: "Admin solicita estorno de pagamento já confirmado.",
        fluxo: `Acessa pagamento → Clica Estornar → Define valor (total/parcial) → Solicita no Asaas → Atualiza status → Registra auditoria`,
        regras: [
          { id: "RNA-33-01", descricao: "Estorno disponível até 90 dias", criticidade: "Alta" },
          { id: "RNA-33-02", descricao: "Estorno parcial permitido", criticidade: "Média" },
          { id: "RNA-33-03", descricao: "Aprovação de admin sênior necessária", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-34",
        titulo: "Negociar Débito",
        modulo: "Financeiro",
        resumo: "Admin negocia dívidas com cliente inadimplente.",
        fluxo: `Acessa cliente inadimplente → Clica Negociar → Define condições → Gera acordo → Cancela faturas antigas → Cria novas faturas`,
        regras: [
          { id: "RNA-34-01", descricao: "Desconto máximo de 30% sem aprovação", criticidade: "Alta" },
          { id: "RNA-34-02", descricao: "Parcelamento em até 12x", criticidade: "Média" },
          { id: "RNA-34-03", descricao: "Registrar acordo em contrato", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-35",
        titulo: "Gerar Relatório Financeiro",
        modulo: "Financeiro",
        resumo: "Admin gera relatório de receitas, inadimplência e projeções.",
        fluxo: `Acessa Relatórios → Seleciona Financeiro → Define período → Gera relatório → Visualiza ou exporta`,
        regras: [
          { id: "RNA-35-01", descricao: "Formatos: CSV, PDF", criticidade: "Média" },
          { id: "RNA-35-02", descricao: "Incluir gráficos no PDF", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "usuarios",
    titulo: "Usuários Internos",
    icon: Users,
    jornadas: [
      {
        id: "JA-36",
        titulo: "Criar Usuário Admin",
        modulo: "Usuários",
        resumo: "Admin master cria novo usuário com acesso ao painel.",
        fluxo: `Clica Novo Usuário → Preenche dados → Define permissões → Salva → Envia email com senha temporária`,
        regras: [
          { id: "RNA-36-01", descricao: "Email deve ser único", criticidade: "Alta" },
          { id: "RNA-36-02", descricao: "Senha temporária expira em 24h", criticidade: "Alta" },
          { id: "RNA-36-03", descricao: "Forçar troca de senha no primeiro acesso", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-37",
        titulo: "Alterar Permissões do Usuário",
        modulo: "Usuários",
        resumo: "Admin ajusta níveis de acesso de um usuário.",
        fluxo: `Acessa usuário → Clica Permissões → Altera roles/permissões → Salva → Efeito imediato`,
        regras: [
          { id: "RNA-37-01", descricao: "RBAC com roles predefinidos", criticidade: "Alta" },
          { id: "RNA-37-02", descricao: "Não pode remover próprias permissões", criticidade: "Alta" },
          { id: "RNA-37-03", descricao: "Registrar alterações em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JA-38",
        titulo: "Ativar/Desativar Usuário",
        modulo: "Usuários",
        resumo: "Admin ativa ou desativa acesso de um usuário.",
        fluxo: `Acessa usuário → Clica Ativar/Desativar → Confirma → Sistema altera status → Sessão encerrada se desativado`,
        regras: [
          { id: "RNA-38-01", descricao: "Desativar encerra sessão imediatamente", criticidade: "Alta" },
          { id: "RNA-38-02", descricao: "Não pode desativar a si mesmo", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-39",
        titulo: "Excluir Usuário",
        modulo: "Usuários",
        resumo: "Admin remove usuário permanentemente do sistema.",
        fluxo: `Acessa usuário → Clica Excluir → Confirma com senha → Sistema remove → Registra auditoria`,
        regras: [
          { id: "RNA-39-01", descricao: "Requer confirmação com senha do admin", criticidade: "Alta" },
          { id: "RNA-39-02", descricao: "Não pode excluir usuário master", criticidade: "Alta" },
          { id: "RNA-39-03", descricao: "Manter logs de auditoria do usuário", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "agentes",
    titulo: "Agentes IA Template",
    icon: Bot,
    jornadas: [
      {
        id: "JA-40",
        titulo: "Criar Template de Agente",
        modulo: "Agentes IA",
        resumo: "Admin cria template base de agente IA para ISPs herdarem.",
        fluxo: `Clica Novo Template → Define nome e descrição → Configura prompt base → Define ferramentas → Salva template`,
        regras: [
          { id: "RNA-40-01", descricao: "Nome do template deve ser único", criticidade: "Alta" },
          { id: "RNA-40-02", descricao: "Prompt base obrigatório", criticidade: "Alta" },
          { id: "RNA-40-03", descricao: "ISPs herdam com possibilidade de override", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-41",
        titulo: "Editar Template de Agente",
        modulo: "Agentes IA",
        resumo: "Admin modifica configurações de um template existente.",
        fluxo: `Seleciona template → Clica Editar → Altera configurações → Salva → Alterações propagam para ISPs`,
        regras: [
          { id: "RNA-41-01", descricao: "Alterações afetam ISPs que não fizeram override", criticidade: "Alta" },
          { id: "RNA-41-02", descricao: "Notificar ISPs sobre alterações", criticidade: "Média" },
        ],
      },
      {
        id: "JA-42",
        titulo: "Definir Ferramentas/APIs do Agente",
        modulo: "Agentes IA",
        resumo: "Admin configura quais ferramentas o agente pode usar.",
        fluxo: `Acessa template → Aba Ferramentas → Adiciona/remove ferramentas → Configura parâmetros → Salva`,
        regras: [
          { id: "RNA-42-01", descricao: "Ferramentas devem estar homologadas", criticidade: "Alta" },
          { id: "RNA-42-02", descricao: "Definir limites de uso por ferramenta", criticidade: "Média" },
        ],
      },
      {
        id: "JA-43",
        titulo: "Configurar Knowledge Base",
        modulo: "Agentes IA",
        resumo: "Admin adiciona documentos à base de conhecimento do agente.",
        fluxo: `Acessa template → Aba Knowledge → Upload de documentos → Sistema processa e indexa → Disponível para RAG`,
        regras: [
          { id: "RNA-43-01", descricao: "Formatos: PDF, TXT, MD, DOCX", criticidade: "Média" },
          { id: "RNA-43-02", descricao: "Tamanho máximo: 10MB por arquivo", criticidade: "Média" },
          { id: "RNA-43-03", descricao: "Indexação automática após upload", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "configuracoes",
    titulo: "Configurações",
    icon: Settings,
    jornadas: [
      {
        id: "JA-44",
        titulo: "Configurar Chaves de API",
        modulo: "Configurações",
        resumo: "Admin gerencia chaves de integração com serviços externos.",
        fluxo: `Acessa Configurações → Aba APIs → Adiciona/atualiza chave → Testa conexão → Salva`,
        regras: [
          { id: "RNA-44-01", descricao: "Chaves armazenadas criptografadas", criticidade: "Alta" },
          { id: "RNA-44-02", descricao: "Testar conexão antes de salvar", criticidade: "Média" },
          { id: "RNA-44-03", descricao: "Registrar alterações em auditoria", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-45",
        titulo: "Configurar Parâmetros Gerais",
        modulo: "Configurações",
        resumo: "Admin ajusta parâmetros globais do sistema.",
        fluxo: `Acessa Configurações → Aba Geral → Altera parâmetros → Salva → Efeito imediato ou próximo ciclo`,
        regras: [
          { id: "RNA-45-01", descricao: "Alguns parâmetros requerem restart", criticidade: "Média" },
          { id: "RNA-45-02", descricao: "Validar valores antes de salvar", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-46",
        titulo: "Configurar Identidade Visual",
        modulo: "Configurações",
        resumo: "Admin personaliza logo, cores e tema do sistema.",
        fluxo: `Acessa Configurações → Aba Visual → Upload logo → Define cores → Salva → Aplica em todo sistema`,
        regras: [
          { id: "RNA-46-01", descricao: "Logo: PNG/SVG, máx 500KB", criticidade: "Baixa" },
          { id: "RNA-46-02", descricao: "Cores em formato HEX", criticidade: "Baixa" },
          { id: "RNA-46-03", descricao: "Preview antes de aplicar", criticidade: "Média" },
        ],
      },
      {
        id: "JA-47",
        titulo: "Configurar Segurança (2FA, Sessão)",
        modulo: "Configurações",
        resumo: "Admin define políticas de segurança do sistema.",
        fluxo: `Acessa Configurações → Aba Segurança → Define políticas → Salva → Aplica para todos usuários`,
        regras: [
          { id: "RNA-47-01", descricao: "2FA pode ser obrigatório ou opcional", criticidade: "Alta" },
          { id: "RNA-47-02", descricao: "Timeout de sessão: 15-60 minutos", criticidade: "Média" },
          { id: "RNA-47-03", descricao: "Complexidade de senha configurável", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "relatorios",
    titulo: "Relatórios",
    icon: BarChart3,
    jornadas: [
      {
        id: "JA-48",
        titulo: "Gerar Relatório Financeiro",
        modulo: "Relatórios",
        resumo: "Admin gera relatório de receitas e inadimplência.",
        fluxo: `Acessa Relatórios → Seleciona Financeiro → Define período → Gera → Visualiza/exporta`,
        regras: [
          { id: "RNA-48-01", descricao: "Período máximo de 12 meses", criticidade: "Média" },
          { id: "RNA-48-02", descricao: "Exportar em CSV ou PDF", criticidade: "Média" },
        ],
      },
      {
        id: "JA-49",
        titulo: "Gerar Relatório de Clientes",
        modulo: "Relatórios",
        resumo: "Admin gera relatório de clientes e suas métricas.",
        fluxo: `Acessa Relatórios → Seleciona Clientes → Define filtros → Gera → Visualiza/exporta`,
        regras: [
          { id: "RNA-49-01", descricao: "Filtros: Status, Plano, Período", criticidade: "Média" },
          { id: "RNA-49-02", descricao: "Incluir métricas de churn", criticidade: "Média" },
        ],
      },
      {
        id: "JA-50",
        titulo: "Gerar Relatório de Uso IA",
        modulo: "Relatórios",
        resumo: "Admin gera relatório de consumo de IA por cliente.",
        fluxo: `Acessa Relatórios → Seleciona Uso IA → Define período → Gera → Visualiza consumo por ISP`,
        regras: [
          { id: "RNA-50-01", descricao: "Métricas: tokens, requests, custo", criticidade: "Média" },
          { id: "RNA-50-02", descricao: "Agrupar por ISP ou período", criticidade: "Média" },
        ],
      },
      {
        id: "JA-51",
        titulo: "Gerar Relatório de Auditoria",
        modulo: "Relatórios",
        resumo: "Admin gera relatório de ações auditadas no sistema.",
        fluxo: `Acessa Relatórios → Seleciona Auditoria → Define filtros → Gera → Visualiza/exporta`,
        regras: [
          { id: "RNA-51-01", descricao: "Filtros: Usuário, Ação, Período", criticidade: "Média" },
          { id: "RNA-51-02", descricao: "Retenção de logs: 6 meses", criticidade: "Alta" },
        ],
      },
      {
        id: "JA-52",
        titulo: "Exportar Relatório (CSV/PDF)",
        modulo: "Relatórios",
        resumo: "Admin exporta relatório gerado para arquivo.",
        fluxo: `Relatório gerado → Clica Exportar → Seleciona formato → Download iniciado`,
        regras: [
          { id: "RNA-52-01", descricao: "CSV para dados tabulares", criticidade: "Baixa" },
          { id: "RNA-52-02", descricao: "PDF com gráficos e formatação", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "auditoria",
    titulo: "Auditoria",
    icon: ClipboardList,
    jornadas: [
      {
        id: "JA-53",
        titulo: "Visualizar Logs de Auditoria",
        modulo: "Auditoria",
        resumo: "Admin visualiza histórico de ações no sistema.",
        fluxo: `Acessa Auditoria → Visualiza lista de logs → Ordena por data → Clica para detalhes`,
        regras: [
          { id: "RNA-53-01", descricao: "Logs ordenados por data decrescente", criticidade: "Baixa" },
          { id: "RNA-53-02", descricao: "Detalhes incluem antes/depois", criticidade: "Média" },
        ],
      },
      {
        id: "JA-54",
        titulo: "Filtrar Logs por Critérios",
        modulo: "Auditoria",
        resumo: "Admin filtra logs por usuário, ação, entidade ou período.",
        fluxo: `Acessa Auditoria → Aplica filtros → Lista atualizada → Pode combinar filtros`,
        regras: [
          { id: "RNA-54-01", descricao: "Filtros combinados com AND", criticidade: "Baixa" },
          { id: "RNA-54-02", descricao: "Busca por ID de entidade", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "notificacoes",
    titulo: "Notificações",
    icon: Bell,
    jornadas: [
      {
        id: "JA-55",
        titulo: "Receber Notificação In-App",
        modulo: "Notificações",
        resumo: "Admin recebe alerta visual no sistema.",
        fluxo: `Evento dispara → Sistema gera notificação → Exibe sino/badge → Admin clica → Marca como lida`,
        regras: [
          { id: "RNA-55-01", descricao: "Badge com contador de não lidas", criticidade: "Baixa" },
          { id: "RNA-55-02", descricao: "Notificações críticas ficam no topo", criticidade: "Média" },
        ],
      },
      {
        id: "JA-56",
        titulo: "Receber Notificação por Email",
        modulo: "Notificações",
        resumo: "Admin recebe email sobre evento importante.",
        fluxo: `Evento dispara → Sistema identifica destinatários → Envia email via Resend → Registra envio`,
        regras: [
          { id: "RNA-56-01", descricao: "Eventos configuráveis por usuário", criticidade: "Média" },
          { id: "RNA-56-02", descricao: "Throttle de emails por hora", criticidade: "Média" },
        ],
      },
      {
        id: "JA-57",
        titulo: "Disparar Webhook para Sistema Externo",
        modulo: "Notificações",
        resumo: "Sistema envia evento para URL externa configurada.",
        fluxo: `Evento dispara → Sistema monta payload → Envia POST para URL → Registra resposta → Retry se falha`,
        regras: [
          { id: "RNA-57-01", descricao: "Payload em JSON com assinatura HMAC", criticidade: "Alta" },
          { id: "RNA-57-02", descricao: "Retry exponencial: 3 tentativas", criticidade: "Alta" },
          { id: "RNA-57-03", descricao: "Timeout de 30 segundos", criticidade: "Média" },
        ],
      },
    ],
  },
];

const getBadgeVariant = (criticidade: "Alta" | "Média" | "Baixa") => {
  switch (criticidade) {
    case "Alta":
      return "destructive";
    case "Média":
      return "default";
    case "Baixa":
      return "secondary";
  }
};

const JornadasAdminSection = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Jornadas — Painel Admin</CardTitle>
              <p className="text-sm text-muted-foreground">
                57 jornadas documentadas organizadas por categoria
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoriasJornadas.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cat.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.jornadas.length} jornadas
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Jornadas por Categoria */}
      <Accordion type="multiple" className="space-y-4">
        {categoriasJornadas.map((categoria) => {
          const Icon = categoria.icon;
          return (
            <AccordionItem
              key={categoria.id}
              value={categoria.id}
              className="rounded-xl border border-border bg-card px-6"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{categoria.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoria.jornadas.length} jornadas
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-6">
                  {categoria.jornadas.map((jornada) => (
                    <Card key={jornada.id} className="border-muted">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {jornada.id}
                            </Badge>
                            <CardTitle className="text-base">
                              {jornada.titulo}
                            </CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {jornada.resumo}
                            </p>
                          </div>
                          <Badge variant="secondary">{jornada.modulo}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Fluxo */}
                        <div>
                          <p className="mb-2 text-sm font-medium">Fluxo</p>
                          <div className="rounded-md bg-muted/50 p-3">
                            <code className="text-xs text-muted-foreground">
                              {jornada.fluxo}
                            </code>
                          </div>
                        </div>

                        {/* Regras de Negócio */}
                        <div>
                          <p className="mb-2 text-sm font-medium">
                            Regras de Negócio
                          </p>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-24">ID</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-24 text-center">
                                  Criticidade
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {jornada.regras.map((regra) => (
                                <TableRow key={regra.id}>
                                  <TableCell className="font-mono text-xs">
                                    {regra.id}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {regra.descricao}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant={getBadgeVariant(regra.criticidade)}
                                    >
                                      {regra.criticidade}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default JornadasAdminSection;
