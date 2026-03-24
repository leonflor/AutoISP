-- Mark current v6 as inactive
UPDATE procedures
SET is_current = false
WHERE id = '7a16bb7b-b5a7-4dea-9a47-11e2d0dc6f2d';

-- Insert v7 with corrected advance conditions and instructions
INSERT INTO procedures (name, template_id, description, version, is_current, is_active, definition)
VALUES (
  'Cobrança de fatura',
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  'Procedimento para identificação de clientes com confirmação de identidade, listagem de contratos para seleção, consulta de faturas em aberto e oferta de segunda via.',
  7,
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
        "instruction": "Solicite o CPF ou CNPJ do cliente. Use a ferramenta erp_client_lookup para localizar o cadastro. Após localizar com sucesso, pergunte ao cliente: \"Estou falando com [nome do cliente encontrado]?\". Aguarde a confirmação positiva antes de prosseguir. NÃO avance para o próximo passo até receber confirmação. NÃO transfira para atendimento humano neste passo.",
        "available_functions": ["erp_client_lookup"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 5,
        "stuck_action": "escalate_human",
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Listar contratos",
        "instruction": "Use a ferramenta erp_contract_lookup com o CPF/CNPJ do cliente já identificado para buscar todos os contratos. Apresente os contratos encontrados de forma NUMERADA (1, 2, 3...) mostrando o endereço completo e o plano de cada um. Pergunte ao cliente qual número deseja consultar. Quando o cliente informar um número, confirme a seleção dizendo o endereço e o plano do contrato escolhido. NÃO transfira para atendimento humano neste passo. NÃO use a ferramenta transfer_to_human aqui.",
        "available_functions": ["erp_contract_lookup"],
        "advance_condition": "llm_judge",
        "stuck_after_turns": 5,
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