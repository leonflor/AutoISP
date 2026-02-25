

# Historico dos ultimos 10 prompts na auditoria

## Problema

Hoje a auditoria gera o prompt sob demanda (on-the-fly) mas nao armazena historico. O admin nao consegue ver como o prompt estava em momentos anteriores — so ve o estado atual.

## Abordagem

Dois passos: (1) salvar o system prompt no `ai_usage.metadata` a cada chamada real do `ai-chat`, e (2) no frontend, buscar os ultimos 10 registros de `ai_usage` daquele `isp_agent_id` e permitir navegar entre eles no dialog de auditoria.

Nao precisa de tabela nova. O campo `metadata` (jsonb) do `ai_usage` ja existe e ja armazena informacoes parciais. Basta incluir o `system_prompt` nele.

## Alteracoes

### 1. `ai-chat/index.ts` — salvar o prompt no metadata do ai_usage

Nos dois pontos onde `ai_usage.insert` e chamado (streaming ~linha 813 e non-streaming ~linha 854), adicionar `system_prompt: systemPrompt` dentro do `metadata`:

```typescript
metadata: {
  model,
  isp_agent_id: ispAgent.id,
  system_prompt: systemPrompt,
  knowledge_items: knowledgeBase.length,
  document_chunks: documentChunks.length,
  security_clauses: securityClauses?.length || 0
}
```

### 2. `audit-prompt/index.ts` — retornar historico dos ultimos 10

Apos montar o prompt atual, buscar os ultimos 10 registros de `ai_usage` que contenham `system_prompt` no metadata para aquele `isp_agent_id`:

```typescript
const { data: history } = await supabaseAdmin
  .from("ai_usage")
  .select("id, created_at, tokens_total, tokens_input, tokens_output, metadata")
  .eq("metadata->>isp_agent_id", isp_agent_id)
  .not("metadata->system_prompt", "is", null)
  .order("created_at", { ascending: false })
  .limit(10);
```

Adicionar o array `history` na resposta JSON, cada item com `{ id, created_at, prompt, tokens_total }`.

### 3. `useAuditPrompt.ts` — tipar o historico

Adicionar ao `AuditPromptResult`:

```typescript
history: {
  id: string;
  created_at: string;
  prompt: string;
  tokens_total: number;
}[];
```

### 4. `PromptAuditDialog.tsx` — UI de navegacao entre prompts

- Adicionar um seletor (tabs ou lista lateral) com os ultimos 10 prompts por data
- O primeiro item e "Atual (simulado)" — o prompt gerado on-the-fly
- Os demais sao historicos reais com timestamp
- Ao selecionar um item, exibir o prompt correspondente na area principal
- Mostrar tokens usados em cada registro historico

Layout: adicionar acima da area de prompt uma barra com botoes de data, tipo:
```
[Atual] [25/02 14:30 - 1.2k tokens] [25/02 13:15 - 980 tokens] ...
```

### 5. `AiAgentDetail.tsx` — sem alteracao necessaria

A chamada ja passa o `ispAgentId` e o dialog ja recebe `data` — o historico vem junto automaticamente.

## Arquivos alterados

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/ai-chat/index.ts` | Salvar `system_prompt` no `metadata` do `ai_usage` |
| `supabase/functions/audit-prompt/index.ts` | Buscar ultimos 10 de `ai_usage` e retornar como `history` |
| `src/hooks/admin/useAuditPrompt.ts` | Tipar `history` no resultado |
| `src/components/admin/ai-agents/PromptAuditDialog.tsx` | Adicionar navegacao entre prompt atual e historicos |

## Deploy

Edge functions `ai-chat` e `audit-prompt`.

## Observacao

O `system_prompt` pode ter ~2-5KB por registro. Em 10 registros sao ~50KB — insignificante para jsonb. A longo prazo, se necessario, pode-se truncar ou comprimir, mas por agora nao ha problema.

