-- 1. Habilitar extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabela de documentos
CREATE TABLE public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_agent_id uuid NOT NULL REFERENCES public.isp_agents(id) ON DELETE CASCADE,
  isp_id uuid NOT NULL REFERENCES public.isps(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_filename text NOT NULL,
  storage_path text NOT NULL,
  size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'indexed', 'error')),
  error_message text,
  chunk_count integer DEFAULT 0,
  indexed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Tabela de chunks com embeddings
CREATE TABLE public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  isp_agent_id uuid NOT NULL,
  isp_id uuid NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  metadata jsonb DEFAULT '{}',
  chunk_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Índice para busca vetorial
CREATE INDEX document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Índice para queries por agente
CREATE INDEX document_chunks_isp_agent_idx 
ON public.document_chunks(isp_agent_id);

CREATE INDEX knowledge_documents_isp_agent_idx 
ON public.knowledge_documents(isp_agent_id);

-- 6. Função de busca semântica
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_isp_agent_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE dc.isp_agent_id = match_isp_agent_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. RLS para knowledge_documents
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP admins can manage documents"
ON public.knowledge_documents FOR ALL
USING (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP members can view documents"
ON public.knowledge_documents FOR SELECT
USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "Super admins can manage all documents"
ON public.knowledge_documents FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 8. RLS para document_chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP admins can manage chunks"
ON public.document_chunks FOR ALL
USING (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP members can view chunks"
ON public.document_chunks FOR SELECT
USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "Super admins can manage all chunks"
ON public.document_chunks FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 9. Adicionar campo de limite em ai_limits
ALTER TABLE public.ai_limits 
ADD COLUMN IF NOT EXISTS max_documents_per_agent integer DEFAULT 5;

-- 10. Adicionar campo de chunk size em isp_agents
ALTER TABLE public.isp_agents 
ADD COLUMN IF NOT EXISTS chunk_size integer DEFAULT 500;

-- Adicionar constraint de verificação para chunk_size
ALTER TABLE public.isp_agents 
ADD CONSTRAINT isp_agents_chunk_size_check 
CHECK (chunk_size >= 250 AND chunk_size <= 1000);

-- 11. Storage bucket para documentos
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-docs', 'knowledge-docs', false)
ON CONFLICT DO NOTHING;

-- 12. Storage RLS policies
CREATE POLICY "ISP admins can upload knowledge docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT isp_id::text FROM isp_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

CREATE POLICY "ISP admins can update knowledge docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'knowledge-docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT isp_id::text FROM isp_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

CREATE POLICY "ISP admins can delete knowledge docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'knowledge-docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT isp_id::text FROM isp_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
  )
);

CREATE POLICY "ISP members can view knowledge docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'knowledge-docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT isp_id::text FROM isp_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- 13. Trigger para atualizar updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();