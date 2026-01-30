

# Integrar Embeddings com Chave OpenAI da Plataforma

## Objetivo

Modificar a Edge Function `process-document` para usar a chave OpenAI já configurada na plataforma (armazenada criptografada em `platform_config`) ao invés do Lovable AI Gateway para gerar embeddings.

---

## Situacao Atual

| Componente | Status |
|------------|--------|
| Chave OpenAI | Configurada e criptografada |
| Masked Key | `sk-proj-...2UEA` |
| Modelo Padrao | `gpt-4o-mini` |
| Endpoint atual | `ai.gateway.lovable.dev/v1/embeddings` (nao suportado) |

O erro `ERR_EMBED_002` ocorre porque o Lovable AI Gateway suporta apenas `/v1/chat/completions`, nao `/v1/embeddings`.

---

## Solucao

Reutilizar a logica de descriptografia do `check-integration` no `process-document` para obter a chave OpenAI e chamar diretamente a API de embeddings da OpenAI.

---

## Fluxo de Processamento Atualizado

```text
1. Recebe requisicao
2. Valida usuario/permissoes
3. Busca config "integration_openai" do banco
4. Descriptografa chave com ENCRYPTION_KEY
5. Baixa documento do storage
6. Extrai texto
7. Divide em chunks
8. Gera embeddings via OpenAI API direta
9. Salva chunks no banco
```

---

## Secao Tecnica

### Funcoes a Adicionar no process-document

1. **Funcao de Descriptografia** (copiar de check-integration):

```typescript
async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"]);
}

async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, ciphertextBytes);
  return new TextDecoder().decode(decrypted);
}
```

2. **Funcao para Obter Chave OpenAI**:

```typescript
async function getOpenAIKey(supabaseAdmin: SupabaseClient): Promise<string> {
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey) throw new Error("ENCRYPTION_KEY not configured");

  const { data: config } = await supabaseAdmin
    .from("platform_config")
    .select("value")
    .eq("key", "integration_openai")
    .single();

  if (!config?.value?.api_key_encrypted) {
    throw new Error("OpenAI not configured. Configure via admin panel.");
  }

  return await decrypt(
    config.value.api_key_encrypted,
    config.value.encryption_iv,
    masterKey
  );
}
```

3. **Atualizar generateEmbedding**:

```typescript
// ANTES: Lovable AI Gateway (nao suporta embeddings)
fetch("https://ai.gateway.lovable.dev/v1/embeddings", ...)

// DEPOIS: OpenAI API direta
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
      dimensions: 768
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Embedding error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
```

4. **Atualizar Handler Principal**:

```typescript
// Remover verificacao de LOVABLE_API_KEY
// Adicionar obtencao da chave OpenAI da plataforma

const openaiKey = await getOpenAIKey(supabaseAdmin);

EdgeRuntime.waitUntil(
  processDocumentBackground(body.document_id, body.isp_agent_id, supabaseAdmin, openaiKey)
);
```

---

## Tratamento de Erros

| Cenario | Codigo | Mensagem |
|---------|--------|----------|
| OpenAI nao configurada | ERR_EMBED_003 | Integracao OpenAI nao configurada. Contate o administrador. |
| Chave invalida/expirada | ERR_EMBED_001 | Falha na geracao de embeddings. Servico indisponivel. |
| Rate limit OpenAI | ERR_EMBED_004 | Limite de requisicoes excedido. Tente novamente em alguns minutos. |

---

## Arquivo a Modificar

`supabase/functions/process-document/index.ts`:

1. Adicionar funcoes `deriveKey` e `decrypt`
2. Adicionar funcao `getOpenAIKey`
3. Atualizar `generateEmbedding` para usar OpenAI direta
4. Atualizar handler para buscar chave da plataforma
5. Adicionar novos codigos de erro
6. Remover dependencia de LOVABLE_API_KEY

---

## Dependencias

Nenhuma nova dependencia. A chave de criptografia `ENCRYPTION_KEY` ja deve estar configurada como Supabase Secret (mesmo secret usado pelo save-integration e check-integration).

---

## Beneficios

| Antes | Depois |
|-------|--------|
| Lovable Gateway (sem embeddings) | OpenAI API direta |
| Erro ERR_EMBED_002 | Embeddings funcionais |
| Chave hardcoded/inexistente | Chave segura da plataforma |
| Sem fallback | Usa config existente do admin |

