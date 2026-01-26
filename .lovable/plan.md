

## Plano: Triggers de Auditoria Automatica

### Objetivo
Implementar triggers de banco de dados que populam automaticamente a tabela `audit_logs` quando ocorrem operacoes INSERT, UPDATE e DELETE nas tabelas principais do sistema.

---

## 1. Analise da Situacao Atual

### Tabela audit_logs (existente)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Identificador unico |
| isp_id | uuid | ISP relacionado (se aplicavel) |
| user_id | uuid | Usuario que executou a acao |
| action | text | Tipo de acao (create, update, delete) |
| entity_type | text | Tipo da entidade (isp, subscription, etc) |
| entity_id | uuid | ID da entidade afetada |
| old_data | jsonb | Dados antes da alteracao |
| new_data | jsonb | Dados apos a alteracao |
| metadata | jsonb | Informacoes adicionais |
| ip_address | inet | IP do usuario |
| user_agent | text | User agent do navegador |
| created_at | timestamptz | Data/hora do registro |

### RLS Atual
- **SELECT**: ISP admins (proprios logs) e super_admins (todos)
- **INSERT/UPDATE/DELETE**: Nao permitido por usuarios (apenas por triggers)

---

## 2. Tabelas a Auditar

| Prioridade | Tabela | entity_type | Campos a Capturar | isp_id |
|------------|--------|-------------|-------------------|--------|
| Alta | isps | isp | name, status, email, phone | record.id |
| Alta | subscriptions | subscription | status, plan_id, canceled_at | record.isp_id |
| Alta | invoices | invoice | status, amount, paid_at | record.isp_id |
| Alta | plans | plan | name, price_monthly, is_active | null |
| Media | isp_users | isp_user | role, is_active | record.isp_id |
| Media | user_roles | user_role | role | null |
| Media | support_tickets | ticket | status, priority, assigned_to | record.isp_id |

---

## 3. Arquitetura da Solucao

### Funcao Generica de Auditoria

```text
+-------------------+     +----------------------+     +-------------+
|  Tabela Principal | --> | Trigger AFTER INSERT | --> | audit_logs  |
|  (isps, invoices) |     |   UPDATE, DELETE     |     |  (registro) |
+-------------------+     +----------------------+     +-------------+
                                    |
                                    v
                          +-------------------+
                          | log_audit_event() |
                          |  (funcao comum)   |
                          +-------------------+
```

### Fluxo de Dados

```text
1. Usuario executa INSERT/UPDATE/DELETE
2. Trigger AFTER dispara
3. Funcao log_audit_event() é chamada
4. Registro criado em audit_logs com:
   - user_id = auth.uid()
   - action = TG_OP (INSERT/UPDATE/DELETE)
   - entity_type = parametro do trigger
   - old_data = row_to_json(OLD)
   - new_data = row_to_json(NEW)
```

---

## 4. Implementacao SQL

### 4.1 Funcao Generica de Auditoria

```sql
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
      WHEN OLD.isp_id IS NOT NULL THEN OLD.isp_id
      ELSE NULL
    END;
  ELSIF TG_OP = 'INSERT' THEN
    _entity_id := NEW.id;
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
    _isp_id := CASE 
      WHEN TG_TABLE_NAME = 'isps' THEN NEW.id
      WHEN NEW.isp_id IS NOT NULL THEN NEW.isp_id
      ELSE NULL
    END;
  ELSE -- UPDATE
    _entity_id := NEW.id;
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
    _isp_id := CASE 
      WHEN TG_TABLE_NAME = 'isps' THEN NEW.id
      WHEN NEW.isp_id IS NOT NULL THEN NEW.isp_id
      ELSE NULL
    END;
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
    TG_ARGV[0], -- entity_type passado como argumento
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
```

### 4.2 Triggers por Tabela

```sql
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
```

---

## 5. Otimizacoes

### 5.1 Filtrar Campos Sensiveis

Para nao armazenar campos sensiveis nos logs:

