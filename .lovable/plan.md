

# Plano: Corrigir agente prometendo transferência sem executar

## Problema

Os guardrails dizem "ofereça transferir para atendimento humano", mas o agente não possui nenhuma ferramenta para executar a transferência. Sem procedimento ativo (`proc=no`), não há mecanismo de `handover_human`. O agente promete transferir, mas nada acontece.

## Solução em duas partes

### 1. Adicionar ferramenta `transfer_to_human` ao catálogo

Criar uma nova tool que o agente pode chamar para efetivamente mudar o `mode` da conversa para `"human"`. Isso permite que o agente execute a transferência em vez de apenas prometer.

**Arquivos:**

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/_shared/tool-catalog.ts` | Adicionar entrada `transfer_to_human` com `requires_erp: false` |
| `supabase/functions/_shared/tool-handlers.ts` | Adicionar handler que faz `update conversations set mode='human'` |
| `src/constants/tool-catalog.ts` | Adicionar espelho da ferramenta para UI admin |

A tool terá um parâmetro `reason` (string) para registrar o motivo da transferência.

### 2. Disponibilizar a ferramenta mesmo sem procedimento ativo

No `procedure-runner.ts`, quando não há procedimento ativo (`step === null`), atualmente nenhuma ferramenta é passada ao OpenAI. Alterar para sempre incluir `transfer_to_human` como ferramenta disponível, independente de haver procedimento.

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/_shared/procedure-runner.ts` | Quando `tools` é `undefined` (sem procedimento), criar array com apenas `transfer_to_human` |

### 3. Ajustar guardrails no prompt

Atualizar a instrução de "ofereça transferir" para "use a ferramenta `transfer_to_human` quando o assunto exigir consulta a sistemas — nunca apenas diga que vai transferir sem executar a ferramenta".

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/_shared/context-builder.ts` | Reescrever guardrail do `!hasProcedure` para instruir uso da ferramenta |

### 4. Simulador: mostrar feedback quando modo muda para "human"

No `AgentSimulator.tsx`, quando o debug retornar `mode: "human"`, exibir um badge ou mensagem indicando que a conversa foi transferida, em vez de ficar silencioso.

| Arquivo | Alteração |
|---------|-----------|
| `src/components/AgentSimulator.tsx` | Exibir indicador visual quando `debug.mode === 'human'` |

### 5. Redeploy da edge function

Após as alterações, fazer deploy de `simulate-agent` (que importa os módulos compartilhados).

## Impacto
- O agente passa a executar transferências reais em vez de apenas prometer
- Funciona tanto no simulador quanto no webhook do WhatsApp
- Sem procedimento ativo, a única ferramenta disponível será `transfer_to_human`

