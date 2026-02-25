

# Atualizar instrução da etapa "Listar contratos"

## Problema

A instrução atual ("exiba uma lista numerada de contratos com duplo espaçamento entre itens") é vaga e não impede o agente de exibir detalhes internos como plano, status ou vencimento prematuramente.

## Alteração

Atualizar o campo `instruction` do registro `886d4ad6-a396-4a42-b7b5-e47385aba30c` na tabela `ai_agent_flow_steps` para:

> "Exiba apenas os endereços de instalação em lista numerada com duplo espaçamento entre itens. Não exiba plano, status ou vencimento nesta etapa. Pergunte qual contrato o cliente deseja tratar."

## Detalhes técnicos

- Tabela: `ai_agent_flow_steps`
- ID: `886d4ad6-a396-4a42-b7b5-e47385aba30c`
- Campo: `instruction`
- Nenhum arquivo de código precisa ser alterado — apenas dado no banco.

