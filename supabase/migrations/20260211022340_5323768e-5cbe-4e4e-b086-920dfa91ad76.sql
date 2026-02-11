
-- 1. ai_agents: restringir leitura a autenticados
DROP POLICY IF EXISTS "Anyone can view active agents" ON ai_agents;
CREATE POLICY "Authenticated can view active agents" ON ai_agents
  FOR SELECT TO authenticated
  USING (is_active = true);

-- 2. plans: restringir leitura a autenticados
DROP POLICY IF EXISTS "Anyone can view active plans" ON plans;
CREATE POLICY "Authenticated can view active plans" ON plans
  FOR SELECT TO authenticated
  USING (is_active = true);
