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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layout,
  Users,
  Bot,
  MapPin,
  FileText,
  Search,
} from "lucide-react";

interface RegraNegocio {
  codigo: string;
  descricao: string;
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

const landingFeatures: Feature[] = [
  // Páginas e Estrutura (6 features)
  {
    codigo: "F-LANDING-001",
    nome: "Visualizar Hero Section",
    modulo: "Páginas e Estrutura",
    plataforma: "Landing Page",
    descricao: "Exibe a seção principal da landing page com headline, subheadline, CTA principal e imagem/vídeo de destaque.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "CTA principal deve redirecionar para formulário de contato ou consulta de viabilidade" },
      { codigo: "RN-002", descricao: "Headline deve comunicar proposta de valor em até 10 palavras" },
      { codigo: "RN-003", descricao: "Imagem/vídeo deve carregar em menos de 3 segundos" },
      { codigo: "RN-004", descricao: "Layout deve ser responsivo para mobile-first" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "HeroContent", campos: ["headline", "subheadline", "ctaText", "ctaLink", "mediaUrl", "mediaType"] },
    ],
  },
  {
    codigo: "F-LANDING-002",
    nome: "Visualizar Seção de Benefícios",
    modulo: "Páginas e Estrutura",
    plataforma: "Landing Page",
    descricao: "Apresenta os principais benefícios e diferenciais do serviço de internet em cards ou lista visual.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Exibir mínimo de 3 e máximo de 6 benefícios" },
      { codigo: "RN-002", descricao: "Cada benefício deve ter ícone, título e descrição curta" },
      { codigo: "RN-003", descricao: "Ordem deve priorizar benefícios mais impactantes" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Beneficio", campos: ["icone", "titulo", "descricao", "ordem"] },
    ],
  },
  {
    codigo: "F-LANDING-003",
    nome: "Visualizar Tabela de Planos",
    modulo: "Páginas e Estrutura",
    plataforma: "Landing Page",
    descricao: "Exibe comparativo de planos disponíveis com preços, velocidades e features incluídas.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Plano mais popular deve estar destacado visualmente" },
      { codigo: "RN-002", descricao: "Preços devem exibir valor mensal e anual se houver desconto" },
      { codigo: "RN-003", descricao: "Cada plano deve ter botão de contratação/interesse" },
      { codigo: "RN-004", descricao: "Features devem ser comparáveis entre planos" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar", "selecionar_plano"] },
    ],
    entidades: [
      { nome: "PlanoPublico", campos: ["nome", "velocidade", "precoMensal", "precoAnual", "features", "destaque", "ordem"] },
    ],
  },
  {
    codigo: "F-LANDING-004",
    nome: "Visualizar Seção de Prova Social",
    modulo: "Páginas e Estrutura",
    plataforma: "Landing Page",
    descricao: "Apresenta depoimentos de clientes, avaliações, logos de parceiros e métricas de satisfação.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Depoimentos devem incluir nome, foto e localização do cliente" },
      { codigo: "RN-002", descricao: "Avaliações devem mostrar nota média e quantidade de avaliadores" },
      { codigo: "RN-003", descricao: "Logos de parceiros devem ter permissão de uso" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "Depoimento", campos: ["nomeCliente", "fotoUrl", "texto", "avaliacao", "cidade", "dataPublicacao"] },
      { nome: "Parceiro", campos: ["nome", "logoUrl", "ordem"] },
    ],
  },
  {
    codigo: "F-LANDING-005",
    nome: "Visualizar Página de FAQ",
    modulo: "Páginas e Estrutura",
    plataforma: "Landing Page",
    descricao: "Exibe perguntas frequentes organizadas por categoria com respostas expansíveis.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "FAQs devem ser organizadas por categoria (Instalação, Pagamento, Suporte)" },
      { codigo: "RN-002", descricao: "Respostas devem ser expansíveis (accordion)" },
      { codigo: "RN-003", descricao: "Deve haver campo de busca para filtrar perguntas" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar", "buscar"] },
    ],
    entidades: [
      { nome: "FAQ", campos: ["pergunta", "resposta", "categoria", "ordem", "ativo"] },
    ],
  },
  {
    codigo: "F-LANDING-006",
    nome: "Visualizar Rodapé Institucional",
    modulo: "Páginas e Estrutura",
    plataforma: "Landing Page",
    descricao: "Exibe informações institucionais, links úteis, contatos e redes sociais no rodapé.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Deve incluir CNPJ e razão social da empresa" },
      { codigo: "RN-002", descricao: "Links para Termos de Uso e Política de Privacidade são obrigatórios" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar"] },
    ],
    entidades: [
      { nome: "InfoInstitucional", campos: ["razaoSocial", "cnpj", "endereco", "telefone", "email", "redesSociais"] },
    ],
  },

  // Captação de Leads (5 features)
  {
    codigo: "F-LANDING-007",
    nome: "Submeter Formulário de Contato",
    modulo: "Captação de Leads",
    plataforma: "Landing Page",
    descricao: "Permite ao visitante enviar dados de contato para receber informações comerciais.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Campos obrigatórios: nome, telefone, email" },
      { codigo: "RN-002", descricao: "Telefone deve ser validado (formato brasileiro)" },
      { codigo: "RN-003", descricao: "Email deve ser validado (formato válido)" },
      { codigo: "RN-004", descricao: "Checkbox de aceite LGPD é obrigatório" },
      { codigo: "RN-005", descricao: "Lead deve ser salvo mesmo se integração externa falhar" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["preencher", "enviar"] },
    ],
    entidades: [
      { nome: "Lead", campos: ["nome", "email", "telefone", "mensagem", "origem", "utmSource", "utmMedium", "utmCampaign", "status", "criadoEm"] },
    ],
  },
  {
    codigo: "F-LANDING-008",
    nome: "Submeter Consulta de Viabilidade",
    modulo: "Captação de Leads",
    plataforma: "Landing Page",
    descricao: "Permite ao visitante consultar se há cobertura de internet em seu endereço.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "CEP é campo obrigatório e deve ser validado" },
      { codigo: "RN-002", descricao: "Endereço deve ser preenchido automaticamente via API de CEP" },
      { codigo: "RN-003", descricao: "Número do endereço é obrigatório" },
      { codigo: "RN-004", descricao: "Consulta deve gerar lead automaticamente" },
      { codigo: "RN-005", descricao: "Resultado deve ser exibido em menos de 5 segundos" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["consultar"] },
    ],
    entidades: [
      { nome: "ConsultaViabilidade", campos: ["cep", "logradouro", "numero", "complemento", "bairro", "cidade", "estado", "resultado", "leadId", "criadoEm"] },
    ],
  },
  {
    codigo: "F-LANDING-009",
    nome: "Iniciar Trial Gratuito",
    modulo: "Captação de Leads",
    plataforma: "Landing Page",
    descricao: "Permite ao visitante solicitar período de teste gratuito do serviço.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Trial disponível apenas para novos clientes" },
      { codigo: "RN-002", descricao: "Período de trial configurável (padrão: 7 dias)" },
      { codigo: "RN-003", descricao: "CPF/CNPJ deve ser validado para evitar duplicidade" },
      { codigo: "RN-004", descricao: "Deve capturar dados completos para instalação" },
      { codigo: "RN-005", descricao: "Email de confirmação deve ser enviado automaticamente" },
      { codigo: "RN-006", descricao: "Lead deve entrar no funil com status 'trial_solicitado'" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["solicitar"] },
    ],
    entidades: [
      { nome: "SolicitacaoTrial", campos: ["leadId", "cpfCnpj", "enderecoInstalacao", "planoInteresse", "periodoTrial", "status", "criadoEm"] },
    ],
  },
  {
    codigo: "F-LANDING-010",
    nome: "Rastrear Origem de Lead (UTM)",
    modulo: "Captação de Leads",
    plataforma: "Landing Page",
    descricao: "Captura e armazena parâmetros UTM para rastreamento de campanhas de marketing.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Capturar utm_source, utm_medium, utm_campaign, utm_term, utm_content" },
      { codigo: "RN-002", descricao: "Parâmetros devem ser salvos em cookie/localStorage para persistência" },
      { codigo: "RN-003", descricao: "Dados UTM devem ser anexados a todos os leads gerados na sessão" },
      { codigo: "RN-004", descricao: "Primeira visita deve ser priorizada (first-touch attribution)" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["capturar", "armazenar"] },
    ],
    entidades: [
      { nome: "RastreamentoUTM", campos: ["utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent", "landingPage", "sessaoId", "criadoEm"] },
    ],
  },
  {
    codigo: "F-LANDING-011",
    nome: "Integrar Lead com CRM/Webhook",
    modulo: "Captação de Leads",
    plataforma: "Landing Page",
    descricao: "Envia dados de leads capturados para sistemas externos via webhook ou API de CRM.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Webhook deve ser configurável por ISP" },
      { codigo: "RN-002", descricao: "Falha na integração não deve impedir salvamento local do lead" },
      { codigo: "RN-003", descricao: "Retry automático em caso de falha (3 tentativas)" },
      { codigo: "RN-004", descricao: "Log de integração deve ser mantido para auditoria" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["enviar"] },
      { perfil: "Administrador", acoes: ["configurar", "visualizar_logs"] },
    ],
    entidades: [
      { nome: "IntegracaoWebhook", campos: ["url", "metodo", "headers", "ativo", "ultimoEnvio", "status"] },
      { nome: "LogIntegracao", campos: ["leadId", "webhookId", "payload", "resposta", "statusCode", "criadoEm"] },
    ],
  },

  // Chatbot com IA (4 features)
  {
    codigo: "F-LANDING-012",
    nome: "Abrir Chatbot IA",
    modulo: "Chatbot com IA",
    plataforma: "Landing Page",
    descricao: "Exibe widget de chatbot flutuante para atendimento automatizado ao visitante.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Widget deve aparecer após 10 segundos na página ou ao scroll de 50%" },
      { codigo: "RN-002", descricao: "Posição deve ser configurável (canto inferior direito padrão)" },
      { codigo: "RN-003", descricao: "Deve exibir mensagem de boas-vindas personalizada" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["abrir", "minimizar", "fechar"] },
    ],
    entidades: [
      { nome: "ConfigChatbot", campos: ["mensagemBoasVindas", "posicao", "tempoExibicao", "corPrimaria", "avatar", "ativo"] },
    ],
  },
  {
    codigo: "F-LANDING-013",
    nome: "Responder Dúvidas Automaticamente",
    modulo: "Chatbot com IA",
    plataforma: "Landing Page",
    descricao: "Utiliza IA para responder perguntas frequentes sobre planos, preços e serviços.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Respostas devem ser baseadas em base de conhecimento do ISP" },
      { codigo: "RN-002", descricao: "Tempo de resposta máximo: 3 segundos" },
      { codigo: "RN-003", descricao: "IA deve identificar intenção do usuário (planos, suporte, viabilidade)" },
      { codigo: "RN-004", descricao: "Respostas devem incluir CTAs relevantes quando apropriado" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["perguntar"] },
      { perfil: "Sistema", acoes: ["responder"] },
    ],
    entidades: [
      { nome: "ConversaChatbot", campos: ["sessaoId", "mensagens", "intencaoDetectada", "leadGerado", "criadoEm"] },
      { nome: "BaseConhecimento", campos: ["pergunta", "resposta", "categoria", "palavrasChave", "ativo"] },
    ],
  },
  {
    codigo: "F-LANDING-014",
    nome: "Coletar Lead via Chatbot",
    modulo: "Chatbot com IA",
    plataforma: "Landing Page",
    descricao: "Solicita dados de contato do visitante durante conversa no chatbot para gerar lead.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Solicitar dados após identificar interesse real (2+ interações)" },
      { codigo: "RN-002", descricao: "Campos mínimos: nome e telefone ou email" },
      { codigo: "RN-003", descricao: "Validar dados antes de criar lead" },
      { codigo: "RN-004", descricao: "Origem do lead deve ser marcada como 'chatbot'" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["fornecer_dados"] },
      { perfil: "Sistema", acoes: ["solicitar_dados", "criar_lead"] },
    ],
    entidades: [
      { nome: "LeadChatbot", campos: ["conversaId", "nome", "telefone", "email", "interessePlano", "criadoEm"] },
    ],
  },
  {
    codigo: "F-LANDING-015",
    nome: "Encaminhar para Atendimento Humano",
    modulo: "Chatbot com IA",
    plataforma: "Landing Page",
    descricao: "Transfere conversa para atendente humano quando IA não consegue resolver.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Oferecer transferência após 3 respostas insatisfatórias" },
      { codigo: "RN-002", descricao: "Visitante pode solicitar humano a qualquer momento" },
      { codigo: "RN-003", descricao: "Histórico da conversa deve ser preservado na transferência" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["solicitar_humano"] },
      { perfil: "Sistema", acoes: ["transferir"] },
      { perfil: "Atendente", acoes: ["assumir_conversa"] },
    ],
    entidades: [
      { nome: "TransferenciaChatbot", campos: ["conversaId", "motivo", "atendenteId", "status", "criadoEm"] },
    ],
  },

  // Consulta de Viabilidade (2 features)
  {
    codigo: "F-LANDING-016",
    nome: "Consultar Viabilidade por CEP",
    modulo: "Consulta de Viabilidade",
    plataforma: "Landing Page",
    descricao: "Permite verificar disponibilidade de cobertura de internet informando apenas o CEP.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "CEP deve ser validado (8 dígitos numéricos)" },
      { codigo: "RN-002", descricao: "Consultar base de cobertura do ISP em tempo real" },
      { codigo: "RN-003", descricao: "Endereço completo deve ser retornado via API de CEP" },
      { codigo: "RN-004", descricao: "Consulta deve ser registrada para analytics" },
      { codigo: "RN-005", descricao: "Cache de 24h para consultas repetidas do mesmo CEP" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["consultar"] },
    ],
    entidades: [
      { nome: "AreaCobertura", campos: ["cep", "bairro", "cidade", "estado", "temCobertura", "planosDisponiveis", "previsaoExpansao"] },
    ],
  },
  {
    codigo: "F-LANDING-017",
    nome: "Exibir Resultado de Viabilidade",
    modulo: "Consulta de Viabilidade",
    plataforma: "Landing Page",
    descricao: "Apresenta resultado da consulta indicando se há cobertura e quais planos estão disponíveis.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Se viável: exibir planos disponíveis com CTA de contratação" },
      { codigo: "RN-002", descricao: "Se não viável: capturar interesse para lista de espera" },
      { codigo: "RN-003", descricao: "Exibir previsão de expansão se houver" },
      { codigo: "RN-004", descricao: "Resultado deve ser claro e visualmente destacado" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar", "cadastrar_interesse"] },
    ],
    entidades: [
      { nome: "ResultadoViabilidade", campos: ["consultaId", "viavel", "planosDisponiveis", "mensagem", "previsaoExpansao"] },
      { nome: "ListaEspera", campos: ["email", "telefone", "cep", "endereco", "criadoEm"] },
    ],
  },

  // Blog e Conteúdo (3 features)
  {
    codigo: "F-LANDING-018",
    nome: "Listar Artigos do Blog",
    modulo: "Blog e Conteúdo",
    plataforma: "Landing Page",
    descricao: "Exibe lista de artigos do blog com thumbnail, título, resumo e data de publicação.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Exibir apenas artigos com status 'publicado'" },
      { codigo: "RN-002", descricao: "Ordenar por data de publicação (mais recente primeiro)" },
      { codigo: "RN-003", descricao: "Paginação de 10 artigos por página" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar", "navegar"] },
    ],
    entidades: [
      { nome: "Artigo", campos: ["titulo", "slug", "resumo", "conteudo", "thumbnail", "autor", "categoria", "tags", "publicadoEm", "status"] },
    ],
  },
  {
    codigo: "F-LANDING-019",
    nome: "Visualizar Artigo Completo",
    modulo: "Blog e Conteúdo",
    plataforma: "Landing Page",
    descricao: "Exibe conteúdo completo do artigo com formatação rica, imagens e CTAs contextuais.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "URL deve usar slug amigável para SEO" },
      { codigo: "RN-002", descricao: "Exibir tempo estimado de leitura" },
      { codigo: "RN-003", descricao: "Incluir CTA para consulta de viabilidade ao final" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["visualizar", "compartilhar"] },
    ],
    entidades: [
      { nome: "Artigo", campos: ["titulo", "slug", "conteudo", "autor", "publicadoEm", "tempoLeitura", "metaDescription"] },
    ],
  },
  {
    codigo: "F-LANDING-020",
    nome: "Filtrar Artigos por Categoria",
    modulo: "Blog e Conteúdo",
    plataforma: "Landing Page",
    descricao: "Permite filtrar artigos do blog por categoria ou tag.",
    criticidade: "baixa",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Categorias devem ser exibidas como filtros clicáveis" },
      { codigo: "RN-002", descricao: "Exibir contador de artigos por categoria" },
    ],
    permissoes: [
      { perfil: "Visitante", acoes: ["filtrar"] },
    ],
    entidades: [
      { nome: "Categoria", campos: ["nome", "slug", "descricao", "quantidadeArtigos"] },
    ],
  },

  // SEO e Performance (4 features)
  {
    codigo: "F-LANDING-021",
    nome: "Gerar Meta Tags Dinâmicas",
    modulo: "SEO e Performance",
    plataforma: "Landing Page",
    descricao: "Gera meta tags (title, description, og:image) dinamicamente para cada página.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Title deve ter máximo de 60 caracteres" },
      { codigo: "RN-002", descricao: "Description deve ter máximo de 160 caracteres" },
      { codigo: "RN-003", descricao: "og:image deve estar presente para compartilhamento social" },
      { codigo: "RN-004", descricao: "Tags canônicas devem evitar conteúdo duplicado" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["gerar"] },
    ],
    entidades: [
      { nome: "MetaTags", campos: ["pagina", "title", "description", "ogImage", "canonical", "robots"] },
    ],
  },
  {
    codigo: "F-LANDING-022",
    nome: "Gerar Sitemap XML",
    modulo: "SEO e Performance",
    plataforma: "Landing Page",
    descricao: "Gera sitemap XML automaticamente com todas as páginas indexáveis.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Incluir todas as páginas públicas e artigos do blog" },
      { codigo: "RN-002", descricao: "Atualizar automaticamente ao publicar novo conteúdo" },
      { codigo: "RN-003", descricao: "Incluir lastmod e priority para cada URL" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["gerar", "atualizar"] },
    ],
    entidades: [
      { nome: "SitemapEntry", campos: ["url", "lastmod", "changefreq", "priority"] },
    ],
  },
  {
    codigo: "F-LANDING-023",
    nome: "Rastrear Eventos no Analytics",
    modulo: "SEO e Performance",
    plataforma: "Landing Page",
    descricao: "Envia eventos de interação do usuário para Google Analytics ou plataforma similar.",
    criticidade: "alta",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "Rastrear: pageviews, cliques em CTAs, submissões de formulário" },
      { codigo: "RN-002", descricao: "Rastrear consultas de viabilidade (iniciadas e concluídas)" },
      { codigo: "RN-003", descricao: "Rastrear interações com chatbot" },
      { codigo: "RN-004", descricao: "Respeitar consent de cookies (LGPD)" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["rastrear"] },
      { perfil: "Visitante", acoes: ["consentir"] },
    ],
    entidades: [
      { nome: "EventoAnalytics", campos: ["categoria", "acao", "label", "valor", "sessaoId", "timestamp"] },
    ],
  },
  {
    codigo: "F-LANDING-024",
    nome: "Otimizar Performance (Core Web Vitals)",
    modulo: "SEO e Performance",
    plataforma: "Landing Page",
    descricao: "Implementa otimizações para atingir boas métricas de Core Web Vitals.",
    criticidade: "media",
    regrasNegocio: [
      { codigo: "RN-001", descricao: "LCP (Largest Contentful Paint) deve ser menor que 2.5s" },
      { codigo: "RN-002", descricao: "FID (First Input Delay) deve ser menor que 100ms" },
      { codigo: "RN-003", descricao: "CLS (Cumulative Layout Shift) deve ser menor que 0.1" },
      { codigo: "RN-004", descricao: "Imagens devem usar lazy loading e formatos modernos (WebP)" },
    ],
    permissoes: [
      { perfil: "Sistema", acoes: ["otimizar"] },
    ],
    entidades: [
      { nome: "MetricaPerformance", campos: ["pagina", "lcp", "fid", "cls", "ttfb", "dataColeta"] },
    ],
  },
];

