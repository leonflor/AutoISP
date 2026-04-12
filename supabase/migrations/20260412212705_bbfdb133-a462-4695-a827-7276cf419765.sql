-- ═══════════════════════════════════════════════════════════
-- Procedimento: Suporte Técnico — Sem Internet (v1)
-- ═══════════════════════════════════════════════════════════

-- Get the template_id for the ISP support template (same as billing)
-- We use the first active template as reference
INSERT INTO public.procedures (name, description, template_id, version, is_current, is_active, definition)
SELECT
  'Suporte Técnico — Sem Internet',
  'Fluxo guiado para diagnóstico e resolução de problemas de conexão à internet, com verificação financeira automática.',
  p.template_id,
  1,
  true,
  true,
  jsonb_build_object(
    'triggers', jsonb_build_object(
      'keywords', jsonb_build_array(
        'sem internet', 'sem sinal', 'caiu', 'lento', 'instavel', 'instável',
        'nao conecta', 'não conecta', 'offline', 'desconectado', 'sem conexao',
        'sem conexão', 'internet caiu', 'fibra', 'onu', 'roteador',
        'queda', 'oscilando', 'intermitente', 'travando', 'ping alto',
        'velocidade baixa', 'lentidao', 'lentidão', 'minha internet'
      ),
      'min_confidence', 1
    ),
    'steps', jsonb_build_array(
      -- Passo 0: Identificação do cliente
      jsonb_build_object(
        'instruction', 'Peça o CPF ou CNPJ do cliente para identificá-lo no sistema. Após receber, use a ferramenta erp_client_lookup para confirmar os dados. Apresente o nome encontrado e peça confirmação.',
        'available_functions', jsonb_build_array('erp_client_lookup'),
        'advance_condition', 'user_confirmation',
        'stuck_after_turns', 5,
        'on_complete', jsonb_build_object('action', 'next_step')
      ),
      -- Passo 1: Seleção de contrato
      jsonb_build_object(
        'instruction', 'Use erp_contract_lookup com o CPF/CNPJ confirmado (confirmed_cpf_cnpj do contexto) para listar os contratos ativos. Se houver mais de um contrato, apresente as opções numeradas com endereço e plano, e peça que o cliente escolha o número. Se houver apenas um, confirme automaticamente.',
        'available_functions', jsonb_build_array('erp_contract_lookup'),
        'advance_condition', 'user_confirmation',
        'stuck_after_turns', 5,
        'on_complete', jsonb_build_object('action', 'next_step')
      ),
      -- Passo 2: Verificação financeira
      jsonb_build_object(
        'instruction', 'Verifique se o contrato selecionado possui bloqueio financeiro. Se contract_is_blocked == true no contexto, informe ao cliente: "Identifiquei que este contrato está com bloqueio por pendência financeira. Vou localizar as faturas pendentes para que possamos resolver isso primeiro." Em seguida, use erp_invoice_search com o CPF confirmado e contrato selecionado para buscar faturas.',
        'available_functions', jsonb_build_array('erp_invoice_search'),
        'advance_condition', 'always',
        'stuck_after_turns', 3,
        'on_complete', jsonb_build_object(
          'action', 'conditional',
          'conditions', jsonb_build_array(
            jsonb_build_object(
              'if_context', 'contract_is_blocked == true',
              'then', jsonb_build_object(
                'action', 'chain_procedure',
                'procedure_name', 'Cobrança de fatura',
                'start_at_step', 2
              )
            )
          )
        )
      ),
      -- Passo 3: Diagnóstico técnico
      jsonb_build_object(
        'instruction', 'Realize o diagnóstico técnico do contrato selecionado (selected_contract_id do contexto). Use erp_connection_status para verificar se a conexão está online ou offline. Em seguida, use erp_signal_diagnosis para analisar o sinal óptico. Apresente os resultados ao cliente de forma clara:
- Se online e sinal OK (severity 0-1): oriente reiniciar o roteador/ONU (desligar da tomada, aguardar 30 segundos, religar). Pergunte se resolveu.
- Se offline ou sinal fraco (severity 2): informe que há um problema detectado e recomende reiniciar equipamento. Se não resolver, ofereça transferir para suporte especializado.
- Se sinal crítico (severity 3): informe que há um problema grave detectado na rede óptica e que será necessário suporte técnico presencial ou avançado.',
        'available_functions', jsonb_build_array('erp_connection_status', 'erp_signal_diagnosis'),
        'advance_condition', 'always',
        'stuck_after_turns', 5,
        'on_complete', jsonb_build_object('action', 'next_step')
      ),
      -- Passo 4: Resolução / Escalonamento
      jsonb_build_object(
        'instruction', 'Com base no diagnóstico anterior, ofereça as opções ao cliente:
1. Se o problema foi resolvido após reiniciar, encerre amigavelmente: "Fico feliz que tenha resolvido! Posso ajudar com mais alguma coisa?"
2. Se o problema persiste com severity 0-1: oriente verificar cabos e conexões do roteador/ONU. Pergunte se deseja transferir para um atendente.
3. Se severity 2-3: recomende transferir para suporte técnico avançado ou atendente humano.

Use transfer_to_human para transferir para atendente humano, ou transfer_to_agent para transferir para um agente de suporte técnico avançado se disponível. Sempre pergunte antes de transferir.',
        'available_functions', jsonb_build_array('transfer_to_human', 'transfer_to_agent'),
        'advance_condition', 'user_confirmation',
        'stuck_after_turns', 5,
        'on_complete', jsonb_build_object('action', 'end_procedure')
      )
    )
  )
FROM public.procedures p
WHERE p.name = 'Cobrança de fatura'
  AND p.is_current = true
LIMIT 1;

-- ═══════════════════════════════════════════════════════════
-- Atualização: Procedimento de Cobrança v20
-- Adiciona menção ao bloqueio financeiro no passo 2
-- ═══════════════════════════════════════════════════════════

-- Mark current billing procedure as not current
UPDATE public.procedures
SET is_current = false
WHERE name = 'Cobrança de fatura'
  AND is_current = true;

-- Insert v20 with updated instructions
INSERT INTO public.procedures (name, description, template_id, version, is_current, is_active, definition)
SELECT
  'Cobrança de fatura',
  'Fluxo guiado de consulta e entrega de faturas em aberto, com suporte a múltiplos contratos e formas de pagamento.',
  p.template_id,
  20,
  true,
  true,
  jsonb_set(
    p.definition,
    '{steps,2,instruction}',
    to_jsonb(
      'Use erp_invoice_search com o CPF confirmado (confirmed_cpf_cnpj do contexto) e o contrato selecionado (selected_contract_id do contexto). Se contract_is_blocked estiver presente no contexto como true, informe ao cliente: "Este contrato está com bloqueio por pendência financeira." Apresente as faturas encontradas de forma clara com número, valor e vencimento. Se houver mais de uma fatura, numere-as e peça que o cliente escolha. Se houver apenas uma, selecione automaticamente.'::text
    )
  )
FROM public.procedures p
WHERE p.name = 'Cobrança de fatura'
  AND is_current = false
ORDER BY version DESC
LIMIT 1;