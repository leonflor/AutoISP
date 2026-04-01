-- Fix: first failed migration unmarked v14, restore it
UPDATE public.procedures SET is_current = true WHERE name = 'Cobrança de fatura' AND version = 14 AND is_current = false;

-- Now create v15
UPDATE public.procedures SET is_current = false WHERE name = 'Cobrança de fatura' AND is_current = true;

INSERT INTO public.procedures (name, description, template_id, version, is_current, is_active, definition)
SELECT
  'Cobrança de fatura',
  'Fluxo proativo de cobrança com guardrail no passo financeiro e 4 opções de pagamento',
  p.template_id,
  p.version + 1,
  true,
  true,
  jsonb_set(
    p.definition,
    '{steps,2,instruction}',
    to_jsonb('IMEDIATAMENTE ao entrar neste passo, execute erp_invoice_search usando o CPF/CNPJ do cliente (disponível em collected_context) e o contrato_id selecionado (campo selected_contract_id no contexto). NÃO peça informações adicionais ao cliente. NÃO transfira para humano. Sua ÚNICA ação deve ser chamar erp_invoice_search. Após obter os resultados, apresente as faturas em aberto com valor, vencimento e dias de atraso de forma clara. Se não houver faturas em aberto, informe que o cliente está em dia. IMPORTANTE: NÃO ofereça formas de pagamento, linha digitável, PIX ou boleto neste passo. Apenas liste as faturas encontradas. As opções de pagamento serão apresentadas no próximo passo. Se houver faturas em aberto, avance automaticamente para o próximo passo.'::text)
  )
FROM public.procedures p
WHERE p.name = 'Cobrança de fatura'
  AND p.version = 14
LIMIT 1;