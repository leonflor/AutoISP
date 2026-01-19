import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Building2, 
  Key, 
  Shield, 
  Database,
  Mail,
  CreditCard,
  Bell,
  Brain,
  Clock,
  Lock,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Settings2
} from "lucide-react";

const Config = () => {
  const [platformName, setPlatformName] = useState("AutoISP");
  const [supportEmail, setSupportEmail] = useState("suporte@autoisp.com.br");
  const [siteUrl, setSiteUrl] = useState("https://autoisp.com.br");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#10b981");
  
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxSessions, setMaxSessions] = useState("3");
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logRetention, setLogRetention] = useState("90");

  const integrations = [
    { name: "OpenAI", icon: Brain, configured: true, description: "IA para atendimento automático" },
    { name: "Resend", icon: Mail, configured: false, description: "Envio de emails transacionais" },
    { name: "Asaas", icon: CreditCard, configured: true, description: "Gateway de pagamentos" },
    { name: "Push Notifications", icon: Bell, configured: false, description: "Notificações push" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Configure a plataforma AutoISP</p>
      </div>

      <Tabs defaultValue="plataforma" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="plataforma" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:inline" />
            Plataforma
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Key className="h-4 w-4 hidden sm:inline" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:inline" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Database className="h-4 w-4 hidden sm:inline" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Tab Plataforma */}
        <TabsContent value="plataforma" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Identidade Visual
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo da Plataforma</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="sm">
                      Alterar Logo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Gerais
                </CardTitle>
                <CardDescription>
                  Dados básicos da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Nome da Plataforma</Label>
                  <Input
                    id="platformName"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de Suporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL do Site</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </TabsContent>

        {/* Tab Integrações */}
        <TabsContent value="integracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                APIs e Serviços
              </CardTitle>
              <CardDescription>
                Gerencie as integrações com serviços externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {integration.configured ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Configurado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.configured ? (
                        <>
                          <Button variant="outline" size="sm">
                            Testar
                          </Button>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </>
                      ) : (
                        <Button size="sm">Configurar</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Autenticação 2FA
                </CardTitle>
                <CardDescription>
                  Configure a autenticação em dois fatores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Obrigatório para Admins</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir 2FA para todos os administradores
                    </p>
                  </div>
                  <Switch
                    checked={require2FA}
                    onCheckedChange={setRequire2FA}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Métodos Permitidos</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">TOTP (App)</Badge>
                    <Badge variant="outline">Email</Badge>
                    <Badge variant="outline">SMS</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Sessões
                </CardTitle>
                <CardDescription>
                  Configure o gerenciamento de sessões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSessions">Máximo de Sessões Simultâneas</Label>
                  <Input
                    id="maxSessions"
                    type="number"
                    value={maxSessions}
                    onChange={(e) => setMaxSessions(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Políticas de Senha
                </CardTitle>
                <CardDescription>
                  Defina os requisitos mínimos de senha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minPasswordLength">Tamanho Mínimo</Label>
                  <Input
                    id="minPasswordLength"
                    type="number"
                    value={minPasswordLength}
                    onChange={(e) => setMinPasswordLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requisitos</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Letras maiúsculas</Badge>
                    <Badge variant="secondary">Números</Badge>
                    <Badge variant="secondary">Caracteres especiais</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </TabsContent>

        {/* Tab Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backups
                </CardTitle>
                <CardDescription>
                  Gerenciamento de backups do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="font-medium">Último Backup</p>
                    <p className="text-sm text-muted-foreground">há 2 horas</p>
                  </div>
                  <Badge variant="default">Sucesso</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Backup
                  </Button>
                  <Button className="flex-1">
                    Executar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Logs de Auditoria
                </CardTitle>
                <CardDescription>
                  Configuração de logs e auditoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Retenção de Logs (dias)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={logRetention}
                    onChange={(e) => setLogRetention(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Ver Logs
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Manutenção
                </CardTitle>
                <CardDescription>
                  Modo de manutenção do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Desativa o acesso público temporariamente
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                {maintenanceMode && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ O sistema está em modo de manutenção
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button>Salvar Alterações</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Config;
