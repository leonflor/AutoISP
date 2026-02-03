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
import { SgpConfigDialog } from '@/components/painel/erp/SgpConfigDialog';

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
    description: 'Sistema Gerencial de Provedores',
    docsUrl: 'https://sgp.net.br/',
    authType: 'token',
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
  const { configs, isLoading, activeConfigsCount, testConnection } = useErpConfigs();
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
    // Only Hubsoft is "em breve" now
    if (provider === 'hubsoft') {
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

      {/* Providers Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {ERP_PROVIDERS.map((provider) => {
            const isComingSoon = provider.provider === 'hubsoft';
            
            return (
              <div key={provider.provider} className={isComingSoon ? 'opacity-60' : ''}>
                <ErpProviderCard
                  provider={provider}
                  config={configByProvider?.[provider.provider]}
                  onConfigure={() => handleConfigure(provider.provider)}
                  onTest={() => testConnection.mutate(provider.provider)}
                  isTestingConnection={
                    testConnection.isPending && 
                    testConnection.variables === provider.provider
                  }
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

      {configDialog?.provider === 'sgp' && (
        <SgpConfigDialog
          open={configDialog.isOpen}
          config={configByProvider?.sgp}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
