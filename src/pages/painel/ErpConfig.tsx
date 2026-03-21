import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useErpConfigs, type ErpProvider } from '@/hooks/painel/useErpConfigs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Clock,
  Server,
} from 'lucide-react';

const ERP_PROVIDERS: { id: ErpProvider; name: string; available: boolean }[] = [
  { id: 'ixc', name: 'IXC Soft', available: true },
  { id: 'sgp', name: 'SGP', available: false },
  { id: 'mk_solutions', name: 'MK-Auth', available: false },
  { id: 'hubsoft', name: 'Hubsoft', available: false },
];

const CANONICAL_FIELDS = {
  'Perfil do Cliente': [
    'full_name', 'document', 'email', 'phone', 'status', 'plan_name', 'address',
  ],
  'Faturas': [
    'amount_cents', 'due_date', 'status', 'payment_link', 'barcode', 'paid_at',
  ],
  'Status do Serviço': [
    'connection_status', 'last_seen_at', 'signal_level', 'ip_address', 'mac_address',
  ],
  'Contrato': [
    'plan_name', 'plan_speed_mbps', 'monthly_amount_cents', 'start_date', 'status',
  ],
};

export default function ErpConfig() {
  const { configs, isLoading, saveConfig, getConfigByProvider } = useErpConfigs();
  const existingConfig = getConfigByProvider('ixc');

  const [apiUrl, setApiUrl] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [useHttps, setUseHttps] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState('');

  const handleTest = async () => {
    if (!apiUrl || !token || !userId) {
      toast.error('Preencha todos os campos antes de testar');
      return;
    }

    setTesting(true);
    setTestSuccess(false);
    setTestError('');

    try {
      const finalUrl = useHttps && !apiUrl.startsWith('https')
        ? apiUrl.replace(/^http:/, 'https:')
        : apiUrl;

      const { data, error } = await supabase.functions.invoke('test-erp', {
        body: {
          provider: 'ixc',
          api_url: finalUrl,
          credentials: { username: userId, password: token },
        },
      });

      if (error) throw error;

      if (data?.success) {
        setTestSuccess(true);
        toast.success(data.message || 'Conexão estabelecida com sucesso!');
      } else {
        setTestError(data?.message || 'Falha ao conectar com a API');
        toast.error(data?.message || 'Falha ao conectar');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao testar conexão';
      setTestError(msg);
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const finalUrl = useHttps && !apiUrl.startsWith('https')
      ? apiUrl.replace(/^http:/, 'https:')
      : apiUrl;

    saveConfig.mutate({
      provider: 'ixc',
      api_url: finalUrl,
      credentials: { username: userId, password: token },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Integração com sistema de gestão
        </h1>
        <p className="text-muted-foreground mt-1">
          Conecte seu ERP para sincronizar dados de assinantes, faturas e serviços.
        </p>
      </div>

      {/* Provider Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ERP_PROVIDERS.map((provider) => (
          <Card
            key={provider.id}
            className={`cursor-default transition-all ${
              provider.available
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'opacity-60'
            }`}
          >
            <CardContent className="p-4 text-center">
              <Server className={`h-8 w-8 mx-auto mb-2 ${provider.available ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium text-sm text-foreground">{provider.name}</p>
              {!provider.available && (
                <Badge variant="secondary" className="mt-2 text-xs">Em breve</Badge>
              )}
              {provider.available && existingConfig?.is_connected && (
                <Badge className="mt-2 text-xs bg-green-600">Conectado</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Existing config status */}
      {existingConfig && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {existingConfig.is_connected ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span className="text-sm font-medium text-foreground">
                {existingConfig.is_connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            {existingConfig.api_url && (
              <span className="text-sm text-muted-foreground">
                URL: {existingConfig.api_url}
              </span>
            )}
            {existingConfig.connected_at && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Conectado em: {new Date(existingConfig.connected_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* IXC Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuração IXC Soft</CardTitle>
          <CardDescription>
            Insira as credenciais da API do seu IXC Soft para conectar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">URL base da API</Label>
            <Input
              id="api-url"
              placeholder="https://sistema.empresa.com.br"
              value={apiUrl}
              onChange={(e) => { setApiUrl(e.target.value); setTestSuccess(false); }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Token de acesso</Label>
            <Input
              id="token"
              type="password"
              placeholder={existingConfig?.masked_key || '••••••••••'}
              value={token}
              onChange={(e) => { setToken(e.target.value); setTestSuccess(false); }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-id">ID do usuário API</Label>
            <Input
              id="user-id"
              type="number"
              placeholder="Ex: 1"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setTestSuccess(false); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="use-https"
              checked={useHttps}
              onCheckedChange={(v) => setUseHttps(v === true)}
            />
            <Label htmlFor="use-https" className="cursor-pointer">Usar HTTPS</Label>
          </div>

          {testError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {testError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testing || !apiUrl || !token || !userId}
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Testar conexão
            </Button>

            <Button
              onClick={handleSave}
              disabled={!testSuccess || saveConfig.isPending}
            >
              {saveConfig.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar configuração
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Fields */}
      {testSuccess && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Campos disponíveis
            </CardTitle>
            <CardDescription>
              Dados canônicos que serão sincronizados via integração IXC Soft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(CANONICAL_FIELDS).map(([category, fields]) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm text-foreground mb-2">{category}</h4>
                  <ul className="space-y-1">
                    {fields.map((field) => (
                      <li key={field} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{field}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
