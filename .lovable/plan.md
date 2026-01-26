

## Plano: Correcao de Warnings de Seguranca do Linter

### Objetivo
Analisar e corrigir os 6 warnings identificados pelo linter de seguranca do Supabase, garantindo conformidade com boas praticas de seguranca.

---

## 1. Analise dos Warnings Encontrados

### 1.1 Function Search Path Mutable (1 funcao)

| Funcao | Status Atual | Risco |
|--------|--------------|-------|
| `handle_updated_at()` | Sem search_path | Baixo |

**Detalhes**: Esta funcao e um trigger simples que atualiza `updated_at`. Nao usa SECURITY DEFINER, entao o risco e minimo, mas devemos corrigir para boas praticas.

### 1.2 RLS Policy Always True (7 politicas)

| Tabela | Politica | Comando | Risco | Acao |
|--------|----------|---------|-------|------|
| `ai_limits` | Anyone can view limits | SELECT | **Aceitavel** | Manter - dados publicos de limites de planos |
| `help_categories` | Authenticated users can view categories | SELECT | **Aceitavel** | Manter - categorias de ajuda sao publicas |
| `sla_configs` | Anyone can view SLA configs | SELECT | **Aceitavel** | Manter - SLAs sao informacao publica dos planos |
| `contact_messages` | Anyone can submit contact messages | INSERT | **Risco** | Adicionar rate limiting e validacao |
| `leads` | Anyone can submit leads | INSERT | **Risco** | Adicionar rate limiting e validacao |
| `newsletter_subscribers` | Anyone can subscribe to newsletter | INSERT | **Risco** | Adicionar rate limiting e validacao |
| `viability_checks` | Anyone can check viability | INSERT | **Risco** | Adicionar rate limiting e validacao |

### 1.3 Leaked Password Protection Disabled

**Acao**: Esta configuracao e feita no dashboard do Supabase, nao via SQL. Informar usuario.

---

## 2. Decisao Arquitetural

### Politicas SELECT com `true`
As politicas de SELECT com `true` para `ai_limits`, `help_categories` e `sla_configs` sao **intencionais** e **aceitaveis** porque:
- Sao dados de configuracao publica (limites de planos, categorias de ajuda, SLAs)
- Nao contem informacoes sensiveis
- Sao necessarios para exibir na landing page e areas publicas

### Politicas INSERT com `true`
As politicas de INSERT com `true` para `contact_messages`, `leads`, `newsletter_subscribers` e `viability_checks` precisam de **validacao adicional** para prevenir spam e abuso.

---

## 3. Correcoes Propostas

### 3.1 Corrigir handle_updated_at() - Adicionar search_path

```sql
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
```

### 3.2 Politicas INSERT - Adicionar validacoes basicas

Em vez de `WITH CHECK (true)`, adicionar validacoes minimas:

**contact_messages:**
```sql
DROP POLICY "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages with validation"
  ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(name) >= 2 AND 
    length(email) >= 5 AND 
    position('@' in email) > 1 AND
    length(message) >= 10
  );
```

**leads:**
```sql
DROP POLICY "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads with validation"
  ON public.leads FOR INSERT
  WITH CHECK (
    length(name) >= 2 AND 
    length(email) >= 5 AND 
    position('@' in email) > 1
  );
```

**newsletter_subscribers:**
```sql
DROP POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with validation"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (
    length(email) >= 5 AND 
    position('@' in email) > 1
  );
```

**viability_checks:**
```sql
DROP POLICY "Anyone can check viability" ON public.viability_checks;
CREATE POLICY "Anyone can check viability with validation"
  ON public.viability_checks FOR INSERT
  WITH CHECK (
    length(cep) >= 8
  );
```

---

## 4. Politicas SELECT - Manter como Intencionais

As seguintes politicas serao **mantidas** pois sao dados publicos intencionais:

| Tabela | Justificativa |
|--------|---------------|
| `ai_limits` | Limites de IA por plano - necessarios para exibir features |
| `help_categories` | Categorias do centro de ajuda - conteudo publico |
| `sla_configs` | SLAs por plano - necessarios para comparacao de planos |

Para documentar que sao intencionais, adicionaremos comentario nas politicas.

---

## 5. Leaked Password Protection

Esta configuracao e feita no **Dashboard do Supabase**:

1. Acessar: Authentication > Providers > Email
2. Ativar: "Enable leaked password protection"

**Nota**: Isso nao e configuravel via SQL/migracao.

---

## 6. Resumo das Alteracoes

### Migracao SQL

```sql
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

-- 6. Comentarios documentando politicas SELECT intencionais
COMMENT ON POLICY "Anyone can view limits" ON public.ai_limits 
  IS 'Intencional: limites de IA sao informacao publica dos planos';

COMMENT ON POLICY "Authenticated users can view categories" ON public.help_categories 
  IS 'Intencional: categorias do centro de ajuda sao conteudo publico';

COMMENT ON POLICY "Anyone can view SLA configs" ON public.sla_configs 
  IS 'Intencional: SLAs sao informacao publica para comparacao de planos';
```

---

## 7. Resultado Esperado

### Antes
| Warning | Quantidade |
|---------|------------|
| Function search_path mutable | 1 |
| RLS Policy always true (INSERT) | 4 |
| RLS Policy always true (SELECT) | 3 |
| Leaked password protection | 1 |

### Depois
| Warning | Quantidade | Status |
|---------|------------|--------|
| Function search_path mutable | 0 | **Corrigido** |
| RLS Policy always true (INSERT) | 0 | **Corrigido** |
| RLS Policy always true (SELECT) | 3 | **Mantido (intencional)** |
| Leaked password protection | 1 | **Manual no Dashboard** |

---

## 8. Proximos Passos Pos-Implementacao

1. **Dashboard Supabase**: Ativar "Leaked password protection"
2. **Rate Limiting**: Considerar implementar rate limiting via Edge Functions para formularios publicos
3. **CAPTCHA**: Avaliar adicionar reCAPTCHA nos formularios de contato e leads

