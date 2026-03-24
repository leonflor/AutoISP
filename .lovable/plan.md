

# Alinhar simulador com comportamento real do WhatsApp

## Problema

O simulador chama `runProcedureStep` diretamente sem replicar a logica que o webhook executa antes e depois. As diferenças concretas:

| Comportamento | WhatsApp webhook | Simulador |
|---|---|---|
| Verificar `mode` (human/paused) antes de processar | Sim | Nao |
| Incrementar `intent_attempts` quando nao detecta procedimento | Sim | Nao |
| Escalar para humano ao atingir `max_intent_attempts` | Sim (chama `escalateToHuman`) | Nao |
| Detectar procedimento antes de `runProcedureStep` | Sim (linhas 678-706) | Nao (delega ao runner) |

O runner ja faz `detectProcedure` internamente, entao a detecção funciona. Mas o controle de `intent_attempts` e a verificação de `mode` nao existem no simulador.

## Solução

Adicionar ao `simulate-agent/index.ts`, antes de chamar `runProcedureStep`, a mesma logica do webhook:

### 1. Verificar mode da conversa
Se `mode === "human"`, nao chamar o motor de IA. Retornar uma mensagem indicando que a conversa esta em modo humano (o frontend ja mostra o banner).

### 2. Tracking de intent_attempts
Se a conversa nao tem `active_procedure_id`:
- Chamar `detectProcedure` com a mensagem
- Se nao detectar: incrementar `intent_attempts`
- Se `intent_attempts >= max_intent_attempts`: mudar mode para `"human"`, salvar `handover_reason`, retornar indicação de transbordo (sem enviar WhatsApp, sem gerar summary — apenas o estado)

### 3. Reset de intent_attempts
Quando `detectProcedure` encontra um procedimento, resetar `intent_attempts` para 0 (o runner ja ativa o procedimento, mas o reset do contador deve ser explicito).

## Arquivo alterado

| Arquivo | Mudança |
|---|---|
| `supabase/functions/simulate-agent/index.ts` | Adicionar verificação de mode, tracking de intent_attempts e escalação antes de `runProcedureStep` |

## Detalhes técnicos

A escalação no simulador sera simplificada: sem chamar WhatsApp API, sem gerar summary via gpt-4o-mini (custo desnecessário em teste). Apenas atualiza o banco (`mode: "human"`, `handover_reason`, `handover_at`) e retorna no response `debug.escalated: true`. O frontend ja reage ao `mode: "human"` mostrando o banner.

Para obter `max_intent_attempts`, o simulador precisara carregar o template do `tenant_agent` (atualmente nao faz isso). Adicionaremos uma query para buscar `agent_templates.max_intent_attempts` via o `tenant_agent`.

