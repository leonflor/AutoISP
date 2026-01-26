-- 1. Corrigir funcao handle_updated_at com search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$function$;

-- 2. Melhorar politica INSERT contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages with validation"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(name) >= 2 AND 
    length(email) >= 5 AND 
    position('@' in email) > 1 AND
    length(message) >= 10
  );

-- 3. Melhorar politica INSERT leads
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads with validation"
  ON public.leads FOR INSERT
  WITH CHECK (
    length(name) >= 2 AND 
    length(email) >= 5 AND 
    position('@' in email) > 1
  );

-- 4. Melhorar politica INSERT newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with validation"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (
    length(email) >= 5 AND 
    position('@' in email) > 1
  );

-- 5. Melhorar politica INSERT viability_checks
DROP POLICY IF EXISTS "Anyone can check viability" ON public.viability_checks;
CREATE POLICY "Anyone can check viability with validation"
  ON public.viability_checks FOR INSERT
  WITH CHECK (
    length(cep) >= 8
  );