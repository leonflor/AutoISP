

## Plano: Formularios Funcionais para Configuracao de APIs

### Objetivo
Implementar dialogs funcionais para configurar as integracoes OpenAI, Resend e Asaas com validacao de campos, teste de conexao e feedback visual, mantendo as chaves seguras via Supabase Secrets.

---

## 1. Arquitetura da Solucao

### Fluxo de Seguranca

```text
+-------------------+     +------------------+     +-------------------+
|   Admin Config    | --> |   Edge Function  | --> |  Supabase Secrets |
|   (Frontend)      |     | (test-integration)|    |  (armazenamento)  |
+-------------------+     +------------------+     +-------------------+
         |                        |
         v                        v
  Formulario Dialog          Valida + Testa
  (sem exibir secrets)        conexao real
```

**Principio**: Chaves de API nunca sao exibidas no frontend apos salvas. O formulario permite apenas inserir novas chaves ou substituir existentes.

---

## 2. Integracoes a Configurar

| Integracao | Endpoint de Teste | Campos |
|------------|-------------------|--------|
| OpenAI | `GET https://api.openai.com/v1/models` | API Key |
| Resend | `GET https://api.resend.com/domains` | API Key, From Email |
| Asaas | `GET https://api.asaas.com/v3/myAccount` | API Key, Ambiente |

---

## 3. Componentes a Criar

### 3.1 Edge Function: test-integration

Endpoint que recebe credenciais temporarias e testa conexao com cada servico.

### 3.2 Dialogs de Configuracao (Frontend)

| Componente | Campos | Acoes |
|------------|--------|-------|
| `IntegrationConfigDialog` | Container generico | Renderiza dialog apropriado |
| `OpenAIConfigForm` | API Key, Modelo Padrao | Testar, Salvar |
| `ResendConfigForm` | API Key, From Email | Testar, Salvar |
| `AsaasConfigForm` | API Key, Ambiente (sandbox/prod) | Testar, Salvar |

---

## 4. Interface dos Dialogs

### 4.1 OpenAI

```text
+-----------------------------------------------+
|  Configurar OpenAI                         [X]|
+-----------------------------------------------+
|                                               |
|  API Key                                      |
|  [sk-xxxxxxxxxxxxxxxxxxxxxxxx]                |
|                                               |
|  Modelo Padrao                                |
|  [v] gpt-4o-mini                              |
|      gpt-4o                                   |
|      gpt-4-turbo                              |
|                                               |
|  Status: ○ Nao testado                        |
|                                               |
|  [Testar Conexao]                             |
|                                               |
+-----------------------------------------------+
|              [Cancelar]  [Salvar Configuracao]|
+-----------------------------------------------+
```

### 4.2 Resend

```text
+-----------------------------------------------+
|  Configurar Resend                         [X]|
+-----------------------------------------------+
|                                               |
|  API Key                                      |
|  [re_xxxxxxxxxxxxxxxxxxxxxxxx]                |
|                                               |
|  From Email (remetente padrao)                |
|  [noreply@seudominio.com]                     |
|                                               |
|  Status: ○ Nao testado                        |
|                                               |
|  [Testar Conexao]                             |
|                                               |
+-----------------------------------------------+
|              [Cancelar]  [Salvar Configuracao]|
+-----------------------------------------------+
```

### 4.3 Asaas

```text
+-----------------------------------------------+
|  Configurar Asaas                          [X]|
+-----------------------------------------------+
|                                               |
|  API Key                                      |
|  [$aact_xxxxxxxxxxxxxxxxxxxxxxxx]             |
|                                               |
|  Ambiente                                     |
|  ( ) Sandbox (testes)                         |
|  (o) Producao                                 |
|                                               |
|  Webhook Token (opcional)                     |
|  [token_para_validar_webhooks]                |
|                                               |
|  Status: ● Conectado                          |
|                                               |
|  [Testar Conexao]                             |
|                                               |
+-----------------------------------------------+
|              [Cancelar]  [Salvar Configuracao]|
+-----------------------------------------------+
```

---

## 5. Estrutura dos Arquivos

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/admin/integrations/IntegrationConfigDialog.tsx` | Dialog principal |
| `src/components/admin/integrations/OpenAIConfigForm.tsx` | Formulario OpenAI |
| `src/components/admin/integrations/ResendConfigForm.tsx` | Formulario Resend |
| `src/components/admin/integrations/AsaasConfigForm.tsx` | Formulario Asaas |
| `src/components/admin/integrations/index.ts` | Exports |
| `src/hooks/admin/useIntegrationTest.ts` | Hook para testar integracoes |
| `supabase/functions/test-integration/index.ts` | Edge function de teste |

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/Config.tsx` | Adicionar estado para dialog, handlers |
| `supabase/config.toml` | Registrar nova edge function |

