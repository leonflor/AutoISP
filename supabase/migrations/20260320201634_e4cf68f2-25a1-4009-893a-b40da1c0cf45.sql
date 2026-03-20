
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(1536),
  p_tenant_agent_id uuid,
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
)
RETURNS TABLE (content text, title text, similarity float)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT kb.content, kb.title,
         (1 - (kb.embedding <=> query_embedding))::float AS similarity
  FROM public.knowledge_bases kb
  WHERE kb.tenant_agent_id = p_tenant_agent_id
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
