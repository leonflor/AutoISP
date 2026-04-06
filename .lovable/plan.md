
Resposta curta

- O ID do contrato está sendo salvo corretamente em `conversations.collected_context.selected_contract_id`.
- O ID do cliente não está sendo salvo de forma dedicada. Hoje ele fica apenas dentro do envelope genérico de `erp_client_lookup`, em `conversations.collected_context.itens[0].id` (junto com `nome`, `cpf_cnpj`, `provider`).

O que houve

- O log já mostra `Resolved contract selection: option=8...`, então a escolha do contrato foi persistida.
- Depois disso, o passo seguinte precisou chamar `erp_invoice_search`, mas esse passo depende de o modelo reencontrar o cliente/CPF dentro de `itens[0]`, que é um armazenamento genérico e frágil.
- Além disso, o resolver de contrato ainda aceita `ctx.contract_options ?? ctx.itens`, misturando contexto de cliente com contexto de contrato.
- Resultado: o runner não perdeu a escolha do contrato; ele ficou sem um “estado nomeado” confiável do cliente para continuar a cobrança.

Plano de correção

1. `procedure-runner.ts`
- Criar tratamento específico para `erp_client_lookup` em `mergeToContext()` e salvar chaves explícitas:
  - `client_options`
  - `selected_client_id`
  - `confirmed_cpf_cnpj`
  - `confirmed_client_name`
  - `confirmed_client_provider`
- Remover o fallback `ctx.itens` de `resolveContractSelectionFromMessage()`; usar só `contract_options`.
- Manter `selected_contract_id`, `selected_contract_address` e `selected_contract_plan` como estão.
- Se `erp_contract_lookup` retornar apenas 1 contrato, auto-preencher `selected_contract_id` para pular a escolha manual.

2. Nova migration do procedimento de cobrança
- Criar uma nova versão do procedimento usando as chaves explícitas do contexto.
- Ajustar o fluxo para ficar determinístico:
  - passo 0: confirmar cliente
  - passo 1: listar contratos e avançar quando houver `selected_contract_id`
  - passo 2: consultar faturas do contrato selecionado
  - passo 3: escolher modalidade
  - passo 4: entregar PIX/linha/PDF/SMS e encerrar
- Nas instruções, trocar referências vagas por nomes reais do contexto:
  - usar `confirmed_cpf_cnpj`
  - usar `selected_contract_id`
  - usar `selected_invoice_id`
  - usar `selected_payment_method`

3. Observabilidade
- Adicionar log objetivo antes da consulta de faturas mostrando se o contexto contém:
  - `confirmed_cpf_cnpj`
  - `selected_client_id`
  - `selected_contract_id`
- Assim fica fácil provar em log se o problema é falta de cliente, de contrato, ou falha de decisão do modelo.

Arquivos envolvidos

- `supabase/functions/_shared/procedure-runner.ts`
- nova migration em `supabase/migrations/`

Resultado esperado

```text
CPF/CNPJ consultado
→ cliente salvo com chaves explícitas

Escolha do contrato "8"
→ selected_contract_id persistido
→ próximo passo usa confirmed_cpf_cnpj + selected_contract_id
→ chama erp_invoice_search
→ mostra a fatura correta e oferece as modalidades
```

Detalhes técnicos

- Hoje o problema principal não é “sumiu o contrato”; é “o cliente está guardado em um envelope genérico”.
- O caminho atual do contrato está correto: `collected_context.selected_contract_id`.
- O caminho atual do cliente é frágil: `collected_context.itens[0].id` / `itens[0].cpf_cnpj`.
- A correção robusta precisa de estado nomeado no `collected_context`, não só ajuste de prompt.
