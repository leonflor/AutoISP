
-- Seed: Atendente Geral template
INSERT INTO public.agent_templates (id, name, type, system_prompt_base, temperature, tone, default_name, max_intent_attempts, intent_failure_message, intent_failure_action)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  'Atendente Geral',
  'atendente_geral',
  'Você é um atendente de suporte de um provedor de internet (ISP). Seu nome é {agent_name}. Seja cordial, objetivo e profissional. Você pode resolver: consulta de boletos, status de conexão e dados cadastrais. Para negociações ou problemas técnicos avançados, transfira para o especialista adequado. Nunca invente informações — use apenas dados retornados pelas ferramentas.',
  0.4,
  'professional',
  'Sofia',
  3,
  'Não consegui entender sua solicitação. Vou transferir você para um de nossos atendentes.',
  'human'
)
ON CONFLICT DO NOTHING;

-- Seed: Procedimento "Cobrança de boleto" vinculado ao template acima
INSERT INTO public.procedures (id, name, description, template_id, version, is_current, is_active, definition)
VALUES (
  'b1b2c3d4-e5f6-7890-abcd-000000000002',
  'Cobrança de boleto',
  'Procedimento para identificação de clientes, consulta de boletos em aberto e oferta de segunda via.',
  'a1b2c3d4-e5f6-7890-abcd-000000000001',
  1,
  true,
  true,
  '{
    "triggers": {
      "keywords": ["boleto", "vencimento", "cobrança", "pagar", "segunda via", "débito", "atraso"],
      "min_confidence": 0.70
    },
    "steps": [
      {
        "index": 0,
        "name": "Identificar cliente",
        "instruction": "Solicite CPF ou e-mail para identificar o cliente.",
        "available_functions": ["get_customer_by_document", "get_customer_by_email"],
        "advance_condition": { "type": "function_success" },
        "stuck_after_turns": 4,
        "stuck_action": "escalate_human"
      },
      {
        "index": 1,
        "name": "Consultar boletos",
        "instruction": "Consulte boletos em aberto e apresente valor, vencimento e status de forma clara.",
        "available_functions": ["get_open_invoices"],
        "advance_condition": { "type": "always" },
        "on_complete": {
          "type": "conditional",
          "rules": [
            { "condition": "no_invoices", "action": "end_procedure", "status": "resolved" },
            { "condition": "overdue_count_gte_3", "action": "handover_agent", "target": "financeiro" },
            { "condition": "default", "action": "next_step" }
          ]
        }
      },
      {
        "index": 2,
        "name": "Oferecer segunda via",
        "instruction": "Ofereça segunda via por e-mail ou link de pagamento.",
        "available_functions": ["generate_payment_link", "send_invoice_by_email"],
        "advance_condition": { "type": "user_confirmation" },
        "stuck_after_turns": 3,
        "stuck_action": "escalate_human"
      }
    ]
  }'::jsonb
)
ON CONFLICT DO NOTHING;
