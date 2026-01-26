
## Plano: Melhorar Mensagens de Erro nas Integracoes

### Objetivo
Tornar as mensagens de erro mais explicativas para facilitar o diagnostico de problemas ao testar chaves de API, especialmente para o Asaas.

---

## 1. Problemas Identificados

### Edge Function (test-integration)

| Problema | Local | Impacto |
|----------|-------|---------|
| Erro generico quando JSON parsing falha | Linha 111-115 | Perde informacao do status HTTP |
| Nao captura codigo de erro do Asaas | Linha 114 | Apenas `description`, ignora `code` |
| Sem logs detalhados para debug | Funcao inteira | Dificil diagnosticar no servidor |
| Nao valida prefixo da chave vs ambiente | Linha 97-108 | Incompatibilidade silenciosa |

### Frontend (AsaasConfigForm)

| Problema | Local | Impacto |
|----------|-------|---------|
| Sem validacao visual de ambiente | Formulario | Usuario pode usar chave errada |
| Mensagem de erro simples | Linha 149-151 | Nao mostra detalhes tecnicos |
| Sem indicacao de status HTTP | Resultado | Dificil saber tipo de falha |

---

## 2. Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|------------|
| `supabase/functions/test-integration/index.ts` | Logs detalhados, captura codigo/status |
| `src/hooks/admin/useIntegrationTest.ts` | Expandir interface TestResult |
| `src/components/admin/integrations/AsaasConfigForm.tsx` | Validacao de prefixo, UI melhorada |

---

## 3. Implementacao Detalhada

### 3.1 Edge Function - Melhorias no Asaas

**Antes:**
```typescript
if (!response.ok) {
  const error = await response.json().catch(() => ({}));
  return { 
    success: false, 
    message: error.errors?.[0]?.description || "Chave API invalida" 
  };
}
```

**Depois:**
```typescript
if (!response.ok) {
  const status = response.status;
  const errorBody = await response.text();
  
  console.log(`[Asaas] HTTP ${status}: ${errorBody}`);
  
  let errorData: { errors?: Array<{ code: string; description: string }> } = {};
  try {
    errorData = JSON.parse(errorBody);
  } catch {}
  
  const firstError = errorData.errors?.[0];
  const errorCode = firstError?.code || "UNKNOWN";
  const errorDesc = firstError?.description || getHttpErrorMessage(status);
  
  return { 
    success: false, 
    message: `${errorDesc} (${errorCode})`,
    details: {
      http_status: status,
      error_code: errorCode,
      raw_response: errorBody.substring(0, 200)
    }
  };
}

// Helper para mensagens HTTP
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 401: return "Chave API nao autorizada";
    case 403: return "Acesso negado - verifique permissoes";
    case 404: return "Endpoint nao encontrado - verifique ambiente";
    case 429: return "Limite de requisicoes excedido";
    case 500: return "Erro interno do Asaas";
    default: return `Erro HTTP ${status}`;
  }
}
```

### 3.2 Validacao de Ambiente por Prefixo

**Na Edge Function - Detectar incompatibilidade:**

```typescript
async function testAsaas(apiKey: string, environment: string = "production"): Promise<TestResult> {
  // Validar prefixo da chave vs ambiente selecionado
  const keyPrefix = apiKey.substring(0, 15);
  const isProductionKey = keyPrefix.includes("_prod_");
  const isSandboxKey = keyPrefix.includes("_hmlg_") || keyPrefix.includes("_sandbox_");
  
  if (environment === "production" && isSandboxKey) {
    return {
      success: false,
      message: "Chave de Sandbox detectada, mas ambiente Production selecionado",
      details: {
        suggestion: "Selecione 'Sandbox (testes)' ou use uma chave de producao ($aact_prod_...)"
      }
    };
  }
  
  if (environment === "sandbox" && isProductionKey) {
    return {
      success: false,
      message: "Chave de Producao detectada, mas ambiente Sandbox selecionado",
      details: {
        suggestion: "Selecione 'Producao' ou use uma chave sandbox ($aact_hmlg_...)"
      }
    };
  }
  
  // ... continuar com o teste
}
```

