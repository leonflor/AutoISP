-- Seed: default tool and flows for the first 'atendente' agent
-- Only inserts if no tools/flows exist yet for that agent

DO $$
DECLARE
  _agent_id uuid;
  _tool_id uuid;
  _flow_cobranca_id uuid;
  _flow_suporte_id uuid;
  _flow_venda_id uuid;
BEGIN
  -- Find first 'atendente' agent
  SELECT id INTO _agent_id FROM public.ai_agents WHERE type = 'atendente' AND is_active = true ORDER BY sort_order LIMIT 1;
  IF _agent_id IS NULL THEN
    RAISE NOTICE 'No active atendente agent found, skipping seed';
    RETURN;
  END IF;

  -- Only seed if no tools exist for this agent
  IF EXISTS (SELECT 1 FROM public.ai_agent_tools WHERE agent_id = _agent_id) THEN
    RAISE NOTICE 'Tools already exist for agent %, skipping', _agent_id;
    RETURN;
  END IF;

  -- ── Tool: buscar_contrato_cliente ──
  INSERT INTO public.ai_agent_tools (agent_id, name, description, parameters_schema, handler_type, requires_erp, sort_order)
  VALUES (
    _agent_id,
    'buscar_contrato_cliente',
    'Busca informações de contrato no ERP pelo nome ou CPF/CNPJ do cliente',
    '{"type":"object","properties":{"busca":{"type":"string","description":"Nome ou CPF/CNPJ do cliente"}},"required":["busca"]}',
    'erp_search',
    true,
    1
  )
  RETURNING id INTO _tool_id;

  -- ── Fluxo 1: Cobrança (5 etapas) ──
  INSERT INTO public.ai_agent_flows (agent_id, name, slug, description, trigger_keywords, trigger_prompt, is_fixed, sort_order)
  VALUES (
    _agent_id,
    'Cobrança',
    'cobranca',
    'Fluxo para atendimento de cobranças, faturas e negociação de débitos',
    ARRAY['fatura', 'boleto', 'débito', 'pagamento', 'cobrança', 'pagar', 'vencimento'],
    'Ative quando o usuário mencionar problemas financeiros, faturas ou pagamentos',
    true,
    1
  )
  RETURNING id INTO _flow_cobranca_id;

  INSERT INTO public.ai_agent_flow_steps (flow_id, name, instruction, expected_input, condition_to_advance, tool_id, step_order) VALUES
  (_flow_cobranca_id, 'Identificar cliente', 'Peça o CPF ou nome completo do cliente para identificação.', 'CPF ou nome do cliente', 'Quando o cliente informar o CPF ou nome', NULL, 1),
  (_flow_cobranca_id, 'Buscar contrato', 'Use a ferramenta buscar_contrato_cliente com o dado informado pelo cliente.', NULL, 'Quando os dados do contrato forem retornados com sucesso', _tool_id, 2),
  (_flow_cobranca_id, 'Verificar débitos', 'Analise os dados retornados e informe ao cliente sobre faturas em aberto, valores e datas de vencimento.', NULL, 'Quando as informações financeiras forem apresentadas ao cliente', NULL, 3),
  (_flow_cobranca_id, 'Negociar', 'Apresente opções de pagamento disponíveis. Ofereça parcelamento se aplicável.', 'Escolha do cliente sobre forma de pagamento', 'Quando o cliente escolher uma opção de pagamento', NULL, 4),
  (_flow_cobranca_id, 'Encerrar', 'Confirme o acordo realizado, informe próximos passos e encerre o atendimento cordialmente.', NULL, NULL, NULL, 5);

  -- ── Fluxo 2: Suporte Técnico (4 etapas) ──
  INSERT INTO public.ai_agent_flows (agent_id, name, slug, description, trigger_keywords, trigger_prompt, is_fixed, sort_order)
  VALUES (
    _agent_id,
    'Suporte Técnico',
    'suporte-tecnico',
    'Fluxo para atendimento de problemas técnicos de conexão e serviços',
    ARRAY['internet', 'conexão', 'lento', 'sem sinal', 'caiu', 'não conecta', 'wifi', 'roteador'],
    'Ative quando o usuário reportar problemas técnicos com internet ou conexão',
    false,
    2
  )
  RETURNING id INTO _flow_suporte_id;

  INSERT INTO public.ai_agent_flow_steps (flow_id, name, instruction, expected_input, condition_to_advance, tool_id, step_order) VALUES
  (_flow_suporte_id, 'Identificar cliente', 'Peça o CPF ou nome para localizar o contrato e verificar status da conexão.', 'CPF ou nome do cliente', 'Quando o cliente se identificar', NULL, 1),
  (_flow_suporte_id, 'Diagnosticar', 'Use buscar_contrato_cliente para verificar o status. Pergunte detalhes do problema: desde quando ocorre, se afeta todos os dispositivos, se já reiniciou o roteador.', NULL, 'Quando tiver informações suficientes para diagnóstico inicial', _tool_id, 2),
  (_flow_suporte_id, 'Orientar solução', 'Sugira soluções básicas: reiniciar roteador, verificar cabos, testar outro dispositivo. Se o problema persistir, oriente sobre agendamento de visita técnica.', NULL, 'Quando a orientação for fornecida', NULL, 3),
  (_flow_suporte_id, 'Encerrar', 'Confirme se o problema foi resolvido. Se não, registre para encaminhamento à equipe técnica.', NULL, NULL, NULL, 4);

  -- ── Fluxo 3: Venda/Upgrade (4 etapas) ──
  INSERT INTO public.ai_agent_flows (agent_id, name, slug, description, trigger_keywords, trigger_prompt, is_fixed, sort_order)
  VALUES (
    _agent_id,
    'Venda e Upgrade',
    'venda-upgrade',
    'Fluxo para ofertas de novos planos, upgrades e contratações',
    ARRAY['plano', 'upgrade', 'melhorar', 'mais velocidade', 'contratar', 'mudar plano', 'promoção'],
    'Ative quando o usuário demonstrar interesse em mudar de plano ou contratar serviços',
    false,
    3
  )
  RETURNING id INTO _flow_venda_id;

  INSERT INTO public.ai_agent_flow_steps (flow_id, name, instruction, expected_input, condition_to_advance, tool_id, step_order) VALUES
  (_flow_venda_id, 'Entender necessidade', 'Pergunte o que o cliente procura: mais velocidade, melhor preço, serviços adicionais. Se já é cliente, peça CPF para verificar plano atual.', 'Necessidade do cliente', 'Quando entender o que o cliente busca', NULL, 1),
  (_flow_venda_id, 'Consultar plano atual', 'Se for cliente existente, use buscar_contrato_cliente para ver o plano atual e identificar oportunidades de upgrade.', NULL, 'Quando tiver dados do plano atual ou confirmar que é novo cliente', _tool_id, 2),
  (_flow_venda_id, 'Apresentar opções', 'Apresente os planos disponíveis que atendam à necessidade. Destaque benefícios e diferenciais. Mencione promoções vigentes.', 'Interesse do cliente em algum plano', 'Quando o cliente demonstrar interesse em uma opção', NULL, 3),
  (_flow_venda_id, 'Fechar ou encaminhar', 'Se o cliente aceitar, oriente sobre próximos passos da contratação. Se precisar de mais tempo, ofereça contato posterior.', NULL, NULL, NULL, 4);

  RAISE NOTICE 'Seed completed: 1 tool, 3 flows with steps for agent %', _agent_id;
END $$;
