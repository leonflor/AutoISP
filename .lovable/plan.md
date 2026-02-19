# Renomear "Busca no ERP" para "Busca Clientes no ERP"

## Resumo

Atualizar o nome e a descricao da ferramenta `erp_search` para refletir que a chave de pesquisa e o CPF ou CNPJ e que pode retornar um ou mais clientes.

## Mudancas

### 3 arquivos editados


| Arquivo                                                       | Mudanca                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/functions/_shared/tool-catalog.ts`                  | `display_name`: "Busca Clientes no ERP". `description`: esclarecer que a busca e por CPF ou CNPJ e pode retornar um ou mais clientes. Atualizar descricao do parametro `busca` para "CPF ou CNPJ do cliente". |
| `src/constants/tool-catalog.ts`                               | Mesmas alteracoes do espelho frontend: `display_name`, `description` e descricao do parametro.                                                                                                                |
| `src/components/guia-projeto/features/modules/IAFeatures.tsx` | Atualizar referencia de "erp_search" na documentacao do catalogo de ferramentas para o novo nome.                                                                                                             |


### Detalhes das alteracoes nos catalogos

**Antes:**

- display_name: "Busca no ERP"
- description: "Busca clientes no sistema ERP do provedor por nome, CPF/CNPJ ou ID."
- parametro busca: "Termo de busca: nome, CPF/CNPJ ou ID do cliente"

**Depois:**

- display_name: "Busca Clientes no ERP"
- description: "Busca clientes no sistema ERP do provedor por CPF ou CNPJ. Pode retornar um ou mais clientes com dados de contrato, status de conexao e sinal."
- parametro busca: "CPF ou CNPJ do cliente (min. 11 caracteres)"  
 - o cpf ou cnpj deve ser validado antes de realizar a consulta

O handler (`erp_search`) e a chave no registro nao mudam -- apenas metadados de exibicao.

Apos a alteracao no backend, o edge function `ai-chat` sera redeployado para que a OpenAI receba a descricao atualizada.