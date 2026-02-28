

## Problema
O prompt completo enviado à OpenAI não é logado de forma inspecionável. Apenas o `system_prompt` é persistido em `ai_usage.metadata`, mas faltam: o array `messages` completo (com tool results), o `tools` JSON Schema, e a resposta não-streaming intermediária. Isso impede debug do comportamento "rebelde".

## Plano: Adicionar log completo do payload enviado à OpenAI

### 1. Em `ai-chat/index.ts`, adicionar `console.log` do system prompt completo

Após `buildSystemPrompt()` (linha 606), logar o prompt inteiro:
```typescript
console.log(`📋 SYSTEM PROMPT:\n${systemPrompt}`);
```

### 2. Logar o payload completo antes de cada chamada à OpenAI

Antes do `fetch` na linha 643 (loop de tools), logar:
```typescript
console.log(`📤 OpenAI request (iteration ${iteration}): messages=${messages.length}, tools=${openaiTools?.length || 0}`);
console.log(`📤 Messages dump:\n${JSON.stringify(messages, null, 2)}`);
```

### 3. Logar o payload do streaming final

Antes do `fetch` de streaming (linha 732), logar:
```typescript
console.log(`📤 Final streaming request: messages=${messages.length}`);
console.log(`📤 Final messages dump:\n${JSON.stringify(messages, null, 2)}`);
```

### Resultado
Após deploy, cada interação produzirá nos Edge Function logs:
- O system prompt completo (8 camadas)
- Todas as mensagens incluindo tool results
- Quantidade de tools disponíveis

Isso permitirá identificar exatamente o que a IA recebe e por que não segue as instruções.

### Alternativa: consulta SQL imediata
Sem alterar código, já é possível ver o system prompt atual via:
```sql
SELECT metadata->>'system_prompt' FROM ai_usage WHERE isp_id = '...' ORDER BY created_at DESC LIMIT 1;
```

