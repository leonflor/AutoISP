
# Plano: Armazenar Chaves de API Criptografadas no Banco de Dados

## Objetivo
Implementar um sistema onde as chaves de API (OpenAI, Resend, Asaas) sao inseridas via UI, criptografadas no servidor, e armazenadas na tabela `platform_config`. Apos salvar, a chave completa nao pode ser consultada - apenas uma versao mascarada (ex: `sk-proj-...xxxx`) fica visivel para verificacao.

---

## 1. Arquitetura Proposta

```text
+------------------+     +------------------------+     +-------------------+
| UI (Admin)       |     | Edge Function          |     | platform_config   |
| - Digita API key | --> | save-integration       | --> | (JSONB)           |
+------------------+     | - Valida              |     +-------------------+
                         | - Criptografa (AES)    |     | api_key_encrypted |
                         | - Mascara (..xxxx)     |     | encryption_iv     |
                         +------------------------+     | masked_key        |
                                                        | configured: true  |
                                                        +-------------------+

+------------------+     +------------------------+     +-------------------+
| UI (Testar)      |     | Edge Function          |     | platform_config   |
| - Clica "Testar" | --> | check-integration      | --> | Le ciphertext     |
+------------------+     | - Descriptografa      |     +-------------------+
                         | - Testa API            |
                         | - Retorna resultado    |
                         +------------------------+
```

---

## 2. Estrutura de Dados no `platform_config`

O campo `value` (JSONB) passara a armazenar:

```json
{
  "configured": true,
  "api_key_encrypted": "base64_ciphertext...",
  "encryption_iv": "base64_iv...",
  "masked_key": "sk-proj-...abcd",
  "default_model": "gpt-4o-mini",
  "from_email": "noreply@dominio.com",
  "environment": "sandbox",
  "tested_at": "2026-01-26T23:44:01.747Z"
}
```

| Campo | Descricao |
|-------|-----------|
| `api_key_encrypted` | Chave criptografada com AES-256-GCM |
| `encryption_iv` | Vetor de inicializacao (IV) unico por operacao |
| `masked_key` | Trecho visivel: primeiros 8 + ultimos 4 caracteres |
| `configured` | Boolean indicando se foi configurado |
| `tested_at` | Timestamp do ultimo teste bem-sucedido |

---

## 3. Algoritmo de Criptografia

### Metodo: AES-256-GCM
- **Seguranca**: Padrao de criptografia autenticada, impede adulteracao
- **Chave Mestre**: `ENCRYPTION_KEY` (Secret do Supabase) - 32 caracteres hex
- **IV**: Gerado aleatoriamente para cada operacao (12 bytes)

### Funcoes de Criptografia (Edge Function)

```typescript
// Gera chave de 256 bits a partir da master key
async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  // Usar primeiros 32 bytes (256 bits) da chave
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey(
    "raw", keyData, "AES-GCM", false, ["encrypt", "decrypt"]
  );
}

// Criptografar API key
async function encrypt(text: string, masterKey: string): Promise<{ciphertext: string, iv: string}> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterKey);
  const encoded = new TextEncoder().encode(text);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, encoded
  );
  
  return { 
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))), 
    iv: btoa(String.fromCharCode(...iv)) 
  };
}

// Descriptografar API key
async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes }, key, ciphertextBytes
  );
  
  return new TextDecoder().decode(decrypted);
}

// Gerar versao mascarada
function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return "****";
  return apiKey.substring(0, 8) + "..." + apiKey.slice(-4);
}
```

---

## 4. Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `supabase/functions/save-integration/index.ts` | **CRIAR** | Recebe chave, criptografa, salva no banco |
| `supabase/functions/check-integration/index.ts` | **MODIFICAR** | Le chave criptografada, descriptografa, testa |
| `src/hooks/admin/useSaveIntegration.ts` | **CRIAR** | Hook para salvar integracao via Edge Function |
| `src/components/admin/integrations/OpenAIConfigForm.tsx` | **MODIFICAR** | Usar novo fluxo de salvamento |
| `src/components/admin/integrations/ResendConfigForm.tsx` | **MODIFICAR** | Usar novo fluxo de salvamento |
| `src/components/admin/integrations/AsaasConfigForm.tsx` | **MODIFICAR** | Usar novo fluxo de salvamento |
| `src/pages/admin/Config.tsx` | **MODIFICAR** | Exibir chave mascarada apos configuracao |
| `supabase/config.toml` | **MODIFICAR** | Adicionar config da nova Edge Function |

---

## 5. Nova Edge Function: save-integration

