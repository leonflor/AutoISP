
-- Drop all AI agent tables (respecting FK order)
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS document_processing_logs CASCADE;
DROP TABLE IF EXISTS knowledge_documents CASCADE;
DROP TABLE IF EXISTS agent_knowledge_base CASCADE;
DROP TABLE IF EXISTS conversation_sessions CASCADE;
DROP TABLE IF EXISTS flow_state_definitions CASCADE;
DROP TABLE IF EXISTS ai_agent_flow_links CASCADE;
DROP TABLE IF EXISTS ai_agent_flows CASCADE;
DROP TABLE IF EXISTS ai_limits CASCADE;
DROP TABLE IF EXISTS ai_usage CASCADE;
DROP TABLE IF EXISTS ai_security_clauses CASCADE;
DROP TABLE IF EXISTS isp_agents CASCADE;
DROP TABLE IF EXISTS ai_agents CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS public.match_document_chunks CASCADE;

-- Drop enums (may fail if not exist, CASCADE handles deps)
DROP TYPE IF EXISTS public.ai_agent_scope CASCADE;
DROP TYPE IF EXISTS public.tipo_agente CASCADE;
DROP TYPE IF EXISTS public.security_clause_applies CASCADE;
