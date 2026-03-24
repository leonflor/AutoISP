
## Falha identificada

A falha não foi no ERP nem na ferramenta `Consulta de Faturas`. A falha aconteceu na transição entre os steps do procedimento.

Pelo histórico e pelos logs:

```text
"8" → step de contratos
→ o modelo selecionou o contrato corretamente
→ NÃO chamou erp_invoice_search
→ chamou transfer_to_human
→ conversa foi para modo human
```

## Evidências

### 1) O procedimento ativo estava correto
A conversa permaneceu no procedimento **Cobrança de fatura** e terminou em `step_index = 3`, com `mode = human`.

### 2) O contrato foi entendido, mas não persistido
No `collected_context` final ficou salvo apenas o retorno bruto de `erp_contract_lookup` e depois o motivo da transferência:

```text
reason: "Consulta de boletos para o contrato 833, Avenida do Jaqueiras..."
```

Ou seja: o modelo entendeu que o usuário escolheu o contrato 8, mas esse dado **não foi estruturado/salvo** como algo como:

```text
selected_contract_number
selected_contract_id
selected_contract_address
selected_contract_plan
```

Sem isso, o passo “Consultar boletos” ficou dependendo do LLM inferir sozinho o contrato escolhido a partir do histórico.

### 3) O step “Consultar boletos” está frouxo demais
Hoje ele está assim no banco:

```text
name: "Consultar boletos"
available_functions: ["erp_invoice_search"]
advance_condition: "always"
```

Problemas:
- ele não exige sucesso de `erp_invoice_search`
- ele não exige que exista contrato selecionado no contexto
- ele não proíbe `transfer_to_human`

### 4) `transfer_to_human` está sempre disponível
No código, `buildStepTools()` injeta `transfer_to_human` em todos os passos, inclusive quando a instrução diz “não transfira”.

Então no step de consulta de boletos o modelo recebeu, na prática:
- `erp_invoice_search`
- `transfer_to_human`

Como o contrato escolhido não estava estruturado no contexto, ele optou por transferir.

## Causa raiz

A causa raiz é uma combinação de 3 problemas:

1. **A seleção do contrato pelo usuário (“8”) não é convertida em contexto estruturado**
2. **O step “Consultar boletos” não força a execução da ferramenta**
3. **`transfer_to_human` continua disponível mesmo em steps onde deveria estar bloqueada**

## O que corrigir

### 1) Persistir a seleção do contrato no momento em que o usuário escolhe o número
Ao receber “8” no step de contratos, o motor deve:
- ler os contratos já existentes em `collected_context.itens`
- localizar o item com `opcao = 8`
- salvar campos estruturados, por exemplo:
  - `selected_contract_option`
  - `selected_contract_id`
  - `selected_contract_address`
  - `selected_contract_plan`

Assim o próximo step não depende da memória do LLM.

### 2) Fazer o step “Consultar boletos” depender de execução bem-sucedida
Trocar `advance_condition: "always"` por algo como:
- `function_success`

Assim ele só avança depois de realmente executar `erp_invoice_search`.

### 3) Remover `transfer_to_human` de steps críticos do fluxo
Hoje a ferramenta é universal. Isso enfraquece o procedimento.

Ajuste recomendado:
- permitir `transfer_to_human` só quando:
  - não há procedimento ativo, ou
  - o step explicitamente autoriza escalonamento

No fluxo de cobrança, especialmente em:
- Identificar cliente
- Listar contratos
- Consultar boletos

o ideal é bloquear transferência automática.

### 4) Enriquecer a instrução do step de consulta
O texto do step deve dizer explicitamente:
- se já houver `selected_contract_address` no contexto, usar esse valor
- se não houver, pedir nova escolha ao usuário
- não transferir por falta de interpretação

## Implementação proposta

### Arquivos a ajustar
- `supabase/functions/_shared/procedure-runner.ts`
- possivelmente `supabase/functions/_shared/context-builder.ts`
- nova migration SQL para atualizar a definição do procedimento

### Mudanças no código
1. Adicionar lógica no runner para interpretar seleção numérica no step de contratos
2. Salvar contrato selecionado em `collected_context`
3. No step seguinte, montar argumentos de `erp_invoice_search` com:
   - `cpf_cnpj`
   - `endereco` do contrato selecionado
4. Tornar `transfer_to_human` opcional por step, em vez de universal

### Mudanças na procedure
Atualizar o JSONB de “Cobrança de fatura” para:
- step 2 com `advance_condition = "function_success"`
- instrução explícita para usar o contrato salvo no contexto
- regra para pedir nova escolha se não houver contrato selecionado

## Resultado esperado após a correção

Fluxo esperado:

```text
Usuário: 8
→ sistema resolve contrato 8 no contexto
→ salva endereço/plano/contrato_id selecionado
→ step "Consultar boletos" chama erp_invoice_search
→ retorna boletos em aberto ou "cliente está em dia"
→ só depois segue para oferecer segunda via
```

## Resumo objetivo

A falha foi: **o número do contrato escolhido não virou contexto estruturado**, então o step de consulta de faturas ficou sem insumo confiável; como `transfer_to_human` ainda estava disponível e o step não exigia `function_success`, o modelo transferiu em vez de consultar.

## Plano curto de correção
1. Persistir contrato selecionado ao receber o número
2. Fazer consulta de faturas usar esse contexto salvo
3. Trocar `advance_condition` de “Consultar boletos” para `function_success`
4. Bloquear `transfer_to_human` nos steps do fluxo de cobrança
5. Validar no simulador o fluxo completo: `boleto → CPF/CNPJ → sim → 8 → retorno das faturas`

## Detalhes técnicos
- O `collected_context` atual está sendo sobrescrito com envelopes brutos de ferramenta (`encontrados`, `itens`, `erros`), mas não com estado de decisão do fluxo.
- `mergeToContext()` faz merge raso; isso também favorece contexto pouco semântico.
- `buildStepTools()` injeta `transfer_to_human` em todos os passos, contrariando as instruções do próprio procedimento.
- O histórico confirma que, após “8”, houve apenas tool call de `transfer_to_human`; nenhuma chamada de `erp_invoice_search` ocorreu.
