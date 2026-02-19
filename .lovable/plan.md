

# Nova Ferramenta: Busca Cliente Ativo no ERP

## Objetivo

Criar uma nova tool `erp_active_client_search` que busca clientes por CPF ou CNPJ e retorna **apenas aqueles com contrato ativo**, filtrando automaticamente os demais status (suspenso, cancelado, bloqueado, etc.).

## Diferenca da tool existente (`erp_search`)

| Aspecto | `erp_search` | `erp_active_client_search` |
|---------|-------------|---------------------------|
| Filtro de status | Nenhum (retorna todos) | Apenas `status_contrato === "ativo"` |
| Caso de uso | Busca geral | Validar se cliente esta ativo |
| Resposta quando inativo | Mostra o cliente com status | Retorna 0 encontrados + mensagem explicativa |

## Arquivos editados (3)

Seguindo a regra de 3 arquivos obrigatorios:

### 1. `supabase/functions/_shared/tool-catalog.ts`

Adicionar entrada `erp_active_client_search` ao `TOOL_CATALOG`:

```
erp_active_client_search: {
  handler: "erp_active_client_search",
  display_name: "Busca Cliente Ativo",
  description: "Busca clientes com contrato ativo no ERP por CPF ou CNPJ. Retorna apenas clientes cujo status de contrato seja 'ativo'.",
  parameters_schema: {
    type: "object",
    properties: {
      busca: {
        type: "string",
        description: "CPF ou CNPJ do cliente",
        minLength: 11
      }
    },
    required: ["busca"],
    additionalProperties: false
  },
  response_description: "Cliente ativo com nome, CPF, plano, conexao e provedor ERP. Retorna vazio se nenhum cliente ativo for encontrado.",
  requires_erp: true
}
```

### 2. `supabase/functions/_shared/tool-handlers.ts`

Adicionar handler `erpActiveClientSearchHandler`:

- Reutiliza `searchClients` existente (mesma busca multi-ERP)
- Aplica filtro adicional: `.filter(c => c.status_contrato === "ativo")`
- Se encontrar clientes pela busca mas nenhum ativo, retorna mensagem: "Cliente encontrado, porem sem contrato ativo."
- Se nao encontrar nenhum cliente, retorna: "Nenhum cliente encontrado com esse dado."
- Registrar no objeto `handlers`

### 3. `src/constants/tool-catalog.ts`

Adicionar espelho frontend ao array `TOOL_CATALOG`:

```
{
  handler: "erp_active_client_search",
  display_name: "Busca Cliente Ativo",
  description: "Busca clientes com contrato ativo no ERP por CPF ou CNPJ. Retorna apenas clientes cujo status seja 'ativo'.",
  parameters: [
    { name: "busca", type: "string", description: "CPF ou CNPJ do cliente (min. 11 caracteres)", required: true }
  ],
  response_description: "Cliente ativo com nome, CPF, plano, conexao e provedor ERP.",
  requires_erp: true
}
```

## Logica do handler (detalhe tecnico)

```text
1. Receber args.busca (CPF/CNPJ)
2. Validar minimo 2 caracteres
3. Chamar searchClients() -- busca em todos os ERPs ativos
4. Separar resultados:
   - allFound = resultado total da busca
   - activeOnly = allFound.filter(c => c.status_contrato === "ativo")
5. Retornar:
   - Se activeOnly > 0: lista dos clientes ativos
   - Se allFound > 0 mas activeOnly === 0: mensagem informando que o cliente existe mas nao esta ativo
   - Se allFound === 0: mensagem de nenhum cliente encontrado
```

Nenhuma funcao nova no `erp-driver.ts` -- reutiliza `searchClients` existente e aplica filtro no handler.

