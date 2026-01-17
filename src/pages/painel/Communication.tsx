import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCommunications } from '@/hooks/painel/useCommunications';
import { Send, Mail, MessageSquare, Bell, Plus, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const channelIcons: Record<string, any> = {
  whatsapp: MessageSquare,
  sms: MessageSquare,
  email: Mail,
  push: Bell,
};

const statusColors: Record<string, string> = {
  rascunho: 'bg-gray-500/10 text-gray-600',
  agendada: 'bg-blue-500/10 text-blue-600',
  enviando: 'bg-yellow-500/10 text-yellow-600',
  concluida: 'bg-green-500/10 text-green-600',
  cancelada: 'bg-red-500/10 text-red-600',
};

export default function CommunicationPage() {
  const { campaigns, templates, stats, loading } = useCommunications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunicação</h1>
          <p className="text-muted-foreground">Campanhas e disparos em massa</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enviadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaEntrega}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaLeitura}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Recentes</CardTitle>
            <CardDescription>Últimas campanhas criadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const Icon = channelIcons[campaign.channel] || Send;
                return (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.targetCount} destinatários
                      </p>
                    </div>
                    <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Modelos de mensagem reutilizáveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => {
                const Icon = channelIcons[template.channel] || Send;
                return (
                  <div
                    key={template.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{template.content}</p>
                    </div>
                    <Badge variant="outline">{template.channel}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
