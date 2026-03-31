-- Desativar versão atual (v12)
UPDATE public.procedures
SET is_current = false
WHERE id = '9849a9f4-63d3-4d9e-b75f-8270ecac4b11';

-- Inserir v13 com passo de opções de pagamento
INSERT INTO public.procedures (name, template_id, version, is_current, is_active, description, definition)
VALUES (
  'Cobrança de fatura',
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  13,
  true,
  true,
  'Fluxo de cobrança com identificação, seleção de contrato, consulta de faturas e oferta de forma de pagamento (linha digitável, PIX ou boleto PDF).',
  '{
    "triggers": {
      "keywords": ["atraso", "boleto", "cobrança", "débito", "pagamento", "pagar", "parcela", "pix", "segunda via", "vencimento"],
      "min_confidence": 0.14
    },
    "steps": [
      {
        "name": "Identificar cliente",
        "instruction": "Seu objetivo neste passo é identificar o cliente E confirmar sua identidade. Siga esta sequência obrigatória:\n1. Solicite o CPF ou CNPJ do cliente de forma natural e amigável.\n2. Quando o cliente informar o documento, use a ferramenta erp_client_lookup para localizar o cadastro.\n3. Após localizar com sucesso, pergunte: \"Estou falando com [nome do cliente encontrado]?\"\n4. Aguarde a confirmação positiva do cliente.\n5. Após a confirmação positiva passe para o próximo passo.\n\nO objetivo deste passo SÓ é cumprido quando AMBAS as condições forem atendidas: (a) erp_client_lookup foi executado com sucesso e (b) o cliente confirmou positivamente sua identidade (respondeu sim, correto, isso, etc.). Se o cliente disser \"sim\" mas o lookup ainda não foi feito, o objetivo NÃO está cumprido — solicite o CPF/CNPJ primeiro.\n\nNÃO transfira para atendimento humano neste passo. NÃO use transfer_to_human.",
        "available_functions": ["erp_client_lookup"],
        "advance_condition": "user_confirmation",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5,
        "stuck_action": "escalate_human"
      },
      {
        "name": "Listar contratos",
        "instruction": "IMEDIATAMENTE ao receber qualquer mensagem neste passo, execute erp_contract_lookup com o CPF/CNPJ já identificado no passo anterior. NÃO espere o cliente pedir. NÃO pergunte o que ele deseja. Sua PRIMEIRA ação DEVE ser chamar a ferramenta erp_contract_lookup.\n\nApós obter os resultados, apresente os contratos encontrados de forma NUMERADA (1, 2, 3...) mostrando o endereço completo e o plano de cada um. Pergunte ao cliente qual número deseja consultar.",
        "available_functions": ["erp_contract_lookup"],
        "advance_condition": "user_confirmation",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5,
        "stuck_action": "escalate_human"
      },
      {
        "name": "Consultar boletos",
        "instruction": "IMEDIATAMENTE ao entrar neste passo, execute erp_invoice_search usando o CPF/CNPJ do cliente (disponível em collected_context) e o contrato_id selecionado (campo selected_contract_id no contexto). NÃO peça informações adicionais ao cliente. NÃO transfira para humano. Sua ÚNICA ação deve ser chamar erp_invoice_search.\n\nApós obter os resultados, apresente os boletos em aberto com valor, vencimento e dias de atraso de forma clara. Se não houver boletos em aberto, informe que o cliente está em dia.\n\nSe houver faturas em aberto, avance automaticamente para o próximo passo para oferecer as opções de pagamento.",
        "available_functions": ["erp_invoice_search"],
        "advance_condition": "function_success",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5,
        "stuck_action": "escalate_human"
      },
      {
        "name": "Oferecer forma de pagamento",
        "instruction": "Após apresentar as faturas em aberto, ofereça as opções de pagamento ao cliente:\n\n1. **Linha digitável** (código de barras) — já disponível nos dados da fatura consultada\n2. **PIX copia-e-cola** — use erp_pix_lookup com o id da fatura\n3. **Boleto PDF** (segunda via) — use erp_boleto_lookup com o id da fatura\n\nPergunte: \"Como deseja receber os dados para pagamento?\"\n- 1. Linha digitável\n- 2. PIX\n- 3. Boleto PDF\n\nQuando o cliente escolher:\n- **Linha digitável**: envie o campo linha_digitavel já retornado pela consulta de faturas no passo anterior.\n- **PIX**: chame erp_pix_lookup com o fatura_id e envie o código qrcode (copia-e-cola). Se o PIX estiver expirado (campo expirado=true), informe ao cliente e ofereça as outras opções.\n- **Boleto PDF**: chame erp_boleto_lookup com o fatura_id e envie o link de download ao cliente.\n\nSe houver múltiplas faturas, pergunte qual fatura deseja pagar antes de oferecer as opções.\n\nApós enviar os dados de pagamento, pergunte se precisa de mais alguma coisa.",
        "available_functions": ["erp_pix_lookup", "erp_boleto_lookup"],
        "advance_condition": "user_confirmation",
        "on_complete": {"action": "next_step"},
        "stuck_after_turns": 5,
        "stuck_action": "escalate_human"
      }
    ]
  }'::jsonb
);