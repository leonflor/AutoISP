import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  FileText, 
  MessageSquare, 
  MapPin, 
  Search, 
  Smartphone, 
  Palette, 
  BarChart3, 
  Zap, 
  Video,
  Star,
  Users,
  Mail,
  Phone,
  Home,
  Link,
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX
} from "lucide-react";

const LandingPageSection = () => {
  // Landing Page do SaaS AutoISP - Site para captação de ISPs (não de assinantes finais)
  const paginasHome = [
    { secao: "Hero com CTA", descricao: "Banner principal com chamada para testar o AutoISP" },
    { secao: "Planos do SaaS", descricao: "Tabela comparativa dos planos do AutoISP (Starter/Pro/Enterprise)" },
    { secao: "Funcionalidades", descricao: "Módulos e recursos do sistema para gestão de ISP" },
    { secao: "Cases de Sucesso", descricao: "Depoimentos e resultados de ISPs que usam o AutoISP" },
    { secao: "Prova Social", descricao: "Números, logos de clientes, certificações" },
  ];

  const paginasAdicionais = [
    { pagina: "Planos", conteudo: "Detalhamento completo dos planos do SaaS e limites" },
    { pagina: "Funcionalidades", conteudo: "Descrição detalhada de cada módulo do sistema" },
    { pagina: "Cases", conteudo: "Histórias de sucesso de ISPs clientes" },
    { pagina: "Blog", conteudo: "Artigos educativos, changelog, cases de clientes" },
    { pagina: "Contato", conteudo: "Formulário e informações de contato comercial" },
    { pagina: "FAQ", conteudo: "Perguntas frequentes sobre o AutoISP" },
  ];

  const provaSocial = [
    { elemento: "Depoimentos", descricao: "Feedbacks de donos de ISP que usam o AutoISP" },
    { elemento: "Números", descricao: "Estatísticas (ex: 500+ ISPs, 2M+ assinantes gerenciados)" },
    { elemento: "Logos de Clientes", descricao: "ISPs que usam a plataforma" },
    { elemento: "Certificações", descricao: "Selos de segurança e qualidade do SaaS" },
  ];

  const canaisCaptacao = [
    { canal: "Formulário de contato", funcao: "Cadastro de ISPs interessados no AutoISP" },
    { canal: "Cadastro para Trial", funcao: "Início do trial de 7 dias" },
    { canal: "WhatsApp comercial", funcao: "Contato direto com equipe de vendas" },
    { canal: "Chat com IA", funcao: "Chatbot para tirar dúvidas e recomendar planos" },
  ];

  const camposFormulario = [
    { categoria: "Responsável", campos: "Nome, email, telefone, cargo" },
    { categoria: "Empresa", campos: "Razão social, CNPJ" },
    { categoria: "Perfil do ISP", campos: "Qtd assinantes, canais utilizados, ERP atual" },
    { categoria: "Interesse", campos: "Plano desejado, mensagem" },
  ];

  const destinosLead = [
    { destino: "CRM AutoISP", descricao: "Lead registrado no CRM interno" },
    { destino: "Email de notificação", descricao: "Equipe comercial recebe alerta" },
    { destino: "WhatsApp comercial", descricao: "Notificação para time de vendas" },
  ];

  const funilStatus = [
    { etapa: "Entrada", status: "Novo Lead", cor: "bg-blue-500", icon: Clock },
    { etapa: "Contato", status: "Em qualificação", cor: "bg-yellow-500", icon: Phone },
    { etapa: "Trial", status: "Em trial", cor: "bg-purple-500", icon: UserCheck },
    { etapa: "Conversão", status: "Cliente ativo", cor: "bg-green-500", icon: CheckCircle2 },
    { etapa: "Perdido", status: "Não converteu", cor: "bg-red-500", icon: UserX },
  ];

  const funcoesChatbot = [
    { funcao: "Tirar dúvidas sobre o AutoISP", descricao: "Responde perguntas sobre o produto" },
    { funcao: "Recomendar plano ideal", descricao: "Sugere plano baseado no perfil do ISP" },
    { funcao: "Captar lead/prospect", descricao: "Coleta dados para follow-up comercial" },
    { funcao: "Transferência", descricao: "Redireciona para atendente humano" },
  ];

  const tiposConteudo = [
    { tipo: "Artigos educativos", descricao: "Conteúdo sobre gestão de ISP" },
    { tipo: "Cases de clientes", descricao: "Histórias de sucesso de ISPs" },
    { tipo: "Changelog/Updates", descricao: "Novidades e atualizações do produto" },
  ];

  const trialInfo = [
    { item: "Duração", valor: "7 dias" },
    { item: "Limite de atendimentos", valor: "Funcionalidades limitadas" },
    { item: "IA", valor: "Sem IA ou IA limitada" },
    { item: "Upgrade incentivo", valor: "Alerta no painel, email, chatbot" },
  ];

  const seoAnalytics = [
    { recurso: "Meta tags SEO", descricao: "Títulos, descrições, Open Graph otimizados" },
    { recurso: "Google Analytics", descricao: "Integração com GA e GTM" },
    { recurso: "Pixel Meta", descricao: "Rastreamento de conversões Facebook/Instagram" },
    { recurso: "Dashboard de métricas", descricao: "Dados de visitas e conversões" },
  ];

  const performance = [
    { tecnica: "Lazy loading", descricao: "Carregamento otimizado de imagens" },
    { tecnica: "SSR/SSG", descricao: "Conteúdo pré-renderizado para SEO" },
    { tecnica: "CDN", descricao: "Distribuição global de assets" },
    { tecnica: "Core Web Vitals", descricao: "Otimização LCP/CLS/FID" },
  ];

  return (
    <div className="space-y-8">
      {/* Identificação */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Landing Page</CardTitle>
              <CardDescription>Site institucional e captação de leads</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">Nome</TableCell>
                <TableCell>Landing Page</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Formato</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    Web (Mobile-first responsivo)
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Acesso</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    100% público (sem login)
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dinâmica</TableCell>
                <TableCell>Site institucional do ISP para apresentação de planos, captação de leads e atendimento via chatbot IA</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Estrutura de Páginas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Estrutura de Páginas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Badge>Home</Badge>
              <span className="text-muted-foreground text-sm font-normal">Single Page</span>
            </h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Seção</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginasHome.map((item) => (
                  <TableRow key={item.secao}>
                    <TableCell className="font-medium">{item.secao}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Páginas Adicionais</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Página</TableHead>
                  <TableHead>Conteúdo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginasAdicionais.map((item) => (
                  <TableRow key={item.pagina}>
                    <TableCell className="font-medium">{item.pagina}</TableCell>
                    <TableCell>{item.conteudo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Prova Social */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Elementos de Prova Social</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Elemento</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provaSocial.map((item) => (
                <TableRow key={item.elemento}>
                  <TableCell className="font-medium">{item.elemento}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Captação de Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Captação de Leads</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Canais de Captação</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Canal</TableHead>
                  <TableHead>Função</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {canaisCaptacao.map((item) => (
                  <TableRow key={item.canal}>
                    <TableCell className="font-medium">{item.canal}</TableCell>
                    <TableCell>{item.funcao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Campos do Formulário de Lead</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Categoria</TableHead>
                  <TableHead>Campos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {camposFormulario.map((item) => (
                  <TableRow key={item.categoria}>
                    <TableCell className="font-medium">{item.categoria}</TableCell>
                    <TableCell>{item.campos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Destino dos Leads</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Destino</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinosLead.map((item) => (
                  <TableRow key={item.destino}>
                    <TableCell className="font-medium">{item.destino}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Funil de Status do Lead</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {funilStatus.map((item, index) => (
                <div key={item.status} className="flex items-center gap-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card">
                    <item.icon className={`h-4 w-4 ${item.cor.replace('bg-', 'text-').replace('-500', '-600')}`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  {index < funilStatus.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                  )}
                </div>
              ))}
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Etapa</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funilStatus.map((item) => (
                  <TableRow key={item.status}>
                    <TableCell className="font-medium">{item.etapa}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${item.cor}/10 border-current`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chat com IA */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Chat com IA (Chatbot)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Funções do Chatbot</h4>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Função</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcoesChatbot.map((item) => (
                  <TableRow key={item.funcao}>
                    <TableCell className="font-medium">{item.funcao}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm text-muted-foreground">
              <strong>Integração:</strong> Usa o <Badge variant="secondary">Agente Comercial</Badge> configurado no Painel Cliente com a mesma base de conhecimento e prompts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consulta de Viabilidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Consulta de Viabilidade</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">Fonte de dados</TableCell>
                <TableCell>Base interna de cobertura</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Input</TableCell>
                <TableCell>Endereço ou CEP do usuário</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Output</TableCell>
                <TableCell>Disponibilidade (sim/não) + planos disponíveis</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Blog/Novidades */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Blog/Novidades</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Tipo de Conteúdo</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposConteudo.map((item) => (
                <TableRow key={item.tipo}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.tipo === "Vídeos" && <Video className="h-4 w-4 text-muted-foreground" />}
                      {item.tipo === "Posts de conteúdo" && <FileText className="h-4 w-4 text-muted-foreground" />}
                      {item.tipo === "Expansão" && <MapPin className="h-4 w-4 text-muted-foreground" />}
                      {item.tipo}
                    </div>
                  </TableCell>
                  <TableCell>{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Trial */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Trial Gratuito</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Item</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialInfo.map((item) => (
                <TableRow key={item.item}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuração de Domínio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Configuração de Domínio</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Tipo</TableHead>
                <TableHead>Formato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Subdomínio AutoISP</TableCell>
                <TableCell>
                  <code className="px-2 py-1 rounded bg-muted text-sm">provedor.autoisp.com.br</code>
                  <Badge variant="outline" className="ml-2">gratuito</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Domínio personalizado</TableCell>
                <TableCell>
                  <code className="px-2 py-1 rounded bg-muted text-sm">meuisp.com.br</code>
                  <Badge variant="outline" className="ml-2">configurável</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Suporte:</strong> Ambos os formatos disponíveis simultaneamente.
          </p>
        </CardContent>
      </Card>

      {/* SEO e Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">SEO e Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Recurso</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoAnalytics.map((item) => (
                <TableRow key={item.recurso}>
                  <TableCell className="font-medium">{item.recurso}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Performance e Otimização</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Técnica</TableHead>
                <TableHead>Implementação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performance.map((item) => (
                <TableRow key={item.tecnica}>
                  <TableCell className="font-medium">{item.tecnica}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm text-muted-foreground">
              <strong>Responsividade:</strong> Abordagem <Badge variant="secondary">Mobile-first</Badge> com breakpoints para Mobile, Tablet e Desktop.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPageSection;
