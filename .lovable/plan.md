

# Plano: Corrigir Support.tsx + Seed SQL

## 1. Corrigir `src/pages/admin/Support.tsx`

A tabela `conversations` foi recriada com schema diferente. Os campos antigos nao existem mais:

| Campo antigo | Campo novo |
|---|---|
| `status` | `mode` (bot/human/paused) + `resolved_at` (null = aberto) |
| `subject` | Nao existe. Usar `user_phone` como identificador |
| `started_at` | `created_at` |
| `closed_at` | `resolved_at` |
| `subscriber_id` | Nao existe |
| `agent_id` | `tenant_agent_id` |

**Alteracoes**:
- Atualizar a query para usar os novos campos e joins (`tenant_agents:tenant_agent_id` em vez de `ai_agents:agent_id`)
- Substituir filtros de status por `mode` e `resolved_at IS NULL`
- Substituir `subject` por `user_phone`
- Substituir `started_at` por `created_at`
- Stats: "Abertos" = mode != paused e resolved_at IS NULL; "Em atendimento humano" = mode = 'human'; "Resolvidos hoje" = resolved_at de hoje

## 2. Seed SQL via insert tool

Inserir 1 registro em `agent_templates` e 1 registro em `procedures` com os dados especificados pelo usuario. Usar o insert tool (nao migration) pois e insercao de dados.

**agent_templates**: name='Atendente Geral', type='atendente_geral', system_prompt completo, temperature=0.4, tone='professional', default_name='Sofia', max_intent_attempts=3, intent_failure_message conforme especificado.

**procedures**: name='Cobranca de boleto', template_id = id do template inserido acima, definition JSONB contendo triggers (keywords + min_confidence) e 3 steps com instructions, available_functions, advance_condition, stuck_after_turns, stuck_action e on_complete conforme especificado.

Apos inserir, executar SELECT para exibir os registros ao usuario.

## Arquivos alterados
- `src/pages/admin/Support.tsx` — adaptar ao novo schema de conversations

