
# Corrigir Scroll e Contagem de Tokens no Chat de Teste

## Problema 1: Scroll nao funciona

O componente `ScrollArea` (Radix UI) envolve o conteudo em um viewport interno. O `ref={scrollRef}` esta no elemento externo, mas o scrollbar pertence ao viewport filho. Por isso, `scrollRef.current.scrollTop = scrollRef.current.scrollHeight` nao tem efeito.

**Solucao:** Usar um elemento `div` "ancora" no final da lista de mensagens e chamar `scrollIntoView()` nele sempre que as mensagens mudarem. Isso funciona independente da estrutura interna do ScrollArea.

## Problema 2: Contador de tokens sempre em 0

O estado `tokensUsed` (linha 121) e exibido na UI (linha 364), mas **nunca e atualizado**. O backend envia os dados de uso em dois lugares:
- No ultimo chunk SSE do OpenAI (campo `usage` — coletado internamente pelo backend)
- **Nao e reenviado ao frontend** — o backend apenas loga no `ai_usage`

**De onde vem a informacao de tokens:**
1. A OpenAI retorna `usage` no ultimo chunk do stream quando `stream_options: { include_usage: true }` esta ativo
2. O campo contem: `prompt_tokens` (tokens do system prompt + historico), `completion_tokens` (tokens gerados na resposta), `total_tokens` (soma)
3. O backend coleta esses valores (linhas 550-554) e insere na tabela `ai_usage` (linha 571-587)
4. Porem, o backend **nao envia** esses dados ao frontend no streaming

**Como funciona o gerenciamento:**
- Cada chamada ao `ai-chat` registra em `ai_usage`: `tokens_total`, `tokens_input`, `tokens_output`, `isp_id`, `agent_id`, `user_id`
- O sistema verifica limites mensais consultando a tabela `ai_limits` vinculada ao plano do ISP (linhas 402-440)
- Se o total de tokens do mes exceder `monthly_limit`, a requisicao e bloqueada com status 429

**Solucao:** Incluir um evento SSE com `usage` no stream (junto ao evento `sources` ja existente) e ler no frontend para atualizar o contador.

---

## Alteracoes Planejadas

### 1. `src/components/painel/ai/AgentTestDialog.tsx`

**a) Corrigir scroll:**
- Adicionar `const messagesEndRef = useRef<HTMLDivElement>(null)` 
- Colocar `<div ref={messagesEndRef} />` como ultimo elemento dentro do `ScrollArea`
- No `useEffect` de mensagens, chamar `messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })`
- Remover o `scrollRef` atual (nao mais necessario)

**b) Atualizar contador de tokens:**
- No parser SSE, detectar o evento `sources` que ja e enviado pelo backend e tambem o novo campo `usage`
- Quando receber `usage`, chamar `setTokensUsed(prev => prev + usage.total_tokens)`
- O contador acumula ao longo da sessao (soma de todas as mensagens)

### 2. `supabase/functions/ai-chat/index.ts`

**Incluir `usage` no evento de fontes:**
- Na linha 563, alterar o JSON do evento `sources` para incluir tambem o campo `usage`:
  ```
  { sources, usage: { total_tokens, prompt_tokens, completion_tokens } }
  ```
- Isso reaproveita o evento SSE ja existente, sem adicionar outro

---

## Secao Tecnica

### Arquivos a modificar:
1. `src/components/painel/ai/AgentTestDialog.tsx` — scroll + leitura de tokens
2. `supabase/functions/ai-chat/index.ts` — incluir usage no evento SSE de sources

### Logica do scroll (padrao React):
```text
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

// Dentro do ScrollArea, apos o ultimo item:
<div ref={messagesEndRef} />
```

### Logica dos tokens no frontend:
```text
// No parser SSE, quando receber sources+usage:
if (parsed.sources) {
  messageSources = parsed.sources;
}
if (parsed.usage) {
  setTokensUsed(prev => prev + parsed.usage.total_tokens);
}
```

### Evento SSE atualizado (backend):
```text
// Linha 563 do ai-chat/index.ts
const sourcesEvent = `data: ${JSON.stringify({ 
  sources, 
  usage: { total_tokens: totalTokens, prompt_tokens: promptTokens, completion_tokens: completionTokens } 
})}\n\n`;
```

### Resumo da origem dos tokens:
- **prompt_tokens**: Numero de tokens do system prompt completo (template + tom de voz + RAG + Q&A + seguranca) somado ao historico de mensagens
- **completion_tokens**: Numero de tokens gerados pela resposta do agente
- **total_tokens**: Soma de ambos
- Esses numeros sao fornecidos pela propria API OpenAI no ultimo chunk do stream
- Sao registrados permanentemente na tabela `ai_usage` para controle de limites por plano
