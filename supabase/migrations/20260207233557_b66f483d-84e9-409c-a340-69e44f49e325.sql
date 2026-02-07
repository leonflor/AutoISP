
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
