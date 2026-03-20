

# Plano: Context Builder — Estado da Conversa para o LLM

## Contexto

A chave OpenAI esta armazenada **criptografada** na tabela `platform_config` (key: `integration_openai`) com campos `api_key_encrypted` e `encryption_iv`. O context-builder precisa descriptografar usando `ENCRYPTION_KEY` (secret ja existente) para gerar embeddings via OpenAI API.

A tabela `knowledge_bases` ja possui coluna `embedding vector(1536)` — compativel com `text-embedding-3-small`.

## Arquivos a Criar

### 1. Migration SQL — `match_knowledge` function

```sql
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  p_tenant_agent_id uuid,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (content text, title text, similarity float)
```

Busca vetorial na `knowledge_bases` filtrada por `tenant_agent_id`.

### 2. `supabase/functions/_shared/context-builder.ts`

Duas funcoes exportadas:

**`buildRuntimeContext(supabaseAdmin, conversationId)`**

Retorna `RuntimeContext` contendo:
- `conversation` — row completa da conversa
- `tenantAgent` — com `template_id` join em `agent_templates`
- `template` — `agent_templates` row
- `procedure` — procedure ativo (se `active_procedure_id` existe), com `definition` JSONB
- `currentStep` — step extraido de `definition.steps[step_index]`
- `messages` — ultimas 20 da tabela `messages` (ASC)
- `erpConfig` — `erp_configs` ativo do ISP (ou null)
- `ragChunks` — array de `{content, title, similarity}` (pode ser vazio)

Logica de queries:
1. Conversation + tenant_agent + agent_template (select com joins)
2. Messages (limit 20, order created_at ASC)
3. Procedure (condicional, se `active_procedure_id` != null)
4. ERP config (condicional, do ISP)
5. RAG: descriptografar OpenAI key de `platform_config.integration_openai` usando `ENCRYPTION_KEY`, gerar embedding da ultima mensagem do usuario via `text-embedding-3-small`, chamar `match_knowledge` via `supabase.rpc()`. Se key nao existir ou falhar, pula silenciosamente (ragChunks = []).

**`buildSystemPrompt(context)`**

Concatena na ordem:
1. `template.system_prompt_base` (substituindo `{agent_name}` pelo `custom_name || default_name`)
2. Procedimento ativo + instrucao do step atual
3. RAG chunks (se existirem), separados por `---`
4. `collected_context` da conversa (se existir)
5. Data/hora atual em BRT

**`decryptApiKey(encrypted, iv, masterKey)`** — funcao auxiliar de descriptografia AES-GCM (mesma logica do `save-integration`, invertida).

**`generateEmbedding(text, apiKey)`** — chama OpenAI `text-embedding-3-small`, retorna `number[]` ou null.

### 3. `supabase/functions/_shared/crypto.ts` (utilidade compartilhada)

Extrair as funcoes `deriveKey` e `decrypt` para reuso entre context-builder e futuras edge functions. A funcao `encrypt` ja existe em `save-integration` — `decrypt` e a operacao inversa.

## Fluxo de Dados

```text
conversation_id
    │
    ▼
buildRuntimeContext()
    ├── query: conversation + tenant_agent + template
    ├── query: messages (last 20)
    ├── query: procedure (if active)
    ├── query: erp_configs
    └── RAG pipeline:
        ├── decrypt OpenAI key from platform_config
        ├── embed last user message (text-embedding-3-small)
        └── match_knowledge RPC → ragChunks[]
    │
    ▼
RuntimeContext → buildSystemPrompt() → system prompt string
```

## Nenhum arquivo existente sera alterado

Criacao apenas. A integracao OpenAI no admin (UI + save-integration) permanece intacta.

