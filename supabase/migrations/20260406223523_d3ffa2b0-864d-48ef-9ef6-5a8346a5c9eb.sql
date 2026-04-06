
-- Desativar v18
UPDATE public.procedures
SET is_current = false
WHERE id = '66e07a88-d453-410b-b0fb-598acc729d2a';

-- Inserir v19
INSERT INTO public.procedures (name, template_id, version, is_current, is_active, description, definition)
VALUES (
  'Cobrança de fatura',
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  19,
  true,
  true,
  'Procedimento de cobrança v19 — chaves explícitas de contexto, auto-seleção de contrato único',
  '{
    "triggers": {
      "keywords": ["boleto","fatura","pagamento","pagar","conta","cobrança","2 via","segunda via","pix","linha digitavel","codigo de barras"],
      "min_confidence": 0.6
    },
    "steps": [
      {
        "name": "Identificação do cliente",
        "instruction": "Peça o CPF ou CNPJ do cliente para localizá-lo no sistema. Use erp_client_lookup para buscar. Se encontrado, confirme o nome (confirmed_client_name no contexto) com o cliente antes de avançar. Exemplo: \"Encontrei o cadastro de [nome]. É você mesmo?\"",
        "available_functions": ["erp_client_lookup"],
        "advance_condition": "user_confirmation",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5
      },
      {
        "name": "Seleção de contrato",
        "instruction": "Use erp_contract_lookup com o confirmed_cpf_cnpj do contexto para listar os contratos do cliente. Se houver APENAS 1 contrato, o sistema já o selecionou automaticamente (selected_contract_id estará preenchido) — informe ao cliente qual contrato será consultado e avance confirmando. Se houver vários contratos, apresente a lista numerada com endereço e plano, e peça ao cliente para escolher. IMPORTANTE: NÃO busque faturas ainda. NÃO mencione valores. Apenas trate dos contratos.",
        "available_functions": ["erp_contract_lookup"],
        "advance_condition": "user_confirmation",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5
      },
      {
        "name": "Consulta de faturas",
        "instruction": "Use erp_invoice_search com o confirmed_cpf_cnpj e o selected_contract_id do contexto para buscar faturas em aberto. Apresente as faturas mostrando APENAS: valor e data de vencimento. NÃO mostre linha digitável, código PIX, ou qualquer dado de pagamento. Após apresentar, pergunte qual modalidade de pagamento o cliente prefere: 1) Linha digitável (código de barras), 2) PIX copia-e-cola, 3) Boleto PDF (segunda via), 4) Envio por SMS. Aguarde a escolha.",
        "available_functions": ["erp_invoice_search"],
        "advance_condition": "user_confirmation",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5
      },
      {
        "name": "Registro da modalidade",
        "instruction": "O cliente escolheu a modalidade de pagamento (selected_payment_method no contexto). Confirme a escolha internamente e avance imediatamente. NÃO execute nenhuma ferramenta neste passo.",
        "available_functions": [],
        "advance_condition": "always",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 1
      },
      {
        "name": "Execução da entrega",
        "instruction": "Execute APENAS a ferramenta correspondente à modalidade escolhida (selected_payment_method no contexto):\n- linha_digitavel → erp_linha_digitavel\n- pix → erp_pix_lookup\n- boleto_pdf → erp_boleto_lookup\n- boleto_sms → erp_boleto_sms\n\nUse o selected_invoice_id do contexto como fatura_id e o confirmed_cpf_cnpj como cpf_cnpj. NUNCA execute uma ferramenta diferente da escolhida. Se falhar, informe o erro e pergunte se deseja tentar outra modalidade.\nApós entregar a informação com sucesso, pergunte ao cliente se precisa de algo mais.",
        "available_functions": ["erp_linha_digitavel","erp_pix_lookup","erp_boleto_lookup","erp_boleto_sms"],
        "advance_condition": "function_success",
        "on_complete": {"action": "end_procedure"},
        "stuck_after_turns": 3
      }
    ]
  }'::jsonb
);
