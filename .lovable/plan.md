

# Plano: Context Builder — Estado da Conversa para o LLM

## Status: ✅ Concluído

## Arquivos Criados

1. **Migration SQL** — `match_knowledge` function criada via migration tool
2. **`supabase/functions/_shared/crypto.ts`** — `deriveKey`, `encrypt`, `decrypt` (AES-GCM) compartilhados
3. **`supabase/functions/_shared/context-builder.ts`** — `buildRuntimeContext` + `buildSystemPrompt`

## Camadas já implementadas

- ✅ Schema multi-tenant (agent_templates, tenant_agents, procedures, conversations, messages, knowledge_bases)
- ✅ LLM Tool Layer (src/lib/llm/tools.ts, tool-executor.ts, tool-result-formatter.ts)
- ✅ Context Builder (context-builder.ts + crypto.ts + match_knowledge SQL)
- ⬜ Motor de execução (Edge Function que orquestra tudo)
- ⬜ Reescrita do whatsapp-webhook para usar o novo schema
