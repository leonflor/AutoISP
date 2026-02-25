UPDATE public.ai_agent_flow_steps
SET instruction = 'Exiba apenas os endereços de instalação em lista numerada com duplo espaçamento entre itens. Não exiba plano, status ou vencimento nesta etapa. Pergunte qual contrato o cliente deseja tratar.',
    updated_at = now()
WHERE id = '0c89d6bc-5504-4b12-9e10-e88fadb621df';