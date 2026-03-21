
-- Add new columns to knowledge_bases for status tracking, file storage, and chunking
ALTER TABLE public.knowledge_bases
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_size integer,
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.knowledge_bases(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS error_message text;
