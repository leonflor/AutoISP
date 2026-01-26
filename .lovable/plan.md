
## Plano: Separar Botao Testar do Modal de Configuracao

### Objetivo
O botao "Testar" nas integracoes deve executar um teste direto de conectividade usando as credenciais ja salvas como Secrets no Supabase, sem abrir o modal de configuracao. O modal deve ser aberto apenas pelo botao "Editar" ou "Configurar".

---

## 1. Arquitetura Atual vs Proposta

### Atual
```text
+------------------+     +------------------+
| Botao "Testar"   | --> | Abre Modal       |
+------------------+     | (pede API key)   |
                         +------------------+

+------------------+     +------------------+
| Botao "Editar"   | --> | Abre Modal       |
+------------------+     | (pede API key)   |
                         +------------------+
```

### Proposta
```text
+------------------+     +------------------------+     +------------------+
| Botao "Testar"   | --> | Edge Function          | --> | Usa Secrets      |
+------------------+     | check-integration      |     | ja configurados  |
                         +------------------------+     +------------------+
                                  |
                                  v
                         +------------------------+
                         | Toast com resultado    |
                         +------------------------+

+------------------+     +------------------+
| Botao "Editar"   | --> | Abre Modal       |
+------------------+     | (configura keys) |
                         +------------------+
```

---

## 2. Secrets Necessarios

Para que o teste funcione, o admin deve configurar os seguintes Secrets no Supabase:

| Integracao | Secret Name       | Exemplo                |
|------------|-------------------|------------------------|
| OpenAI     | OPENAI_API_KEY    | sk-proj-...            |
| Resend     | RESEND_API_KEY    | re_...                 |
| Asaas      | ASAAS_API_KEY     | \$aact_prod_...        |
| Asaas      | ASAAS_ENVIRONMENT | production ou sandbox  |

---

## 3. Arquivos a Modificar/Criar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/check-integration/index.ts` | **CRIAR** - Nova Edge Function que testa usando Secrets |
| `src/pages/admin/Config.tsx` | Separar handlers dos botoes Testar e Editar |
| `src/hooks/admin/useIntegrationCheck.ts` | **CRIAR** - Hook para chamar check-integration |
| `supabase/config.toml` | Adicionar config para nova Edge Function |

---

## 4. Nova Edge Function: check-integration

Esta funcao usa os Secrets ja configurados no Supabase para testar conectividade.

```typescript
// supabase/functions/check-integration/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckRequest {
  integration: "openai" | "resend" | "asaas";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar autenticacao (mesmo padrao do test-integration)
  const authHeader = req.headers.get("Authorization");
  // ... validacao JWT ...

  const { integration }: CheckRequest = await req.json();

  let result;
  switch (integration) {
    case "openai":
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiKey) {
        result = { success: false, message: "OPENAI_API_KEY nao configurada" };
      } else {
        // Testar conexao com OpenAI
        result = await testOpenAI(openaiKey);
      }
      break;

    case "resend":
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) {
        result = { success: false, message: "RESEND_API_KEY nao configurada" };
      } else {
        result = await testResend(resendKey);
      }
      break;

    case "asaas":
      const asaasKey = Deno.env.get("ASAAS_API_KEY");
      const asaasEnv = Deno.env.get("ASAAS_ENVIRONMENT") || "production";
      if (!asaasKey) {
        result = { success: false, message: "ASAAS_API_KEY nao configurada" };
      } else {
        result = await testAsaas(asaasKey, asaasEnv);
      }
      break;
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
```

---

## 5. Modificar Config.tsx

### Adicionar novo handler para teste direto:

```typescript
// Importar novo hook
import { useIntegrationCheck } from "@/hooks/admin/useIntegrationCheck";

// No componente
const { checkIntegration, isChecking, checkingIntegration } = useIntegrationCheck();

const handleTestIntegration = async (integrationKey: string) => {
  const integration = integrationKey.replace("integration_", "") as IntegrationType;
  const result = await checkIntegration(integration);
  
  if (result.success) {
    toast({
      title: "Integracao Online",
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
```

