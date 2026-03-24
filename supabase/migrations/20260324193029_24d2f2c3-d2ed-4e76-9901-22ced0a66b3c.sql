-- Normalize all procedures with min_confidence > 1 (percentage → decimal)
UPDATE public.procedures
SET definition = jsonb_set(
  definition,
  '{triggers,min_confidence}',
  to_jsonb((definition->'triggers'->>'min_confidence')::numeric / 100)
)
WHERE is_current = true
  AND (definition->'triggers'->>'min_confidence')::numeric > 1;

-- Set "Cobrança de fatura" to 0.14 so single keyword "boleto" triggers it (1/7 = 0.14)
UPDATE public.procedures
SET definition = jsonb_set(
  definition,
  '{triggers,min_confidence}',
  '0.14'
)
WHERE id = 'cd769a96-5780-4054-92e0-6143628ba060';