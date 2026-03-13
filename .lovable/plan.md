

# Montagem do Prompt do Agente — Estado Atual

O prompt do sistema é construído pela função `buildSystemPrompt()` em `supabase/functions/ai-chat/index.ts` (linha 178-284), em **8 camadas sequenciais**:

---

## Camada 1 — Prompt Base (Template)
O `system_prompt` do template do agente (`ai_agents.system_prompt`). Define persona, regras gerais e comportamento base.

## Camada 2 — Tom de Voz (ISP)
Se o ISP configurou um `voice_tone` no `isp_agents`, injeta:
> "Adote o seguinte tom de voz em suas respostas: {voice_tone}"

## Camada 3 — Documentos RAG (pgvector)
Busca semântica nos chunks de documentos do agente usando embedding da última mensagem do usuário (modelo `text-embedding-3-small`, 768 dimensões). Até 5 chunks com similaridade >= 0.7. Exibe relevância percentual.

## Camada 4 — FAQ (Q&A manual)
Itens da tabela `agent_knowledge_base` ativos, ordenados por `sort_order`. Formato pergunta/resposta.

## Camada 5 — Cláusulas de Segurança
Cláusulas ativas da tabela `ai_security_clauses` com `applies_to` = "all" ou "tenant". Injetadas como regras obrigatórias.

## Camada 5.5 — Ferramentas (Tools)
Lista apenas as tools cujos `handler` estão referenciados nos fluxos vinculados ao agente. Se a tool requer ERP (`requires_erp`), só aparece se o ISP tem ERP ativo. Usa o catálogo hardcoded `TOOL_CATALOG`.

## Camada 5.6 — Fluxos Conversacionais
Fluxos vinculados via `ai_agent_flow_links`. Para cada fluxo:
- Tipo: "roteiro fixo" ou "guia flexível"
- Keywords/prompt de gatilho
- Etapas numeradas com: instrução, ferramenta, input esperado, condição de avanço, fallback, rotas condicionais (saltos)

## Camada 6 — Ancoragem de Contexto
Metadados dinâmicos para evitar vazamento cross-tenant:
- Nome do provedor (ISP)
- Data atual
- Nome do agente (display_name do ISP ou nome do template)

---

## Payload final enviado à OpenAI
- `model`: do template (default `gpt-4o-mini`)
- `messages`: [system_prompt, ...mensagens_do_usuário]
- `tools`: apenas as tools filtradas pelos fluxos (formato function calling)
- `temperature`: do template (default 0.7)
- `max_tokens`: do template (default 1000)
- Loop de até 3 iterações para tool calls

O `system_prompt` completo é persistido no campo `metadata` da tabela `ai_usage` em cada interação para auditoria.

