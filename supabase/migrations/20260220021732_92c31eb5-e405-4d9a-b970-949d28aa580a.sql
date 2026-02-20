ALTER TABLE public.ai_agent_flow_steps
ADD COLUMN conditional_routes jsonb NOT NULL DEFAULT '[]'::jsonb;