```sql
-- Remover campos sensiveis antes de salvar
_new_data := _new_data - 'password_encrypted' - 'api_key_encrypted';
_old_data := _old_data - 'password_encrypted' - 'api_key_encrypted';
```

### 5.2 Evitar Logs Redundantes

Nao logar updates que nao alteraram dados relevantes:

```sql
-- Verificar se houve alteracao real (excluindo updated_at)
IF TG_OP = 'UPDATE' THEN
  _old_data := _old_data - 'updated_at';
  _new_data := _new_data - 'updated_at';
  IF _old_data = _new_data THEN
    RETURN NEW; -- Sem alteracao real
  END IF;
END IF;
```

---

## 6. Permissoes RLS

A tabela `audit_logs` ja possui RLS configurado:

```text
SELECT:
  - ISP admins: apenas logs do proprio ISP
  - Super admins: todos os logs

INSERT/UPDATE/DELETE:
  - Nenhum usuario pode manipular diretamente
  - Apenas triggers (SECURITY DEFINER) podem inserir
```

Como a funcao `log_audit_event()` usa `SECURITY DEFINER`, ela pode inserir registros mesmo sem politicas INSERT para usuarios.

---

## 7. Estrutura de Arquivos

### Migracao SQL

| Arquivo | Conteudo |
|---------|----------|
| `supabase/migrations/XXXXXX_audit_triggers.sql` | Funcao + triggers |

### Nenhuma alteracao no frontend necessaria

A tabela `AuditLogsTable.tsx` ja suporta os tipos de entidade e acoes que serao gerados.

---

## 8. Tipos de Acoes Suportadas

| Acao | Descricao | Dados Capturados |
|------|-----------|------------------|
| create | Novo registro | new_data completo |
| update | Alteracao | old_data e new_data |
| delete | Remocao | old_data completo |

---

## 9. Exemplos de Logs Gerados

### Criacao de ISP

```json
{
  "action": "create",
  "entity_type": "isp",
  "entity_id": "uuid-do-isp",
  "isp_id": "uuid-do-isp",
  "user_id": "uuid-do-admin",
  "old_data": null,
  "new_data": {
    "id": "uuid-do-isp",
    "name": "Provedor Internet",
    "status": "trial",
    "email": "contato@provedor.com"
  }
}
```

### Cancelamento de Assinatura

```json
{
  "action": "update",
  "entity_type": "subscription",
  "entity_id": "uuid-subscription",
  "isp_id": "uuid-do-isp",
  "user_id": "uuid-do-admin",
  "old_data": {
    "status": "ativa"
  },
  "new_data": {
    "status": "cancelada",
    "canceled_at": "2026-01-26T21:30:00Z",
    "cancel_reason": "Solicitacao do cliente"
  }
}
```

---

## 10. Resumo da Migracao

```sql
-- Funcao generica de auditoria
CREATE OR REPLACE FUNCTION public.log_audit_event() ...

-- Triggers para tabelas principais
CREATE TRIGGER audit_isps ...
CREATE TRIGGER audit_subscriptions ...
CREATE TRIGGER audit_invoices ...
CREATE TRIGGER audit_plans ...
CREATE TRIGGER audit_isp_users ...
CREATE TRIGGER audit_user_roles ...
CREATE TRIGGER audit_support_tickets ...
```

---

## 11. Resultado Esperado

### Antes
- Logs de auditoria apenas manuais (via codigo)
- Cobertura parcial e inconsistente
- Possibilidade de operacoes nao registradas

### Depois
- Logs automaticos em TODAS as operacoes
- Cobertura completa das tabelas principais
- Rastreabilidade total de alteracoes
- Dados old/new para comparacao

### Tabelas Auditadas

| Tabela | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|
| isps | ✅ | ✅ | ✅ |
| subscriptions | ✅ | ✅ | ✅ |
| invoices | ✅ | ✅ | ✅ |
| plans | ✅ | ✅ | ✅ |
| isp_users | ✅ | ✅ | ✅ |
| user_roles | ✅ | ✅ | ✅ |
| support_tickets | ✅ | ✅ | ✅ |

