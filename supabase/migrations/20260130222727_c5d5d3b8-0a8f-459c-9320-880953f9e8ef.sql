-- Add new columns to erp_configs for multi-provider support
ALTER TABLE erp_configs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS masked_key TEXT,
ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create unique index on isp_id + provider to allow one config per provider per ISP
CREATE UNIQUE INDEX IF NOT EXISTS idx_erp_configs_isp_provider 
ON erp_configs(isp_id, provider);