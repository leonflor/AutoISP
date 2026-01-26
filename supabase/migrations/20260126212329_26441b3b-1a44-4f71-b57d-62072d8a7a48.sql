-- =============================================
-- Função Genérica de Auditoria
-- =============================================
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _user_id uuid;
  _isp_id uuid;
  _entity_id uuid;
  _old_data jsonb;
  _new_data jsonb;
  _action text;
BEGIN
  -- Obter usuario atual
  _user_id := auth.uid();
  
  -- Determinar acao
  _action := CASE TG_OP
    WHEN 'INSERT' THEN 'create'
    WHEN 'UPDATE' THEN 'update'
    WHEN 'DELETE' THEN 'delete'
  END;
  
  -- Determinar entity_id e dados baseado na operacao
  IF TG_OP = 'DELETE' THEN
    _entity_id := OLD.id;
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
    -- Tentar obter isp_id do registro antigo
    _isp_id := CASE 
      WHEN TG_TABLE_NAME = 'isps' THEN OLD.id
      ELSE (to_jsonb(OLD)->>'isp_id')::uuid
    END;
  ELSIF TG_OP = 'INSERT' THEN
    _entity_id := NEW.id;
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
    _isp_id := CASE 
      WHEN TG_TABLE_NAME = 'isps' THEN NEW.id
      ELSE (to_jsonb(NEW)->>'isp_id')::uuid
    END;
  ELSE -- UPDATE
    _entity_id := NEW.id;
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
    _isp_id := CASE 
      WHEN TG_TABLE_NAME = 'isps' THEN NEW.id
      ELSE (to_jsonb(NEW)->>'isp_id')::uuid
    END;
  END IF;
  
  -- Remover campos sensiveis
  _old_data := _old_data - 'password_encrypted' - 'api_key_encrypted';
  _new_data := _new_data - 'password_encrypted' - 'api_key_encrypted';
  
  -- Evitar logs redundantes (apenas updated_at mudou)
  IF TG_OP = 'UPDATE' THEN
    IF (_old_data - 'updated_at') = (_new_data - 'updated_at') THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Inserir log de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    isp_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    metadata,
    created_at
  ) VALUES (
    _user_id,
    _isp_id,
    _action,
    TG_ARGV[0],
    _entity_id,
    _old_data,
    _new_data,
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'schema_name', TG_TABLE_SCHEMA,
      'trigger_name', TG_NAME
    ),
    now()
  );
  
  -- Retornar registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

-- =============================================
-- Triggers para Tabelas Principais
-- =============================================

-- Trigger para isps
CREATE TRIGGER audit_isps
  AFTER INSERT OR UPDATE OR DELETE ON public.isps
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('isp');

-- Trigger para subscriptions
CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('subscription');

-- Trigger para invoices
CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('invoice');

-- Trigger para plans
CREATE TRIGGER audit_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('plan');

-- Trigger para isp_users
CREATE TRIGGER audit_isp_users
  AFTER INSERT OR UPDATE OR DELETE ON public.isp_users
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('isp_user');

-- Trigger para user_roles
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('user_role');

-- Trigger para support_tickets
CREATE TRIGGER audit_support_tickets
  AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event('ticket');