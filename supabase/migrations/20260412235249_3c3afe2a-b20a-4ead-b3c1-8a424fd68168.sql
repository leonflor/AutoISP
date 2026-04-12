
-- 1. Atualizar constraint para incluir suporte_n1
ALTER TABLE public.agent_templates DROP CONSTRAINT agent_templates_type_check;
ALTER TABLE public.agent_templates ADD CONSTRAINT agent_templates_type_check
  CHECK (type = ANY (ARRAY['atendente_geral','suporte_n1','suporte_n2','financeiro','comercial']));

-- 2. Inserir o agent_template "Suporte Nível 1"
INSERT INTO public.agent_templates (
  name, type, default_name, tone, temperature,
  max_intent_attempts, intent_failure_action, intent_failure_message,
  system_prompt_base, version, is_active
) VALUES (
  'suporte_n1',
  'suporte_n1',
  'Suporte N1',
  'professional',
  0.3,
  3,
  'human',
  'Não foi possível resolver seu problema técnico automaticamente. Vou transferir você para um atendente especializado.',
  E'Você é {agent_name}, técnico de suporte de primeiro nível do provedor de internet {tenant_name}. Sua função é realizar diagnósticos técnicos e orientar o cliente na verificação de equipamentos.\n\nCOMPORTAMENTO:\n- Seja objetivo e técnico, mas acessível ao cliente leigo.\n- Sempre explique o que está fazendo: \"Vou verificar o status da sua conexão...\"\n- Ao dar instruções ao cliente (reiniciar roteador, verificar cabos), seja passo-a-passo, com linguagem simples.\n- Se o diagnóstico indicar problema grave (sinal crítico, equipamento danificado), encaminhe para atendimento humano.\n- Você não resolve questões financeiras. Se o contrato está bloqueado financeiramente, informe e transfira de volta para o agente de atendimento geral.\n\nINSTRUÇÕES PARA ORIENTAÇÃO DE EQUIPAMENTO:\n- Reiniciar roteador/ONU: \"1. Desligue o equipamento da tomada. 2. Aguarde 30 segundos. 3. Ligue novamente. 4. Aguarde 2 minutos para estabilizar.\"\n- Verificar cabos: \"Verifique se o cabo de fibra óptica está bem conectado na ONU (luz vermelha = cabo desconectado).\"\n- Verificar luzes: \"A luz PON/GPON deve estar fixa (verde). Se estiver piscando ou apagada, há problema na fibra.\"\n- Verificar roteador Wi-Fi: \"As luzes de POWER e WAN devem estar acesas. Se WAN estiver apagada, verifique o cabo entre o roteador e a ONU.\"',
  1,
  true
);

-- 3. Inserir o procedimento "Diagnóstico Técnico N1"
INSERT INTO public.procedures (
  name, description, template_id, version, is_current, is_active, definition
) VALUES (
  'Diagnóstico Técnico N1',
  'Procedimento de diagnóstico técnico de primeiro nível: verifica conexão, sinal óptico e orienta o cliente na verificação de equipamentos.',
  (SELECT id FROM public.agent_templates WHERE name = 'suporte_n1' AND is_active = true LIMIT 1),
  1,
  true,
  true,
  '{
    "triggers": {
      "keywords": ["diagnostico", "verificar sinal", "verificar conexao", "checar equipamento", "testar conexao", "problema tecnico"],
      "min_confidence": 0.6
    },
    "steps": [
      {
        "name": "Validação de contexto",
        "instruction": "Verifique se já existe selected_contract_id no contexto da conversa. Se sim, confirme com o cliente: \"Vou realizar o diagnóstico no contrato [número]. Está correto?\". Se não houver contrato no contexto, peça o CPF do cliente e use erp_client_lookup para identificá-lo, depois erp_contract_lookup para listar os contratos.",
        "available_functions": ["erp_client_lookup", "erp_contract_lookup"],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 5,
        "stuck_action": "human"
      },
      {
        "name": "Diagnóstico de conexão e sinal",
        "instruction": "Execute erp_connection_status para verificar se o cliente está online ou offline. Em seguida, execute erp_signal_diagnosis para analisar o sinal óptico. Apresente os resultados de forma clara: \"Sua conexão está [online/offline]. O sinal da fibra está [normal/fraco/crítico].\" Salve a severidade do diagnóstico no contexto.",
        "available_functions": ["erp_connection_status", "erp_signal_diagnosis"],
        "advance_condition": "always"
      },
      {
        "name": "Orientação guiada",
        "instruction": "Com base no diagnóstico do passo anterior, oriente o cliente:\n\n- Severity 0 (Normal) ou 1 (Atenção): \"Seus indicadores estão dentro do esperado. Vamos reiniciar o equipamento para normalizar.\" Dê instruções passo-a-passo para reiniciar roteador/ONU. Pergunte se resolveu após 2 minutos.\n\n- Severity 2 (Degradado): \"Detectamos degradação no sinal. Vamos tentar reiniciar o equipamento e verificar os cabos.\" Oriente reinício + verificação de cabos e luzes. Se não resolver, informe que pode ser necessária visita técnica.\n\n- Severity 3 (Crítico): \"Identificamos um problema grave no sinal da sua fibra óptica. Isso geralmente requer intervenção técnica presencial.\" Recomende transferir para atendente humano para agendamento.",
        "available_functions": [],
        "advance_condition": "user_confirmation",
        "stuck_after_turns": 8,
        "stuck_action": "human"
      },
      {
        "name": "Resolução ou Escalonamento",
        "instruction": "Pergunte ao cliente se o problema foi resolvido.\n\nSe resolvido: \"Fico feliz que tenha sido resolvido! Se precisar de mais alguma coisa, é só chamar.\" Encerre o procedimento.\n\nSe não resolvido: \"Vou transferir você para nossa equipe técnica avançada para uma análise mais detalhada.\" Use transfer_to_human para escalonar o atendimento.",
        "available_functions": ["transfer_to_human"],
        "advance_condition": "user_confirmation",
        "on_complete": {
          "action": "end_procedure",
          "resolution": "diagnostic_completed"
        }
      }
    ]
  }'::jsonb
);
