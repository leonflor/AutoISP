UPDATE public.ai_agent_flow_steps
SET instruction = 'Exiba apenas os endereços de instalação em lista numerada com duplo espaçamento entre itens. Não exiba plano, status ou vencimento nesta etapa. Pergunte qual contrato o cliente deseja tratar.',
    updated_at = now()
WHERE id = '886d4ad6-a396-4a42-b7b5-e47385aba30c';