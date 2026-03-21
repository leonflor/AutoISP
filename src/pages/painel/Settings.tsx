import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useIspMembership } from '@/hooks/useIspMembership';
import { useErpConfigs } from '@/hooks/painel/useErpConfigs';
import { useWhatsAppConfig } from '@/hooks/painel/useWhatsAppConfig';
import { Building2, Palette, Bell, Link as LinkIcon, CheckCircle, XCircle, ChevronRight, Database, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const { membership } = useIspMembership();
  const { activeConfigsCount } = useErpConfigs();

  const integrations = [
    { 
      name: 'WhatsApp Business', 
      status: 'pendente' as const, 
      icon: MessageSquare,
      href: '/painel/whatsapp',
      description: 'Comunicação via WhatsApp'
    },
    { 
      name: 'ERP', 
      status: activeConfigsCount > 0 ? 'configurado' as const : 'pendente' as const,
      icon: Database,
      href: '/painel/integracoes/erp',
      description: 'IXC Soft, MK-Solutions e outros',
      badge: activeConfigsCount > 0 ? `${activeConfigsCount} ativo${activeConfigsCount > 1 ? 's' : ''}` : null
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu provedor</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="personalizacao" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Personalização</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Dados da Empresa</CardTitle>
              </div>
              <CardDescription>Informações básicas do provedor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Provedor</Label>
                <Input defaultValue={membership?.ispName || ''} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label>E-mail de Contato</Label>
                <Input type="email" placeholder="contato@provedor.com" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(00) 0000-0000" />
              </div>
              <Button className="w-full">Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalizacao">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Personalização</CardTitle>
              </div>
              <CardDescription>Aparência e branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Arraste uma imagem ou clique para fazer upload
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor Primária</Label>
                <div className="flex gap-2">
                  <Input type="color" className="w-16 h-10" defaultValue="#6366f1" />
                  <Input placeholder="#6366f1" className="flex-1" />
                </div>
              </div>
              <Button variant="outline" className="w-full">Salvar Personalização</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notificações</CardTitle>
              </div>
              <CardDescription>Preferências de alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novos atendimentos</p>
                  <p className="text-sm text-muted-foreground">Receber alerta de tickets abertos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transferência humana</p>
                  <p className="text-sm text-muted-foreground">Quando IA solicitar ajuda</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Limite de IA</p>
                  <p className="text-sm text-muted-foreground">Alerta ao atingir 80% do limite</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Relatórios semanais</p>
                  <p className="text-sm text-muted-foreground">Resumo por e-mail</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                <CardTitle>Integrações</CardTitle>
              </div>
              <CardDescription>Status das conexões externas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <Link
                    key={integration.name}
                    to={integration.href}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <integration.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{integration.name}</span>
                          {integration.badge && (
                            <Badge variant="outline" className="text-xs">
                              {integration.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === 'configurado' ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Configurado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
