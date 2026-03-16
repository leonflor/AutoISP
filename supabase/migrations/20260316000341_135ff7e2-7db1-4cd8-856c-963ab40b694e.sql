
-- Seed: Fluxo de Cobrança completo com 6 estados
-- Usa um CTE para capturar o ID do fluxo inserido

WITH new_flow AS (
  INSERT INTO public.ai_agent_flows (
    name, slug, description, trigger_keywords, trigger_prompt,
    is_active, is_fixed, sort_order, agent_id
  ) VALUES (
    'Cobrança',
    'cobranca',
    'Fluxo completo de cobrança: identifica cliente, busca faturas em aberto, apresenta débitos, negocia pagamento e gera boleto.',
    ARRAY['cobranca', 'fatura', 'boleto', 'debito', 'pagamento', 'segunda via'],
    'O cliente mencionou assuntos relacionados a cobrança, faturas, boletos ou pagamentos.',
    true,
    true,
    1,
    NULL
  )
  RETURNING id
)
INSERT INTO public.flow_state_definitions (
  flow_id, state_key, objective, allowed_tools, transition_rules,
  fallback_message, max_attempts, step_order, is_active
)
SELECT
  new_flow.id,
  v.state_key,
  v.objective,
  v.allowed_tools::text[],
  v.transition_rules::jsonb,
  v.fallback_message,
  5,
  v.step_order,
  true
FROM new_flow,
(VALUES
  (1, 'identificar_cliente',
   'Solicite o CPF ou CNPJ do cliente para identificação. Valide que o documento informado possui 11 dígitos (CPF) ou 14 dígitos (CNPJ). Não prossiga sem um documento válido.',
   '{}',
   '[{"event":"user_input","pattern":"\\d{11,14}","destination":"buscar_faturas"}]',
   'Não consegui identificar um CPF ou CNPJ válido. Por favor, informe o número do documento com 11 dígitos (CPF) ou 14 dígitos (CNPJ).'),

  (2, 'buscar_faturas',
   'Execute a busca de faturas em aberto no ERP usando o CPF/CNPJ informado pelo cliente no estado anterior. Informe ao cliente que está consultando o sistema.',
   '{erp_invoice_search}',
   '[{"event":"tool_success","tool_name":"erp_invoice_search","destination":"apresentar_debitos"}]',
   'Não foi possível consultar as faturas no momento. Vou tentar novamente.'),

  (3, 'apresentar_debitos',
   'Liste todas as faturas em aberto encontradas, informando: valor, data de vencimento e dias em atraso. Ao final, pergunte se o cliente deseja negociar o pagamento.',
   '{}',
   '[{"event":"user_input","pattern":"sim|negoci|quero|pagar|aceito|ok","destination":"negociar"}]',
   'Não entendi sua resposta. Você gostaria de negociar o pagamento das faturas em aberto? Responda sim ou não.'),

  (4, 'negociar',
   'Apresente as opções de negociação disponíveis: 1) Pagamento à vista com desconto; 2) Parcelamento em até 3x; 3) Nova data de vencimento. Aguarde o cliente escolher uma opção.',
   '{}',
   '[{"event":"option_selected","destination":"gerar_boleto"}]',
   'Por favor, escolha uma das opções de pagamento apresentadas: à vista com desconto, parcelamento ou nova data de vencimento.'),

  (5, 'gerar_boleto',
   'Confirme a opção de pagamento escolhida pelo cliente e informe que o boleto atualizado será gerado e enviado. Pergunte se precisa de mais alguma coisa.',
   '{}',
   '[{"event":"user_input","pattern":".*","destination":"finalizar"}]',
   'Houve um problema ao processar sua solicitação. Vou tentar novamente.'),

  (6, 'finalizar',
   'Agradeça o cliente pelo contato e encerre o atendimento de forma cordial. Informe que o boleto será enviado por e-mail/WhatsApp.',
   '{}',
   '[{"event":"auto","destination":"__complete__"}]',
   'Obrigado pelo contato. Seu atendimento foi encerrado.')
) AS v(step_order, state_key, objective, allowed_tools, transition_rules, fallback_message);
