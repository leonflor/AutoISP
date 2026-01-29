-- Adicionar campos no template (superadmin define opções)
ALTER TABLE ai_agents 
ADD COLUMN IF NOT EXISTS voice_tones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS escalation_options JSONB DEFAULT '{}'::jsonb;

-- Adicionar campos na ativação (cliente escolhe)
ALTER TABLE isp_agents 
ADD COLUMN IF NOT EXISTS voice_tone TEXT,
ADD COLUMN IF NOT EXISTS escalation_config JSONB DEFAULT '{}'::jsonb;