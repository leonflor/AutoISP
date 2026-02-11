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