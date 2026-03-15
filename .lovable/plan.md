

# Avaliacao: Planner/Executor vs State Machine Aprovada

## O que a sugestao propoe de diferente

A principal novidade e a separacao em **Planner** (IA gera plano estruturado) e **Executor** (IA executa etapa). No modelo aprovado, os estados ja estao pre-definidos na tabela `flow_state_definitions` — nao ha necessidade de a IA "planejar".

## Analise ponto a ponto

| Aspecto | Sugestao | Plano aprovado | Veredicto |
|---|---|---|---|
| Planner (IA gera plano) | IA decide os steps | Steps pre-definidos no banco | **Plano aprovado e melhor** — se a IA gera o plano, ela pode inventar steps ou errar a ordem. Pre-definir no banco e mais previsivel. |
| Executor separado | Papel explicito no prompt | Ja previsto — o prompt recebe apenas o objetivo do estado atual | Equivalente. A restricao ja esta no design. |
| Tool Guardrails (validacao backend antes de executar) | Valida ferramenta + params + autorizacao no backend antes de executar | Filtra tools no payload da OpenAI (allowed_tools) mas nao valida no backend pos-resposta | **Sugestao e melhor** — adicionar validacao no backend antes de executar a tool e uma camada extra de seguranca. |
| Max execucoes por etapa | 5 por etapa + bloquear repeticao de tool | `max_attempts` = 3, sem bloqueio de repeticao | **Sugestao agrega** — bloquear repeticao da mesma tool no mesmo estado evita loops. |
| Historico de acoes por estado | Registrar acoes executadas | Nao previsto | **Sugestao agrega** — util para debug e auditoria. |
| Persistencia (plan no banco) | Salvar o plano inteiro na sessao | Nao previsto (flow_id ja referencia os estados) | **Desnecessario** — os estados ja estao em `flow_state_definitions`. Salvar o plano seria redundante. |
| 4 componentes (Orquestrador, Planner, Executor, Tools) | 4 chamadas/roles distintos | 1 chamada a OpenAI por turno | **Plano aprovado e melhor** — 2 chamadas a OpenAI (planner + executor) dobra latencia e custo. Com estados pre-definidos, o planner e desnecessario. |

## O que vale incorporar ao plano aprovado

### 1. Tool Guardrails no backend (validacao pos-resposta da IA)

Antes de executar qualquer tool call retornada pela OpenAI, o backend valida:
- Tool esta em `allowed_tools` do estado atual (redundante com o filtro no payload, mas defesa em profundidade)
- Parametros obrigatorios estao presentes
- Se a tool `requires_erp`, o ISP tem ERP ativo

Adicionar isso em `state-machine.ts` como funcao `validateToolCall()`.

### 2. Bloqueio de repeticao de tool no mesmo estado

No `conversation_sessions.context`, manter um array `executed_tools` por estado. Se a mesma tool ja foi executada com sucesso naquele estado, bloquear re-execucao.

### 3. Historico de acoes por estado

Adicionar campo `action_log` (jsonb array) em `conversation_sessions` para registrar cada acao executada com timestamp, tool, resultado. Util para debug sem consultar `ai_usage`.

### 4. Max attempts aumentado

Manter `max_attempts` = 5 (em vez de 3) como sugerido, para dar mais margem em estados que dependem de input do usuario.

## O que NAO vale incorporar

- **Planner como chamada separada a IA**: Adiciona latencia, custo, e o plano ja esta pre-definido no banco. A previsibilidade vem de estados fixos, nao de pedir a IA para planejar.
- **Salvar plano na sessao**: Redundante com `flow_id` + `flow_state_definitions`.
- **Separacao explicita Planner/Executor**: Com estados pre-definidos, basta 1 chamada a IA com o objetivo do estado. Duas chamadas sao desnecessarias.

## Plano atualizado (diferencas vs versao anterior)

Apenas 3 adicoes ao plano aprovado:

1. **`validateToolCall()`** em `state-machine.ts` — valida tool + params antes de executar
2. **`context.executed_tools`** — array de tools ja executadas no estado, bloqueia repeticao
3. **`context.action_log`** — historico de acoes por estado para auditoria
4. **`max_attempts` = 5** em vez de 3

Nenhuma mudanca estrutural no schema, nenhuma tabela nova, nenhum componente novo. Apenas logica adicional no `state-machine.ts` e campo extra no `context` jsonb.

