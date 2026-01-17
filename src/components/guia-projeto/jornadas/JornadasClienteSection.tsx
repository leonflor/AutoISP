import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LogIn,
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  Bot,
  Activity,
  UserCog,
  Plug,
  Settings,
  FileText,
  Shield,
  HelpCircle,
  Bell,
} from "lucide-react";

interface RegraDeNegocio {
  id: string;
  descricao: string;
  criticidade: "Alta" | "Média" | "Baixa";
}

interface Jornada {
  id: string;
  titulo: string;
  modulo: string;
  resumo: string;
  fluxo: string;
  regras: RegraDeNegocio[];
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
    icon: LogIn,
    jornadas: [
      {
        id: "JC-01",
        titulo: "Login com Email/Senha (Cliente ISP)",
        modulo: "Autenticação",
        resumo: "Operador do ISP realiza login na plataforma via rota /auth.",
        fluxo: `1. Operador acessa /auth
2. Preenche email e senha (ou cria conta via signup)
3. Sistema valida credenciais
4. Verifica membership na tabela isp_users
5. Se válido e membro de ISP → Redireciona /painel
6. Se válido mas sem ISP → Exibe mensagem "Sem Provedor Associado"
7. Se inválido → Exibe mensagem de erro`,
        regras: [
          { id: "RNC-01-01", descricao: "Usuário deve estar vinculado a um ISP via tabela isp_users", criticidade: "Alta" },
          { id: "RNC-01-02", descricao: "2FA configurável por perfil definido pelo Admin do ISP", criticidade: "Alta" },
          { id: "RNC-01-03", descricao: "Sessão isolada por isp_id (tenant)", criticidade: "Alta" },
          { id: "RNC-01-04", descricao: "Máximo de 5 tentativas antes de bloqueio temporário", criticidade: "Média" },
          { id: "RNC-01-05", descricao: "Se não for membro de ISP, exibir tela informativa com opção de voltar", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-02",
        titulo: "Login com 2FA",
        modulo: "Autenticação",
        resumo: "Operador completa autenticação de dois fatores após login inicial.",
        fluxo: `1. Após login válido, sistema detecta 2FA ativo no perfil
2. Exibe tela de verificação 2FA
3. Operador insere código do app autenticador
4. Sistema valida código
5. Se válido → Redireciona ao Dashboard
6. Se inválido → Permite nova tentativa`,
        regras: [
          { id: "RNC-02-01", descricao: "2FA habilitado por perfil, configurável pelo Admin do ISP", criticidade: "Alta" },
          { id: "RNC-02-02", descricao: "Código expira em 30 segundos", criticidade: "Alta" },
          { id: "RNC-02-03", descricao: "Máximo 3 tentativas antes de bloquear sessão", criticidade: "Média" },
        ],
      },
      {
        id: "JC-03",
        titulo: "Logout Manual",
        modulo: "Autenticação",
        resumo: "Operador encerra sessão manualmente através do menu.",
        fluxo: `1. Operador clica no avatar/menu do usuário
2. Seleciona "Sair"
3. Sistema invalida token de sessão
4. Redireciona para tela de login
5. Limpa dados locais do navegador`,
        regras: [
          { id: "RNC-03-01", descricao: "Token deve ser invalidado no servidor", criticidade: "Alta" },
          { id: "RNC-03-02", descricao: "Dados de sessão removidos do localStorage/cookies", criticidade: "Média" },
        ],
      },
      {
        id: "JC-04",
        titulo: "Logout por Inatividade",
        modulo: "Autenticação",
        resumo: "Sistema encerra sessão automaticamente após período de inatividade.",
        fluxo: `1. Sistema monitora atividade do operador
2. Após 30 minutos sem interação
3. Exibe modal de aviso (2 minutos para reagir)
4. Se operador interage → Renova sessão
5. Se não interage → Invalida sessão e redireciona ao login`,
        regras: [
          { id: "RNC-04-01", descricao: "Tempo de inatividade configurável por ISP (padrão: 30 min)", criticidade: "Média" },
          { id: "RNC-04-02", descricao: "Modal de aviso antes do logout forçado", criticidade: "Baixa" },
          { id: "RNC-04-03", descricao: "Evento de logout registrado em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JC-05",
        titulo: "Recuperação de Senha",
        modulo: "Autenticação",
        resumo: "Operador solicita redefinição de senha via email.",
        fluxo: `1. Operador clica em "Esqueci minha senha"
2. Informa email cadastrado
3. Sistema valida email no tenant
4. Envia link de recuperação (válido por 1h)
5. Operador acessa link e define nova senha
6. Sistema valida requisitos de senha
7. Senha atualizada → Redireciona ao login`,
        regras: [
          { id: "RNC-05-01", descricao: "Link de recuperação expira em 1 hora", criticidade: "Alta" },
          { id: "RNC-05-02", descricao: "Senha deve atender requisitos de complexidade do ISP", criticidade: "Alta" },
          { id: "RNC-05-03", descricao: "Email deve pertencer ao tenant atual", criticidade: "Alta" },
          { id: "RNC-05-04", descricao: "Notificar operador sobre alteração de senha", criticidade: "Média" },
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
        id: "JC-06",
        titulo: "Visualizar KPIs de Atendimento",
        modulo: "Dashboard",
        resumo: "Operador visualiza indicadores principais de atendimento no dashboard.",
        fluxo: `1. Operador acessa Dashboard
2. Sistema carrega dados do período selecionado
3. Exibe cards com KPIs: Total Atendimentos, Em Aberto, Finalizados
4. Dados atualizados em tempo real
5. Operador pode clicar para detalhar`,
        regras: [
          { id: "RNC-06-01", descricao: "Dados filtrados pelo tenant_id do ISP", criticidade: "Alta" },
          { id: "RNC-06-02", descricao: "Atualização em tempo real via WebSocket", criticidade: "Média" },
          { id: "RNC-06-03", descricao: "KPIs visíveis conforme permissão do perfil", criticidade: "Média" },
        ],
      },
      {
        id: "JC-07",
        titulo: "Visualizar CSAT/NPS",
        modulo: "Dashboard",
        resumo: "Operador visualiza métricas de satisfação do cliente.",
        fluxo: `1. Dashboard exibe card de CSAT/NPS
2. Mostra média do período selecionado
3. Gráfico de evolução temporal
4. Comparativo com período anterior
5. Click expande para detalhamento`,
        regras: [
          { id: "RNC-07-01", descricao: "CSAT calculado apenas de avaliações respondidas", criticidade: "Alta" },
          { id: "RNC-07-02", descricao: "NPS calculado conforme metodologia padrão", criticidade: "Alta" },
          { id: "RNC-07-03", descricao: "Período mínimo de 7 dias para cálculo confiável", criticidade: "Média" },
        ],
      },
      {
        id: "JC-08",
        titulo: "Visualizar Tempo Médio de Resposta",
        modulo: "Dashboard",
        resumo: "Operador visualiza métricas de tempo de resposta dos atendimentos.",
        fluxo: `1. Dashboard exibe card de TMA (Tempo Médio de Atendimento)
2. Mostra TMR (Tempo Médio de Resposta) inicial
3. Exibe comparativo com meta configurada
4. Indica tendência (melhorando/piorando)
5. Permite filtrar por canal e operador`,
        regras: [
          { id: "RNC-08-01", descricao: "TMR conta do recebimento até primeira resposta", criticidade: "Alta" },
          { id: "RNC-08-02", descricao: "TMA conta do início ao encerramento", criticidade: "Alta" },
          { id: "RNC-08-03", descricao: "Metas configuráveis pelo ISP", criticidade: "Média" },
        ],
      },
      {
        id: "JC-09",
        titulo: "Visualizar Alertas de Monitoramento",
        modulo: "Dashboard",
        resumo: "Operador visualiza alertas de rede no dashboard principal.",
        fluxo: `1. Widget de alertas exibe notificações críticas
2. Mostra contagem por severidade (crítico, warning, info)
3. Lista os 5 alertas mais recentes
4. Click em alerta redireciona ao módulo de Monitoramento
5. Alertas críticos destacados visualmente`,
        regras: [
          { id: "RNC-09-01", descricao: "Alertas sincronizados com sistema de monitoramento", criticidade: "Alta" },
          { id: "RNC-09-02", descricao: "Alertas críticos exibidos em destaque", criticidade: "Alta" },
          { id: "RNC-09-03", descricao: "Atualização automática a cada 30 segundos", criticidade: "Média" },
        ],
      },
      {
        id: "JC-10",
        titulo: "Filtrar Dashboard por Período",
        modulo: "Dashboard",
        resumo: "Operador ajusta período de visualização dos dados do dashboard.",
        fluxo: `1. Operador clica no seletor de período
2. Escolhe período pré-definido ou customizado
3. Sistema recarrega todos os widgets
4. Dados exibidos conforme novo período
5. Período persiste na sessão`,
        regras: [
          { id: "RNC-10-01", descricao: "Períodos disponíveis: Hoje, 7 dias, 30 dias, Customizado", criticidade: "Baixa" },
          { id: "RNC-10-02", descricao: "Período máximo de 90 dias para consulta", criticidade: "Média" },
          { id: "RNC-10-03", descricao: "Filtro aplicado a todos os widgets simultaneamente", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "atendimentos",
    titulo: "Atendimentos",
    icon: MessageSquare,
    jornadas: [
      {
        id: "JC-11",
        titulo: "Receber Atendimento via WhatsApp",
        modulo: "Atendimentos",
        resumo: "Sistema recebe e processa mensagem de assinante via WhatsApp.",
        fluxo: `1. Assinante envia mensagem para número do ISP
2. Webhook recebe evento da Meta
3. Sistema identifica assinante pelo telefone
4. Cria ou recupera conversa existente
5. Roteia para Agente de IA apropriado
6. IA processa e responde
7. Operador pode acompanhar em tempo real`,
        regras: [
          { id: "RNC-11-01", descricao: "Identificação de assinante via integração com ERP", criticidade: "Alta" },
          { id: "RNC-11-02", descricao: "Janela de 24h do WhatsApp respeitada", criticidade: "Alta" },
          { id: "RNC-11-03", descricao: "Mensagens de mídia processadas (imagem, áudio, documento)", criticidade: "Média" },
          { id: "RNC-11-04", descricao: "Atendimento vinculado ao tenant do ISP", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-12",
        titulo: "Receber Atendimento via Webchat",
        modulo: "Atendimentos",
        resumo: "Sistema recebe atendimento iniciado pelo widget de webchat.",
        fluxo: `1. Visitante acessa site do ISP com widget instalado
2. Clica no ícone do chat
3. Preenche dados iniciais (nome, CPF/telefone)
4. Sistema identifica ou cria lead
5. Inicia conversa com Agente de IA
6. Atendimento aparece na fila do operador`,
        regras: [
          { id: "RNC-12-01", descricao: "Widget configurado com cores do ISP", criticidade: "Baixa" },
          { id: "RNC-12-02", descricao: "Dados mínimos obrigatórios antes de iniciar", criticidade: "Média" },
          { id: "RNC-12-03", descricao: "Sessão persiste se usuário recarregar página", criticidade: "Média" },
        ],
      },
      {
        id: "JC-13",
        titulo: "Receber Atendimento via Telegram",
        modulo: "Atendimentos",
        resumo: "Sistema recebe e processa mensagem de assinante via Telegram.",
        fluxo: `1. Assinante envia mensagem para bot do ISP
2. Webhook recebe evento do Telegram
3. Sistema identifica assinante (se cadastrado)
4. Cria ou recupera conversa
5. Roteia para Agente de IA
6. IA processa e responde`,
        regras: [
          { id: "RNC-13-01", descricao: "Bot Telegram configurado por ISP", criticidade: "Alta" },
          { id: "RNC-13-02", descricao: "Identificação por username ou telefone vinculado", criticidade: "Média" },
          { id: "RNC-13-03", descricao: "Suporte a comandos especiais (/status, /fatura)", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-14",
        titulo: "Transferir Atendimento (Automático por Regra)",
        modulo: "Atendimentos",
        resumo: "IA transfere atendimento para operador humano conforme regras configuradas.",
        fluxo: `1. Atendimento em curso com IA
2. IA detecta gatilho de transferência (ex: 3x não entendeu)
3. IA encerra seu contexto e notifica assinante
4. Atendimento muda status para "Aguardando Transferência"
5. Notifica operadores disponíveis (in-app, email, SMS)
6. Entra na fila de espera
7. Operador aceita e assume atendimento`,
        regras: [
          { id: "RNC-14-01", descricao: "Regras de transferência definidas por tipo de atendimento", criticidade: "Alta" },
          { id: "RNC-14-02", descricao: "Notificar via in-app, email e SMS conforme config", criticidade: "Alta" },
          { id: "RNC-14-03", descricao: "Timeout configurável por ISP antes de escalar", criticidade: "Média" },
          { id: "RNC-14-04", descricao: "Histórico da conversa com IA visível ao operador", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-15",
        titulo: "Operador Assume Atendimento Transferido",
        modulo: "Atendimentos",
        resumo: "Operador aceita e assume atendimento transferido da IA.",
        fluxo: `1. Operador visualiza atendimentos na fila
2. Seleciona atendimento pendente
3. Clica em "Assumir"
4. Sistema atribui atendimento ao operador
5. Status muda para "Em Atendimento Humano"
6. Operador visualiza histórico completo
7. Inicia interação com assinante`,
        regras: [
          { id: "RNC-15-01", descricao: "Apenas operadores com permissão podem assumir", criticidade: "Alta" },
          { id: "RNC-15-02", descricao: "Limite de atendimentos simultâneos por operador", criticidade: "Média" },
          { id: "RNC-15-03", descricao: "Tempo de espera do cliente visível ao operador", criticidade: "Média" },
        ],
      },
      {
        id: "JC-16",
        titulo: "Encerrar Atendimento",
        modulo: "Atendimentos",
        resumo: "Operador ou IA finaliza o atendimento e registra resolução.",
        fluxo: `1. Operador/IA identifica resolução do atendimento
2. Clica em "Encerrar Atendimento"
3. Seleciona motivo de encerramento
4. Adiciona observações (opcional)
5. Sistema registra encerramento
6. Dispara pesquisa de satisfação (se configurado)
7. Atendimento arquivado`,
        regras: [
          { id: "RNC-16-01", descricao: "Motivo de encerramento obrigatório", criticidade: "Alta" },
          { id: "RNC-16-02", descricao: "CSAT disparado automaticamente se habilitado", criticidade: "Média" },
          { id: "RNC-16-03", descricao: "Atendimento não pode ser reaberto após 24h", criticidade: "Média" },
        ],
      },
      {
        id: "JC-17",
        titulo: "Criar OS Automaticamente pela IA",
        modulo: "Atendimentos",
        resumo: "IA identifica necessidade e cria ordem de serviço automaticamente.",
        fluxo: `1. IA identifica necessidade de OS durante conversa
2. Extrai dados relevantes do atendimento
3. Consulta ERP para dados do assinante
4. Valida dados mínimos necessários
5. Cria OS via API do ERP
6. Vincula OS ao atendimento
7. Informa assinante sobre OS aberta
8. Registra ação em auditoria`,
        regras: [
          { id: "RNC-17-01", descricao: "IA decide criação baseada em contexto e regras", criticidade: "Alta" },
          { id: "RNC-17-02", descricao: "Dados mínimos: assinante, tipo de problema, endereço", criticidade: "Alta" },
          { id: "RNC-17-03", descricao: "Log completo da criação registrado em auditoria", criticidade: "Média" },
          { id: "RNC-17-04", descricao: "Falha na criação notifica operador para ação manual", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-18",
        titulo: "Coletar CSAT (Automático por Configuração)",
        modulo: "Atendimentos",
        resumo: "Sistema envia pesquisa de satisfação após encerramento do atendimento.",
        fluxo: `1. Atendimento encerrado
2. Sistema verifica configuração de CSAT do ISP
3. Aguarda tempo configurado (ex: 5 minutos)
4. Envia mensagem com escala de avaliação
5. Assinante responde com nota
6. Sistema registra avaliação
7. Se nota baixa → Dispara alerta para supervisor`,
        regras: [
          { id: "RNC-18-01", descricao: "CSAT enviado apenas se configurado pelo ISP", criticidade: "Alta" },
          { id: "RNC-18-02", descricao: "Escala de 1-5 ou NPS (0-10) configurável", criticidade: "Média" },
          { id: "RNC-18-03", descricao: "Nota baixa (<3) gera alerta automático", criticidade: "Média" },
          { id: "RNC-18-04", descricao: "Timeout de 24h para resposta", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-19",
        titulo: "Visualizar Histórico de Atendimentos",
        modulo: "Atendimentos",
        resumo: "Operador consulta histórico completo de atendimentos.",
        fluxo: `1. Operador acessa módulo de Atendimentos
2. Visualiza lista com filtros (status, período, canal, operador)
3. Aplica filtros desejados
4. Sistema retorna resultados paginados
5. Clica em atendimento para ver detalhes
6. Visualiza conversa completa e metadados`,
        regras: [
          { id: "RNC-19-01", descricao: "Histórico limitado ao tenant do ISP", criticidade: "Alta" },
          { id: "RNC-19-02", descricao: "Operador vê apenas seus atendimentos (se não for supervisor)", criticidade: "Alta" },
          { id: "RNC-19-03", descricao: "Exportação disponível para supervisores", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "assinantes",
    titulo: "Assinantes",
    icon: Users,
    jornadas: [
      {
        id: "JC-20",
        titulo: "Pesquisar Assinante",
        modulo: "Assinantes",
        resumo: "Operador busca assinante por diferentes critérios.",
        fluxo: `1. Operador acessa módulo de Assinantes
2. Digita termo de busca (nome, CPF, telefone, contrato)
3. Sistema consulta ERP em tempo real
4. Retorna lista de resultados
5. Operador seleciona assinante desejado`,
        regras: [
          { id: "RNC-20-01", descricao: "Busca integrada com ERP do ISP", criticidade: "Alta" },
          { id: "RNC-20-02", descricao: "Mínimo 3 caracteres para iniciar busca", criticidade: "Baixa" },
          { id: "RNC-20-03", descricao: "Resultados limitados a 50 por página", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-21",
        titulo: "Visualizar Ficha do Assinante",
        modulo: "Assinantes",
        resumo: "Operador visualiza dados completos do assinante.",
        fluxo: `1. Operador seleciona assinante na lista
2. Sistema carrega dados do ERP
3. Exibe ficha com: dados pessoais, contrato, faturas
4. Mostra histórico de atendimentos
5. Exibe status de conexão (online/offline)
6. Lista equipamentos vinculados`,
        regras: [
          { id: "RNC-21-01", descricao: "Dados sensíveis mascarados conforme LGPD", criticidade: "Alta" },
          { id: "RNC-21-02", descricao: "Permissão necessária para ver dados financeiros", criticidade: "Alta" },
          { id: "RNC-21-03", descricao: "Cache de 5 minutos para dados do ERP", criticidade: "Média" },
        ],
      },
      {
        id: "JC-22",
        titulo: "Verificar Status Online/Offline",
        modulo: "Assinantes",
        resumo: "Operador verifica status de conexão do assinante.",
        fluxo: `1. Na ficha do assinante, visualiza indicador de status
2. Sistema consulta concentrador/OLT em tempo real
3. Exibe status: Online, Offline, Intermitente
4. Mostra última atividade registrada
5. Se offline, sugere ações de diagnóstico`,
        regras: [
          { id: "RNC-22-01", descricao: "Status consultado via integração com monitoramento", criticidade: "Alta" },
          { id: "RNC-22-02", descricao: "Refresh manual disponível para atualizar", criticidade: "Baixa" },
          { id: "RNC-22-03", descricao: "Histórico de status dos últimos 7 dias", criticidade: "Média" },
        ],
      },
      {
        id: "JC-23",
        titulo: "Enviar Mensagem Proativa ao Assinante",
        modulo: "Assinantes",
        resumo: "Operador envia mensagem direta para assinante específico.",
        fluxo: `1. Na ficha do assinante, clica em "Enviar Mensagem"
2. Seleciona canal (WhatsApp, SMS)
3. Escolhe template ou escreve mensagem livre
4. Sistema valida janela de 24h (WhatsApp)
5. Envia mensagem
6. Registra envio no histórico`,
        regras: [
          { id: "RNC-23-01", descricao: "WhatsApp: apenas HSM fora da janela de 24h", criticidade: "Alta" },
          { id: "RNC-23-02", descricao: "SMS: limite de caracteres e custo por mensagem", criticidade: "Média" },
          { id: "RNC-23-03", descricao: "Registro de todas as mensagens enviadas", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-24",
        titulo: "Criar OS para Assinante",
        modulo: "Assinantes",
        resumo: "Operador cria ordem de serviço manualmente para assinante.",
        fluxo: `1. Na ficha do assinante, clica em "Nova OS"
2. Seleciona tipo de OS (instalação, reparo, etc.)
3. Preenche detalhes do problema
4. Define prioridade e agendamento
5. Sistema cria OS no ERP
6. Confirma criação e exibe número da OS`,
        regras: [
          { id: "RNC-24-01", descricao: "Integração com ERP para criação de OS", criticidade: "Alta" },
          { id: "RNC-24-02", descricao: "Campos obrigatórios validados antes do envio", criticidade: "Alta" },
          { id: "RNC-24-03", descricao: "OS vinculada ao atendimento atual (se houver)", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "comunicacao-ativa",
    titulo: "Comunicação Ativa",
    icon: Send,
    jornadas: [
      {
        id: "JC-25",
        titulo: "Criar Disparo Manual Imediato",
        modulo: "Comunicação Ativa",
        resumo: "Operador cria e executa disparo de mensagens imediato.",
        fluxo: `1. Acessa módulo de Comunicação Ativa
2. Clica em "Novo Disparo"
3. Seleciona tipo: Imediato
4. Escolhe segmento ou lista de destinatários
5. Seleciona template de mensagem
6. Configura canal (WhatsApp, SMS)
7. Revisa e confirma envio
8. Sistema processa fila de envio`,
        regras: [
          { id: "RNC-25-01", descricao: "Template HSM obrigatório para WhatsApp", criticidade: "Alta" },
          { id: "RNC-25-02", descricao: "Limite de disparos por hora conforme plano", criticidade: "Alta" },
          { id: "RNC-25-03", descricao: "Confirmação obrigatória antes do envio em massa", criticidade: "Alta" },
          { id: "RNC-25-04", descricao: "Estimativa de custo exibida antes de confirmar", criticidade: "Média" },
        ],
      },
      {
        id: "JC-26",
        titulo: "Criar Disparo Agendado",
        modulo: "Comunicação Ativa",
        resumo: "Operador agenda disparo de mensagens para data/hora futura.",
        fluxo: `1. Cria novo disparo (mesmo fluxo JC-25)
2. Seleciona tipo: Agendado
3. Define data e hora do envio
4. Sistema valida horário permitido
5. Salva agendamento
6. Disparo executado automaticamente na data`,
        regras: [
          { id: "RNC-26-01", descricao: "Horário de envio deve respeitar regras do ISP", criticidade: "Alta" },
          { id: "RNC-26-02", descricao: "Edição permitida até 1h antes do disparo", criticidade: "Média" },
          { id: "RNC-26-03", descricao: "Notificação ao criador quando disparo executar", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-27",
        titulo: "Configurar Gatilho Automático",
        modulo: "Comunicação Ativa",
        resumo: "Operador configura disparo automático baseado em eventos.",
        fluxo: `1. Acessa Comunicação Ativa → Gatilhos
2. Clica em "Novo Gatilho"
3. Define evento trigger (fatura vencida, OS finalizada, etc.)
4. Configura condições/filtros
5. Seleciona template de mensagem
6. Define canal de disparo
7. Salva e ativa gatilho`,
        regras: [
          { id: "RNC-27-01", descricao: "Template deve ser HSM aprovado para WhatsApp", criticidade: "Alta" },
          { id: "RNC-27-02", descricao: "Rate limit por assinante (1 msg/tipo/dia)", criticidade: "Alta" },
          { id: "RNC-27-03", descricao: "Segmentação respeita status do contrato", criticidade: "Média" },
          { id: "RNC-27-04", descricao: "Logs de execução de gatilhos disponíveis", criticidade: "Média" },
        ],
      },
      {
        id: "JC-28",
        titulo: "Criar Campanha Multi-etapas",
        modulo: "Comunicação Ativa",
        resumo: "Operador cria sequência automatizada de mensagens.",
        fluxo: `1. Acessa Comunicação Ativa → Campanhas
2. Clica em "Nova Campanha"
3. Define nome e objetivo da campanha
4. Adiciona etapas com intervalos
5. Configura condições de saída (respondeu, converteu)
6. Define público-alvo
7. Agenda início da campanha
8. Monitora execução e métricas`,
        regras: [
          { id: "RNC-28-01", descricao: "Máximo de 5 etapas por campanha", criticidade: "Média" },
          { id: "RNC-28-02", descricao: "Intervalo mínimo de 24h entre etapas", criticidade: "Alta" },
          { id: "RNC-28-03", descricao: "Assinante removido ao atingir condição de saída", criticidade: "Alta" },
          { id: "RNC-28-04", descricao: "Opt-out automático remove de todas as campanhas", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-29",
        titulo: "Selecionar Segmento de Clientes",
        modulo: "Comunicação Ativa",
        resumo: "Operador define público-alvo para disparos usando segmentação.",
        fluxo: `1. Durante criação de disparo/campanha
2. Clica em "Selecionar Segmento"
3. Escolhe segmento existente ou cria novo
4. Define filtros: plano, status, região, comportamento
5. Sistema calcula quantidade de destinatários
6. Operador confirma segmento`,
        regras: [
          { id: "RNC-29-01", descricao: "Segmentos podem ser salvos para reuso", criticidade: "Baixa" },
          { id: "RNC-29-02", descricao: "Filtros combinados com operadores AND/OR", criticidade: "Média" },
          { id: "RNC-29-03", descricao: "Prévia de quantidade atualizada em tempo real", criticidade: "Média" },
        ],
      },
      {
        id: "JC-30",
        titulo: "Gerenciar Templates de Mensagem",
        modulo: "Comunicação Ativa",
        resumo: "Operador cria e gerencia templates de mensagens.",
        fluxo: `1. Acessa Comunicação Ativa → Templates
2. Visualiza lista de templates existentes
3. Para criar: clica em "Novo Template"
4. Define nome, canal e conteúdo
5. Insere variáveis dinâmicas (nome, valor, vencimento)
6. Salva template (local) ou envia para aprovação (HSM)
7. Acompanha status de aprovação`,
        regras: [
          { id: "RNC-30-01", descricao: "HSM WhatsApp requer aprovação da Meta (24-48h)", criticidade: "Alta" },
          { id: "RNC-30-02", descricao: "Templates SMS limitados a 160 caracteres", criticidade: "Média" },
          { id: "RNC-30-03", descricao: "Variáveis devem corresponder a campos do ERP", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-31",
        titulo: "Visualizar Métricas de Disparo",
        modulo: "Comunicação Ativa",
        resumo: "Operador acompanha métricas de disparos realizados.",
        fluxo: `1. Acessa Comunicação Ativa → Relatórios
2. Seleciona disparo/campanha para analisar
3. Visualiza métricas: enviados, entregues, lidos, respondidos
4. Analisa taxa de conversão
5. Exporta relatório se necessário`,
        regras: [
          { id: "RNC-31-01", descricao: "Métricas atualizadas a cada 5 minutos", criticidade: "Média" },
          { id: "RNC-31-02", descricao: "Status de leitura disponível apenas para WhatsApp", criticidade: "Baixa" },
          { id: "RNC-31-03", descricao: "Histórico de métricas mantido por 90 dias", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "agentes-ia",
    titulo: "Agentes de IA",
    icon: Bot,
    jornadas: [
      {
        id: "JC-32",
        titulo: "Configurar Agente Comercial",
        modulo: "Agentes de IA",
        resumo: "Operador configura comportamento do agente de IA comercial.",
        fluxo: `1. Acessa módulo Agentes de IA
2. Seleciona agente "Comercial"
3. Visualiza template herdado do Admin
4. Pode sobrescrever: tom de voz, regras específicas
5. Configura produtos/planos para oferecer
6. Define regras de escalação
7. Salva configurações`,
        regras: [
          { id: "RNC-32-01", descricao: "Template base herdado do Admin AutoISP", criticidade: "Alta" },
          { id: "RNC-32-02", descricao: "Sobrescrita limitada a campos permitidos", criticidade: "Alta" },
          { id: "RNC-32-03", descricao: "Produtos vinculados ao catálogo do ERP", criticidade: "Média" },
        ],
      },
      {
        id: "JC-33",
        titulo: "Configurar Agente Financeiro",
        modulo: "Agentes de IA",
        resumo: "Operador configura comportamento do agente de IA financeiro.",
        fluxo: `1. Acessa Agentes de IA → Financeiro
2. Visualiza template herdado
3. Configura: tolerância para negociação, parcelamento máximo
4. Define regras de 2ª via automática
5. Configura integração com gateway de pagamento
6. Salva configurações`,
        regras: [
          { id: "RNC-33-01", descricao: "Limites de negociação definidos pelo Admin do ISP", criticidade: "Alta" },
          { id: "RNC-33-02", descricao: "Emissão de 2ª via vinculada ao ERP", criticidade: "Alta" },
          { id: "RNC-33-03", descricao: "Link de pagamento gerado automaticamente", criticidade: "Média" },
        ],
      },
      {
        id: "JC-34",
        titulo: "Configurar Agente Suporte Técnico",
        modulo: "Agentes de IA",
        resumo: "Operador configura comportamento do agente de IA de suporte.",
        fluxo: `1. Acessa Agentes de IA → Suporte Técnico
2. Visualiza template herdado
3. Configura: scripts de diagnóstico, procedimentos
4. Define quando criar OS automaticamente
5. Configura integração com monitoramento
6. Define regras de escalação para humano
7. Salva configurações`,
        regras: [
          { id: "RNC-34-01", descricao: "Scripts de diagnóstico baseados na rede do ISP", criticidade: "Alta" },
          { id: "RNC-34-02", descricao: "Criação de OS segue regras do JC-17", criticidade: "Alta" },
          { id: "RNC-34-03", descricao: "Consulta status em tempo real via monitoramento", criticidade: "Média" },
        ],
      },
      {
        id: "JC-35",
        titulo: "Configurar Agente Institucional",
        modulo: "Agentes de IA",
        resumo: "Operador configura comportamento do agente de IA institucional.",
        fluxo: `1. Acessa Agentes de IA → Institucional
2. Visualiza template herdado
3. Configura: informações da empresa, horário de funcionamento
4. Define FAQs específicas do ISP
5. Configura redirecionamentos para outros agentes
6. Salva configurações`,
        regras: [
          { id: "RNC-35-01", descricao: "Informações institucionais sincronizadas com configurações", criticidade: "Média" },
          { id: "RNC-35-02", descricao: "Horário de atendimento reflete configuração do ISP", criticidade: "Média" },
          { id: "RNC-35-03", descricao: "Redirecionamento inteligente baseado em intent", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-36",
        titulo: "Editar Regras de Atendimento",
        modulo: "Agentes de IA",
        resumo: "Operador ajusta regras de comportamento dos agentes.",
        fluxo: `1. Seleciona agente para editar
2. Acessa aba "Regras de Atendimento"
3. Visualiza regras atuais
4. Adiciona/edita regras (quando transferir, respostas proibidas)
5. Define prioridade das regras
6. Testa regras no simulador
7. Salva alterações`,
        regras: [
          { id: "RNC-36-01", descricao: "Regras do Admin têm prioridade sobre regras do ISP", criticidade: "Alta" },
          { id: "RNC-36-02", descricao: "Simulador disponível para testar antes de publicar", criticidade: "Média" },
          { id: "RNC-36-03", descricao: "Histórico de alterações mantido para auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JC-37",
        titulo: "Gerenciar Knowledge Base",
        modulo: "Agentes de IA",
        resumo: "Operador adiciona e gerencia base de conhecimento dos agentes.",
        fluxo: `1. Acessa Agentes de IA → Knowledge Base
2. Visualiza documentos/FAQs existentes
3. Para adicionar: clica em "Novo Documento"
4. Faz upload ou digita conteúdo
5. Define categoria e agentes que usarão
6. Sistema processa e indexa conteúdo
7. Conteúdo disponível para os agentes`,
        regras: [
          { id: "RNC-37-01", descricao: "Formatos aceitos: PDF, TXT, MD, DOCX", criticidade: "Média" },
          { id: "RNC-37-02", descricao: "Limite de 50 documentos por ISP", criticidade: "Média" },
          { id: "RNC-37-03", descricao: "Processamento assíncrono (até 5 min)", criticidade: "Baixa" },
          { id: "RNC-37-04", descricao: "KB do ISP complementa KB global do Admin", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-38",
        titulo: "Herdar/Sobrescrever Template do Admin",
        modulo: "Agentes de IA",
        resumo: "Operador decide entre usar template padrão ou customizar.",
        fluxo: `1. Ao acessar configuração de agente
2. Sistema exibe template herdado do Admin
3. Operador visualiza o que pode customizar
4. Escolhe: manter herança ou sobrescrever
5. Se sobrescrever: edita campos permitidos
6. Salva configuração
7. Admin pode forçar reset para template original`,
        regras: [
          { id: "RNC-38-01", descricao: "Campos bloqueados pelo Admin não são editáveis", criticidade: "Alta" },
          { id: "RNC-38-02", descricao: "Atualizações do Admin propagam para ISPs que não sobrescreveram", criticidade: "Alta" },
          { id: "RNC-38-03", descricao: "Reset para template original disponível a qualquer momento", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "monitoramento",
    titulo: "Monitoramento",
    icon: Activity,
    jornadas: [
      {
        id: "JC-39",
        titulo: "Listar Ativos de Rede",
        modulo: "Monitoramento",
        resumo: "Operador visualiza lista de equipamentos monitorados.",
        fluxo: `1. Acessa módulo de Monitoramento
2. Visualiza lista de ativos sincronizados
3. Filtra por tipo (OLT, roteador, switch)
4. Ordena por status ou nome
5. Visualiza indicadores de saúde por ativo`,
        regras: [
          { id: "RNC-39-01", descricao: "Ativos sincronizados com sistema de monitoramento", criticidade: "Alta" },
          { id: "RNC-39-02", descricao: "Status atualizado a cada 1 minuto", criticidade: "Média" },
          { id: "RNC-39-03", descricao: "Apenas ativos do tenant do ISP são exibidos", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-40",
        titulo: "Reiniciar Equipamento Remotamente",
        modulo: "Monitoramento",
        resumo: "Operador executa reinício remoto de equipamento do assinante.",
        fluxo: `1. Localiza equipamento na lista ou via ficha do assinante
2. Clica em "Reiniciar"
3. Sistema solicita confirmação
4. Envia comando ao equipamento
5. Aguarda resposta (timeout 30s)
6. Exibe resultado: sucesso ou falha
7. Registra ação em auditoria`,
        regras: [
          { id: "RNC-40-01", descricao: "Permissão específica necessária para reinício", criticidade: "Alta" },
          { id: "RNC-40-02", descricao: "Timeout de 30 segundos para resposta", criticidade: "Média" },
          { id: "RNC-40-03", descricao: "Limite de 3 reinícios por equipamento por hora", criticidade: "Média" },
          { id: "RNC-40-04", descricao: "Ação registrada em auditoria com IP do operador", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-41",
        titulo: "Executar Testes de Rede (Ping/Traceroute)",
        modulo: "Monitoramento",
        resumo: "Operador executa diagnósticos de rede para equipamento.",
        fluxo: `1. Seleciona equipamento ou IP de destino
2. Escolhe tipo de teste: Ping ou Traceroute
3. Configura parâmetros (quantidade de pacotes)
4. Executa teste
5. Aguarda resultado
6. Visualiza saída formatada
7. Pode exportar resultado`,
        regras: [
          { id: "RNC-41-01", descricao: "Testes executados a partir do servidor do ISP", criticidade: "Alta" },
          { id: "RNC-41-02", descricao: "Limite de 10 testes simultâneos por operador", criticidade: "Média" },
          { id: "RNC-41-03", descricao: "Resultados salvos por 24 horas", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-42",
        titulo: "Visualizar Alertas de Status",
        modulo: "Monitoramento",
        resumo: "Operador visualiza e gerencia alertas de monitoramento.",
        fluxo: `1. Acessa Monitoramento → Alertas
2. Visualiza lista de alertas ativos
3. Filtra por severidade (crítico, warning, info)
4. Clica em alerta para detalhes
5. Pode reconhecer alerta (acknowledge)
6. Visualiza histórico de alertas`,
        regras: [
          { id: "RNC-42-01", descricao: "Alertas sincronizados com Zabbix/PRTG/LibreNMS", criticidade: "Alta" },
          { id: "RNC-42-02", descricao: "Alertas críticos disparam notificação push", criticidade: "Alta" },
          { id: "RNC-42-03", descricao: "Histórico de alertas mantido por 30 dias", criticidade: "Média" },
        ],
      },
      {
        id: "JC-43",
        titulo: "Consultar Logs de Roteador de Borda",
        modulo: "Monitoramento",
        resumo: "Operador consulta logs do roteador de borda do ISP.",
        fluxo: `1. Acessa Monitoramento → Logs
2. Seleciona equipamento de borda
3. Define período de consulta
4. Sistema conecta ao servidor de log
5. Retorna logs filtrados
6. Operador pode pesquisar por termo
7. Exporta logs se necessário`,
        regras: [
          { id: "RNC-43-01", descricao: "Integração com servidor de log configurado (syslog)", criticidade: "Alta" },
          { id: "RNC-43-02", descricao: "Logs sensíveis ocultados para perfis básicos", criticidade: "Alta" },
          { id: "RNC-43-03", descricao: "Consulta registrada em auditoria", criticidade: "Média" },
          { id: "RNC-43-04", descricao: "Limite de 10.000 linhas por consulta", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "usuarios-perfis",
    titulo: "Usuários e Perfis",
    icon: UserCog,
    jornadas: [
      {
        id: "JC-44",
        titulo: "Criar Operador (Cadastro Direto)",
        modulo: "Usuários e Perfis",
        resumo: "Admin do ISP cria novo operador diretamente no sistema.",
        fluxo: `1. Acessa Configurações → Usuários
2. Clica em "Novo Operador"
3. Preenche dados: nome, email, telefone
4. Seleciona perfil de acesso
5. Define se requer 2FA
6. Sistema envia convite por email
7. Operador ativa conta no primeiro acesso`,
        regras: [
          { id: "RNC-44-01", descricao: "Email deve ser único no tenant", criticidade: "Alta" },
          { id: "RNC-44-02", descricao: "Perfil obrigatório para definir permissões", criticidade: "Alta" },
          { id: "RNC-44-03", descricao: "Convite expira em 7 dias", criticidade: "Média" },
          { id: "RNC-44-04", descricao: "Limite de operadores conforme plano do ISP", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-45",
        titulo: "Atribuir Perfil ao Operador",
        modulo: "Usuários e Perfis",
        resumo: "Admin do ISP atribui ou altera perfil de acesso do operador.",
        fluxo: `1. Acessa lista de operadores
2. Seleciona operador
3. Clica em "Alterar Perfil"
4. Visualiza perfis disponíveis
5. Seleciona novo perfil
6. Confirma alteração
7. Permissões atualizadas imediatamente`,
        regras: [
          { id: "RNC-45-01", descricao: "Apenas Admin do ISP pode alterar perfis", criticidade: "Alta" },
          { id: "RNC-45-02", descricao: "Alteração registrada em auditoria", criticidade: "Alta" },
          { id: "RNC-45-03", descricao: "Sessões ativas do operador são invalidadas", criticidade: "Média" },
        ],
      },
      {
        id: "JC-46",
        titulo: "Editar Permissões (RBAC Granular)",
        modulo: "Usuários e Perfis",
        resumo: "Admin do ISP customiza permissões de um perfil.",
        fluxo: `1. Acessa Configurações → Perfis
2. Seleciona perfil para editar
3. Visualiza matriz de permissões
4. Ativa/desativa permissões granulares
5. Salva alterações
6. Permissões aplicadas a todos do perfil`,
        regras: [
          { id: "RNC-46-01", descricao: "Perfis pré-definidos podem ser clonados, não editados", criticidade: "Alta" },
          { id: "RNC-46-02", descricao: "Permissões agrupadas por módulo", criticidade: "Média" },
          { id: "RNC-46-03", descricao: "Auditoria de todas as alterações de perfil", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-47",
        titulo: "Ativar/Desativar Operador",
        modulo: "Usuários e Perfis",
        resumo: "Admin do ISP ativa ou desativa acesso de operador.",
        fluxo: `1. Acessa lista de operadores
2. Localiza operador
3. Clica em toggle de status
4. Confirma ação
5. Se desativar: sessões encerradas, acesso bloqueado
6. Se ativar: acesso restaurado`,
        regras: [
          { id: "RNC-47-01", descricao: "Desativação não exclui dados, apenas bloqueia acesso", criticidade: "Alta" },
          { id: "RNC-47-02", descricao: "Sessões ativas encerradas imediatamente", criticidade: "Alta" },
          { id: "RNC-47-03", descricao: "Operador desativado não conta no limite do plano", criticidade: "Média" },
        ],
      },
      {
        id: "JC-48",
        titulo: "Excluir Operador",
        modulo: "Usuários e Perfis",
        resumo: "Admin do ISP remove operador permanentemente.",
        fluxo: `1. Acessa lista de operadores
2. Seleciona operador
3. Clica em "Excluir"
4. Sistema exibe aviso sobre irreversibilidade
5. Solicita confirmação com senha do Admin
6. Operador removido
7. Histórico de ações mantido para auditoria`,
        regras: [
          { id: "RNC-48-01", descricao: "Exclusão requer confirmação com senha", criticidade: "Alta" },
          { id: "RNC-48-02", descricao: "Histórico de atendimentos do operador é mantido", criticidade: "Alta" },
          { id: "RNC-48-03", descricao: "Ação irreversível registrada em auditoria", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "integracoes",
    titulo: "Integrações",
    icon: Plug,
    jornadas: [
      {
        id: "JC-49",
        titulo: "Configurar Integração com ERP",
        modulo: "Integrações",
        resumo: "Admin do ISP configura conexão com sistema ERP.",
        fluxo: `1. Acessa Configurações → Integrações
2. Seleciona ERP (IXCSoft, MK Solutions, etc.)
3. Insere credenciais de API
4. Configura mapeamento de campos
5. Salva configuração
6. Sistema testa conexão automaticamente`,
        regras: [
          { id: "RNC-49-01", descricao: "ERPs homologados: IXCSoft, MK Solutions, SGP, Hubsoft", criticidade: "Alta" },
          { id: "RNC-49-02", descricao: "Credenciais armazenadas criptografadas", criticidade: "Alta" },
          { id: "RNC-49-03", descricao: "Mapeamento de campos obrigatório para sincronização", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-50",
        titulo: "Testar Conexão com ERP",
        modulo: "Integrações",
        resumo: "Operador executa teste manual de conexão com ERP.",
        fluxo: `1. Acessa configuração do ERP
2. Clica em "Testar Conexão"
3. Sistema envia requisição de teste
4. Valida autenticação e permissões
5. Exibe resultado: sucesso ou erro detalhado
6. Se sucesso, habilita sincronização`,
        regras: [
          { id: "RNC-50-01", descricao: "Teste verifica autenticação e endpoints principais", criticidade: "Alta" },
          { id: "RNC-50-02", descricao: "Erros exibidos com orientação de correção", criticidade: "Média" },
          { id: "RNC-50-03", descricao: "Log do teste disponível para diagnóstico", criticidade: "Média" },
        ],
      },
      {
        id: "JC-51",
        titulo: "Configurar Sistema de Monitoramento",
        modulo: "Integrações",
        resumo: "Admin do ISP configura conexão com sistema de monitoramento.",
        fluxo: `1. Acessa Configurações → Integrações
2. Seleciona tipo (Zabbix, PRTG, LibreNMS)
3. Insere URL e credenciais
4. Configura quais alertas sincronizar
5. Define mapeamento de severidades
6. Salva e testa conexão`,
        regras: [
          { id: "RNC-51-01", descricao: "Sistemas suportados: Zabbix, PRTG, LibreNMS", criticidade: "Alta" },
          { id: "RNC-51-02", descricao: "Webhook para receber alertas em tempo real", criticidade: "Alta" },
          { id: "RNC-51-03", descricao: "Mapeamento de severidade configurável", criticidade: "Média" },
        ],
      },
      {
        id: "JC-52",
        titulo: "Testar Conexão com Monitoramento",
        modulo: "Integrações",
        resumo: "Operador executa teste manual de conexão com monitoramento.",
        fluxo: `1. Acessa configuração do monitoramento
2. Clica em "Testar Conexão"
3. Sistema consulta API do sistema
4. Valida acesso e lista hosts
5. Exibe resultado com quantidade de ativos
6. Se sucesso, inicia sincronização`,
        regras: [
          { id: "RNC-52-01", descricao: "Teste lista primeiros 10 hosts para validação", criticidade: "Média" },
          { id: "RNC-52-02", descricao: "Sincronização inicial pode levar minutos", criticidade: "Baixa" },
          { id: "RNC-52-03", descricao: "Erros de conexão logados para suporte", criticidade: "Média" },
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
        id: "JC-53",
        titulo: "Configurar Identidade Visual",
        modulo: "Configurações",
        resumo: "Admin do ISP personaliza identidade visual da plataforma.",
        fluxo: `1. Acessa Configurações → Identidade Visual
2. Faz upload do logo
3. Define cores primárias e secundárias
4. Configura favicon
5. Pré-visualiza alterações
6. Salva configuração
7. Alterações refletidas em toda a plataforma`,
        regras: [
          { id: "RNC-53-01", descricao: "Logo: PNG/SVG, máximo 2MB", criticidade: "Baixa" },
          { id: "RNC-53-02", descricao: "Cores aplicadas ao widget de webchat também", criticidade: "Média" },
          { id: "RNC-53-03", descricao: "Cache de assets atualizado em até 5 minutos", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-54",
        titulo: "Editar Dados da Empresa",
        modulo: "Configurações",
        resumo: "Admin do ISP atualiza informações cadastrais.",
        fluxo: `1. Acessa Configurações → Dados da Empresa
2. Edita campos: razão social, CNPJ, endereço
3. Atualiza informações de contato
4. Salva alterações
5. Dados usados em comunicações e documentos`,
        regras: [
          { id: "RNC-54-01", descricao: "CNPJ validado e não pode ser alterado após setup", criticidade: "Alta" },
          { id: "RNC-54-02", descricao: "Endereço usado para geração de documentos fiscais", criticidade: "Média" },
          { id: "RNC-54-03", descricao: "Alterações registradas em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JC-55",
        titulo: "Configurar Horário de Atendimento",
        modulo: "Configurações",
        resumo: "Admin do ISP define horários de funcionamento.",
        fluxo: `1. Acessa Configurações → Horário de Atendimento
2. Define horário por dia da semana
3. Configura feriados e exceções
4. Define mensagem fora do horário
5. Configura comportamento da IA fora do horário
6. Salva configurações`,
        regras: [
          { id: "RNC-55-01", descricao: "IA pode atender 24/7 se configurado", criticidade: "Média" },
          { id: "RNC-55-02", descricao: "Mensagem fora do horário customizável", criticidade: "Baixa" },
          { id: "RNC-55-03", descricao: "Feriados podem ser importados automaticamente", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-56",
        titulo: "Configurar Políticas de Segurança",
        modulo: "Configurações",
        resumo: "Admin do ISP define políticas de segurança da conta.",
        fluxo: `1. Acessa Configurações → Segurança
2. Define requisitos de senha (complexidade, expiração)
3. Configura 2FA obrigatório por perfil
4. Define tempo de inatividade para logout
5. Configura IPs permitidos (whitelist)
6. Salva políticas`,
        regras: [
          { id: "RNC-56-01", descricao: "Políticas do Admin AutoISP são mínimas obrigatórias", criticidade: "Alta" },
          { id: "RNC-56-02", descricao: "2FA pode ser obrigatório para perfis específicos", criticidade: "Alta" },
          { id: "RNC-56-03", descricao: "Whitelist de IP opcional e editável", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "relatorios",
    titulo: "Relatórios",
    icon: FileText,
    jornadas: [
      {
        id: "JC-57",
        titulo: "Gerar Relatório de Atendimentos",
        modulo: "Relatórios",
        resumo: "Operador gera relatório detalhado de atendimentos.",
        fluxo: `1. Acessa módulo de Relatórios
2. Seleciona "Relatório de Atendimentos"
3. Define período e filtros (canal, operador, status)
4. Clica em "Gerar Relatório"
5. Sistema processa dados
6. Exibe prévia na tela
7. Pode exportar em CSV ou PDF`,
        regras: [
          { id: "RNC-57-01", descricao: "Período máximo de 90 dias por relatório", criticidade: "Média" },
          { id: "RNC-57-02", descricao: "Dados sensíveis omitidos para perfis básicos", criticidade: "Alta" },
          { id: "RNC-57-03", descricao: "Relatório gerado de forma assíncrona se > 10k registros", criticidade: "Média" },
        ],
      },
      {
        id: "JC-58",
        titulo: "Gerar Relatório de Monitoramento",
        modulo: "Relatórios",
        resumo: "Operador gera relatório de eventos de monitoramento.",
        fluxo: `1. Acessa Relatórios → Monitoramento
2. Seleciona tipo (alertas, uptime, performance)
3. Define período e ativos
4. Gera relatório
5. Visualiza gráficos e métricas
6. Exporta se necessário`,
        regras: [
          { id: "RNC-58-01", descricao: "Dados de uptime calculados com base em alertas", criticidade: "Alta" },
          { id: "RNC-58-02", descricao: "Gráficos interativos para análise", criticidade: "Média" },
          { id: "RNC-58-03", descricao: "Comparativo com período anterior disponível", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-59",
        titulo: "Gerar Relatório de Comunicação",
        modulo: "Relatórios",
        resumo: "Operador gera relatório de campanhas e disparos.",
        fluxo: `1. Acessa Relatórios → Comunicação
2. Seleciona tipo (disparos, campanhas, gatilhos)
3. Define período
4. Gera relatório
5. Visualiza métricas: enviados, entregues, lidos
6. Analisa ROI de campanhas
7. Exporta dados`,
        regras: [
          { id: "RNC-59-01", descricao: "Métricas de leitura disponíveis apenas para WhatsApp", criticidade: "Baixa" },
          { id: "RNC-59-02", descricao: "Custo de SMS/WhatsApp incluído no relatório", criticidade: "Média" },
          { id: "RNC-59-03", descricao: "Segmentação por campanha ou período", criticidade: "Média" },
        ],
      },
      {
        id: "JC-60",
        titulo: "Exportar Relatório (CSV/PDF)",
        modulo: "Relatórios",
        resumo: "Operador exporta relatório gerado em formato desejado.",
        fluxo: `1. Após gerar relatório na tela
2. Clica em "Exportar"
3. Seleciona formato: CSV ou PDF
4. Sistema gera arquivo
5. Download iniciado automaticamente
6. Arquivo disponível por 24h no histórico`,
        regras: [
          { id: "RNC-60-01", descricao: "CSV para dados brutos, PDF para apresentação", criticidade: "Baixa" },
          { id: "RNC-60-02", descricao: "PDF inclui logo e identidade visual do ISP", criticidade: "Baixa" },
          { id: "RNC-60-03", descricao: "Limite de 100k linhas para exportação CSV", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "auditoria",
    titulo: "Auditoria",
    icon: Shield,
    jornadas: [
      {
        id: "JC-61",
        titulo: "Visualizar Logs de Auditoria",
        modulo: "Auditoria",
        resumo: "Admin do ISP consulta logs de ações do sistema.",
        fluxo: `1. Acessa Configurações → Auditoria
2. Visualiza lista de eventos recentes
3. Cada evento mostra: ação, operador, data/hora, IP
4. Clica em evento para detalhes
5. Visualiza dados antes/depois (quando aplicável)`,
        regras: [
          { id: "RNC-61-01", descricao: "Logs mantidos por 1 ano", criticidade: "Alta" },
          { id: "RNC-61-02", descricao: "Logs não podem ser editados ou excluídos", criticidade: "Alta" },
          { id: "RNC-61-03", descricao: "Acesso restrito a Admin e Supervisor", criticidade: "Alta" },
        ],
      },
      {
        id: "JC-62",
        titulo: "Filtrar Logs por Evento/Operador",
        modulo: "Auditoria",
        resumo: "Admin do ISP filtra logs de auditoria por critérios.",
        fluxo: `1. Na tela de auditoria
2. Aplica filtros: tipo de evento, operador, período
3. Sistema retorna logs filtrados
4. Pode combinar múltiplos filtros
5. Exporta resultado se necessário`,
        regras: [
          { id: "RNC-62-01", descricao: "Filtros combinados com operador AND", criticidade: "Baixa" },
          { id: "RNC-62-02", descricao: "Período máximo de 90 dias por consulta", criticidade: "Média" },
          { id: "RNC-62-03", descricao: "Exportação disponível em CSV", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "help-center",
    titulo: "Help Center",
    icon: HelpCircle,
    jornadas: [
      {
        id: "JC-63",
        titulo: "Acessar Tutoriais",
        modulo: "Help Center",
        resumo: "Operador acessa tutoriais de uso da plataforma.",
        fluxo: `1. Clica no ícone de ajuda (?)
2. Acessa seção "Tutoriais"
3. Navega por categorias
4. Seleciona tutorial desejado
5. Visualiza conteúdo (texto, imagens, vídeos)
6. Pode marcar como favorito`,
        regras: [
          { id: "RNC-63-01", descricao: "Tutoriais mantidos pela equipe AutoISP", criticidade: "Baixa" },
          { id: "RNC-63-02", descricao: "Busca por palavra-chave disponível", criticidade: "Baixa" },
          { id: "RNC-63-03", descricao: "Tutoriais organizados por módulo", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-64",
        titulo: "Consultar FAQ",
        modulo: "Help Center",
        resumo: "Operador consulta perguntas frequentes.",
        fluxo: `1. Acessa Help Center → FAQ
2. Visualiza categorias de perguntas
3. Expande categoria desejada
4. Lê resposta
5. Pode avaliar se resposta foi útil
6. Se não resolver, link para suporte`,
        regras: [
          { id: "RNC-64-01", descricao: "FAQ atualizado semanalmente", criticidade: "Baixa" },
          { id: "RNC-64-02", descricao: "Feedback de utilidade coletado", criticidade: "Baixa" },
          { id: "RNC-64-03", descricao: "Perguntas mais acessadas destacadas", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-65",
        titulo: "Abrir Chat com Suporte AutoISP",
        modulo: "Help Center",
        resumo: "Operador inicia conversa com chatbot de suporte da AutoISP.",
        fluxo: `1. Acessa Help Center → Suporte
2. Clica em "Iniciar Chat"
3. Chatbot AutoISP inicia conversa
4. Operador descreve problema
5. Chatbot tenta resolver ou escala
6. Se necessário, cria ticket de suporte
7. Operador acompanha status do ticket`,
        regras: [
          { id: "RNC-65-01", descricao: "Chatbot disponível 24/7", criticidade: "Média" },
          { id: "RNC-65-02", descricao: "Escalação para humano em horário comercial", criticidade: "Média" },
          { id: "RNC-65-03", descricao: "Tickets respondidos em até 24h úteis", criticidade: "Média" },
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
        id: "JC-66",
        titulo: "Receber Notificação In-App",
        modulo: "Notificações",
        resumo: "Operador recebe notificação em tempo real na plataforma.",
        fluxo: `1. Evento dispara notificação (novo atendimento, alerta)
2. Sistema envia via WebSocket
3. Ícone de sino exibe badge com contagem
4. Operador clica no sino
5. Visualiza lista de notificações
6. Clica para ir ao contexto
7. Notificação marcada como lida`,
        regras: [
          { id: "RNC-66-01", descricao: "Notificações em tempo real via WebSocket", criticidade: "Alta" },
          { id: "RNC-66-02", descricao: "Badge mostra contagem de não lidas", criticidade: "Baixa" },
          { id: "RNC-66-03", descricao: "Histórico de notificações mantido por 30 dias", criticidade: "Baixa" },
        ],
      },
      {
        id: "JC-67",
        titulo: "Receber Notificação por Email",
        modulo: "Notificações",
        resumo: "Operador recebe notificação por email.",
        fluxo: `1. Evento dispara notificação (conforme config)
2. Sistema envia email para operador
3. Email contém resumo e link de ação
4. Operador clica no link
5. Redireciona para plataforma (com login se necessário)
6. Visualiza contexto do evento`,
        regras: [
          { id: "RNC-67-01", descricao: "Email enviado apenas para eventos configurados", criticidade: "Média" },
          { id: "RNC-67-02", descricao: "Link de ação válido por 7 dias", criticidade: "Baixa" },
          { id: "RNC-67-03", descricao: "Opção de unsubscribe por tipo de notificação", criticidade: "Média" },
        ],
      },
      {
        id: "JC-68",
        titulo: "Receber Notificação por SMS",
        modulo: "Notificações",
        resumo: "Operador recebe notificação crítica por SMS.",
        fluxo: `1. Evento crítico dispara notificação
2. Sistema envia SMS para telefone do operador
3. SMS contém resumo curto do evento
4. Operador acessa plataforma para detalhes`,
        regras: [
          { id: "RNC-68-01", descricao: "SMS apenas para eventos críticos", criticidade: "Alta" },
          { id: "RNC-68-02", descricao: "Limite de 160 caracteres", criticidade: "Baixa" },
          { id: "RNC-68-03", descricao: "Custo de SMS debitado da conta do ISP", criticidade: "Média" },
          { id: "RNC-68-04", descricao: "Operador pode desabilitar SMS nas preferências", criticidade: "Média" },
        ],
      },
    ],
  },
];

const getBadgeVariant = (criticidade: string) => {
  switch (criticidade) {
    case "Alta":
      return "destructive";
    case "Média":
      return "default";
    case "Baixa":
      return "secondary";
    default:
      return "outline";
  }
};

const JornadasClienteSection = () => {
  const totalJornadas = categoriasJornadas.reduce(
    (acc, cat) => acc + cat.jornadas.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Jornadas do Painel Cliente (ISP)
            </h2>
            <p className="mt-1 text-muted-foreground">
              Documentação completa das jornadas de uso para operadores do ISP
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold text-primary">
              {totalJornadas}
            </span>
            <span className="text-sm text-muted-foreground">jornadas</span>
          </div>
        </div>
      </div>

      {/* Resumo por categoria */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {categoriasJornadas.map((categoria) => {
          const Icon = categoria.icon;
          return (
            <Card key={categoria.id} className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xs font-medium">
                    {categoria.titulo}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">
                  {categoria.jornadas.length}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Jornadas por categoria */}
      <Accordion type="multiple" className="space-y-4">
        {categoriasJornadas.map((categoria) => {
          const Icon = categoria.icon;
          return (
            <AccordionItem
              key={categoria.id}
              value={categoria.id}
              className="rounded-xl border border-border bg-card px-6"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">
                      {categoria.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {categoria.jornadas.length} jornadas documentadas
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-6">
                  {categoria.jornadas.map((jornada) => (
                    <div
                      key={jornada.id}
                      className="rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {jornada.id}
                            </Badge>
                            <h4 className="text-base font-semibold text-foreground">
                              {jornada.titulo}
                            </h4>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {jornada.resumo}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="mb-2 text-sm font-medium text-foreground">
                          Fluxo
                        </h5>
                        <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs text-muted-foreground">
                          {jornada.fluxo}
                        </pre>
                      </div>

                      <div>
                        <h5 className="mb-2 text-sm font-medium text-foreground">
                          Regras de Negócio
                        </h5>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">ID</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="w-[100px] text-right">
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
                                <TableCell className="text-right">
                                  <Badge variant={getBadgeVariant(regra.criticidade)}>
                                    {regra.criticidade}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
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

export default JornadasClienteSection;
