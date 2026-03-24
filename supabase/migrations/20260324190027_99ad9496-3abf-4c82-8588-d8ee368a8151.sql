UPDATE public.procedures 
SET definition = jsonb_set(
  definition, 
  '{triggers,min_confidence}', 
  '0.14'
) 
WHERE id = 'b1b2c3d4-e5f6-7890-abcd-000000000002';