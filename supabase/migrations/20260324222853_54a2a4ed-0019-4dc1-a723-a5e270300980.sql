-- Update step 2 (Consultar boletos): change advance_condition to function_success
-- and enrich the instruction to use selected contract from context
UPDATE procedures
SET definition = jsonb_set(
  jsonb_set(
    definition,
    '{steps,2,advance_condition}',
    '"function_success"'
  ),
  '{steps,2,instruction}',
  '"IMEDIATAMENTE ao entrar neste passo, execute erp_invoice_search usando o CPF/CNPJ do cliente (disponível em collected_context) e o endereço do contrato selecionado (campo selected_contract_address no contexto). NÃO peça informações adicionais ao cliente. NÃO transfira para humano. Sua ÚNICA ação deve ser chamar erp_invoice_search.\n\nApós obter os resultados, apresente os boletos em aberto com valor, vencimento e dias de atraso de forma clara. Se não houver boletos em aberto, informe que o cliente está em dia.\n\nSe selected_contract_address não estiver disponível no contexto, pergunte novamente qual contrato o cliente deseja consultar."'
),
  version = version + 1
WHERE name = 'Cobrança de fatura' AND is_current = true;