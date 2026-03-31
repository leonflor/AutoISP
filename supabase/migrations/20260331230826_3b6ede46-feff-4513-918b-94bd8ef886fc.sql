-- Procedimento v14: adiciona opção "Enviar boleto por SMS" ao passo 3

-- Marcar v13 como não atual
UPDATE public.procedures
SET is_current = false
WHERE name = 'Cobrança de fatura'
  AND is_current = true;

-- Inserir v14
INSERT INTO public.procedures (name, description, template_id, version, is_current, is_active, definition)
SELECT
  'Cobrança de fatura',
  'Fluxo proativo de cobrança com identificação, seleção de contrato, consulta financeira e 4 opções de pagamento (linha digitável, PIX, boleto PDF, SMS)',
  p.template_id,
  p.version + 1,
  true,
  true,
  jsonb_set(
    jsonb_set(
      p.definition,
      '{steps,3,instruction}',
      '"Ofereça ao cliente as formas de pagamento disponíveis:\n1. **Linha digitável** (código de barras) — já disponível nos dados da fatura consultada\n2. **PIX copia-e-cola** — use a ferramenta erp_pix_lookup com o ID da fatura\n3. **Boleto PDF** (segunda via) — use a ferramenta erp_boleto_lookup com o ID da fatura\n4. **Receber boleto por SMS** — use a ferramenta erp_boleto_sms com o ID da fatura\n\nPergunte qual opção o cliente prefere e execute a ação correspondente. Se o PIX estiver expirado, informe e sugira as outras opções."'::jsonb
    ),
    '{steps,3,available_functions}',
    '["erp_pix_lookup", "erp_boleto_lookup", "erp_boleto_sms"]'::jsonb
  )
FROM public.procedures p
WHERE p.name = 'Cobrança de fatura'
  AND p.is_current = false
ORDER BY p.version DESC
LIMIT 1;