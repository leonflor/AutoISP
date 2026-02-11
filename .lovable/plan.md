

# Mover pgvector do schema public para extensions

## Por que isso e importante?

Quando a extensao `pgvector` esta instalada no schema `public`, todas as suas funcoes internas (mais de 80 funcoes como `vector_in`, `vector_out`, `cosine_distance`, etc.) ficam misturadas com as funcoes de negocio da aplicacao (`has_role`, `get_user_isp_id`, `match_document_chunks`). Isso causa:

- **Poluicao do namespace**: as funcoes do pgvector aparecem junto com as funcoes do sistema, dificultando manutencao
- **Risco de colisao de nomes**: funcoes futuras podem conflitar com nomes usados pelo pgvector
- **Pratica recomendada pelo Supabase**: a documentacao oficial recomenda instalar extensoes no schema `extensions`, que ja existe por padrao em todos os projetos Supabase

## O que muda na pratica?

Para o codigo da aplicacao, **nada muda**. A unica funcao que usa pgvector diretamente e `match_document_chunks`, que continuara funcionando porque o Supabase adiciona automaticamente o schema `extensions` ao `search_path`.

## Como sera feito

Essa alteracao requer executar um comando SQL no banco de dados:

```text
-- Remover a extensao do schema public
DROP EXTENSION IF EXISTS vector;

-- Recriar no schema extensions (padrao recomendado pelo Supabase)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
```

**Importante:** Isso so e seguro se nao houver dados reais com embeddings armazenados. Se ja existirem dados na tabela `document_chunks` com a coluna `embedding` preenchida, sera necessario fazer backup dos dados antes.

## Verificacao previa

Antes de executar, sera verificado se existem dados na tabela `document_chunks` para garantir que a migracao e segura.

## Secao tecnica

**Migration SQL:**

```text
-- Dropar e recriar extensao no schema correto
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
```

O `CASCADE` remove objetos dependentes (operadores, tipos). Apos recriar a extensao, a funcao `match_document_chunks` e a coluna `embedding` em `document_chunks` precisarao ser recriadas:

```text
-- Recriar coluna embedding (se a tabela existir)
ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

-- Recriar funcao match_document_chunks referenciando extensions.vector
CREATE OR REPLACE FUNCTION match_document_chunks(
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
```

**Arquivos afetados:** Apenas migration SQL no banco de dados. Nenhum arquivo de codigo frontend precisa ser alterado.

