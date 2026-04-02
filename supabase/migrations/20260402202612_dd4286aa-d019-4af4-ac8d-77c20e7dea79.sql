-- Deactivate current version
UPDATE public.procedures SET is_current = false WHERE name = 'Cobrança de fatura' AND is_current = true;

-- Insert v16 with full procedure definition
INSERT INTO public.procedures (name, description, template_id, version, is_current, is_active, definition)
SELECT
  'Cobrança de fatura',
  'Fluxo controlado de cobrança com contexto nomeado, 5 passos e travas determinísticas',
  p.template_id,
  16,
  true,
  true,
  '{
    "triggers": {
      "keywords": ["boleto", "fatura", "cobrança", "pagamento", "pagar", "débito", "atraso", "vencimento", "parcela", "pix", "segunda via"],
      "min_confidence": 0.14
    },
    "steps": [
      {
        "instruction": "Peça o CPF ou CNPJ do cliente de forma educada. Quando receber, execute erp_client_lookup para identificar o cliente. Após obter o resultado, confirme o nome do cliente com o usuário antes de avançar. NÃO avance sem confirmação explícita do cliente.",
        "available_functions": ["erp_client_lookup"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 5
      },
      {
        "instruction": "Execute erp_contract_lookup usando o CPF/CNPJ do cliente (disponível em collected_context). Apresente a lista de contratos encontrados com número sequencial, endereço e plano. Peça ao cliente para informar o NÚMERO da opção desejada. NÃO avance sem a escolha explícita. NÃO consulte faturas ainda. Se houver apenas 1 contrato, confirme com o cliente antes de prosseguir.",
        "available_functions": ["erp_contract_lookup"],
        "advance_condition": "data_collected",
        "required_fields": ["selected_contract_id"],
        "stuck_after_turns": 5,
        "on_complete": { "action": "next_step" }
      },
      {
        "instruction": "Execute erp_invoice_search usando o CPF/CNPJ do cliente e o contrato_id selecionado (campo selected_contract_id no contexto). Apresente as faturas em aberto mostrando APENAS: valor e vencimento. NÃO ofereça formas de pagamento, linha digitável, PIX ou boleto neste passo. Se houver múltiplas faturas, peça ao cliente para escolher qual deseja pagar informando o número. Se houver apenas 1 fatura, avance automaticamente. Se não houver faturas em aberto, informe que está tudo em dia.",
        "available_functions": ["erp_invoice_search"],
        "advance_condition": "data_collected",
        "required_fields": ["selected_invoice_id"],
        "stuck_after_turns": 5,
        "on_complete": { "action": "next_step" }
      },
      {
        "instruction": "Apresente as opções de pagamento para o cliente. Liste EXATAMENTE estas 4 opções numeradas:\n1. Linha digitável (código de barras)\n2. PIX copia-e-cola\n3. Boleto PDF (segunda via para download)\n4. Envio do boleto por SMS\n\nAguarde o cliente escolher UMA opção. NÃO execute nenhuma ferramenta neste passo. NÃO ofereça a linha digitável diretamente. Apenas liste as opções e espere a resposta.",
        "available_functions": [],
        "advance_condition": "data_collected",
        "required_fields": ["selected_payment_method"],
        "stuck_after_turns": 5,
        "on_complete": { "action": "next_step" }
      },
      {
        "instruction": "Execute APENAS a ferramenta correspondente à modalidade escolhida pelo cliente (campo selected_payment_method no contexto):\n- linha_digitavel → execute erp_linha_digitavel\n- pix → execute erp_pix_lookup\n- boleto_pdf → execute erp_boleto_lookup\n- boleto_sms → execute erp_boleto_sms\n\nUse o selected_invoice_id do contexto como fatura_id. NUNCA execute uma ferramenta diferente da escolhida. Se a ferramenta falhar, informe o erro de forma amigável e pergunte se deseja tentar outra modalidade. NÃO tente outra modalidade automaticamente.",
        "available_functions": ["erp_pix_lookup", "erp_boleto_lookup", "erp_boleto_sms", "erp_linha_digitavel"],
        "advance_condition": "function_success",
        "stuck_after_turns": 3,
        "on_complete": { "action": "end_procedure" }
      }
    ]
  }'::jsonb
FROM public.procedures p
WHERE p.name = 'Cobrança de fatura'
LIMIT 1;