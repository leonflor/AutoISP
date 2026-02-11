-- Reprocessar documento que perdeu embedding na migração pgvector
-- Reset status para pending e limpa chunks órfãos

UPDATE public.knowledge_documents 
SET status = 'pending', error_message = NULL, chunk_count = 0
WHERE id = 'eb4815a4-3f60-47ff-a613-ef203aaafc68';

DELETE FROM public.document_chunks 
WHERE document_id = 'eb4815a4-3f60-47ff-a613-ef203aaafc68';