```typescript
// supabase/functions/save-integration/index.ts

interface SaveRequest {
  integration: "openai" | "resend" | "asaas";
  credentials: {
    api_key: string;
    environment?: "sandbox" | "production";
    default_model?: string;
    from_email?: string;
    webhook_token?: string;
  };
}

serve(async (req) => {
  // 1. Validar JWT (super_admin apenas)
  // 2. Testar credenciais antes de salvar (reusar logica existente)
  // 3. Criptografar api_key com AES-256-GCM
  // 4. Gerar masked_key para exibicao
  // 5. Salvar no platform_config:
  //    - api_key_encrypted
  //    - encryption_iv
  //    - masked_key
  //    - configured: true
  //    - tested_at
  //    - (demais campos: environment, default_model, etc.)
  // 6. Retornar sucesso + masked_key
});
```

---

## 6. Modificar check-integration

```typescript
// Fluxo atualizado:

// 1. Ler platform_config para obter api_key_encrypted e encryption_iv
const { data: config } = await supabase
  .from("platform_config")
  .select("value")
  .eq("key", `integration_${integration}`)
  .single();

// 2. Verificar se tem chave criptografada
if (!config?.value?.api_key_encrypted) {
  return { success: false, message: "Integracao nao configurada" };
}

// 3. Descriptografar
const masterKey = Deno.env.get("ENCRYPTION_KEY");
const apiKey = await decrypt(
  config.value.api_key_encrypted,
  config.value.encryption_iv,
  masterKey
);

// 4. Testar conectividade (logica existente)
const result = await testOpenAI(apiKey);
```

---

## 7. Modificar Formularios de Integracao

### OpenAIConfigForm.tsx

```tsx
// Estado para exibir chave mascarada quando ja configurado
const [maskedKey, setMaskedKey] = useState<string | null>(null);

// Carregar dados existentes
useEffect(() => {
  if (existingConfig?.masked_key) {
    setMaskedKey(existingConfig.masked_key);
  }
}, [existingConfig]);

// Campo API Key
<div className="space-y-2">
  <Label>API Key</Label>
  
  {/* Exibir chave mascarada se ja configurado */}
  {maskedKey && !apiKey && (
    <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
      <span className="font-mono">{maskedKey}</span>
      <Badge variant="outline">Configurada</Badge>
    </div>
  )}
  
  <Input
    type="password"
    placeholder={maskedKey ? "Digite nova chave para alterar" : "sk-proj-..."}
    value={apiKey}
    onChange={(e) => setApiKey(e.target.value)}
  />
  
  {maskedKey && (
    <p className="text-xs text-muted-foreground">
      Deixe em branco para manter a chave atual
    </p>
  )}
</div>
```

---

## 8. Exibir Chave Mascarada no Config.tsx

```tsx
// Na lista de integracoes, mostrar masked_key se disponivel
{integration.configured && (
  <div className="flex flex-col gap-1">
    <span className="font-medium">{integration.name}</span>
    {configMap?.[integration.key]?.masked_key && (
      <span className="text-xs font-mono text-muted-foreground">
        {configMap[integration.key].masked_key}
      </span>
    )}
  </div>
)}
```

---

## 9. Secret Necessario

| Nome | Valor | Descricao |
|------|-------|-----------|
| `ENCRYPTION_KEY` | `a1b2c3d4e5f6...` (64 hex chars) | Chave mestre para AES-256-GCM |

