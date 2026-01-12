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
  Globe,
  Search,
  CreditCard,
  Bot,
  UserPlus,
  ClipboardCheck,
  ShoppingCart,
  Clock,
  XCircle,
  FileText,
  Phone,
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
    id: "navegacao",
    titulo: "Navegação e Descoberta",
    icon: Globe,
    jornadas: [
      {
        id: "JL-01",
        titulo: "Acessar Landing Page via Busca Orgânica",
        modulo: "Navegação",
        resumo: "ISP prospect encontra a landing page do AutoISP através de busca no Google.",
        fluxo: `1. Prospect pesquisa termo relacionado (ex: "sistema para provedor de internet")
2. Landing Page aparece nos resultados orgânicos
3. Prospect clica no link
4. Sistema registra origem (utm_source=organic)
5. Carrega página otimizada para o termo buscado`,
        regras: [
          { id: "RNL-01-01", descricao: "Meta tags SEO otimizadas para termos de busca", criticidade: "Alta" },
          { id: "RNL-01-02", descricao: "Rastrear origem da visita via UTM", criticidade: "Média" },
          { id: "RNL-01-03", descricao: "Página com Core Web Vitals otimizados", criticidade: "Média" },
        ],
      },
      {
        id: "JL-02",
        titulo: "Acessar Landing Page via Anúncio Pago",
        modulo: "Navegação",
        resumo: "ISP prospect chega à landing page através de anúncio pago (Google Ads, Meta Ads).",
        fluxo: `1. Prospect visualiza anúncio patrocinado
2. Clica no anúncio
3. Sistema registra origem (utm_source, utm_campaign, utm_medium)
4. Redireciona para landing page específica da campanha
5. Exibe conteúdo alinhado com o anúncio`,
        regras: [
          { id: "RNL-02-01", descricao: "Landing pages específicas por campanha", criticidade: "Alta" },
          { id: "RNL-02-02", descricao: "Pixel de conversão configurado", criticidade: "Alta" },
          { id: "RNL-02-03", descricao: "UTMs obrigatórios em todas as campanhas", criticidade: "Média" },
        ],
      },
      {
        id: "JL-03",
        titulo: "Acessar Landing Page via Indicação",
        modulo: "Navegação",
        resumo: "ISP prospect acessa através de link de indicação de outro ISP cliente.",
        fluxo: `1. ISP cliente compartilha link de indicação
2. Prospect clica no link com código de referência
3. Sistema identifica indicador (ref=codigo_isp)
4. Registra relação prospect-indicador
5. Carrega landing page com banner de indicação`,
        regras: [
          { id: "RNL-03-01", descricao: "Código de referência único por ISP cliente", criticidade: "Alta" },
          { id: "RNL-03-02", descricao: "Vincular conversão ao indicador", criticidade: "Alta" },
          { id: "RNL-03-03", descricao: "Benefício para indicador configurável", criticidade: "Média" },
        ],
      },
      {
        id: "JL-04",
        titulo: "Acessar Landing Page via Redes Sociais",
        modulo: "Navegação",
        resumo: "ISP prospect chega através de post ou link em redes sociais.",
        fluxo: `1. Prospect visualiza post do AutoISP (LinkedIn, Instagram, etc.)
2. Clica no link do post
3. Sistema registra origem (utm_source=social)
4. Carrega landing page padrão
5. Exibe conteúdo relevante`,
        regras: [
          { id: "RNL-04-01", descricao: "Open Graph tags configuradas corretamente", criticidade: "Média" },
          { id: "RNL-04-02", descricao: "Preview de links otimizado por rede", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-05",
        titulo: "Navegar pela Página de Funcionalidades",
        modulo: "Navegação",
        resumo: "Prospect explora as funcionalidades do SaaS AutoISP.",
        fluxo: `1. Prospect acessa seção de Funcionalidades
2. Visualiza lista de módulos disponíveis
3. Expande detalhes de cada funcionalidade
4. Visualiza screenshots/demos
5. Pode clicar para iniciar trial ou falar com comercial`,
        regras: [
          { id: "RNL-05-01", descricao: "Funcionalidades agrupadas por categoria", criticidade: "Média" },
          { id: "RNL-05-02", descricao: "CTA visível em cada seção", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-06",
        titulo: "Visualizar Cases de Sucesso",
        modulo: "Navegação",
        resumo: "Prospect consulta cases de ISPs que já usam o AutoISP.",
        fluxo: `1. Prospect acessa seção de Cases
2. Visualiza lista de clientes/depoimentos
3. Filtra por tamanho de ISP ou região
4. Lê detalhes do case
5. Visualiza métricas de resultado`,
        regras: [
          { id: "RNL-06-01", descricao: "Cases com permissão do cliente", criticidade: "Alta" },
          { id: "RNL-06-02", descricao: "Métricas de resultado verificáveis", criticidade: "Média" },
        ],
      },
      {
        id: "JL-07",
        titulo: "Assistir Demonstrações Visuais",
        modulo: "Navegação",
        resumo: "Prospect visualiza screenshots e vídeos demonstrativos do produto.",
        fluxo: `1. Prospect acessa galeria de demos
2. Visualiza screenshots das telas
3. Assiste vídeos de demonstração
4. Pode pausar/avançar vídeos
5. CTA para testar após visualização`,
        regras: [
          { id: "RNL-07-01", descricao: "Vídeos com legendas/acessibilidade", criticidade: "Baixa" },
          { id: "RNL-07-02", descricao: "Lazy loading para performance", criticidade: "Média" },
        ],
      },
      {
        id: "JL-08",
        titulo: "Consultar FAQ",
        modulo: "Navegação",
        resumo: "Prospect consulta perguntas frequentes sobre o AutoISP.",
        fluxo: `1. Prospect acessa seção FAQ
2. Visualiza perguntas organizadas por categoria
3. Expande pergunta de interesse
4. Lê resposta detalhada
5. Pode sugerir nova pergunta via formulário`,
        regras: [
          { id: "RNL-08-01", descricao: "FAQ com schema markup para SEO", criticidade: "Média" },
          { id: "RNL-08-02", descricao: "Busca interna no FAQ", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "planos",
    titulo: "Planos e Preços",
    icon: CreditCard,
    jornadas: [
      {
        id: "JL-09",
        titulo: "Visualizar Lista de Planos",
        modulo: "Planos",
        resumo: "Prospect visualiza os planos disponíveis do SaaS AutoISP.",
        fluxo: `1. Prospect acessa /planos
2. Sistema carrega lista de planos ativos
3. Exibe cards com: nome, preço mensal, limites
4. Destaca plano mais popular
5. Mostra economia no plano anual`,
        regras: [
          { id: "RNL-09-01", descricao: "Preços sempre atualizados via CMS/API", criticidade: "Alta" },
          { id: "RNL-09-02", descricao: "Destacar plano mais popular visualmente", criticidade: "Média" },
          { id: "RNL-09-03", descricao: "Mostrar economia percentual no plano anual", criticidade: "Média" },
        ],
      },
      {
        id: "JL-10",
        titulo: "Comparar Funcionalidades entre Planos",
        modulo: "Planos",
        resumo: "Prospect compara o que está incluído em cada tier.",
        fluxo: `1. Prospect visualiza tabela comparativa
2. Linhas mostram funcionalidades
3. Colunas mostram planos (Starter/Pro/Enterprise)
4. Ícones indicam inclusão (✓) ou exclusão (-)
5. Tooltips explicam cada funcionalidade`,
        regras: [
          { id: "RNL-10-01", descricao: "Tabela responsiva em mobile", criticidade: "Alta" },
          { id: "RNL-10-02", descricao: "Funcionalidades ordenadas por importância", criticidade: "Média" },
        ],
      },
      {
        id: "JL-11",
        titulo: "Visualizar Limites de Uso por Plano",
        modulo: "Planos",
        resumo: "Prospect entende os limites de cada plano (assinantes, atendimentos, IA).",
        fluxo: `1. Prospect visualiza seção de limites
2. Exibe limite de assinantes por plano
3. Exibe limite de atendimentos mensais
4. Exibe capacidade de IA (mensagens/mês)
5. Indica se há overage ou bloqueio ao atingir limite`,
        regras: [
          { id: "RNL-11-01", descricao: "Limites claramente comunicados", criticidade: "Alta" },
          { id: "RNL-11-02", descricao: "Explicar política de overage", criticidade: "Média" },
        ],
      },
      {
        id: "JL-12",
        titulo: "Selecionar Plano e Iniciar Checkout",
        modulo: "Planos",
        resumo: "Prospect escolhe plano e é direcionado ao fluxo de checkout.",
        fluxo: `1. Prospect clica em "Assinar" no plano desejado
2. Sistema armazena plano selecionado
3. Redireciona para /checkout ou /cadastro
4. Plano aparece pré-selecionado
5. Prospect pode alterar antes de confirmar`,
        regras: [
          { id: "RNL-12-01", descricao: "Plano persistido na sessão", criticidade: "Alta" },
          { id: "RNL-12-02", descricao: "Permitir alteração no checkout", criticidade: "Média" },
        ],
      },
      {
        id: "JL-13",
        titulo: "Iniciar Conversa no Chat sobre Planos",
        modulo: "Planos",
        resumo: "Prospect inicia conversa com chatbot para tirar dúvidas sobre planos.",
        fluxo: `1. Prospect clica no widget de chat na página de planos
2. Chatbot identifica contexto (está em /planos)
3. Oferece ajuda sobre planos automaticamente
4. Prospect faz perguntas específicas
5. IA responde ou sugere falar com comercial`,
        regras: [
          { id: "RNL-13-01", descricao: "Chatbot ciente do contexto da página", criticidade: "Média" },
          { id: "RNL-13-02", descricao: "Base de conhecimento atualizada com planos", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "chatbot",
    titulo: "Chatbot IA",
    icon: Bot,
    jornadas: [
      {
        id: "JL-14",
        titulo: "Iniciar Conversa com Chatbot",
        modulo: "Chatbot",
        resumo: "Prospect inicia conversa com o chatbot do AutoISP.",
        fluxo: `1. Prospect visualiza widget de chat no canto da tela
2. Clica no ícone do chat
3. Widget expande mostrando mensagem de boas-vindas
4. Chatbot se apresenta e oferece opções
5. Prospect escolhe opção ou digita pergunta`,
        regras: [
          { id: "RNL-14-01", descricao: "Widget não intrusivo (não abrir automaticamente)", criticidade: "Média" },
          { id: "RNL-14-02", descricao: "Mensagem de boas-vindas configurável", criticidade: "Baixa" },
          { id: "RNL-14-03", descricao: "Disponível 24/7", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-15",
        titulo: "Tirar Dúvidas sobre o AutoISP",
        modulo: "Chatbot",
        resumo: "Prospect faz perguntas sobre o produto e recebe respostas da IA.",
        fluxo: `1. Prospect digita pergunta no chat
2. IA processa usando base de conhecimento
3. Retorna resposta contextualizada
4. Oferece links para mais informações
5. Pergunta se ajudou ou se precisa de mais ajuda`,
        regras: [
          { id: "RNL-15-01", descricao: "Respostas baseadas em FAQ e docs oficiais", criticidade: "Alta" },
          { id: "RNL-15-02", descricao: "Limite de tokens por resposta para clareza", criticidade: "Média" },
          { id: "RNL-15-03", descricao: "Escalar para humano se não souber", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-16",
        titulo: "Receber Recomendação de Plano Ideal",
        modulo: "Chatbot",
        resumo: "Chatbot recomenda plano baseado no perfil do prospect.",
        fluxo: `1. Chatbot pergunta sobre o ISP (tamanho, assinantes, canais)
2. Prospect responde perguntas
3. IA analisa respostas
4. Recomenda plano mais adequado
5. Explica motivo da recomendação
6. Oferece link para assinar`,
        regras: [
          { id: "RNL-16-01", descricao: "Perguntas de qualificação definidas", criticidade: "Alta" },
          { id: "RNL-16-02", descricao: "Lógica de recomendação documentada", criticidade: "Média" },
          { id: "RNL-16-03", descricao: "Permitir escolher plano diferente", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-17",
        titulo: "Captar Lead via Chatbot",
        modulo: "Chatbot",
        resumo: "Chatbot coleta dados do prospect para follow-up comercial.",
        fluxo: `1. Durante conversa, chatbot identifica interesse
2. Solicita dados: nome, email, telefone
3. Prospect fornece informações
4. Sistema registra lead com origem=chatbot
5. Envia para CRM/equipe comercial
6. Confirma ao prospect que entrarão em contato`,
        regras: [
          { id: "RNL-17-01", descricao: "LGPD: consentimento antes de coletar dados", criticidade: "Alta" },
          { id: "RNL-17-02", descricao: "Lead enviado em tempo real para CRM", criticidade: "Alta" },
          { id: "RNL-17-03", descricao: "Email de confirmação automático", criticidade: "Média" },
        ],
      },
      {
        id: "JL-18",
        titulo: "Transferir para Atendente Humano",
        modulo: "Chatbot",
        resumo: "Chatbot transfere conversa para atendente quando necessário.",
        fluxo: `1. Prospect solicita falar com humano ou IA não consegue resolver
2. Chatbot pergunta se deseja transferir
3. Prospect confirma
4. Sistema notifica equipe comercial (email/WhatsApp)
5. Informa prospect sobre tempo de espera
6. Atendente assume conversa`,
        regras: [
          { id: "RNL-18-01", descricao: "Transferência disponível em horário comercial", criticidade: "Alta" },
          { id: "RNL-18-02", descricao: "Fora do horário: coletar contato para retorno", criticidade: "Alta" },
          { id: "RNL-18-03", descricao: "Histórico da conversa visível ao atendente", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "captacao",
    titulo: "Captação de Lead",
    icon: UserPlus,
    jornadas: [
      {
        id: "JL-19",
        titulo: "Preencher Formulário de Contato",
        modulo: "Captação",
        resumo: "Prospect preenche formulário para receber contato comercial.",
        fluxo: `1. Prospect acessa formulário de contato
2. Preenche campos obrigatórios: nome, email, telefone
3. Informa tamanho do ISP (opcional)
4. Aceita termos de privacidade
5. Clica em Enviar
6. Sistema valida e registra lead`,
        regras: [
          { id: "RNL-19-01", descricao: "Campos obrigatórios: nome, email, telefone", criticidade: "Alta" },
          { id: "RNL-19-02", descricao: "Aceite de LGPD obrigatório", criticidade: "Alta" },
          { id: "RNL-19-03", descricao: "Validação de email em tempo real", criticidade: "Média" },
        ],
      },
      {
        id: "JL-20",
        titulo: "Receber Confirmação na Tela",
        modulo: "Captação",
        resumo: "Prospect vê confirmação após enviar formulário.",
        fluxo: `1. Formulário enviado com sucesso
2. Sistema exibe mensagem de sucesso
3. Informa próximos passos
4. Oferece opções adicionais (WhatsApp, trial)
5. Registra evento de conversão`,
        regras: [
          { id: "RNL-20-01", descricao: "Mensagem clara de confirmação", criticidade: "Alta" },
          { id: "RNL-20-02", descricao: "Não permitir envio duplicado", criticidade: "Média" },
        ],
      },
      {
        id: "JL-21",
        titulo: "Receber Email de Confirmação",
        modulo: "Captação",
        resumo: "Prospect recebe email confirmando interesse.",
        fluxo: `1. Lead registrado no sistema
2. Dispara email automático de confirmação
3. Email contém: agradecimento, próximos passos, contatos
4. Inclui links úteis (planos, FAQ, demo)
5. Registra envio do email`,
        regras: [
          { id: "RNL-21-01", descricao: "Email enviado em até 1 minuto", criticidade: "Alta" },
          { id: "RNL-21-02", descricao: "Template profissional com branding", criticidade: "Média" },
          { id: "RNL-21-03", descricao: "Incluir opção de descadastro", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-22",
        titulo: "Receber WhatsApp de Boas-vindas",
        modulo: "Captação",
        resumo: "Prospect recebe mensagem no WhatsApp após registro.",
        fluxo: `1. Lead registrado com telefone válido
2. Sistema dispara mensagem template do WhatsApp
3. Mensagem apresenta o AutoISP
4. Oferece opção de agendar demonstração
5. Registra entrega da mensagem`,
        regras: [
          { id: "RNL-22-01", descricao: "Usar template aprovado pela Meta", criticidade: "Alta" },
          { id: "RNL-22-02", descricao: "Respeitar janela de 24h para mensagens", criticidade: "Alta" },
          { id: "RNL-22-03", descricao: "Opt-in necessário para comunicações futuras", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "cadastro",
    titulo: "Cadastro e Trial",
    icon: ClipboardCheck,
    jornadas: [
      {
        id: "JL-23",
        titulo: "Iniciar Cadastro para Trial",
        modulo: "Cadastro",
        resumo: "Prospect inicia processo de cadastro para trial gratuito.",
        fluxo: `1. Prospect clica em "Testar Grátis"
2. Sistema exibe formulário de cadastro em steps
3. Step 1: Dados do responsável
4. Step 2: Dados da empresa
5. Step 3: Perfil do provedor
6. Step 4: Seleção de plano`,
        regras: [
          { id: "RNL-23-01", descricao: "Formulário em múltiplos steps para UX", criticidade: "Média" },
          { id: "RNL-23-02", descricao: "Progresso salvo entre steps", criticidade: "Média" },
          { id: "RNL-23-03", descricao: "Validação em tempo real", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-24",
        titulo: "Preencher Dados do Responsável",
        modulo: "Cadastro",
        resumo: "Prospect informa dados pessoais do responsável pelo ISP.",
        fluxo: `1. Exibe formulário de dados pessoais
2. Campos: nome completo, email, telefone, cargo
3. Valida email (formato e duplicidade)
4. Valida telefone (formato brasileiro)
5. Permite avançar para próximo step`,
        regras: [
          { id: "RNL-24-01", descricao: "Email deve ser único no sistema", criticidade: "Alta" },
          { id: "RNL-24-02", descricao: "Preferir email corporativo (não gmail/hotmail)", criticidade: "Média" },
          { id: "RNL-24-03", descricao: "Telefone no formato brasileiro", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-25",
        titulo: "Preencher Dados da Empresa",
        modulo: "Cadastro",
        resumo: "Prospect informa dados do ISP (CNPJ, razão social, endereço).",
        fluxo: `1. Exibe formulário de dados empresariais
2. Prospect informa CNPJ
3. Sistema consulta API da Receita
4. Preenche automaticamente razão social e endereço
5. Prospect confirma ou ajusta dados
6. Valida CNPJ único no sistema`,
        regras: [
          { id: "RNL-25-01", descricao: "CNPJ validado via API Receita Federal", criticidade: "Alta" },
          { id: "RNL-25-02", descricao: "CNPJ deve ser único no sistema", criticidade: "Alta" },
          { id: "RNL-25-03", descricao: "Permitir ajuste manual do endereço", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-26",
        titulo: "Preencher Perfil do Provedor",
        modulo: "Cadastro",
        resumo: "Prospect informa características do ISP para personalização.",
        fluxo: `1. Exibe formulário de perfil
2. Campos: qtd assinantes, canais utilizados, ERP atual
3. Prospect seleciona opções
4. Sistema usa dados para recomendar plano
5. Dados usados para onboarding personalizado`,
        regras: [
          { id: "RNL-26-01", descricao: "Campos opcionais mas incentivados", criticidade: "Baixa" },
          { id: "RNL-26-02", descricao: "Dados usados para segmentação", criticidade: "Média" },
        ],
      },
      {
        id: "JL-27",
        titulo: "Selecionar Plano de Interesse",
        modulo: "Cadastro",
        resumo: "Prospect escolhe plano desejado para o trial.",
        fluxo: `1. Exibe opções de planos
2. Sistema pode pré-selecionar baseado no perfil
3. Prospect visualiza comparativo resumido
4. Seleciona plano de interesse
5. Confirma seleção`,
        regras: [
          { id: "RNL-27-01", descricao: "Trial dá acesso ao plano selecionado", criticidade: "Alta" },
          { id: "RNL-27-02", descricao: "Funcionalidades limitadas durante trial", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-28",
        titulo: "Confirmar Cadastro e Ativar Trial",
        modulo: "Cadastro",
        resumo: "Prospect finaliza cadastro e recebe acesso ao trial.",
        fluxo: `1. Prospect revisa dados informados
2. Aceita termos de uso e privacidade
3. Clica em "Criar Conta"
4. Sistema cria tenant isolado
5. Gera credenciais de acesso
6. Ativa trial de 7 dias
7. Redireciona para Painel Cliente`,
        regras: [
          { id: "RNL-28-01", descricao: "Tenant isolado criado automaticamente", criticidade: "Alta" },
          { id: "RNL-28-02", descricao: "Trial de 7 dias iniciado imediatamente", criticidade: "Alta" },
          { id: "RNL-28-03", descricao: "Aceite de termos obrigatório", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-29",
        titulo: "Acessar Painel Cliente (Primeiro Acesso)",
        modulo: "Cadastro",
        resumo: "Novo ISP acessa o painel pela primeira vez após cadastro.",
        fluxo: `1. Cadastro concluído
2. Sistema redireciona para Dashboard
3. Exibe tour de onboarding
4. Destaca primeiros passos recomendados
5. Oferece ajuda via chatbot`,
        regras: [
          { id: "RNL-29-01", descricao: "Tour de onboarding no primeiro acesso", criticidade: "Média" },
          { id: "RNL-29-02", descricao: "Checklist de configuração inicial", criticidade: "Média" },
          { id: "RNL-29-03", descricao: "Badge 'Trial' visível no painel", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-30",
        titulo: "Receber Email de Boas-vindas",
        modulo: "Cadastro",
        resumo: "Novo ISP recebe email de boas-vindas com informações úteis.",
        fluxo: `1. Cadastro concluído
2. Sistema dispara email de boas-vindas
3. Email contém: credenciais, link de acesso, próximos passos
4. Inclui link para documentação
5. Informa prazo do trial (7 dias)`,
        regras: [
          { id: "RNL-30-01", descricao: "Email enviado imediatamente após cadastro", criticidade: "Alta" },
          { id: "RNL-30-02", descricao: "Incluir credenciais de forma segura", criticidade: "Alta" },
          { id: "RNL-30-03", descricao: "Link direto para primeiro acesso", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "checkout",
    titulo: "Checkout (Conversão)",
    icon: ShoppingCart,
    jornadas: [
      {
        id: "JL-31",
        titulo: "Acessar Página de Checkout",
        modulo: "Checkout",
        resumo: "Prospect ou ISP em trial acessa página de checkout.",
        fluxo: `1. Usuário clica em "Assinar" ou "Fazer Upgrade"
2. Sistema redireciona para /checkout
3. Carrega dados do usuário (se logado)
4. Exibe resumo do plano selecionado
5. Mostra opções de pagamento`,
        regras: [
          { id: "RNL-31-01", descricao: "Checkout acessível com ou sem login", criticidade: "Alta" },
          { id: "RNL-31-02", descricao: "Pré-popular dados se usuário logado", criticidade: "Média" },
        ],
      },
      {
        id: "JL-32",
        titulo: "Revisar Plano Selecionado",
        modulo: "Checkout",
        resumo: "Usuário revisa detalhes do plano antes do pagamento.",
        fluxo: `1. Exibe card do plano selecionado
2. Mostra preço, ciclo (mensal/anual), limites
3. Permite alterar plano no checkout
4. Aplica cupom de desconto (se houver)
5. Atualiza valor total`,
        regras: [
          { id: "RNL-32-01", descricao: "Permitir troca de plano no checkout", criticidade: "Média" },
          { id: "RNL-32-02", descricao: "Cupom validado em tempo real", criticidade: "Média" },
          { id: "RNL-32-03", descricao: "Mostrar economia no plano anual", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-33",
        titulo: "Inserir Dados de Pagamento (Cartão)",
        modulo: "Checkout",
        resumo: "Usuário informa dados do cartão de crédito.",
        fluxo: `1. Seleciona forma de pagamento: Cartão
2. Informa número, validade, CVV, nome
3. Sistema valida dados via gateway
4. Tokeniza cartão para cobrança recorrente
5. Confirma validação`,
        regras: [
          { id: "RNL-33-01", descricao: "PCI-DSS: dados não armazenados localmente", criticidade: "Alta" },
          { id: "RNL-33-02", descricao: "Tokenização via Stripe/Asaas", criticidade: "Alta" },
          { id: "RNL-33-03", descricao: "Validação de cartão em tempo real", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-34",
        titulo: "Gerar Boleto Bancário",
        modulo: "Checkout",
        resumo: "Usuário opta por pagar via boleto.",
        fluxo: `1. Seleciona forma de pagamento: Boleto
2. Sistema gera boleto via gateway
3. Exibe código de barras e linha digitável
4. Envia boleto por email
5. Informa prazo de vencimento (3 dias)`,
        regras: [
          { id: "RNL-34-01", descricao: "Boleto com vencimento em 3 dias úteis", criticidade: "Alta" },
          { id: "RNL-34-02", descricao: "Acesso liberado após confirmação bancária", criticidade: "Alta" },
          { id: "RNL-34-03", descricao: "Lembrete automático antes do vencimento", criticidade: "Média" },
        ],
      },
      {
        id: "JL-35",
        titulo: "Gerar Código PIX",
        modulo: "Checkout",
        resumo: "Usuário opta por pagar via PIX.",
        fluxo: `1. Seleciona forma de pagamento: PIX
2. Sistema gera QR Code via gateway
3. Exibe QR Code e código copia-e-cola
4. Informa validade (30 minutos)
5. Aguarda confirmação em tempo real`,
        regras: [
          { id: "RNL-35-01", descricao: "QR Code válido por 30 minutos", criticidade: "Alta" },
          { id: "RNL-35-02", descricao: "Confirmação em tempo real via webhook", criticidade: "Alta" },
          { id: "RNL-35-03", descricao: "Permitir gerar novo código se expirar", criticidade: "Média" },
        ],
      },
      {
        id: "JL-36",
        titulo: "Confirmar Pagamento",
        modulo: "Checkout",
        resumo: "Sistema processa e confirma o pagamento.",
        fluxo: `1. Pagamento enviado ao gateway
2. Gateway processa transação
3. Webhook retorna status
4. Se aprovado: ativa assinatura
5. Se recusado: exibe erro e opções`,
        regras: [
          { id: "RNL-36-01", descricao: "Cartão: processamento síncrono", criticidade: "Alta" },
          { id: "RNL-36-02", descricao: "Boleto/PIX: aguardar webhook", criticidade: "Alta" },
          { id: "RNL-36-03", descricao: "Retry automático em caso de falha temporária", criticidade: "Média" },
        ],
      },
      {
        id: "JL-37",
        titulo: "Receber Confirmação de Contratação",
        modulo: "Checkout",
        resumo: "Usuário recebe confirmação da contratação.",
        fluxo: `1. Pagamento confirmado
2. Sistema envia email de confirmação
3. Email contém: plano, valor, próximos passos
4. Registra início da assinatura
5. Atualiza status no CRM`,
        regras: [
          { id: "RNL-37-01", descricao: "Email de confirmação imediato", criticidade: "Alta" },
          { id: "RNL-37-02", descricao: "Nota fiscal gerada automaticamente", criticidade: "Alta" },
          { id: "RNL-37-03", descricao: "Registro em auditoria", criticidade: "Média" },
        ],
      },
      {
        id: "JL-38",
        titulo: "Acessar Painel Cliente (Pós-Checkout)",
        modulo: "Checkout",
        resumo: "Usuário é redirecionado ao painel após pagamento.",
        fluxo: `1. Pagamento confirmado
2. Sistema atualiza permissões do tenant
3. Redireciona para Dashboard
4. Exibe mensagem de boas-vindas
5. Remove limitações do trial (se aplicável)`,
        regras: [
          { id: "RNL-38-01", descricao: "Permissões atualizadas imediatamente", criticidade: "Alta" },
          { id: "RNL-38-02", descricao: "Badge 'Trial' removido", criticidade: "Média" },
        ],
      },
    ],
  },
  {
    id: "trial",
    titulo: "Trial (Durante o Período)",
    icon: Clock,
    jornadas: [
      {
        id: "JL-39",
        titulo: "Usar Plataforma com Funcionalidades Limitadas",
        modulo: "Trial",
        resumo: "ISP em trial usa o sistema com restrições.",
        fluxo: `1. ISP acessa painel durante trial
2. Funcionalidades limitadas indicadas visualmente
3. Ao tentar acessar recurso bloqueado
4. Sistema exibe modal de upgrade
5. Oferece link para checkout`,
        regras: [
          { id: "RNL-39-01", descricao: "Trial expira em 7 dias", criticidade: "Alta" },
          { id: "RNL-39-02", descricao: "Limite de atendimentos (ex: 100/mês)", criticidade: "Alta" },
          { id: "RNL-39-03", descricao: "IA com funcionalidades básicas", criticidade: "Média" },
          { id: "RNL-39-04", descricao: "Badge 'Trial' sempre visível", criticidade: "Média" },
        ],
      },
      {
        id: "JL-40",
        titulo: "Visualizar Alerta de Upgrade no Painel",
        modulo: "Trial",
        resumo: "ISP visualiza alertas incentivando upgrade.",
        fluxo: `1. ISP acessa Dashboard
2. Banner de trial exibe dias restantes
3. Se < 3 dias: alerta destacado
4. Link direto para upgrade
5. Contador regressivo visível`,
        regras: [
          { id: "RNL-40-01", descricao: "Alerta intensificado nos últimos 3 dias", criticidade: "Média" },
          { id: "RNL-40-02", descricao: "Banner não pode ser dispensado", criticidade: "Média" },
        ],
      },
      {
        id: "JL-41",
        titulo: "Receber Email de Lembrete de Trial",
        modulo: "Trial",
        resumo: "ISP recebe emails lembrando do fim do trial.",
        fluxo: `1. Trial iniciado
2. Sistema agenda emails automáticos
3. Email D-3: "Seu trial termina em 3 dias"
4. Email D-1: "Último dia de trial"
5. Email D+1: "Trial expirado - faça upgrade"`,
        regras: [
          { id: "RNL-41-01", descricao: "Emails D-3, D-1 e D+1 automáticos", criticidade: "Alta" },
          { id: "RNL-41-02", descricao: "CTA claro para upgrade", criticidade: "Alta" },
          { id: "RNL-41-03", descricao: "Permitir opt-out de lembretes", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-42",
        titulo: "Receber Sugestão de Upgrade via Chatbot",
        modulo: "Trial",
        resumo: "Chatbot sugere upgrade durante uso do trial.",
        fluxo: `1. ISP usa chatbot durante trial
2. Chatbot identifica uso frequente
3. Sugere upgrade baseado no comportamento
4. Oferece link para checkout
5. Pode oferecer desconto especial`,
        regras: [
          { id: "RNL-42-01", descricao: "Sugestão contextualizada ao uso", criticidade: "Média" },
          { id: "RNL-42-02", descricao: "Não ser intrusivo (max 1x por sessão)", criticidade: "Média" },
        ],
      },
      {
        id: "JL-43",
        titulo: "Fazer Upgrade para Plano Pago",
        modulo: "Trial",
        resumo: "ISP converte de trial para assinatura paga.",
        fluxo: `1. ISP clica em "Fazer Upgrade"
2. Redireciona para checkout
3. Plano do trial pré-selecionado
4. Completa pagamento
5. Trial convertido em assinatura ativa`,
        regras: [
          { id: "RNL-43-01", descricao: "Dados já coletados no cadastro aproveitados", criticidade: "Média" },
          { id: "RNL-43-02", descricao: "Transição sem perda de dados/config", criticidade: "Alta" },
          { id: "RNL-43-03", descricao: "Créditos de trial não cumulativos", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "cancelamento",
    titulo: "Cancelamento",
    icon: XCircle,
    jornadas: [
      {
        id: "JL-44",
        titulo: "Iniciar Cancelamento Self-Service",
        modulo: "Cancelamento",
        resumo: "ISP inicia processo de cancelamento pelo painel.",
        fluxo: `1. ISP acessa Configurações > Assinatura
2. Clica em "Cancelar Assinatura"
3. Sistema exibe aviso sobre consequências
4. Solicita confirmação
5. Exibe formulário de motivo`,
        regras: [
          { id: "RNL-44-01", descricao: "Cancelamento self-service disponível", criticidade: "Alta" },
          { id: "RNL-44-02", descricao: "Avisar sobre perda de acesso", criticidade: "Alta" },
          { id: "RNL-44-03", descricao: "Oferecer alternativas antes de cancelar", criticidade: "Média" },
        ],
      },
      {
        id: "JL-45",
        titulo: "Solicitar Cancelamento via Suporte",
        modulo: "Cancelamento",
        resumo: "ISP solicita cancelamento via chat ou email.",
        fluxo: `1. ISP contata suporte via chat/email
2. Atendente verifica solicitação
3. Tenta retenção (oferece downgrade, pausa)
4. Se ISP confirmar: processa cancelamento
5. Registra motivo no CRM`,
        regras: [
          { id: "RNL-45-01", descricao: "Script de retenção para atendente", criticidade: "Média" },
          { id: "RNL-45-02", descricao: "Registro obrigatório do motivo", criticidade: "Alta" },
        ],
      },
      {
        id: "JL-46",
        titulo: "Informar Motivo do Cancelamento",
        modulo: "Cancelamento",
        resumo: "ISP informa razão do cancelamento.",
        fluxo: `1. Exibe formulário de motivo
2. Opções pré-definidas + campo livre
3. ISP seleciona/escreve motivo
4. Sistema registra para análise
5. Permite continuar cancelamento`,
        regras: [
          { id: "RNL-46-01", descricao: "Motivo obrigatório para cancelar", criticidade: "Alta" },
          { id: "RNL-46-02", descricao: "Motivos: Preço, Não atende, Migração, Fechou empresa, Outro", criticidade: "Média" },
          { id: "RNL-46-03", descricao: "Dados usados para melhoria do produto", criticidade: "Média" },
        ],
      },
      {
        id: "JL-47",
        titulo: "Confirmar Cancelamento",
        modulo: "Cancelamento",
        resumo: "Sistema processa confirmação do cancelamento.",
        fluxo: `1. ISP confirma cancelamento
2. Sistema agenda encerramento para fim do ciclo
3. Envia email de confirmação
4. Mantém acesso até fim do período pago
5. Dados retidos por 90 dias`,
        regras: [
          { id: "RNL-47-01", descricao: "Cancelamento efetiva no fim do ciclo pago", criticidade: "Alta" },
          { id: "RNL-47-02", descricao: "Acesso mantido até data de expiração", criticidade: "Alta" },
          { id: "RNL-47-03", descricao: "Dados mantidos 90 dias para reativação", criticidade: "Alta" },
          { id: "RNL-47-04", descricao: "Email de confirmação obrigatório", criticidade: "Alta" },
        ],
      },
    ],
  },
  {
    id: "blog",
    titulo: "Blog/Conteúdo",
    icon: FileText,
    jornadas: [
      {
        id: "JL-48",
        titulo: "Acessar Blog do AutoISP",
        modulo: "Blog",
        resumo: "Visitante acessa o blog institucional do AutoISP.",
        fluxo: `1. Visitante clica em Blog no menu
2. Sistema carrega lista de posts
3. Exibe posts ordenados por data
4. Permite filtrar por categoria
5. Exibe destaques e mais lidos`,
        regras: [
          { id: "RNL-48-01", descricao: "Blog indexado para SEO", criticidade: "Alta" },
          { id: "RNL-48-02", descricao: "Paginação ou scroll infinito", criticidade: "Baixa" },
        ],
      },
      {
        id: "JL-49",
        titulo: "Ler Artigos Educativos",
        modulo: "Blog",
        resumo: "Visitante lê artigo sobre gestão de ISP ou tecnologia.",
        fluxo: `1. Visitante clica em artigo
2. Sistema carrega conteúdo completo
3. Exibe tempo de leitura estimado
4. Mostra autor e data
5. Oferece artigos relacionados`,
        regras: [
          { id: "RNL-49-01", descricao: "Artigos com schema markup", criticidade: "Média" },
          { id: "RNL-49-02", descricao: "CTA para trial no fim do artigo", criticidade: "Média" },
        ],
      },
      {
        id: "JL-50",
        titulo: "Visualizar Cases de Clientes",
        modulo: "Blog",
        resumo: "Visitante lê case de sucesso de ISP cliente.",
        fluxo: `1. Visitante acessa seção de cases
2. Visualiza lista de cases publicados
3. Clica em case de interesse
4. Lê história, desafios e resultados
5. Visualiza métricas e depoimentos`,
        regras: [
          { id: "RNL-50-01", descricao: "Cases com autorização do cliente", criticidade: "Alta" },
          { id: "RNL-50-02", descricao: "Métricas verificáveis quando possível", criticidade: "Média" },
        ],
      },
      {
        id: "JL-51",
        titulo: "Consultar Changelog/Updates",
        modulo: "Blog",
        resumo: "Visitante consulta atualizações e novidades do produto.",
        fluxo: `1. Visitante acessa Changelog
2. Sistema exibe lista de releases
3. Ordenado por data (mais recente primeiro)
4. Cada release lista: novas features, melhorias, correções
5. Badges indicam tipo (feature, fix, improvement)`,
        regras: [
          { id: "RNL-51-01", descricao: "Changelog público e atualizado", criticidade: "Média" },
          { id: "RNL-51-02", descricao: "Versionamento semântico", criticidade: "Baixa" },
        ],
      },
    ],
  },
  {
    id: "contato",
    titulo: "Contato",
    icon: Phone,
    jornadas: [
      {
        id: "JL-52",
        titulo: "Enviar Formulário de Contato",
        modulo: "Contato",
        resumo: "Visitante envia mensagem via formulário de contato.",
        fluxo: `1. Visitante acessa página de Contato
2. Preenche formulário: nome, email, assunto, mensagem
3. Aceita termos de privacidade
4. Envia formulário
5. Recebe confirmação na tela e por email`,
        regras: [
          { id: "RNL-52-01", descricao: "Campos obrigatórios validados", criticidade: "Alta" },
          { id: "RNL-52-02", descricao: "Proteção anti-spam (reCAPTCHA)", criticidade: "Alta" },
          { id: "RNL-52-03", descricao: "Encaminhado para equipe adequada por assunto", criticidade: "Média" },
        ],
      },
      {
        id: "JL-53",
        titulo: "Visualizar Dados de Contato",
        modulo: "Contato",
        resumo: "Visitante visualiza informações de contato do AutoISP.",
        fluxo: `1. Visitante acessa seção de contato
2. Visualiza: email, telefone, endereço
3. Visualiza horário de atendimento
4. Pode copiar informações
5. Links clicáveis (tel:, mailto:)`,
        regras: [
          { id: "RNL-53-01", descricao: "Dados de contato sempre atualizados", criticidade: "Alta" },
          { id: "RNL-53-02", descricao: "Horário de atendimento claro", criticidade: "Média" },
        ],
      },
      {
        id: "JL-54",
        titulo: "Acessar Redes Sociais",
        modulo: "Contato",
        resumo: "Visitante acessa redes sociais do AutoISP.",
        fluxo: `1. Visitante visualiza ícones de redes sociais
2. Clica na rede de interesse
3. Abre perfil do AutoISP em nova aba
4. Pode seguir/curtir
5. Visualiza conteúdo da rede`,
        regras: [
          { id: "RNL-54-01", descricao: "Links abrem em nova aba", criticidade: "Baixa" },
          { id: "RNL-54-02", descricao: "Redes ativas: LinkedIn, Instagram, YouTube", criticidade: "Média" },
        ],
      },
    ],
  },
];

const getCriticidadeBadge = (criticidade: "Alta" | "Média" | "Baixa") => {
  const variants = {
    Alta: "bg-red-500/10 text-red-600 border-red-500/30",
    Média: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    Baixa: "bg-green-500/10 text-green-600 border-green-500/30",
  };
  return variants[criticidade];
};

const JornadasLandingSection = () => {
  const totalJornadas = categoriasJornadas.reduce(
    (acc, cat) => acc + cat.jornadas.length,
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Jornadas da Landing Page AutoISP</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Site institucional do SaaS para captação de ISPs
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {totalJornadas} jornadas
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {categoriasJornadas.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 rounded-lg border bg-card p-3"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{cat.titulo}</p>
                    <p className="font-semibold">{cat.jornadas.length}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-4">
        {categoriasJornadas.map((categoria) => {
          const Icon = categoria.icon;
          return (
            <AccordionItem
              key={categoria.id}
              value={categoria.id}
              className="rounded-xl border bg-card px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">{categoria.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {categoria.jornadas.length} jornadas
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {categoria.jornadas.map((jornada) => (
                    <Card key={jornada.id} className="border-l-4 border-l-primary">
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
                              <strong>Módulo:</strong> {jornada.modulo} |{" "}
                              <strong>Plataforma:</strong> Landing Page AutoISP
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="mb-2 text-sm font-semibold">Resumo</h4>
                          <p className="text-sm text-muted-foreground">
                            {jornada.resumo}
                          </p>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-semibold">
                            Fluxo da Jornada
                          </h4>
                          <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-xs">
                            {jornada.fluxo}
                          </pre>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-semibold">
                            Regras de Negócio
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
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
                                      variant="outline"
                                      className={getCriticidadeBadge(
                                        regra.criticidade
                                      )}
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

export default JornadasLandingSection;
