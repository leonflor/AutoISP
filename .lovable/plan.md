

# Pendencias da Implementacao de Tools + Fluxos

## Bugs criticos encontrados

### 1. Streaming quebrado no `ai-chat/index.ts`
O bloco de streaming (linhas 734-826) referencia a variavel `aiResponse` que esta fora do escopo do loop -- ela so existe dentro do `for`. Apos o loop, o codigo tenta ler `aiResponse.body` mas essa variavel nao esta acessivel. O correto e **re-chamar a OpenAI com `stream: true`** usando as `messages` ja enriquecidas (com resultados de tool calls), ou usar o `finalResponse` ja obtido.

### 2. Resposta nao-streaming duplicada
O bloco nao-streaming (linhas 828-831) faz `await aiResponse.json()` novamente, mas o body ja foi consumido no loop. Deve usar `finalResponse` que ja contem os dados parseados.

### 3. `fetch-erp-clients/index.ts` nao foi refatorado
O plano previa refatorar este arquivo para importar de `_shared/erp-fetcher.ts`, eliminando a duplicacao. A logica ainda esta 100% duplicada.

---

## Itens pendentes (nao-bugs)

### 4. Seed de dados (tools e fluxos padrao)
A migracao criou as tabelas mas nao inseriu dados de exemplo (seed). O plano previa criar:
- Tool: `buscar_contrato_cliente` (handler: `erp_search`)
- Fluxo: Cobranca (5 etapas)
- Fluxo: Suporte Tecnico (4 etapas)
- Fluxo: Venda/Upgrade (4 etapas)

Esses seeds dependem do `id` de um agente existente, entao serao inseridos condicionalmente (ou via SQL com subquery).

### 5. Deploy das edge functions
As funcoes `ai-chat` e `fetch-erp-clients` (e as novas shared files) precisam ser deployadas apos as correcoes.

---

## Plano de execucao

### Etapa 1 -- Corrigir streaming e nao-streaming no `ai-chat/index.ts`

**Streaming:** Apos o tool call loop, se `body.stream = true`, fazer uma nova chamada a OpenAI com `stream: true` usando as `messages` finais (que ja incluem resultados de tools). Transmitir essa stream via SSE.

**Nao-streaming:** Substituir `await aiResponse.json()` por `finalResponse` (que ja foi parseado no loop).

Resumo das alteracoes no `ai-chat/index.ts`:
- Remover referencia a `aiResponse` fora do loop
- Para streaming: re-chamar OpenAI com `stream: true` e `messages` finais
- Para nao-streaming: usar `finalResponse` diretamente para extrair `message.content` e `usage`

### Etapa 2 -- Refatorar `fetch-erp-clients/index.ts`

- Remover as funcoes `decrypt`, `fetchIxcClients`, `fetchSgpClients`, `fetchMkClients` duplicadas
- Importar de `../_shared/erp-fetcher.ts`
- Manter a mesma interface HTTP (sem breaking change)

### Etapa 3 -- Seed de dados (migracao SQL)

Inserir condicionalmente tools e fluxos de exemplo vinculados ao primeiro agente do tipo `atendente`:

- 1 tool: `buscar_contrato_cliente` com `handler_type = 'erp_search'` e `requires_erp = true`
- 3 fluxos (Cobranca, Suporte Tecnico, Venda) com etapas, vinculando a tool onde aplicavel

### Etapa 4 -- Deploy das edge functions

Deployar `ai-chat` e `fetch-erp-clients` para aplicar as correcoes.

---

## Detalhes tecnicos

### Correcao do streaming (Etapa 1)

A logica correta e:

```text
// Apos o tool call loop:
if (body.stream) {
  // Re-chamar OpenAI com stream: true e as messages finais (com tool results)
  const streamResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { ... },
    body: JSON.stringify({
      model, messages, temperature, max_tokens,
      stream: true,
      stream_options: { include_usage: true }
      // SEM tools -- tool calls ja foram resolvidos
    })
  });
  // Transmitir streamResponse.body via SSE (codigo existente funciona)
} else {
  // Usar finalResponse diretamente
  const assistantMessage = finalResponse.choices?.[0]?.message?.content || "";
  const tokensUsed = finalResponse.usage?.total_tokens || 0;
  // ... resto igual
}
```

### Refatoracao do `fetch-erp-clients` (Etapa 2)

```text
// Antes: ~200 linhas com funcoes duplicadas
// Depois: ~80 linhas importando de _shared
import { decrypt, fetchIxcClients, fetchSgpClients, fetchMkClients } from "../_shared/erp-fetcher.ts";
// ... manter apenas o Deno.serve() com a logica de orquestracao
```