---

## 6. Edge Function: test-integration

### Estrutura da Requisicao

```typescript
interface TestRequest {
  integration: "openai" | "resend" | "asaas";
  credentials: {
    api_key: string;
    environment?: "sandbox" | "production";
    default_model?: string;
    from_email?: string;
  };
  save?: boolean;
}
```

### Logica de Teste

**OpenAI:**
```typescript
async function testOpenAI(apiKey: string): Promise<TestResult> {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  
  if (!response.ok) {
    return { success: false, message: "Chave API invalida" };
  }
  
  const data = await response.json();
  const models = data.data?.filter(m => m.id.includes("gpt"));
  return { 
    success: true, 
    message: "Conexao estabelecida",
    details: { available_models: models.length }
  };
}
```

**Resend:**
```typescript
async function testResend(apiKey: string): Promise<TestResult> {
  const response = await fetch("https://api.resend.com/domains", {
    headers: { "Authorization": `Bearer ${apiKey}` }
  });
  
  if (!response.ok) {
    return { success: false, message: "Chave invalida" };
  }
  
  const domains = await response.json();
  return { 
    success: true, 
    message: "Conexao estabelecida",
    details: { domains_count: domains.data?.length || 0 }
  };
}
```

**Asaas:**
```typescript
async function testAsaas(apiKey: string, env: string): Promise<TestResult> {
  const baseUrl = env === "production" 
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";
    
  const response = await fetch(`${baseUrl}/myAccount`, {
    headers: { "access_token": apiKey }
  });
  
  if (!response.ok) {
    return { success: false, message: "Chave invalida" };
  }
  
  const account = await response.json();
  return { 
    success: true, 
    message: "Conexao estabelecida",
    details: { account_name: account.name }
  };
}
```

---

## 7. Armazenamento de Secrets

### Estrategia com platform_config

Apos teste bem-sucedido, as configuracoes sao armazenadas em `platform_config`:

```typescript
// Estrutura no platform_config
{
  key: "integration_openai",
  value: {
    configured: true,
    default_model: "gpt-4o-mini",
    tested_at: "2026-01-26T21:00:00Z"
  }
}
```

**Nota**: As chaves de API em si devem ser configuradas como Supabase Secrets via Dashboard. O sistema apenas valida e registra o status.

---

## 8. Hook useIntegrationTest

```typescript
export function useIntegrationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  
  const testIntegration = async (
    integration: "openai" | "resend" | "asaas",
    credentials: Credentials
  ) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("test-integration", {
        body: { integration, credentials }
      });
      
      if (response.error) throw response.error;
      setResult(response.data);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setResult({ success: false, message });
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  
  return { testIntegration, isLoading, result, resetResult: () => setResult(null) };
}
```

---

## 9. Fluxo de Estados

```text
           +-------------+
           |   Pendente  |
           +------+------+
                  |
         [Inserir credenciais]
                  v
           +-------------+
           |  Testando   |
           +------+------+
                  |
         +--------+--------+
         |                 |
    [Sucesso]          [Falha]
         v                 v
   +----------+      +----------+
   | Validado |      |   Erro   |
   +----+-----+      +----------+
        |                  |
   [Salvar]          [Corrigir]
        v                  |
   +----------+            |
   |Configurado| <---------+
   +----------+
```

---

## 10. Atualizacao da Pagina Config.tsx

### Adicionar Estado

```typescript
const [configDialog, setConfigDialog] = useState<{
  open: boolean;
  integration: "openai" | "resend" | "asaas" | null;
}>({ open: false, integration: null });
```

### Modificar Cards de Integracao

Cada card tera:
- Badge de status (Pendente/Configurado/Erro)
- Botao "Configurar" ou "Editar"
- Data do ultimo teste

---

## 11. Resultado Esperado

### Interface

| Estado | Visualizacao |
|--------|--------------|
| Nao configurado | Badge "Pendente" amarelo + Botao "Configurar" |
| Configurado | Badge "Configurado" verde + Botoes "Testar" e "Editar" |
| Testando | Badge "Testando..." com spinner |
| Erro | Badge "Erro" vermelho + mensagem |

### Seguranca

- Chaves nunca exibidas apos salvas (placeholder com asteriscos)
- Teste de conexao obrigatorio antes de salvar
- RLS restrito a super_admins
- Logs de auditoria em alteracoes de configuracao

