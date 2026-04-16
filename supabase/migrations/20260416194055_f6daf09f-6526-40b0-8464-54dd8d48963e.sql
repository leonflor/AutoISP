-- 1) Despromover a versão atual
UPDATE public.procedures
SET is_current = false
WHERE template_id = (
  SELECT template_id FROM public.procedures WHERE id = '82d7cf5c-0bfb-45b0-a5ba-90832c542bf0'
);

-- 2) Inserir nova versão (v21) com modalidade boleto_pdf via envio inline
WITH cur AS (
  SELECT template_id, definition
  FROM public.procedures
  WHERE id = '82d7cf5c-0bfb-45b0-a5ba-90832c542bf0'
),
new_steps AS (
  SELECT
    cur.template_id,
    cur.definition,
    jsonb_agg(
      CASE
        WHEN ord = 5 THEN
          elem
            || jsonb_build_object(
              'available_functions',
              '["erp_linha_digitavel","erp_pix_lookup","erp_boleto_send_pdf","erp_boleto_lookup","erp_boleto_sms"]'::jsonb,
              'instruction',
              'Execute APENAS a ferramenta correspondente à modalidade escolhida (selected_payment_method no contexto):
- linha_digitavel → erp_linha_digitavel
- pix → erp_pix_lookup
- boleto_pdf → erp_boleto_send_pdf (envia o PDF como anexo inline no WhatsApp; em simulador ou canal sem WhatsApp configurado a ferramenta retorna o link como fallback)
- boleto_sms → erp_boleto_sms

Use o selected_invoice_id do contexto como fatura_id e o confirmed_cpf_cnpj como cpf_cnpj. NUNCA execute uma ferramenta diferente da escolhida. Se falhar, informe o erro e pergunte se deseja tentar outra modalidade.
Após entregar a informação com sucesso, pergunte ao cliente se precisa de algo mais.'
            )
        ELSE elem
      END
      ORDER BY ord
    ) AS steps_arr
  FROM cur, jsonb_array_elements(cur.definition->'steps') WITH ORDINALITY AS s(elem, ord)
  GROUP BY cur.template_id, cur.definition
)
INSERT INTO public.procedures (template_id, name, description, definition, version, is_current, is_active)
SELECT
  template_id,
  'Cobrança de fatura',
  'Identifica cliente, lista contratos/faturas e entrega via PIX, linha digitável, SMS ou PDF inline no WhatsApp.',
  jsonb_set(definition, '{steps}', steps_arr),
  21,
  true,
  true
FROM new_steps;