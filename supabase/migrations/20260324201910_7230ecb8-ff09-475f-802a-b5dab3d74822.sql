
-- Step 1: Mark current version as not current
UPDATE procedures
SET is_current = false
WHERE id = 'efcce877-806f-4559-9b7e-b61a7b034ff5';

-- Step 2: Insert new version (v6) with the contract selection step
INSERT INTO procedures (name, template_id, description, version, is_current, is_active, definition)
VALUES (
  'Cobrança de fatura',
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  'Procedimento para identificação de clientes, listagem de contratos, consulta de faturas em aberto e oferta de segunda via.',
  6,
  true,
  true,
  '{
    "triggers": {
      "keywords": ["boleto", "vencimento", "cobrança", "pagar", "segunda via", "débito", "atraso"],
      "min_confidence": 0.14
    },
    "steps": [
      {
        "name": "Identificar cliente",
        "instruction": "Solicite CPF/CNPJ ou e-mail para identificar o cliente.",
        "available_functions": ["erp_client_lookup"],
        "advance_condition": "function_success",
        "stuck_after_turns": 4,
        "stuck_action": "escalate_human",
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Listar contratos",
        "instruction": "Use a ferramenta erp_contract_lookup com o CPF/CNPJ do cliente já identificado. Apresente os contratos encontrados de forma NUMERADA (1, 2, 3...) mostrando o endereço completo e o plano de cada um. Pergunte ao cliente qual número de contrato deseja consultar. Aguarde a resposta do cliente antes de prosseguir.",
        "available_functions": ["erp_contract_lookup"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 4,
        "stuck_action": "escalate_human",
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Consultar boletos",
        "instruction": "Use a ferramenta erp_invoice_search com o CPF/CNPJ do cliente e o endereço do contrato selecionado pelo cliente no passo anterior. Apresente os boletos em aberto com valor, vencimento e dias de atraso de forma clara. Se não houver boletos em aberto, informe que o cliente está em dia.",
        "available_functions": ["erp_invoice_search"],
        "advance_condition": "always",
        "stuck_after_turns": 5,
        "stuck_action": "escalate_human",
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Oferecer segunda via",
        "instruction": "Ofereça segunda via por e-mail ou link de pagamento.",
        "available_functions": [],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 3,
        "stuck_action": "escalate_human",
        "on_complete": {"action": "next_step"}
      }
    ]
  }'::jsonb
);
