DO $$
DECLARE
  proc RECORD;
  new_steps jsonb;
  step jsonb;
  new_fns jsonb;
  fn_item jsonb;
  handler_name text;
  new_handler text;
BEGIN
  FOR proc IN SELECT id, definition FROM public.procedures WHERE is_current = true AND definition ? 'steps'
  LOOP
    new_steps := '[]'::jsonb;
    
    FOR step IN SELECT * FROM jsonb_array_elements(proc.definition -> 'steps')
    LOOP
      new_fns := '[]'::jsonb;
      
      IF step ? 'available_functions' AND jsonb_typeof(step -> 'available_functions') = 'array' THEN
        FOR fn_item IN SELECT * FROM jsonb_array_elements(step -> 'available_functions')
        LOOP
          -- Determine handler name
          IF jsonb_typeof(fn_item) = 'string' THEN
            handler_name := fn_item #>> '{}';
          ELSIF jsonb_typeof(fn_item) = 'object' AND fn_item ? 'handler' THEN
            handler_name := fn_item ->> 'handler';
          ELSE
            handler_name := NULL;
          END IF;
          
          -- Map to new name
          new_handler := CASE handler_name
            WHEN 'get_customer_by_document' THEN 'erp_client_lookup'
            WHEN 'get_customer_by_email' THEN 'erp_client_lookup'
            WHEN 'get_open_invoices' THEN 'erp_invoice_search'
            WHEN 'get_contract' THEN 'erp_contract_lookup'
            WHEN 'get_service_status' THEN NULL
            WHEN 'generate_payment_link' THEN NULL
            WHEN 'send_invoice_by_email' THEN NULL
            ELSE handler_name
          END;
          
          -- Skip removed functions
          IF new_handler IS NOT NULL THEN
            IF jsonb_typeof(fn_item) = 'string' THEN
              new_fns := new_fns || to_jsonb(new_handler);
            ELSIF jsonb_typeof(fn_item) = 'object' THEN
              new_fns := new_fns || jsonb_set(fn_item, '{handler}', to_jsonb(new_handler));
            ELSE
              new_fns := new_fns || fn_item;
            END IF;
          END IF;
        END LOOP;
      END IF;
      
      step := jsonb_set(step, '{available_functions}', new_fns);
      new_steps := new_steps || jsonb_build_array(step);
    END LOOP;
    
    UPDATE public.procedures
    SET definition = jsonb_set(definition, '{steps}', new_steps)
    WHERE id = proc.id;
  END LOOP;
END $$;