### Separar botoes Testar e Editar:

```tsx
{integration.configured ? (
  <>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleTestIntegration(integration.key)}
      disabled={isChecking && checkingIntegration === integration.key}
    >
      {isChecking && checkingIntegration === integration.key && (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      Testar
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleOpenIntegrationDialog(
        integration.key.replace("integration_", "") as IntegrationType
      )}
    >
      Editar
    </Button>
  </>
) : (
  <Button 
    size="sm"
    onClick={() => handleOpenIntegrationDialog(
      integration.key.replace("integration_", "") as IntegrationType
    )}
    disabled={integration.key === "integration_push"}
  >
    {integration.key === "integration_push" ? "Em breve" : "Configurar"}
  </Button>
)}
```

---

## 6. Novo Hook: useIntegrationCheck

```typescript
// src/hooks/admin/useIntegrationCheck.ts
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IntegrationType = "openai" | "resend" | "asaas";

export interface CheckResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export function useIntegrationCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [checkingIntegration, setCheckingIntegration] = useState<IntegrationType | null>(null);

  const checkIntegration = useCallback(async (integration: IntegrationType): Promise<CheckResult> => {
    setIsChecking(true);
    setCheckingIntegration(integration);
    
    try {
      const { data, error } = await supabase.functions.invoke("check-integration", {
        body: { integration }
      });

      if (error) {
        return { 
          success: false, 
          message: error.message || "Erro ao verificar integracao" 
        };
      }

      return data as CheckResult;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Erro desconhecido" 
      };
    } finally {
      setIsChecking(false);
      setCheckingIntegration(null);
    }
  }, []);

  return { checkIntegration, isChecking, checkingIntegration };
}
```

---

## 7. Fluxo de Usuario Atualizado

### Cenario 1: Integracao nao configurada

1. Usuario clica em "Configurar"
2. Modal abre para inserir API key
3. Testa e salva (existente)
4. Secret deve ser configurado manualmente no Supabase

### Cenario 2: Integracao ja configurada

1. Usuario clica em "Testar"
2. Loading aparece no botao
3. Edge Function `check-integration` usa Secrets do Supabase
4. Toast mostra resultado (sucesso/falha)

### Cenario 3: Editar configuracao

1. Usuario clica em "Editar"
2. Modal abre para atualizar API key
3. Testa nova chave e salva

---

## 8. Configuracao de Secrets (Manual pelo Admin)

O admin deve configurar os Secrets no Supabase Dashboard:

1. Acessar: Settings > Edge Functions > Secrets
2. Adicionar:
   - `OPENAI_API_KEY`: Chave da OpenAI
   - `RESEND_API_KEY`: Chave do Resend
   - `ASAAS_API_KEY`: Chave do Asaas
   - `ASAAS_ENVIRONMENT`: "production" ou "sandbox"

---

## 9. Mensagens de Erro Claras

| Cenario | Mensagem |
|---------|----------|
| Secret nao configurado | "OPENAI_API_KEY nao configurada no Supabase" |
| Chave invalida | "Chave API nao autorizada (HTTP 401)" |
| Conexao OK | "Conexao estabelecida com OpenAI" |
| Timeout | "Timeout ao conectar - verifique sua rede" |

---

## 10. Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/check-integration/index.ts` | Criar |
| `supabase/config.toml` | Adicionar verify_jwt = false para check-integration |
| `src/hooks/admin/useIntegrationCheck.ts` | Criar |
| `src/pages/admin/Config.tsx` | Modificar handlers dos botoes |

---

## 11. Consideracoes de Seguranca

1. A Edge Function `check-integration` valida JWT antes de executar
2. Secrets nunca sao expostos ao cliente - apenas o resultado do teste
3. Logs detalhados no servidor para diagnostico
4. Somente admins autenticados podem executar testes
