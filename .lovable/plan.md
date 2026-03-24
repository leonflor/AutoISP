

# Analise do Dialogo: Dois Bugs Distintos

## Bug 1: Por que "boleto" transferiu para humano?

Os logs mostram `proc=no` em todas as chamadas. Ou seja, `detectProcedure` nao encontrou nenhum procedimento ativo com a keyword "boleto" para o template em uso.

Sem procedimento ativo, `buildStepTools(null, hasErp)` retorna apenas `transfer_to_human`. O guardrail no system prompt diz explicitamente: *"Nenhum procedimento está ativo... use a ferramenta `transfer_to_human` para transferir"*. O LLM obedeceu corretamente.

**Causa raiz**: Nao ha procedimento cadastrado com trigger "boleto" (ou ele esta com `is_active=false` / `is_current=false`). Isso e um problema de dados/configuracao, nao de codigo.

**Verificacao necessaria**: Consultar a tabela `procedures` para confirmar se existe algum procedimento com keyword "boleto" vinculado ao template usado na simulacao.

## Bug 2: Erro OpenAI na mensagem apos o transfer

O erro e: `"messages with role 'tool' must be a response to a preceding message with 'tool_calls'"` na posicao `messages.[6]`.

**Causa raiz**: Quando o LLM faz um tool_call, o `procedure-runner.ts` salva no banco:
- A mensagem `role: "tool"` com `tool_call_id` (linha 277-284)
- A resposta final `role: "assistant"` com content (linha 364-368)

Mas **nao salva** a mensagem intermediaria `role: "assistant"` que contem o array `tool_calls`. Essa mensagem so existe em memoria (`historyMessages.push` na linha 254-258).

Na proxima chamada, o `context-builder` carrega o historico do banco e `formatMessagesForOpenAI` monta: `...user, tool(com tool_call_id), assistant...`. O OpenAI ve uma mensagem `tool` sem a mensagem `assistant` com `tool_calls` que a precede — erro 400.

## Plano de Correcao

### 1. Salvar mensagem assistant com tool_calls no banco

Em `procedure-runner.ts`, apos a linha 258 (onde o assistant com tool_calls e adicionado ao historyMessages), inserir tambem no banco:

```typescript
await supabaseAdmin.from("messages").insert({
  conversation_id: conversationId,
  role: "assistant",
  content: assistantMsg.content ?? "",
  tool_calls: assistantMsg.tool_calls, // salvar o array de tool_calls
});
```

### 2. Reconstruir tool_calls no formatMessagesForOpenAI

Em `formatMessagesForOpenAI`, adicionar logica para incluir `tool_calls` quando o campo existir na mensagem do banco:

```typescript
if (m.tool_calls) {
  msg.tool_calls = m.tool_calls;
}
```

### 3. Verificar procedures no banco

Consultar `procedures` para confirmar se ha um procedimento com keyword "boleto" vinculado ao template correto, com `is_active=true` e `is_current=true`.

## Arquivos a alterar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/_shared/procedure-runner.ts` | Salvar assistant+tool_calls no banco; reconstruir no formatMessages |

## Detalhe tecnico

```text
Historico atual no banco (bugado):
  user: "boleto"
  tool: { tool_call_id: "xxx", content: '{"transferred":true}' }  ← sem assistant precedente!
  assistant: "Vou transferir voce..."

Historico correto:
  user: "boleto"
  assistant: { content: null, tool_calls: [{id:"xxx", ...}] }     ← FALTAVA
  tool: { tool_call_id: "xxx", content: '{"transferred":true}' }
  assistant: "Vou transferir voce..."
```