const modulos = [
  { id: "paginas", nome: "Páginas e Estrutura", icon: Layout, count: 6 },
  { id: "captacao", nome: "Captação de Leads", icon: Users, count: 5 },
  { id: "chatbot", nome: "Chatbot com IA", icon: Bot, count: 4 },
  { id: "viabilidade", nome: "Consulta de Viabilidade", icon: MapPin, count: 2 },
  { id: "blog", nome: "Blog e Conteúdo", icon: FileText, count: 3 },
  { id: "seo", nome: "SEO e Performance", icon: Search, count: 4 },
];

const getCriticidadeBadge = (criticidade: Feature["criticidade"]) => {
  const styles = {
    alta: "bg-red-500/10 text-red-500 border-red-500/20",
    media: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    baixa: "bg-green-500/10 text-green-500 border-green-500/20",
  };

  return (
    <Badge variant="outline" className={styles[criticidade]}>
      {criticidade.charAt(0).toUpperCase() + criticidade.slice(1)}
    </Badge>
  );
};

const LandingFeatures = () => {
  return (
    <Tabs defaultValue="paginas" className="w-full">
      <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
        {modulos.map((modulo) => {
          const Icon = modulo.icon;
          return (
            <TabsTrigger
              key={modulo.id}
              value={modulo.id}
              className="group flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon className="h-4 w-4" />
              {modulo.nome}
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {modulo.count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {modulos.map((modulo) => {
        const features = landingFeatures.filter((f) => {
          const moduloMap: Record<string, string> = {
            paginas: "Páginas e Estrutura",
            captacao: "Captação de Leads",
            chatbot: "Chatbot com IA",
            viabilidade: "Consulta de Viabilidade",
            blog: "Blog e Conteúdo",
            seo: "SEO e Performance",
          };
          return f.modulo === moduloMap[modulo.id];
        });

        return (
          <TabsContent key={modulo.id} value={modulo.id} className="mt-0">
            <Accordion type="single" collapsible className="space-y-3">
              {features.map((feature) => (
                <AccordionItem
                  key={feature.codigo}
                  value={feature.codigo}
                  className="rounded-lg border border-border bg-card px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {feature.codigo}
                        </span>
                        <span className="font-medium">{feature.nome}</span>
                      </div>
                      {getCriticidadeBadge(feature.criticidade)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-6">
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                          Descrição
                        </h4>
                        <p className="text-sm">{feature.descricao}</p>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                          Regras de Negócio
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-24">Código</TableHead>
                              <TableHead>Descrição</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feature.regrasNegocio.map((rn) => (
                              <TableRow key={rn.codigo}>
                                <TableCell className="font-mono text-xs">
                                  {rn.codigo}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {rn.descricao}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                          Permissões
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-32">Perfil</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feature.permissoes.map((perm) => (
                              <TableRow key={perm.perfil}>
                                <TableCell className="font-medium">
                                  {perm.perfil}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {perm.acoes.map((acao) => (
                                      <Badge
                                        key={acao}
                                        variant="secondary"
                                        className="text-xs"
                                      >
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

                      <div>
                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                          Entidades de Dados
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-40">Entidade</TableHead>
                              <TableHead>Campos</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feature.entidades.map((ent) => (
                              <TableRow key={ent.nome}>
                                <TableCell className="font-mono text-xs">
                                  {ent.nome}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {ent.campos.map((campo) => (
                                      <Badge
                                        key={campo}
                                        variant="outline"
                                        className="text-xs"
                                      >
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
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default LandingFeatures;
