-- Add encryption_iv column to whatsapp_configs for proper decryption
ALTER TABLE public.whatsapp_configs 
ADD COLUMN IF NOT EXISTS encryption_iv text;

-- Add comment for documentation
COMMENT ON COLUMN public.whatsapp_configs.encryption_iv IS 'IV (Initialization Vector) used for AES-GCM decryption of api_key_encrypted';