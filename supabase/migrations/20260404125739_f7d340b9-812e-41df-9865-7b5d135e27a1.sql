-- Desativar v17
UPDATE procedures SET is_current = false WHERE id = '496a35c7-6aa5-42a7-a555-62bf3ac44a32';

-- Inserir v18 com stuck_after_turns=5 nos passos 0-2
INSERT INTO procedures (name, template_id, version, is_current, is_active, description, definition)
VALUES (
  'Cobrança de fatura',
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  18,
  true,
  true,
  'V18: stuck_after_turns aumentado para 5 nos passos iniciais para evitar handover prematuro.',
  '{
    "triggers": {
      "keywords": ["boleto","fatura","pagamento","pagar","conta","cobrança","2 via","segunda via","pix","linha digitavel","codigo de barras"],
      "min_confidence": 0.6
    },
    "steps": [
      {
        "name": "Identificação do cliente",
        "instruction": "Peça o CPF ou CNPJ do cliente para localizá-lo no sistema. Use erp_client_lookup para buscar. Se encontrado, confirme o nome com o cliente antes de avançar.",
        "available_functions": ["erp_client_lookup"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 5,
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Seleção de contrato",
        "instruction": "Use erp_contract_lookup com o CPF/CNPJ confirmado para listar os contratos do cliente. Apresente os contratos encontrados com endereço e plano. Peça ao cliente para escolher qual contrato deseja consultar. IMPORTANTE: NÃO busque faturas ainda. NÃO mencione valores de faturas. Apenas liste os contratos e aguarde a escolha.",
        "available_functions": ["erp_contract_lookup"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 5,
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Consulta de faturas",
        "instruction": "Use erp_invoice_search com o CPF/CNPJ e o contrato_id selecionado para buscar faturas em aberto. Apresente as faturas encontradas mostrando APENAS: valor e data de vencimento. NÃO mostre linha digitável, código PIX, ou qualquer dado de pagamento neste momento. Após apresentar as faturas, pergunte qual modalidade de pagamento o cliente prefere: 1) Linha digitável (código de barras), 2) PIX copia-e-cola, 3) Boleto PDF (segunda via), 4) Envio por SMS. Aguarde a escolha do cliente.",
        "available_functions": ["erp_invoice_search"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 5,
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Registro da modalidade",
        "instruction": "O cliente escolheu a modalidade de pagamento. Registre a escolha e avance imediatamente para executar a ferramenta correspondente. NÃO execute nenhuma ferramenta neste passo — apenas confirme a escolha internamente e avance.",
        "available_functions": [],
        "advance_condition": "always",
        "stuck_after_turns": 1,
        "on_complete": {"action": "next_step"}
      },
      {
        "name": "Execução da entrega",
        "instruction": "Execute APENAS a ferramenta correspondente à modalidade escolhida pelo cliente (campo selected_payment_method no contexto):\n- linha_digitavel → execute erp_linha_digitavel\n- pix → execute erp_pix_lookup\n- boleto_pdf → execute erp_boleto_lookup\n- boleto_sms → execute erp_boleto_sms\n\nUse o selected_invoice_id do contexto como fatura_id. NUNCA execute uma ferramenta diferente da escolhida. Se a ferramenta falhar, informe o erro de forma amigável e pergunte se deseja tentar outra modalidade. NÃO tente outra modalidade automaticamente.\nApós entregar a informação com sucesso, pergunte ao cliente se precisa de algo mais.",
        "available_functions": ["erp_linha_digitavel","erp_pix_lookup","erp_boleto_lookup","erp_boleto_sms"],
        "advance_condition": "function_success",
        "stuck_after_turns": 3,
        "on_complete": {"action": "end_procedure"}
      }
    ]
  }'::jsonb
);