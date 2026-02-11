
-- 1. ai_security_clauses: exigir autenticacao para leitura
DROP POLICY "Authenticated can read active clauses" ON ai_security_clauses;
CREATE POLICY "Authenticated can read active clauses" ON ai_security_clauses
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- 2. audit_logs: bloqueio explicito de modificacoes
CREATE POLICY "audit_logs_no_update" ON audit_logs
  FOR UPDATE USING (false);
CREATE POLICY "audit_logs_no_delete" ON audit_logs
  FOR DELETE USING (false);

-- 3. document_processing_logs: restringir INSERT
DROP POLICY "Service role can insert logs" ON document_processing_logs;
CREATE POLICY "Service role only insert logs" ON document_processing_logs
  FOR INSERT WITH CHECK (false);
