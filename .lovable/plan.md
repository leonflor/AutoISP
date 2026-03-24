

# Confirmacao antes do transbordo + correcao de deteccao contextual

## Contexto

Alem das correcoes ja aprovadas (remover `length <= 5`, reduzir `max_intent_attempts` para 2, aviso na primeira tentativa), o usuario quer que **antes de transferir para humano**, o bot pergunte: *"Deseja falar com um dos nossos atendentes?"*. Se sim, transfere. Se nao, encerra agradecendo.

## Abordagem

Introduzir um estado intermediario `pending_handover` na conversa. Quando o sistema decide escalar (por `max_intent_attempts` ou por `stuck_after_turns`), em vez de transferir imediatamente, salva a intencao e pergunta ao usuario. Na proxima mensagem, verifica a resposta.

## Mudancas

### 1. `_shared/procedure-runner.ts`
- **Remover `|| messageLower.length <= 5`** da linha 673 (correcao ja aprovada)
- **Logica de `stuck_after_turns`**: em vez de chamar `transfer_to_human` direto, setar `pending_handover = true` na conversa e retornar mensagem de confirmacao

### 2. `_shared/tool-handlers.ts`
- No handler de `transfer_to_human`: em vez de transferir direto, setar `pending_handover = true` e `pending_handover_reason` na conversa. Retornar mensagem perguntando ao usuario se quer falar com atendente

### 3. `simulate-agent/index.ts` e `whatsapp-webhook/index.ts`
- **Antes de processar com IA**, verificar se `pending_handover = true` na conversa
- Se sim, analisar a mensagem do usuario:
  - Confirmacao (sim, quero, pode, ok): executar transferencia real (`mode = "human"`)
  - Negacao (nao, obrigado, nao precisa): limpar `pending_handover`, responder agradecendo e encerrar conversa (`mode = "resolved"` ou manter `bot`)
- **Na escalacao por `max_intent_attempts`**: em vez de transferir direto, setar `pending_handover = true` e retornar a pergunta de confirmacao
- **Reduzir `max_intent_attempts` para 2** (migration SQL)

### 4. Migration SQL
- Adicionar coluna `pending_handover boolean default false` na tabela `conversations`
- Adicionar coluna `pending_handover_reason text` na tabela `conversations`
- Atualizar `max_intent_attempts` de 3 para 2 em `agent_templates`

## Fluxo esperado apos correcao

```text
1. "oi"    → saudacao normal (intent_attempts=0)
2. "bola"  → "Desculpe, nao entendi. Posso ajudar com boletos ou conexao." (intent_attempts=1)
3. "pato"  → "Nao consegui identificar. Deseja falar com um dos nossos atendentes?" (intent_attempts=2, pending_handover=true)
4a. "sim"  → transfere para humano
4b. "nao"  → "Obrigado pelo contato! Se precisar de algo, estamos a disposicao."
```

## Arquivos alterados

| Arquivo | Mudanca |
|---|---|
| `supabase/functions/_shared/procedure-runner.ts` | Remover `length<=5`, stuck_after_turns seta pending_handover |
| `supabase/functions/_shared/tool-handlers.ts` | transfer_to_human seta pending_handover em vez de transferir direto |
| `supabase/functions/simulate-agent/index.ts` | Verificar pending_handover antes de processar, confirmar/negar, escalacao com confirmacao |
| `supabase/functions/whatsapp-webhook/index.ts` | Mesma logica de pending_handover |
| Migration SQL | Colunas pending_handover + pending_handover_reason, max_intent_attempts=2 |

