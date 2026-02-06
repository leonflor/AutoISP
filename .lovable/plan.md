
# Migrar de Lovable AI Gateway para OpenAI API Direta

## Resumo

Substituir todas as chamadas ao Lovable AI Gateway (`ai.gateway.lovable.dev`) pela API OpenAI direta (`api.openai.com`), e trocar a `LOVABLE_API_KEY` pela chave OpenAI armazenada criptografada no `platform_config` (mesmo padrao ja usado pelo `process-document`). Em seguida, atualizar toda a documentacao no Guia do Projeto.

## Situacao Atual

| Item | Atual | Novo |
|------|-------|------|
| Endpoint Chat | `ai.gateway.lovable.dev/v1/chat/completions` | `api.openai.com/v1/chat/completions` |
| Endpoint Embeddings (ai-chat) | `ai.gateway.lovable.dev/v1/embeddings` | `api.openai.com/v1/embeddings` |
| Endpoint Embeddings (process-document) | `api.openai.com/v1/embeddings` | Sem alteracao (ja correto) |
| Autenticacao | `LOVABLE_API_KEY` (secret auto-provisionado) | Chave OpenAI criptografada em `platform_config` (via `getOpenAIKey()`) |
| Modelos | Prefixo provider (`openai/gpt-4o`, `google/gemini-2.5-flash`) | Nomes OpenAI diretos (`gpt-4o`, `gpt-4o-mini`) |

## Alteracoes por Arquivo

### 1. Edge Function: `supabase/functions/ai-chat/index.ts`

**a) Adicionar funcao `getOpenAIKey()`** (copiar padrao do `process-document`):
- Importar helper de criptografia (decrypt + deriveKey)
- Buscar chave criptografada em `platform_config` com key `integration_openai`
- Descriptografar com `ENCRYPTION_KEY`

**b) Remover `LOVABLE_API_KEY`** (linhas 155-167):
- Substituir por chamada a `getOpenAIKey(supabaseAdmin)` apos criar o client admin
- Atualizar mensagem de erro para "Integracao OpenAI nao configurada"

**c) Atualizar `generateQueryEmbedding()`** (linha 63):
- Endpoint: `https://api.openai.com/v1/embeddings`

**d) Simplificar `modelMap`** (linhas 399-407):
- Remover prefixos de provider: `"gpt-4o" -> "gpt-4o"`, `"gpt-4o-mini" -> "gpt-4o-mini"`
- Remover modelos nao-OpenAI (Gemini, Claude)
- Default: `"gpt-4o-mini"`

**e) Atualizar chamada de chat** (linha 410):
- Endpoint: `https://api.openai.com/v1/chat/completions`

**f) Atualizar tratamento de erros**:
- Remover referencia a "Gateway" e "402 creditos Lovable"
- Manter tratamento de 429 (rate limit OpenAI)

### 2. Guia: `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`

- Linha 45: Titulo `"INT-02 — OpenAI API"` (era Lovable AI Gateway)
- Linha 80: Badge `"OpenAI API (GPT-4o / GPT-4o-mini)"`
- Linhas 89-94: Modelos suportados — remover Gemini, manter apenas GPT-4o e GPT-4o-mini
- Linha 185: Endpoint para `api.openai.com/v1/chat/completions`
- Linhas 228-231: Secret `OPENAI_API_KEY` com descricao "Criptografada em platform_config, configurada via painel Admin"
- Linha 240: Endpoint `https://api.openai.com/v1/chat/completions`
- Linhas 410-411: Seguranca — trocar "LOVABLE_API_KEY auto-provisionado" por "OPENAI_API_KEY criptografada (AES-256-GCM)"
- Linhas 422: Rate Limits — trocar "429/402 do Gateway" por "429 da OpenAI"
- Linhas 468-469: Troubleshooting — trocar "LOVABLE_API_KEY invalida" por "OPENAI_API_KEY invalida ou nao configurada"
- Linhas 473-474: Remover erro 402 (especifico do Gateway)
- Linhas 514-518: Payload — atualizar endpoint e header para `api.openai.com` + `$OPENAI_API_KEY`
- Linhas 523: Modelo `"gpt-4o-mini"` (era `google/gemini-2.5-flash`)
- Linhas 569-572: Custos — atualizar para pricing OpenAI direto
- Linha 576-577: Dica — remover Gemini, sugerir gpt-4o-mini para simples e gpt-4o para complexo

### 3. Guia: `src/components/guia-projeto/integracoes/IASection.tsx`

- Linha 7: Titulo `"OpenAI API"` (era Lovable AI Gateway)
- Linha 9: Descricao `"API OpenAI (GPT-4o, GPT-4o-mini) para os Agentes Inteligentes"`

### 4. Guia: `src/components/guia-projeto/ResumoProjetoTab.tsx`

- Linha 36: Tecnologia `{ nome: "OpenAI", icon: Bot, categoria: "IA (GPT-4o)" }` (era Lovable AI Gateway)
- Linhas 340-341: Resumo executivo — trocar "via Lovable AI Gateway" por "via OpenAI API"

### 5. Guia: `src/components/guia-projeto/ImplementacaoTab.tsx`

- Linha 37: Consolidacao `"Core primeiro (Asaas → OpenAI → WhatsApp)"`
- Linha 55: Secret `{ nome: "OPENAI_API_KEY", fase: "F2", descricao: "Criptografada em platform_config via painel Admin" }`
- Linha 362-363: Passo F2 — "Configurar OPENAI_API_KEY via painel Admin" e "Criar edge function ai-chat usando OpenAI API"
- Linha 367: "Testar OpenAI API com prompts basicos"
- Linha 380: Rodada R6 — "OpenAI API + ai-chat"
- Linha 384: Rodada R10 — "Testar OpenAI API"

## Secao Tecnica

### Arquivos a modificar:
1. `supabase/functions/ai-chat/index.ts` — migrar de Gateway para OpenAI direta
2. `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx` — documentacao
3. `src/components/guia-projeto/integracoes/IASection.tsx` — titulo/descricao
4. `src/components/guia-projeto/ResumoProjetoTab.tsx` — tecnologias e resumo
5. `src/components/guia-projeto/ImplementacaoTab.tsx` — secrets, consolidacao, fases

### Padrao de autenticacao OpenAI (reutilizar de process-document):
A chave OpenAI sera obtida da tabela `platform_config` (key: `integration_openai`), descriptografada com `ENCRYPTION_KEY` usando AES-256-GCM. Este padrao ja esta implementado e testado no `process-document`.

### Sem alteracao de banco:
- Nenhuma migracao necessaria
- A tabela `platform_config` e a funcao `getOpenAIKey()` ja existem

### Prerequisito:
- A chave OpenAI deve estar configurada no painel Admin (integracao OpenAI) antes de usar os agentes de IA
