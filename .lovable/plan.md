

# Adicionar Tool `consultar_faturas` e Vincular ao Fluxo de Cobranca

## O que existe hoje

- **Tool**: `buscar_contrato_cliente` (handler: `erp_search`) vinculada ao agente "Atendente Virtual"
- **Fluxo Cobranca**: 5 etapas, mas somente a etapa 2 usa uma tool. A etapa 3 ("Verificar debitos") nao tem tool vinculada.

## O que sera feito

### 1. Nova tool: `consultar_faturas`

Inserir no banco a tool vinculada ao agente "Atendente Virtual":

| Campo | Valor |
|---|---|
| name | `consultar_faturas` |
| description | Lista faturas abertas de um cliente pelo CPF/CNPJ ou ID do contrato |
| handler_type | `erp_invoice_search` |
| requires_erp | true |
| parameters_schema | `{ type: "object", properties: { cliente_id: { type: "string", description: "CPF, CNPJ ou ID do cliente" } }, required: ["cliente_id"] }` |

### 2. Novo handler: `erp_invoice_search`

Adicionar ao `_shared/tool-handlers.ts` um handler que simula a consulta de faturas. Como os ERPs reais tem APIs diferentes para faturas, o handler inicial retornara dados simulados (mock) para validacao do fluxo, com a estrutura pronta para integracao futura.

O handler retornara:

```text
{
  success: true,
  data: {
    cliente: "Nome do cliente",
    faturas: [
      { numero: "FAT-001", valor: 120.00, vencimento: "2026-01-15", status: "vencida" },
      { numero: "FAT-002", valor: 120.00, vencimento: "2026-02-15", status: "aberta" }
    ],
    total_aberto: 240.00
  }
}
```

### 3. Vincular tool a etapa 3 do fluxo Cobranca

Atualizar a etapa "Verificar debitos" (step_order = 3) para usar a nova tool `consultar_faturas`, adicionando o `tool_id` correspondente.

### 4. Deploy

Deployar `ai-chat` (que importa `tool-handlers.ts`) para que o novo handler fique disponivel.

---

## Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| Migracao SQL | INSERT da tool `consultar_faturas` + UPDATE da etapa 3 do fluxo Cobranca |
| `_shared/tool-handlers.ts` | Novo handler `erp_invoice_search` (mock) + registro no registry |
| Deploy | `ai-chat` e `fetch-erp-clients` |

---

## Detalhes tecnicos

### Handler `erp_invoice_search`

```text
const erpInvoiceSearchHandler: ToolHandler = async (ctx, args) => {
  const clienteId = String(args.cliente_id || "");
  if (!clienteId) return { success: false, error: "Informe o CPF/CNPJ ou ID do cliente" };

  // Mock -- pronto para integracao futura com ERPs reais
  return {
    success: true,
    data: {
      cliente_id: clienteId,
      faturas: [
        { numero: "FAT-2026-001", valor: 129.90, vencimento: "2026-01-15", status: "vencida", dias_atraso: 23 },
        { numero: "FAT-2026-002", valor: 129.90, vencimento: "2026-02-15", status: "aberta", dias_atraso: 0 }
      ],
      total_aberto: 259.80,
      mensagem: "Dados simulados para teste. Integrar com API do ERP para dados reais."
    }
  };
};
```

### SQL da migracao

```text
-- Inserir tool consultar_faturas
INSERT INTO ai_agent_tools (agent_id, name, description, parameters_schema, handler_type, requires_erp, sort_order)
VALUES (
  '599bcd52-350c-47e7-8f96-b919a5e2a8a1',
  'consultar_faturas',
  'Lista faturas abertas de um cliente pelo CPF/CNPJ ou ID do contrato',
  '{ "type": "object", "properties": { "cliente_id": { "type": "string", "description": "CPF, CNPJ ou ID do cliente" } }, "required": ["cliente_id"] }',
  'erp_invoice_search',
  true,
  2
);

-- Vincular a tool a etapa 3 do fluxo Cobranca
UPDATE ai_agent_flow_steps
SET tool_id = (SELECT id FROM ai_agent_tools WHERE name = 'consultar_faturas' AND agent_id = '599bcd52-350c-47e7-8f96-b919a5e2a8a1')
WHERE id = '6c047fd3-22d3-42b0-9df7-6472734a6faa';
```
