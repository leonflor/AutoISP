

# Integracao ERP Multi-Provider para ISPs

## Objetivo

Implementar um sistema de integracao ERP que permita ao cliente (ISP) escolher e configurar multiplos ERPs simultaneamente (ex: IXC Soft e MK-Solutions). Cada ISP gerencia suas proprias credenciais de forma isolada, sem acesso aos dados de outros ISPs.

---

## Visao Geral da Arquitetura

```text
+---------------------------------------------------------------+
|                    Configuracoes > Integracoes                 |
+---------------------------------------------------------------+
|                                                                |
|  +------------------+  +------------------+  +----------------+ |
|  | WhatsApp Business|  | ERP              |  | Outros...      | |
|  | [Configurado]    |  | [2 ativos]       |  | [Pendente]     | |
|  +------------------+  +------------------+  +----------------+ |
|                              |                                 |
|                              v                                 |
|  +----------------------------------------------------------+ |
|  |               Pagina de Integracao ERP                    | |
|  +----------------------------------------------------------+ |
|  |                                                           | |
|  |  Provedores Disponiveis:                                  | |
|  |  +-------------+  +-------------+  +-------------+        | |
|  |  | IXC Soft    |  | MK-Solutions|  | SGP         |        | |
|  |  | [Conectado] |  | [Conectado] |  | [Adicionar] |        | |
|  |  | [Editar]    |  | [Editar]    |  |             |        | |
|  |  +-------------+  +-------------+  +-------------+        | |
|  |                                                           | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

---

## ERPs Suportados

| Provider | Nome Display | Tipo API | Autenticacao | Status |
|----------|-------------|----------|--------------|--------|
| `ixc` | IXC Soft | REST | Basic Auth (Token) | MVP |
| `mk_solutions` | MK-Solutions | REST/SOAP | User + API Key | MVP |
| `sgp` | SGP | REST | User + Password | Futuro |
| `hubsoft` | Hubsoft | REST | API Key | Futuro |

---

## Modelo de Dados

A tabela `erp_configs` ja suporta multiplos ERPs por ISP atraves da chave unica `(isp_id, provider)`:

```typescript
// Cada ISP pode ter uma config para cada provider
interface ErpConfig {
  id: string;
  isp_id: string;
  provider: 'ixc' | 'mk_solutions' | 'sgp' | 'hubsoft' | 'other';
  api_url: string | null;
  api_key_encrypted: string | null;
  username: string | null;
  password_encrypted: string | null;
  sync_enabled: boolean;
  last_sync_at: string | null;
  sync_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Um ISP pode ter:
// - 1 config para IXC (provider = 'ixc')
// - 1 config para MK-Solutions (provider = 'mk_solutions')
// Ambas ativas simultaneamente
```

### Campos Adicionais Necessarios na Tabela

```sql
ALTER TABLE erp_configs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS masked_key TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Garantir indice unico
CREATE UNIQUE INDEX IF NOT EXISTS idx_erp_configs_isp_provider 
ON erp_configs(isp_id, provider);
```

---

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/painel/ErpIntegrations.tsx` | Pagina principal com lista de ERPs |
| `src/components/painel/erp/ErpProviderCard.tsx` | Card de cada provider |
| `src/components/painel/erp/IxcConfigDialog.tsx` | Modal config IXC |
| `src/components/painel/erp/MkConfigDialog.tsx` | Modal config MK-Solutions |
| `src/hooks/painel/useErpConfigs.ts` | Hook para gerenciar configs |
| `supabase/functions/save-erp-config/index.ts` | Salvar config criptografada |
| `supabase/functions/test-erp/index.ts` | Testar conexao (multiplos providers) |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/painel/integracoes/erp` |
| `src/pages/painel/Settings.tsx` | Link para pagina de ERP na aba Integracoes |
| `src/types/database.ts` | Adicionar campos extras na interface ErpConfig |

---

## Secao Tecnica

### Pagina Principal: ErpIntegrations.tsx

```typescript
interface ErpProviderInfo {
  provider: ErpProvider;
  name: string;
  description: string;
  logo?: string;
  docsUrl: string;
  authType: 'token' | 'user_pass' | 'api_key';
}

const ERP_PROVIDERS: ErpProviderInfo[] = [
  {
    provider: 'ixc',
    name: 'IXC Soft',
    description: 'Sistema de gestao para provedores de internet',
    docsUrl: 'https://wikiapiprovedor.ixcsoft.com.br/',
    authType: 'token',
  },
  {
    provider: 'mk_solutions',
    name: 'MK-Solutions',
    description: 'Solucao completa para gestao de ISPs',
    docsUrl: 'https://wiki.mksolutions.com.br/',
    authType: 'user_pass',
  },
  {
    provider: 'sgp',
    name: 'SGP',
    description: 'Sistema Gerencial de Provedores',
    docsUrl: 'https://docs.sgp.com.br/',
    authType: 'user_pass',
  },
];

export default function ErpIntegrations() {
  const { configs, isLoading } = useErpConfigs();
  const [configDialog, setConfigDialog] = useState<{
    provider: ErpProvider;
    isOpen: boolean;
  } | null>(null);

  // Mapear configs existentes por provider
  const configByProvider = useMemo(() => {
    return configs?.reduce((acc, config) => {
      acc[config.provider] = config;
      return acc;
    }, {} as Record<ErpProvider, ErpConfig>);
  }, [configs]);

  return (
    <div className="space-y-6">
      <div>
        <h1>Integracao ERP</h1>
        <p>Conecte seu sistema de gestao para sincronizar dados</p>
      </div>

      {/* Grid de Providers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ERP_PROVIDERS.map((provider) => (
          <ErpProviderCard
            key={provider.provider}
            provider={provider}
            config={configByProvider?.[provider.provider]}
            onConfigure={() => setConfigDialog({ 
              provider: provider.provider, 
              isOpen: true 
            })}
          />
        ))}
      </div>

      {/* Dialogs de configuracao */}
      {configDialog?.provider === 'ixc' && (
        <IxcConfigDialog
          open={configDialog.isOpen}
          config={configByProvider?.ixc}
          onClose={() => setConfigDialog(null)}
        />
      )}

      {configDialog?.provider === 'mk_solutions' && (
        <MkConfigDialog
          open={configDialog.isOpen}
          config={configByProvider?.mk_solutions}
          onClose={() => setConfigDialog(null)}
        />
      )}
    </div>
  );
}
```

### Componente ErpProviderCard

```typescript
interface ErpProviderCardProps {
  provider: ErpProviderInfo;
  config?: ErpConfig;
  onConfigure: () => void;
}

export function ErpProviderCard({ provider, config, onConfigure }: ErpProviderCardProps) {
  const isConfigured = config?.is_connected;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isConfigured && "border-green-500/30 bg-green-500/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{provider.name}</CardTitle>
          {isConfigured ? (
            <Badge className="bg-green-500/10 text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Circle className="h-3 w-3 mr-1" />
              Nao configurado
            </Badge>
          )}
        </div>
        <CardDescription>{provider.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isConfigured && config && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="truncate">{config.api_url}</span>
            </div>
            {config.last_sync_at && (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Ultima sync: {format(new Date(config.last_sync_at), "dd/MM HH:mm")}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant={isConfigured ? "outline" : "default"} 
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
            <Button variant="outline" size="icon" asChild>
              <a href={provider.docsUrl} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Hook useErpConfigs

```typescript
export function useErpConfigs() {
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;
  const queryClient = useQueryClient();

  // Buscar todas as configs do ISP
  const { data: configs, isLoading } = useQuery({
    queryKey: ['erp-configs', ispId],
    queryFn: async () => {
      if (!ispId) return [];
      
      const { data, error } = await supabase
        .from('erp_configs')
        .select('*')
        .eq('isp_id', ispId);
      
      if (error) throw error;
      return data as ErpConfig[];
    },
    enabled: !!ispId,
  });

  // Mutation para salvar config
  const saveConfig = useMutation({
    mutationFn: async (data: {
      provider: ErpProvider;
      api_url: string;
      credentials: Record<string, string>;
      options?: Record<string, unknown>;
    }) => {
      const { data: result, error } = await supabase.functions.invoke(
        'save-erp-config',
        { body: data }
      );
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-configs', ispId] });
      toast.success('Configuracao salva com sucesso!');
    },
  });

  // Mutation para testar conexao
  const testConnection = useMutation({
    mutationFn: async (provider: ErpProvider) => {
      const { data: result, error } = await supabase.functions.invoke(
        'test-erp',
        { body: { provider } }
      );
      
      if (error) throw error;
      return result;
    },
  });

  // Mutation para remover config
  const removeConfig = useMutation({
    mutationFn: async (provider: ErpProvider) => {
      const { error } = await supabase
        .from('erp_configs')
        .delete()
        .eq('isp_id', ispId)
        .eq('provider', provider);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['erp-configs', ispId] });
      toast.success('Integracao removida');
    },
  });

  return { 
    configs, 
    isLoading, 
    saveConfig, 
    testConnection, 
    removeConfig 
  };
}
```

### Modal IxcConfigDialog

```typescript
const formSchema = z.object({
  api_url: z.string().url('URL invalida').min(1, 'URL e obrigatoria'),
  token: z.string().min(1, 'Token e obrigatorio'),
  self_signed_cert: z.boolean().default(false),
});

export function IxcConfigDialog({ open, config, onClose }: Props) {
  const { saveConfig, testConnection } = useErpConfigs();
  const [showToken, setShowToken] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      api_url: config?.api_url || '',
      token: '', // Nunca preencher (criptografado)
      self_signed_cert: config?.sync_config?.self_signed_cert || false,
    },
  });

  const onSubmit = (data: FormData) => {
    saveConfig.mutate({
      provider: 'ixc',
      api_url: data.api_url,
      credentials: { token: data.token },
      options: { self_signed_cert: data.self_signed_cert },
    }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Configurar IXC Soft
          </DialogTitle>
          <DialogDescription>
            Configure a integracao com seu sistema IXC
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Status Badge se ja configurado */}
            {config?.is_connected && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Integracao ativa</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection.mutate('ixc')}
                    disabled={testConnection.isPending}
                  >
                    {testConnection.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Masked Key se existir */}
            {config?.masked_key && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <KeyRound className="h-4 w-4" />
                <span className="font-mono text-sm">{config.masked_key}</span>
                <Badge variant="outline" className="ml-auto">Configurado</Badge>
              </div>
            )}

            <FormField name="api_url" ... />
            <FormField name="token" (password com toggle) ... />
            <FormField name="self_signed_cert" (Switch) ... />

            <Separator />

            {/* Instrucoes */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm">
                <HelpCircle className="h-4 w-4" />
                Como obter o token?
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>Acesse IXC > Configuracoes > Usuarios</li>
                  <li>Crie ou edite um usuario</li>
                  <li>Marque "Permite acesso ao webservice"</li>
                  <li>Copie o Token gerado</li>
                </ol>
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveConfig.isPending}>
                {saveConfig.isPending && <Loader2 className="animate-spin mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### Modal MkConfigDialog

```typescript
// Diferente do IXC, MK-Solutions usa usuario + senha/api_key
const formSchema = z.object({
  api_url: z.string().url('URL invalida'),
  username: z.string().min(1, 'Usuario e obrigatorio'),
  api_key: z.string().min(1, 'API Key e obrigatoria'),
});

export function MkConfigDialog({ open, config, onClose }: Props) {
  // Similar ao IxcConfigDialog mas com campos diferentes
  
  const onSubmit = (data: FormData) => {
    saveConfig.mutate({
      provider: 'mk_solutions',
      api_url: data.api_url,
      credentials: { 
        username: data.username,
        api_key: data.api_key 
      },
    }, {
      onSuccess: () => onClose(),
    });
  };

  // Instrucoes especificas para MK-Solutions
  // ...
}
```

### Edge Function save-erp-config

```typescript
// supabase/functions/save-erp-config/index.ts

interface SaveRequest {
  provider: 'ixc' | 'mk_solutions' | 'sgp' | 'hubsoft';
  api_url: string;
  credentials: {
    token?: string;       // IXC
    username?: string;    // MK, SGP
    password?: string;    // SGP
    api_key?: string;     // MK, Hubsoft
  };
  options?: {
    self_signed_cert?: boolean;
    sync_interval?: number;
  };
}

serve(async (req) => {
  // 1. Validar JWT e obter user_id
  const userId = await validateAuth(req);
  
  // 2. Verificar membership e permissao (isp_admin/owner)
  const membership = await getMembership(userId);
  if (!['admin', 'owner'].includes(membership.role)) {
    return error(403, 'Sem permissao para configurar integracoes');
  }
  
  const ispId = membership.isp_id;
  const body = await req.json() as SaveRequest;
  
  // 3. Testar conexao antes de salvar
  const testResult = await testErpConnection(body.provider, body.api_url, body.credentials);
  if (!testResult.success) {
    return error(400, testResult.message);
  }
  
  // 4. Criptografar credenciais
  const masterKey = Deno.env.get('ENCRYPTION_KEY');
  const encryptedData = await encryptCredentials(body.credentials, masterKey);
  
  // 5. Upsert na tabela (unico por isp_id + provider)
  const { error: upsertError } = await supabaseAdmin
    .from('erp_configs')
    .upsert({
      isp_id: ispId,
      provider: body.provider,
      api_url: body.api_url,
      api_key_encrypted: encryptedData.api_key_ciphertext,
      username: body.credentials.username || null,
      password_encrypted: encryptedData.password_ciphertext,
      encryption_iv: encryptedData.iv,
      masked_key: encryptedData.masked_key,
      is_active: true,
      is_connected: true,
      connected_at: new Date().toISOString(),
      sync_config: body.options || {},
    }, {
      onConflict: 'isp_id,provider'
    });

  if (upsertError) {
    return error(500, 'Erro ao salvar configuracao');
  }
  
  // 6. Registrar em audit log
  await supabaseAdmin.from('audit_logs').insert({
    isp_id: ispId,
    user_id: userId,
    action: 'erp_config_saved',
    entity_type: 'erp_configs',
    new_data: { provider: body.provider, api_url: body.api_url },
  });

  return success({ 
    message: `Integracao ${body.provider.toUpperCase()} configurada com sucesso` 
  });
});
```

### Edge Function test-erp

```typescript
// supabase/functions/test-erp/index.ts

interface TestRequest {
  provider: ErpProvider;
  // Se fornecidas, testa com essas credenciais (antes de salvar)
  api_url?: string;
  credentials?: Record<string, string>;
}

serve(async (req) => {
  const userId = await validateAuth(req);
  const membership = await getMembership(userId);
  const ispId = membership.isp_id;
  const body = await req.json() as TestRequest;
  
  let apiUrl: string;
  let credentials: Record<string, string>;
  
  if (body.api_url && body.credentials) {
    // Teste com credenciais fornecidas
    apiUrl = body.api_url;
    credentials = body.credentials;
  } else {
    // Buscar do banco e descriptografar
    const config = await getDecryptedConfig(ispId, body.provider);
    apiUrl = config.api_url;
    credentials = config.decryptedCredentials;
  }
  
  // Testar conexao baseado no provider
  let result: TestResult;
  
  switch (body.provider) {
    case 'ixc':
      result = await testIxcConnection(apiUrl, credentials.token);
      break;
    case 'mk_solutions':
      result = await testMkConnection(apiUrl, credentials.username, credentials.api_key);
      break;
    default:
      return error(400, 'Provider nao suportado');
  }
  
  // Atualizar status de conexao no banco
  if (result.success) {
    await supabaseAdmin
      .from('erp_configs')
      .update({ 
        is_connected: true, 
        connected_at: new Date().toISOString() 
      })
      .eq('isp_id', ispId)
      .eq('provider', body.provider);
  }

  return success(result);
});

// Adaptadores por provider
async function testIxcConnection(apiUrl: string, token: string): Promise<TestResult> {
  const response = await fetch(`${apiUrl}/webservice/v1/cliente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${token}`,
      'ixcsoft': 'listar'
    },
    body: JSON.stringify({
      qtype: 'id', query: '1', oper: '>', page: '1', rp: '1'
    })
  });
  
  if (response.status === 401) {
    return { success: false, message: 'Token invalido ou expirado' };
  }
  
  if (!response.ok) {
    return { success: false, message: `Erro HTTP ${response.status}` };
  }
  
  return { success: true, message: 'Conexao IXC estabelecida' };
}

async function testMkConnection(apiUrl: string, username: string, apiKey: string): Promise<TestResult> {
  // MK-Solutions usa autenticacao diferente
  const response = await fetch(`${apiUrl}/api/v1/clientes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-MK-User': username,
      'X-MK-ApiKey': apiKey,
    }
  });
  
  if (response.status === 401 || response.status === 403) {
    return { success: false, message: 'Credenciais invalidas' };
  }
  
  if (!response.ok) {
    return { success: false, message: `Erro HTTP ${response.status}` };
  }
  
  return { success: true, message: 'Conexao MK-Solutions estabelecida' };
}
```

---

## Modificacao na Aba Integracoes (Settings.tsx)

```typescript
// Atualizar array de integrations para linkar corretamente
const integrations = [
  { 
    name: 'WhatsApp Business', 
    status: whatsappConnected ? 'configurado' : 'pendente',
    icon: '💬',
    href: '/painel/whatsapp'
  },
  { 
    name: 'ERP', 
    status: erpCount > 0 ? 'configurado' : 'pendente',
    icon: '📊',
    href: '/painel/integracoes/erp',
    badge: erpCount > 0 ? `${erpCount} ativo${erpCount > 1 ? 's' : ''}` : null
  },
];

// No JSX, cada item vira um link clicavel
<Link to={integration.href}>
  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
    ...
  </div>
</Link>
```

---

## Fluxo de Seguranca Multi-Tenant

```text
1. Usuario acessa /painel/integracoes/erp
2. Hook busca erp_configs WHERE isp_id = membership.ispId
3. RLS garante que so retorna configs do proprio ISP
4. Usuario clica em "Configurar IXC"
5. Preenche URL + Token e clica Salvar
6. Edge Function:
   a. Valida JWT
   b. Busca membership do user -> obtem isp_id
   c. Testa conexao
   d. Criptografa token
   e. Upsert com isp_id do usuario
7. Usuario pode repetir para MK-Solutions
8. Ambos ERPs ficam ativos simultaneamente
```

---

## Tratamento de Erros por Provider

### IXC Soft

| Codigo | Cenario | Mensagem |
|--------|---------|----------|
| 401 | Token invalido | Token invalido ou expirado. Gere um novo no IXC. |
| 404 | URL incorreta | Endpoint nao encontrado. Verifique a URL. |
| SSL_ERROR | Certificado | Erro de certificado. Marque "Certificado Self-Signed". |

### MK-Solutions

| Codigo | Cenario | Mensagem |
|--------|---------|----------|
| 401/403 | Credenciais | Usuario ou API Key invalidos. |
| 404 | URL incorreta | Servidor nao encontrado. Verifique a URL. |
| 500 | Servidor | Erro interno do MK-Solutions. Tente novamente. |

---

## Ordem de Implementacao

1. Migracao: adicionar campos na tabela `erp_configs`
2. Atualizar tipo `ErpConfig` em `types/database.ts`
3. Criar Edge Function `save-erp-config`
4. Criar Edge Function `test-erp`
5. Criar hook `useErpConfigs`
6. Criar componente `ErpProviderCard`
7. Criar modal `IxcConfigDialog`
8. Criar modal `MkConfigDialog`
9. Criar pagina `ErpIntegrations.tsx`
10. Adicionar rota no `App.tsx`
11. Atualizar `Settings.tsx` com link para ERP
12. Deploy das Edge Functions
13. Testar fluxo completo com ambos ERPs

---

## Beneficios da Arquitetura

| Aspecto | Beneficio |
|---------|-----------|
| Multi-Provider | ISP pode usar IXC para clientes e MK para financeiro |
| Isolamento | RLS + isp_id garante separacao total |
| Flexibilidade | Adicionar novos ERPs e facil (novo modal + adapter) |
| Seguranca | Credenciais nunca expostas, criptografia AES-256-GCM |
| UX | Interface unica para gerenciar todos os ERPs |

