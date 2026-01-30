
# Implementar Base de Conhecimento por Documentos com Embeddings Vetoriais

## Visao Geral

Expandir o sistema de agentes de IA para suportar upload de documentos (PDF, TXT, DOCX, ODT) com processamento automatico, geracao de embeddings vetoriais e busca semantica hibrida (RAG). A funcionalidade estara disponivel apenas para agentes com `uses_knowledge_base = true` e o acesso sera controlado por limites do plano.

---

## Pre-requisito

A opcao de Base de Conhecimento (Q&A manual e Documentos) so aparece para agentes que possuem `uses_knowledge_base = true` no template. Esta validacao ja existe no sistema e sera mantida.

---

## Arquitetura da Solucao

```text
+------------------+      +-------------------+      +------------------+
|  Upload Frontend |----->|  Supabase Storage |      |  knowledge_docs  |
|  (PDF/TXT/DOCX)  |      |  (bucket privado) |      |  (bucket)        |
+------------------+      +-------------------+      +------------------+
        |                           |
        v                           v
+-------------------+      +-------------------+
|  knowledge_       |<-----|  Edge Function    |
|  documents (meta) |      |  process-document |
+-------------------+      +-------------------+
                                    |
                          +---------+---------+
                          |                   |
                          v                   v
                   +-------------+    +-----------------+
                   | Chunking    |    | Lovable AI      |
                   | (~500 tokens)|    | (Embeddings)    |
                   +-------------+    +-----------------+
                          |                   |
                          v                   v
                   +-----------------------------------+
                   |  document_chunks (pgvector 768)  |
                   +-----------------------------------+
                                    |
                                    v
                   +-----------------------------------+
                   |  ai-chat (busca hibrida RAG)     |
                   +-----------------------------------+
```

---

## Estrutura de Tabs na Pagina de Conhecimento

A pagina `AiAgentKnowledge` tera duas abas:
1. **Perguntas/Respostas** - Sistema Q&A manual existente (CSV)
2. **Documentos** - Upload e gestao de PDFs/DOCs com embeddings

```text
+------------------------------------------------------------------+
|  Base de Conhecimento - Agente X                                  |
+------------------------------------------------------------------+
|  [Perguntas/Respostas]  [Documentos]                             |
+------------------------------------------------------------------+
```

---

## Controle de Disponibilidade

| Verificacao | Onde | Acao |
|-------------|------|------|
| `uses_knowledge_base = false` | Template | Esconder botao "Base de Conhecimento" no card do agente ativo |
| `uses_knowledge_base = false` | Rota direta | Redirecionar para lista de agentes com mensagem |
| Limite de documentos atingido | Upload | Desabilitar upload + exibir aviso do plano |

---

## Limites por Plano

Novo campo na tabela `ai_limits`:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `max_documents_per_agent` | integer | Limite de documentos por agente (default: 5) |

---

## Configuracao de Chunks por Agente

Novo campo na tabela `isp_agents`:

| Campo | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| `chunk_size` | integer | 500 | Tamanho do chunk em tokens (250-1000) |

---

## Fluxo de Upload Assincrono

1. Usuario seleciona arquivo (max 25MB)
2. Frontend faz upload para Storage
3. Cria registro em `knowledge_documents` com status `pending`
4. Chama Edge Function `process-document` (background task)
5. Toast: "Documento enviado! Voce sera notificado quando o processamento concluir."
6. Edge Function processa em background:
   - Extrai texto
   - Divide em chunks (tamanho configuravel)
   - Gera embeddings
   - Atualiza status para `indexed` ou `error`
7. Frontend mostra status em tempo real via polling/refetch

---

## Busca Hibrida (RAG)

Prioridade de fontes no `ai-chat`:

1. Gerar embedding da pergunta do usuario
2. Buscar chunks similares em `document_chunks` (similarity > 0.7)
3. Buscar Q&A exato em `agent_knowledge_base`
4. Combinar resultados por ranking de relevancia
5. Injetar contexto no system prompt

```text
## Base de Conhecimento

### Documentos Relevantes:
[Trecho 1 - similarity 0.92]
[Trecho 2 - similarity 0.85]

### Perguntas Frequentes:
P: Como gerar boleto?
R: Acesse Financeiro > Boletos...
```

---

## Secao Tecnica

### Migracoes SQL

