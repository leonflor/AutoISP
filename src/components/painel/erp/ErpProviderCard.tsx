import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Settings, Plus, ExternalLink, Link, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ErpConfig, ErpProvider } from '@/hooks/painel/useErpConfigs';

export interface ErpProviderInfo {
  provider: ErpProvider;
  name: string;
  description: string;
  docsUrl: string;
  authType: 'token' | 'user_pass' | 'api_key';
}

interface ErpProviderCardProps {
  provider: ErpProviderInfo;
  config?: ErpConfig;
  onConfigure: () => void;
  onTest?: () => void;
  isTestingConnection?: boolean;
}

export function ErpProviderCard({ provider, config, onConfigure, onTest, isTestingConnection }: ErpProviderCardProps) {
  const isConfigured = config?.is_connected;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md flex flex-col min-h-[220px]',
        isConfigured && 'border-green-500/30 bg-green-500/5'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{provider.name}</CardTitle>
          {isConfigured ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Circle className="h-3 w-3 mr-1" />
              Não configurado
            </Badge>
          )}
        </div>
        <CardDescription>{provider.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        {isConfigured && config && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="truncate">{config.api_url}</span>
            </div>
            {config.connected_at && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>
                  Conectado em: {format(new Date(config.connected_at), 'dd/MM/yyyy HH:mm')}
                </span>
              </div>
            )}
            {config.masked_key && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {config.masked_key}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <Button
            variant={isConfigured ? 'outline' : 'default'}
            className="flex-1"
            onClick={onConfigure}
          >
            {isConfigured ? (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Configurar
              </>
            )}
          </Button>

          {isConfigured && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={onTest}
                disabled={isTestingConnection}
                title="Testar conexão"
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
