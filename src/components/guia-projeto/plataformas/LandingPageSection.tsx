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
  const paginasHome = [
    { secao: "Hero com CTA", descricao: "Banner principal com chamada para ação" },
    { secao: "Planos e Preços", descricao: "Tabela comparativa dos planos disponíveis" },
    { secao: "Sobre a Empresa", descricao: "Informações institucionais do ISP" },
    { secao: "Área de Cobertura", descricao: "Mapa ou lista de regiões atendidas" },
    { secao: "Prova Social", descricao: "Depoimentos, números, logos, certificações" },
  ];

  const paginasAdicionais = [
    { pagina: "Planos", conteudo: "Detalhamento completo dos planos e benefícios" },
    { pagina: "Contato", conteudo: "Formulário e informações de contato" },
    { pagina: "FAQ", conteudo: "Perguntas frequentes" },
    { pagina: "Blog/Novidades", conteudo: "Posts, vídeos, expansão de cobertura" },
  ];

  const provaSocial = [
    { elemento: "Depoimentos", descricao: "Avaliações e feedbacks de assinantes" },
    { elemento: "Números", descricao: "Estatísticas (ex: 10.000+ clientes, 99.9% uptime)" },
    { elemento: "Parceiros", descricao: "Logos de marcas e tecnologias utilizadas" },
    { elemento: "Certificações", descricao: "Selos de qualidade e certificados" },
  ];

  const canaisCaptacao = [
    { canal: "Formulário de interesse", funcao: "Cadastro estruturado de novos leads" },
    { canal: "Consulta de viabilidade", funcao: "Verificação de cobertura por endereço" },
    { canal: "WhatsApp direto", funcao: "Botão para iniciar conversa" },
    { canal: "Chat com IA", funcao: "Chatbot integrado para atendimento" },
  ];

  const camposFormulario = [
    { categoria: "Dados básicos", campos: "Nome, email, telefone" },
    { categoria: "Endereço completo", campos: "Rua, número, bairro, CEP" },
    { categoria: "Preferências", campos: "Plano de interesse" },
    { categoria: "Financeiro", campos: "Melhor data de vencimento (05/10/15/20/25/30)" },
    { categoria: "Opcional", campos: "Mensagem/comentários" },
  ];

  const destinosLead = [
    { destino: "Integração com ERP", descricao: "Enviado automaticamente para o ERP do ISP" },
    { destino: "Email de notificação", descricao: "Equipe comercial recebe alerta" },
    { destino: "WhatsApp da equipe", descricao: "Notificação via WhatsApp" },
  ];

  const funilStatus = [
    { etapa: "Entrada", status: "Novo", cor: "bg-blue-500", icon: Clock },
    { etapa: "Contato", status: "Em atendimento", cor: "bg-yellow-500", icon: Phone },
    { etapa: "Qualificação", status: "Qualificado", cor: "bg-purple-500", icon: UserCheck },
    { etapa: "Conversão", status: "Convertido", cor: "bg-green-500", icon: CheckCircle2 },
    { etapa: "Encerramento", status: "Descartado", cor: "bg-red-500", icon: UserX },
  ];

  const funcoesChatbot = [
    { funcao: "Atendimento comercial", descricao: "Responde dúvidas sobre planos e preços" },
    { funcao: "Consulta de cobertura", descricao: "Verifica viabilidade por endereço" },
    { funcao: "Captação de lead", descricao: "Coleta dados e inicia processo" },
    { funcao: "Transferência", descricao: "Redireciona para atendente humano" },
  ];

  const tiposConteudo = [
    { tipo: "Posts de conteúdo", descricao: "Artigos sobre internet e tecnologia" },
    { tipo: "Vídeos", descricao: "Tutoriais e conteúdo em vídeo" },
    { tipo: "Expansão", descricao: "Anúncios de novas áreas de cobertura" },
  ];

  const personalizacao = [
    { elemento: "Cores da marca", customizavel: true },
    { elemento: "Logo", customizavel: true },
    { elemento: "Textos", customizavel: true },
    { elemento: "Imagens", customizavel: true },
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

      {/* Personalização */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personalização pelo ISP</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Elemento</TableHead>
                <TableHead>Customizável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personalizacao.map((item) => (
                <TableRow key={item.elemento}>
                  <TableCell className="font-medium">{item.elemento}</TableCell>
                  <TableCell>
                    {item.customizavel ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </TableCell>
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