```sql
-- 1. Habilitar extensao pgvector
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

-- 4. Indice para busca vetorial
CREATE INDEX document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Funcao de busca semantica
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

-- 6. RLS Policies
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP admins can manage documents"
ON public.knowledge_documents FOR ALL
USING (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP members can view documents"
ON public.knowledge_documents FOR SELECT
USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "ISP admins can manage chunks"
ON public.document_chunks FOR ALL
USING (is_isp_admin(auth.uid(), isp_id));

CREATE POLICY "ISP members can view chunks"
ON public.document_chunks FOR SELECT
USING (is_isp_member(auth.uid(), isp_id));

CREATE POLICY "Super admins can manage all documents"
ON public.knowledge_documents FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all chunks"
ON public.document_chunks FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 7. Adicionar campo de limite em ai_limits
ALTER TABLE public.ai_limits 
ADD COLUMN IF NOT EXISTS max_documents_per_agent integer DEFAULT 5;

-- 8. Adicionar campo de chunk size em isp_agents
ALTER TABLE public.isp_agents 
ADD COLUMN IF NOT EXISTS chunk_size integer DEFAULT 500 
CHECK (chunk_size >= 250 AND chunk_size <= 1000);

-- 9. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-docs', 'knowledge-docs', false)
ON CONFLICT DO NOTHING;

-- 10. Storage RLS
CREATE POLICY "ISP admins can manage knowledge docs"
ON storage.objects FOR ALL
USING (
  bucket_id = 'knowledge-docs' 
  AND (storage.foldername(name))[1] IN (
    SELECT isp_id::text FROM isp_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);
```

### Edge Functions

| Funcao | Descricao |
|--------|-----------|
| `process-document` | Extrai texto, chunka e gera embeddings (background task) |
| `ai-chat` (update) | Adiciona busca hibrida RAG antes de gerar resposta |

### process-document

```text
1. Recebe: document_id, isp_agent_id
2. Baixa arquivo do Storage
3. Extrai texto baseado no mime_type:
   - PDF: pdf-parse
   - DOCX: mammoth
   - ODT: JSZip + XML
   - TXT: leitura direta
4. Busca chunk_size do isp_agent (default 500)
5. Divide em chunks com overlap de 10%
6. Para cada chunk:
   - Chama Lovable AI Gateway para embedding
   - Insere em document_chunks
7. Atualiza knowledge_documents: status='indexed', chunk_count=N
8. Em caso de erro: status='error', error_message='...'
```

### Componentes React

| Arquivo | Descricao |
|---------|-----------|
| `DocumentUpload.tsx` | Drag-and-drop com validacao de tipo/tamanho |
| `DocumentsTable.tsx` | Lista documentos com status/progresso |
| `DocumentStatusBadge.tsx` | Badge visual de status (pending/processing/indexed/error) |
| `ChunkSizeConfig.tsx` | Slider para configurar tamanho do chunk |

### Hooks

| Hook | Descricao |
|------|-----------|
| `useDocumentKnowledge` | CRUD de documentos + polling de status |
| `useDocumentLimits` | Verifica limites do plano |

---

## Arquivos a Criar

| Arquivo | Tipo |
|---------|------|
| `supabase/functions/process-document/index.ts` | Edge Function |
| `src/components/painel/ai/DocumentUpload.tsx` | Componente |
| `src/components/painel/ai/DocumentsTable.tsx` | Componente |
| `src/components/painel/ai/DocumentStatusBadge.tsx` | Componente |
| `src/components/painel/ai/ChunkSizeConfig.tsx` | Componente |
| `src/hooks/painel/useDocumentKnowledge.ts` | Hook |

---

## Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/pages/painel/AiAgentKnowledge.tsx` | Adicionar layout de Tabs (Q&A + Documentos) |
| `src/components/painel/ai/ActiveAgentCard.tsx` | Validar uses_knowledge_base antes de exibir botao |
| `src/components/painel/ai/AgentConfigDialog.tsx` | Adicionar campo chunk_size |
| `supabase/functions/ai-chat/index.ts` | Implementar busca hibrida RAG |
| `supabase/config.toml` | Registrar process-document |
| `src/integrations/supabase/types.ts` | Atualizado automaticamente |

---

## Formatos Suportados

| Formato | Extensao | Limite | Metodo |
|---------|----------|--------|--------|
| PDF | .pdf | 25 MB | pdf-parse |
| Texto | .txt | 25 MB | Leitura direta |
| Word OOXML | .docx | 25 MB | mammoth |
| OpenDocument | .odt | 25 MB | JSZip + XML |

---

## Limites e Configuracoes

| Item | Valor |
|------|-------|
| Tamanho maximo arquivo | 25 MB |
| Documentos por agente | Definido pelo plano (default: 5) |
| Chunk size | Configuravel (250-1000 tokens) |
| Overlap | 10% do chunk size |
| Dimensao embedding | 768 |
| Threshold similaridade | 0.7 |
| Max chunks retornados | 5 |

---

## Ordem de Implementacao

1. Migracao SQL (pgvector + tabelas + funcoes + RLS + storage)
2. Edge Function `process-document` com background task
3. Hook `useDocumentKnowledge` com polling
4. Componentes React (Upload + Table + Badge)
5. Refatorar `AiAgentKnowledge` para layout de Tabs
6. Adicionar configuracao de chunk_size no `AgentConfigDialog`
7. Modificar `ai-chat` para busca hibrida RAG
8. Testes e ajustes
