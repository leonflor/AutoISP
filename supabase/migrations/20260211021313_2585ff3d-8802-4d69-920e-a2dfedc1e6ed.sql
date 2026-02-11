-- 1. Dropar extensão do schema public (CASCADE remove coluna embedding e função dependente)
DROP EXTENSION IF EXISTS vector CASCADE;

-- 2. Recriar no schema extensions (padrão recomendado pelo Supabase)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- 3. Recriar coluna embedding na tabela document_chunks
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

-- 4. Recriar função match_document_chunks referenciando extensions.vector
CREATE OR REPLACE FUNCTION public.match_document_chunks(
  query_embedding extensions.vector,
  match_isp_agent_id uuid,
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5
) RETURNS TABLE(id uuid, content text, similarity double precision)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT dc.id, dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE dc.isp_agent_id = match_isp_agent_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;