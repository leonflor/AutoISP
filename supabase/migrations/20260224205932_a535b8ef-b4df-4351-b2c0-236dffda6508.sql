
-- Drop orphan FK constraint on ai_agent_flow_steps.tool_id first
ALTER TABLE public.ai_agent_flow_steps DROP CONSTRAINT IF EXISTS ai_agent_flow_steps_tool_id_fkey;
ALTER TABLE public.ai_agent_flow_steps DROP COLUMN IF EXISTS tool_id;

-- Drop junction tables (children first)
DROP TABLE IF EXISTS public.ai_procedure_tools;
DROP TABLE IF EXISTS public.ai_procedure_flows;
DROP TABLE IF EXISTS public.ai_agent_procedures;

-- Drop parent table
DROP TABLE IF EXISTS public.ai_procedures;

-- Drop ai_agent_tools
DROP TABLE IF EXISTS public.ai_agent_tools;
