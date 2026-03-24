

# Ajustar procedimento "Cobranca de fatura" para exibir contratos antes de faturas

## Situacao atual

O procedimento tem 3 passos:
1. **Identificar cliente** — pede CPF, chama `erp_client_lookup`
2. **Consultar boletos** — chama `erp_invoice_search` direto (sem saber qual contrato)
3. **Oferecer segunda via**

Problema: pula direto para faturas sem perguntar qual contrato o cliente quer consultar. Se o cliente tem multiplos contratos, o resultado fica confuso.

## Plano

Inserir um novo passo 2 entre "Identificar cliente" e "Consultar boletos", resultando em 4 passos:

| Passo | Nome | Ferramenta | Instrucao resumida |
|---|---|---|---|
| 1 | Identificar cliente | `erp_client_lookup` | Pedir CPF, localizar cliente |
| **2 (novo)** | **Listar contratos** | **`erp_contract_lookup`** | **Consultar contratos do cliente, apresentar de forma numerada (1, 2, 3...) com endereco e plano. Pedir que o cliente escolha o numero.** |
| 3 | Consultar boletos | `erp_invoice_search` | Usar o endereco do contrato selecionado como filtro para buscar faturas em aberto |
| 4 | Oferecer segunda via | *(nenhuma)* | Oferecer envio de segunda via |

### Implementacao

**Migration SQL** para atualizar o JSONB `definition` do procedimento `efcce877-806f-4559-9b7e-b61a7b034ff5`:

- Inserir novo step no indice 1 do array `steps`:
  - `name`: "Listar contratos"
  - `instruction`: "Use a ferramenta erp_contract_lookup com o CPF/CNPJ do cliente ja identificado. Apresente os contratos encontrados de forma NUMERADA (1, 2, 3...) mostrando o endereco completo e o plano de cada um. Pergunte ao cliente qual contrato deseja consultar."
  - `available_functions`: `["erp_contract_lookup"]`
  - `advance_condition`: "user_confirmation"
  - `stuck_after_turns`: 4
  - `on_complete`: `{"action": "next_step"}`

- Ajustar instrucao do passo "Consultar boletos" (agora indice 2) para:
  - "Use a ferramenta erp_invoice_search com o CPF/CNPJ do cliente e o endereco do contrato selecionado pelo cliente no passo anterior. Apresente os boletos em aberto com valor, vencimento e dias de atraso. Se nao houver boletos em aberto, informe que o cliente esta em dia."

### Arquivo alterado

| Arquivo | Alteracao |
|---|---|
| Nova migration SQL | Atualizar `definition` do procedimento de cobranca |

Nenhuma alteracao de codigo frontend ou backend necessaria — a logica de steps e ferramentas ja suporta este fluxo.

