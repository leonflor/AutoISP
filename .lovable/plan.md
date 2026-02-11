

# Corrigir Politicas RLS com `true`

## Situacao atual

| Problema | Status |
|----------|--------|
| audit_logs imutavel | Ja corrigido (policies `no_update` e `no_delete` com `USING (false)`) |
| Conversas restritas por role | Ja correto (scoped por `is_isp_member`) |
| Tickets restritos por role | Ja correto (scoped por `is_isp_member` / `is_isp_admin`) |
| Politicas com `true` | **3 tabelas precisam correcao** |

## O que sera corrigido

Tres tabelas permitem leitura por usuarios anonimos (sem autenticacao) porque usam `USING (true)`:

| Tabela | Policy | Risco |
|--------|--------|-------|
| ai_limits | "Anyone can view limits" | Usuarios anonimos veem limites de IA por plano |
| help_categories | "Authenticated users can view categories" | Nome diz "authenticated" mas a policy usa `true` |
| sla_configs | "Anyone can view SLA configs" | Usuarios anonimos veem configuracoes de SLA |

## Correcao

Restringir as 3 policies para exigir autenticacao (`auth.role() = 'authenticated'`). Isso nao afeta o funcionamento normal porque o frontend sempre usa sessoes autenticadas.

## Secao tecnica

**Migration SQL:**

```text
-- 1. ai_limits: restringir a autenticados
DROP POLICY "Anyone can view limits" ON ai_limits;
CREATE POLICY "Authenticated can view limits" ON ai_limits
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. help_categories: corrigir policy que diz "authenticated" mas usa true
DROP POLICY "Authenticated users can view categories" ON help_categories;
CREATE POLICY "Authenticated users can view categories" ON help_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- 3. sla_configs: restringir a autenticados
DROP POLICY "Anyone can view SLA configs" ON sla_configs;
CREATE POLICY "Authenticated can view SLA configs" ON sla_configs
  FOR SELECT USING (auth.role() = 'authenticated');
```

**Impacto:** Nenhum no uso normal. Todas as paginas que consultam essas tabelas ja exigem login. Apenas bloqueia acesso anonimo direto a API.

**Arquivos afetados:** Apenas migration SQL. Nenhum codigo frontend precisa ser alterado.