Gerar uma chave segura:
```bash
openssl rand -hex 32
# Exemplo: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

---

## 10. Fluxo de Usuario

### Cenario 1: Primeira Configuracao

1. Usuario acessa Configuracoes > Integracoes
2. Clica em "Configurar" no OpenAI
3. Modal abre com campo de API key vazio
4. Digita a chave: `sk-proj-abc123xyz789...`
5. Clica em "Testar Conexao" (testa via test-integration)
6. Se sucesso, clica em "Salvar"
7. Edge Function `save-integration`:
   - Valida credenciais novamente
   - Criptografa a chave
   - Salva no banco com `masked_key: "sk-proj-...9xyz"`
8. Modal fecha, status atualiza para "Configurado"
9. Na lista, aparece: `OpenAI - sk-proj-...9xyz`

### Cenario 2: Testar Integracao Existente

1. Usuario clica em "Testar" no OpenAI
2. Edge Function `check-integration`:
   - Le `api_key_encrypted` e `encryption_iv` do banco
   - Descriptografa com `ENCRYPTION_KEY`
   - Testa conectividade com OpenAI
3. Toast mostra resultado: "Conexao estabelecida"

### Cenario 3: Editar Integracao

1. Usuario clica em "Editar" no OpenAI
2. Modal abre mostrando `sk-proj-...9xyz` (mascarada)
3. Campo de nova chave vazio
4. Usuario pode:
   - Deixar vazio = manter chave atual
   - Digitar nova chave = substituir
5. Salvar repete o processo de criptografia

---

## 11. Consideracoes de Seguranca

| Aspecto | Implementacao |
|---------|---------------|
| **Chave nunca exposta ao frontend** | Apos salvar, apenas `masked_key` e enviado ao cliente |
| **Criptografia forte** | AES-256-GCM com IV unico por operacao |
| **Chave mestre segura** | `ENCRYPTION_KEY` armazenado como Supabase Secret |
| **Logs protegidos** | Trigger existente ja remove campos `*_encrypted` dos audit logs |
| **Autenticacao** | JWT validado em todas as Edge Functions |
| **Autorizacao** | Apenas `super_admin` pode acessar configuracoes |

---

## 12. Sequencia de Implementacao

1. **Adicionar Secret** `ENCRYPTION_KEY` no Supabase
2. **Criar** `save-integration` Edge Function com logica de criptografia
3. **Modificar** `check-integration` para ler/descriptografar do banco
4. **Criar** hook `useSaveIntegration` no frontend
5. **Atualizar** formularios para usar novo fluxo
6. **Atualizar** `Config.tsx` para exibir chave mascarada
7. **Deploy** Edge Functions
8. **Testar** ciclo completo: configurar, testar, editar

---

## Secao Tecnica: Estrutura Detalhada dos Arquivos

### save-integration/index.ts (completo)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Funcoes de criptografia (deriveKey, encrypt, maskApiKey)
// ...

// Funcoes de teste (testOpenAI, testResend, testAsaas - copiar de test-integration)
// ...

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validar autenticacao
  const authHeader = req.headers.get("Authorization");
  // ... validar JWT ...

  // Verificar role super_admin
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  
  if (!roles?.some(r => r.role === "super_admin")) {
    return new Response(
      JSON.stringify({ success: false, message: "Acesso negado" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { integration, credentials }: SaveRequest = await req.json();

  // 1. Testar credenciais primeiro
  let testResult;
  switch (integration) {
    case "openai": testResult = await testOpenAI(credentials.api_key); break;
    case "resend": testResult = await testResend(credentials.api_key); break;
    case "asaas": testResult = await testAsaas(credentials.api_key, credentials.environment); break;
  }

  if (!testResult.success) {
    return new Response(JSON.stringify(testResult), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // 2. Criptografar API key
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey || masterKey.length < 32) {
    return new Response(
      JSON.stringify({ success: false, message: "ENCRYPTION_KEY nao configurada" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { ciphertext, iv } = await encrypt(credentials.api_key, masterKey);
  const maskedKey = maskApiKey(credentials.api_key);

  // 3. Montar valor para salvar
  const configValue = {
    configured: true,
    api_key_encrypted: ciphertext,
    encryption_iv: iv,
    masked_key: maskedKey,
    tested_at: new Date().toISOString(),
    ...(credentials.environment && { environment: credentials.environment }),
    ...(credentials.default_model && { default_model: credentials.default_model }),
    ...(credentials.from_email && { from_email: credentials.from_email }),
    ...(credentials.webhook_token && { 
      webhook_token_encrypted: (await encrypt(credentials.webhook_token, masterKey)).ciphertext,
      webhook_token_iv: (await encrypt(credentials.webhook_token, masterKey)).iv
    }),
  };

  // 4. Salvar no banco usando service role
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error: updateError } = await supabaseAdmin
    .from("platform_config")
    .update({ value: configValue, updated_at: new Date().toISOString() })
    .eq("key", `integration_${integration}`);

  if (updateError) {
    return new Response(
      JSON.stringify({ success: false, message: "Erro ao salvar: " + updateError.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({
    success: true,
    message: `Integracao ${integration.toUpperCase()} configurada com sucesso`,
    masked_key: maskedKey
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
```

### useSaveIntegration.ts

```typescript
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type IntegrationType = "openai" | "resend" | "asaas";

export interface SaveCredentials {
  api_key: string;
  environment?: "sandbox" | "production";
  default_model?: string;
  from_email?: string;
  webhook_token?: string;
}

export interface SaveResult {
  success: boolean;
  message: string;
  masked_key?: string;
}

export function useSaveIntegration() {
  const [isSaving, setIsSaving] = useState(false);

  const saveIntegration = useCallback(async (
    integration: IntegrationType,
    credentials: SaveCredentials
  ): Promise<SaveResult> => {
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("save-integration", {
        body: { integration, credentials }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return data as SaveResult;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Erro ao salvar" 
      };
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { saveIntegration, isSaving };
}
```