### 3.3 Logs Detalhados na Edge Function

```typescript
// No inicio da funcao testAsaas
console.log(`[Asaas] Testando integracao - Ambiente: ${environment}`);
console.log(`[Asaas] Prefixo da chave: ${apiKey.substring(0, 15)}...`);

// Apos a requisicao
console.log(`[Asaas] Resposta HTTP: ${response.status} ${response.statusText}`);

// Em caso de sucesso
console.log(`[Asaas] Conta encontrada: ${account.name} (${account.personType})`);
```

### 3.4 Hook - Expandir Interface

```typescript
export interface TestResult {
  success: boolean;
  message: string;
  details?: {
    http_status?: number;
    error_code?: string;
    raw_response?: string;
    suggestion?: string;
    account_name?: string;
    environment?: string;
    // ... outros campos
    [key: string]: unknown;
  };
}
```

### 3.5 Frontend - UI Melhorada

**Alerta de ambiente incompativel:**

```tsx
// Detectar prefixo no frontend
const detectedEnvironment = useMemo(() => {
  if (apiKey.includes("_prod_")) return "production";
  if (apiKey.includes("_hmlg_") || apiKey.includes("_sandbox_")) return "sandbox";
  return null;
}, [apiKey]);

const hasEnvironmentMismatch = detectedEnvironment && detectedEnvironment !== environment;

// Renderizar alerta
{hasEnvironmentMismatch && (
  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
    <p className="text-sm text-amber-700">
      <AlertTriangle className="h-4 w-4 inline mr-1" />
      A chave parece ser de <strong>{detectedEnvironment}</strong>, 
      mas voce selecionou <strong>{environment}</strong>.
    </p>
  </div>
)}
```

**Mensagem de erro expandida:**

```tsx
{result && !result.success && (
  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
    <p className="text-sm font-medium text-destructive">{result.message}</p>
    
    {result.details?.http_status && (
      <p className="text-xs text-muted-foreground">
        Status HTTP: {result.details.http_status}
      </p>
    )}
    
    {result.details?.suggestion && (
      <p className="text-xs text-amber-600">
        Sugestao: {result.details.suggestion}
      </p>
    )}
    
    {result.details?.error_code && result.details.error_code !== "UNKNOWN" && (
      <p className="text-xs text-muted-foreground">
        Codigo: {result.details.error_code}
      </p>
    )}
  </div>
)}
```

---

## 4. Codigos de Erro Asaas Comuns

| Codigo | Descricao | Causa Provavel |
|--------|-----------|----------------|
| invalid_accessToken | Token invalido | Chave errada ou expirada |
| unauthorized | Nao autorizado | Ambiente incorreto |
| forbidden | Acesso negado | Permissoes insuficientes |
| not_found | Recurso nao encontrado | Endpoint errado |

---

## 5. Resultado Esperado

### Antes (Erro Generico)

```
"Chave API invalida ou sem permissao"
```

### Depois (Erro Detalhado)

```
Chave de Sandbox detectada, mas ambiente Production selecionado

Status HTTP: 401
Codigo: invalid_accessToken
Sugestao: Selecione 'Sandbox (testes)' ou use uma chave de producao
```

---

## 6. Resumo de Alteracoes

| Componente | Melhoria |
|------------|----------|
| Edge Function | Logs detalhados, captura codigo/status HTTP |
| Edge Function | Validacao de ambiente vs prefixo da chave |
| Hook | Interface expandida com campos de erro |
| Frontend | Alerta visual de incompatibilidade |
| Frontend | Mensagem de erro com detalhes tecnicos |

---

## 7. Deploy

Apos as alteracoes:
1. Edge function sera redeployada automaticamente
2. Logs estarao disponiveis no dashboard Supabase
3. Frontend mostrara mensagens mais claras
