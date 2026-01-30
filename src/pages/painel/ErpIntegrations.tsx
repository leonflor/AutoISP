import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useErpConfigs, ErpConfig, ErpProvider } from '@/hooks/painel/useErpConfigs';
import { ErpProviderCard, ErpProviderInfo } from '@/components/painel/erp/ErpProviderCard';
import { IxcConfigDialog } from '@/components/painel/erp/IxcConfigDialog';
import { MkConfigDialog } from '@/components/painel/erp/MkConfigDialog';

const ERP_PROVIDERS: ErpProviderInfo[] = [
  {
    provider: 'ixc',
    name: 'IXC Soft',
    description: 'Sistema de gestão completo para provedores de internet',
    docsUrl: 'https://wikiapiprovedor.ixcsoft.com.br/',
    authType: 'token',
  },
  {
    provider: 'mk_solutions',
    name: 'MK-Solutions',
    description: 'Solução completa para gestão de ISPs',
    docsUrl: 'https://wiki.mksolutions.com.br/',
    authType: 'user_pass',
  },
  {
    provider: 'sgp',
    name: 'SGP',
    description: 'Sistema Gerencial de Provedores (em breve)',
    docsUrl: 'https://docs.sgp.com.br/',
    authType: 'user_pass',
  },
  {
    provider: 'hubsoft',
    name: 'Hubsoft',
    description: 'Plataforma de gestão para ISPs (em breve)',
    docsUrl: 'https://docs.hubsoft.com.br/',
    authType: 'api_key',
  },
];

export default function ErpIntegrations() {
  const { configs, isLoading, activeConfigsCount } = useErpConfigs();
  const [configDialog, setConfigDialog] = useState<{
    provider: ErpProvider;
    isOpen: boolean;
  } | null>(null);

  // Map configs by provider
  const configByProvider = useMemo(() => {
    return configs?.reduce((acc, config) => {
      acc[config.provider] = config;
      return acc;
    }, {} as Record<ErpProvider, ErpConfig>);
  }, [configs]);

  const handleConfigure = (provider: ErpProvider) => {
    // Only allow IXC and MK for now
    if (provider === 'sgp' || provider === 'hubsoft') {
      return;
    }
    setConfigDialog({ provider, isOpen: true });
  };

  const handleCloseDialog = () => {
    setConfigDialog(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/painel/configuracoes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Integração ERP</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-12">
            Conecte seu sistema de gestão para sincronizar dados automaticamente
          </p>
        </div>

        {activeConfigsCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {activeConfigsCount} ativo{activeConfigsCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Você pode conectar <strong>múltiplos ERPs</strong> simultaneamente</li>
            <li>Cada ERP mantém suas próprias credenciais de forma segura</li>
            <li>As credenciais são criptografadas e nunca expostas</li>
            <li>Use o botão "Testar" para verificar a conexão a qualquer momento</li>
          </ul>
        </CardContent>
      </Card>

      {/* Providers Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ERP_PROVIDERS.map((provider) => {
            const isComingSoon = provider.provider === 'sgp' || provider.provider === 'hubsoft';
            
            return (
              <div key={provider.provider} className={isComingSoon ? 'opacity-60' : ''}>
                <ErpProviderCard
                  provider={provider}
                  config={configByProvider?.[provider.provider]}
                  onConfigure={() => handleConfigure(provider.provider)}
                />
                {isComingSoon && (
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Em breve
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Config Dialogs */}
      {configDialog?.provider === 'ixc' && (
        <IxcConfigDialog
          open={configDialog.isOpen}
          config={configByProvider?.ixc}
          onClose={handleCloseDialog}
        />
      )}

      {configDialog?.provider === 'mk_solutions' && (
        <MkConfigDialog
          open={configDialog.isOpen}
          config={configByProvider?.mk_solutions}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
