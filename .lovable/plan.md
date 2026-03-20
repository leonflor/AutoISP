

# Plano: Procedure Runner — Step Executor + Condition Evaluator

## Contexto Tecnico

O runner opera inteiramente no Deno (Edge Functions), usando:
- `context-builder.ts` → `buildRuntimeContext` + `buildSystemPrompt`
- `tool-catalog.ts` → `TOOL_CATALOG` + `buildOpenAITools` (server-side, 3 tools ERP com nomes `erp_*`)
- `tool-handlers.ts` → `executeToolHandler` (executa tools server-side)
- OpenAI key descriptografada de `platform_config` via `crypto.ts`

As tools usadas sao as **server-side** (`erp_client_lookup`, `erp_contract_lookup`, `erp_invoice_search`), nao as 7 tools frontend (`get_customer_by_document`, etc.). O runner filtra as tools disponibilizadas ao LLM pelo campo `available_functions` do step atual.

## Arquivo a Criar

### `supabase/functions/_shared/procedure-runner.ts`

Tres funcoes exportadas:

**`runProcedureStep(supabaseAdmin, conversationId, userMessage)`**

1. `buildRuntimeContext(supabaseAdmin, conversationId)`
2. Extrair step atual de `procedure.definition.steps[step_index]`
3. Se nao ha procedure ativo, chamar `detectProcedure()` para tentar ativar um
4. Filtrar tools do `TOOL_CATALOG` pelo `step.available_functions` (ou nenhuma se step nao tem tools)
5. Salvar mensagem do usuario em `messages` (role: 'user')
6. Chamar OpenAI (`gpt-4o`) com:
   - system: `buildSystemPrompt(context)`
   - messages: historico formatado `{role, content}` + tool messages
   - tools: filtradas pelo step (formato OpenAI via `buildOpenAITools` filtrado)
   - temperature: `template.temperature`
7. **Loop de tool calls** (max 5 iteracoes):
   - Se response tem `tool_calls`: executar cada via `executeToolHandler()`
   - Salvar resultado em `messages` (role: 'tool', tool_name, tool_result)
   - Merge dados relevantes em `collected_context` da conversa
   - Re-chamar OpenAI com tool results no historico
   - Repetir ate nao ter mais tool_calls
8. Avaliar `advance_condition` do step
9. Salvar resposta final em `messages` (role: 'assistant')
10. Retornar `{ reply: string, debug: object }`

**`evaluateAdvanceCondition(condition, context, supabaseAdmin, openaiKey)`**

Avalia se o step deve avancar:
- `'always'` → true
- `'function_success'` → ultima tool call retornou `success: true`?
- `'user_confirmation'` → chamar `gpt-4o-mini`: "Esta mensagem e uma confirmacao positiva? Responda so sim/nao: {msg}"
- `'data_collected'` → campos obrigatorios existem em `collected_context`?
- `'llm_judge'` → chamar `gpt-4o-mini` com objetivo do step + resposta do bot

**`resolveStepOutcome(outcome, supabaseAdmin, conversationId, context)`**

- `'next_step'` → `step_index++`, `turns_on_current_step = 0`
- `'end_procedure'` → `active_procedure_id = null`, `step_index = 0`
- `'handover_human'` → `mode = 'human'`, salvar `handover_reason` + `handover_at`
- `'conditional'` → para cada condicao, chamar `gpt-4o-mini` com `collected_context`, aplicar primeiro `then` que for true

**`detectProcedure(supabaseAdmin, message, templateId)`**

- Buscar todos procedures `is_current = true` do template
- Para cada, contar keywords do `definition.triggers.keywords` presentes na mensagem
- Score = keywords encontradas / total keywords
- Retornar procedure com maior score se `>= min_confidence` (default 0.5)
- Retornar null se nenhum atingiu threshold
- Se detectado: atualizar conversa com `active_procedure_id` e `step_index = 0`

## Detalhes de Implementacao

- OpenAI key: reutilizar `getOpenAIKey()` que ja existe no context-builder (precisa exportar)
- Tool filtering: mapear `step.available_functions` (ex: `["erp_client_lookup"]`) para subset do `TOOL_CATALOG`
- Messages format: converter rows do DB para formato OpenAI `{role, content, tool_call_id?, name?}`
- Stuck detection: se `turns_on_current_step >= stuck_after_turns`, aplicar acao de stuck (handover ou mensagem padrao)
- Todas as chamadas OpenAI usam `https://api.openai.com/v1/chat/completions` diretamente (nao Lovable gateway) pois e o provider do tenant

## Alteracoes em Arquivo Existente

### `supabase/functions/_shared/context-builder.ts`
- Exportar `getOpenAIKey()` (atualmente e funcao privada `async function`, precisa virar `export async function`)

## Nenhuma migration SQL necessaria

