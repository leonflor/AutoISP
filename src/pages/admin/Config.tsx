import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
import { IntegrationConfigDialog, type IntegrationType } from "@/components/admin/integrations";
import { useIntegrationCheck } from "@/hooks/admin/useIntegrationCheck";
import { useToast } from "@/hooks/use-toast";
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
  Settings2,
  Loader2,
  Zap
} from "lucide-react";

const Config = () => {
  const { configMap, isLoading, getValue, batchUpdate, updateConfig, isUpdating } = usePlatformConfig();
  const { checkIntegration, isChecking, checkingIntegration } = useIntegrationCheck();
  const { toast } = useToast();
  
  // Dialog state for integration configuration
  const [configDialog, setConfigDialog] = useState<{
    open: boolean;
    integration: IntegrationType;
  }>({ open: false, integration: null });

  // Local states for form fields
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#10b981");
  
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxSessions, setMaxSessions] = useState("3");
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logRetention, setLogRetention] = useState("90");

  // Sync local state with config when loaded - access configMap directly to avoid getValue reference issues
  useEffect(() => {
    if (!isLoading && configMap && Object.keys(configMap).length > 0) {
      setPlatformName((configMap.platform_name?.value as string) ?? "AutoISP");
      setSupportEmail((configMap.support_email?.value as string) ?? "suporte@autoisp.com.br");
      setSiteUrl((configMap.site_url?.value as string) ?? "https://autoisp.com.br");
      setPrimaryColor((configMap.primary_color?.value as string) ?? "#3b82f6");
      setSecondaryColor((configMap.secondary_color?.value as string) ?? "#10b981");
      setRequire2FA((configMap.require_2fa?.value as boolean) ?? true);
      setSessionTimeout(String(configMap.session_timeout?.value ?? 30));
      setMaxSessions(String(configMap.max_sessions?.value ?? 3));
      setMinPasswordLength(String(configMap.min_password_length?.value ?? 8));
      setMaintenanceMode((configMap.maintenance_mode?.value as boolean) ?? false);
      setLogRetention(String(configMap.log_retention_days?.value ?? 90));
    }
  }, [isLoading, configMap]);

  const integrations = [
    { 
      name: "OpenAI", 
      key: "integration_openai",
      icon: Brain, 
      configured: configMap?.integration_openai?.configured ?? false, 
      description: "IA para atendimento automático" 
    },
    { 
      name: "Resend", 
      key: "integration_resend",
      icon: Mail, 
      configured: configMap?.integration_resend?.configured ?? false, 
      description: "Envio de emails transacionais" 
    },
    { 
      name: "Asaas", 
      key: "integration_asaas",
      icon: CreditCard, 
      configured: configMap?.integration_asaas?.configured ?? false, 
      description: "Gateway de pagamentos" 
    },
    { 
      name: "Push Notifications", 
      key: "integration_push",
      icon: Bell, 
      configured: configMap?.integration_push?.configured ?? false, 
      description: "Notificações push" 
    },
  ];

  const handleSavePlatform = () => {
    batchUpdate([
      { key: "platform_name", value: { value: platformName } },
      { key: "support_email", value: { value: supportEmail } },
      { key: "site_url", value: { value: siteUrl } },
      { key: "primary_color", value: { value: primaryColor } },
      { key: "secondary_color", value: { value: secondaryColor } },
    ]);
  };

  const handleSaveSecurity = () => {
    batchUpdate([
      { key: "require_2fa", value: { value: require2FA } },
      { key: "session_timeout", value: { value: parseInt(sessionTimeout) } },
      { key: "max_sessions", value: { value: parseInt(maxSessions) } },
      { key: "min_password_length", value: { value: parseInt(minPasswordLength) } },
    ]);
  };

  const handleSaveSystem = () => {
    batchUpdate([
      { key: "maintenance_mode", value: { value: maintenanceMode } },
      { key: "log_retention_days", value: { value: parseInt(logRetention) } },
    ]);
  };

  const handleOpenIntegrationDialog = (integration: IntegrationType) => {
    setConfigDialog({ open: true, integration });
  };

  const handleCloseIntegrationDialog = () => {
    setConfigDialog({ open: false, integration: null });
  };

  // Handler para teste direto de conectividade (sem abrir modal)
  const handleTestIntegration = async (integrationKey: string) => {
    const integration = integrationKey.replace("integration_", "") as "openai" | "resend" | "asaas";
    const result = await checkIntegration(integration);
    
    if (result.success) {
      toast({
        title: "Integração Online",
        description: result.message,
      });
    } else {
      toast({
        title: "Falha no Teste",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveIntegration = (integration: IntegrationType, config: Record<string, unknown>) => {
    if (!integration) return;
    
    const key = `integration_${integration}`;
    updateConfig({ 
      key, 
      value: config 
    });
    
    toast({
      title: "Integração configurada",
      description: `A integração ${integration.toUpperCase()} foi configurada com sucesso.`,
    });
    
    handleCloseIntegrationDialog();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

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
            <Button onClick={handleSavePlatform} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
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
                {integrations.map((integration) => {
                  const integrationConfig = configMap?.[integration.key] as {
                    masked_key?: string;
                    environment?: string;
                  } | undefined;
                  
                  return (
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
                          {/* Show masked key if configured */}
                          {integration.configured && integrationConfig?.masked_key && (
                            <p className="text-xs font-mono text-muted-foreground mt-1">
                              {integrationConfig.masked_key}
                              {integrationConfig.environment && (
                                <span className="ml-2 text-xs">
                                  ({integrationConfig.environment})
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.configured ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTestIntegration(integration.key)}
                              disabled={isChecking && checkingIntegration === integration.key.replace("integration_", "")}
                            >
                              {isChecking && checkingIntegration === integration.key.replace("integration_", "") ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Zap className="h-4 w-4 mr-2" />
                              )}
                              Testar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenIntegrationDialog(integration.key.replace("integration_", "") as IntegrationType)}
                            >
                              <Settings2 className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleOpenIntegrationDialog(integration.key.replace("integration_", "") as IntegrationType)}
                            disabled={integration.key === "integration_push"}
                          >
                            {integration.key === "integration_push" ? "Em breve" : "Configurar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            <Button onClick={handleSaveSecurity} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
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
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      O modo manutenção está ativo. Usuários não conseguirão acessar a plataforma.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSystem} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Config Dialog */}
      <IntegrationConfigDialog
        open={configDialog.open}
        integration={configDialog.integration}
        isConfigured={
          configDialog.integration 
            ? (configMap?.[`integration_${configDialog.integration}`]?.configured ?? false)
            : false
        }
        onClose={handleCloseIntegrationDialog}
      />
    </div>
  );
};

export default Config;
