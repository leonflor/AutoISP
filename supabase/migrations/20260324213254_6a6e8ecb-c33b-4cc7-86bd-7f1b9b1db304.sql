UPDATE procedures
SET definition = jsonb_set(
  definition,
  '{triggers,keywords}',
  (
    SELECT jsonb_agg(DISTINCT kw)
    FROM (
      SELECT jsonb_array_elements_text(definition->'triggers'->'keywords') AS kw
      FROM procedures
      WHERE name = 'Cobrança de fatura' AND is_current = true
      UNION ALL
      SELECT unnest(ARRAY['pagamento','pagar','segunda via','débito','pix','vencimento','parcela'])
    ) sub
  )
)
WHERE name = 'Cobrança de fatura' AND is_current = true;