
## Objetivo

Corrigir a detecção do procedimento “Cobrança de fatura” para que a mensagem `boleto` ative o fluxo, em vez de transferir para humano.

## Diagnóstico encontrado

O problema não está no `transfer_to_human` em si. O procedimento nem chega a ser detectado.

### Causa raiz principal
Hoje o backend calcula o score assim:

```text
score = keywords_encontradas / total_keywords
```

No caso de `boleto`, com 1 palavra encontrada em 7 keywords:

```text
score = 1 / 7 = 0.14
```

Mas o procedimento atual no banco está com:

```text
min_confidence = 55
```

Enquanto o `detectProcedure()` espera um valor entre `0` e `1`:

```ts
if (score >= minConfidence)
```

Logo:

```text
0.14 >= 55  -> false
```

Por isso os logs continuam mostrando `proc=no`.

### Causa raiz secundária
O editor de procedimentos está tratando confiança como porcentagem inteira (`50..95`) e salva esse número bruto no JSON:

- UI mostra: `Confiança mínima: 55%`
- Banco grava: `55`
- Runtime espera: `0.55`

Ou seja: UI e backend estão em escalas diferentes.

### Causa adicional
A migration anterior atualizou um procedimento antigo (`b1b2...0002`), mas o procedimento **ativo/current** hoje é outro:

```text
id atual: cd769a96-5780-4054-92e0-6143628ba060
name: Cobrança de fatura
version: 4
is_current: true
min_confidence: 55
```

Então a correção anterior não afetou a versão em uso.

## Plano de correção

### 1. Tornar o runtime tolerante a ambos os formatos
Ajustar `detectProcedure()` em `supabase/functions/_shared/procedure-runner.ts` para aceitar:

- decimal: `0.14`, `0.55`
- porcentagem inteira: `14`, `55`

Regra proposta:

```ts
const raw = triggers.min_confidence ?? 0.5;
const minConfidence = raw > 1 ? raw / 100 : raw;
```

Isso corrige imediatamente procedimentos já salvos com escala errada e evita novas falhas silenciosas.

### 2. Corrigir o ProcedureEditor para exibir em % e salvar em decimal
Em `src/components/admin/procedures/ProcedureEditor.tsx`:

- ao carregar do banco:
  - se vier `0.14`, mostrar `14`
  - se vier `55`, mostrar `55` temporariamente
- ao salvar:
  - converter `%` para decimal antes de persistir
  - ex.: `14` -> `0.14`, `55` -> `0.55`

Assim a UI continua amigável, mas o banco passa a ficar no formato correto para o runtime.

### 3. Permitir valores baixos no slider
Hoje o slider vai de `50` a `95`, o que torna impossível configurar algo como `14%`.

Ajuste proposto:
- faixa: `5` a `100` (ou `1` a `100`)
- step: `1` ou `5`

Isso permite configurar corretamente gatilhos por palavra única quando fizer sentido.

### 4. Corrigir os dados atuais via migration
Criar uma migration para normalizar os procedimentos ativos que estejam com `min_confidence > 1`.

Estratégia:
- converter automaticamente `55` -> `0.55`
- opcionalmente ajustar o procedimento “Cobrança de fatura” para `0.14`, já que ele precisa disparar com `boleto`

Abordagem segura:
```text
a) normalização geral: valores > 1 viram valor/100
b) correção específica do procedimento atual de cobrança para 0.14
```

Isso resolve o estado atual do banco e não depende apenas do fallback do runtime.

### 5. Validar no editor para evitar regressão
Adicionar proteção no submit do editor para garantir que o valor persistido sempre fique entre `0` e `1`.

Exemplo:
- UI usa `14`
- persistência usa `0.14`
- nunca salvar `14` ou `55` no JSON novamente

## Arquivos a alterar

| Arquivo | Ajuste |
|---|---|
| `supabase/functions/_shared/procedure-runner.ts` | Normalizar `min_confidence` no runtime |
| `src/components/admin/procedures/ProcedureEditor.tsx` | Converter % <-> decimal, ampliar slider e corrigir persistência |
| `supabase/migrations/...sql` | Normalizar dados existentes e ajustar o procedimento atual de cobrança |

## Resultado esperado

Após a correção:

```text
mensagem: "boleto"
keywords encontradas: 1/7
score: 0.14
min_confidence: 0.14
procedimento detectado: sim
```

Então o fluxo correto passa a ser:

```text
"boleto"
-> detectProcedure encontra "Cobrança de fatura"
-> conversa recebe active_procedure_id
-> step 1 do procedimento é iniciado
-> tools do step são disponibilizadas
-> não ocorre transbordo imediato para humano
```

## Observação técnica importante

O bug real é de compatibilidade de escala:

```text
Frontend: porcentagem inteira (55%)
Banco salvo: 55
Backend esperado: 0.55
```

Sem corrigir isso nos 3 pontos (editor, runtime e banco), o problema volta mesmo após uma correção pontual de dados.
