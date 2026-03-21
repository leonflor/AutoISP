

# Plano: Base de Conhecimento e FAQ (`/painel/knowledge-base`)

## Resumo

Criar página com três abas (FAQ, Documentos, URLs) para gerenciar a base de conhecimento do agente via RAG. Criar Edge Function `embed-content` para chunking e embeddings.

## 1. Migration

Adicionar colunas na tabela `knowledge_bases`:
- `status` text DEFAULT 'pending' (pending, indexing, indexed, error)
- `file_url` text (para documentos no Storage)
- `file_size` integer (bytes)
- `parent_id` uuid (auto-ref para chunks filhos de docs longos)
- `error_message` text

## 2. Edge Function `embed-content`

**`supabase/functions/embed-content/index.ts`**

- Recebe `{ knowledge_base_id }`
- Busca registro via service role
- Atualiza status → 'indexing'
- Para source_type='url': fetch URL, extrair texto (HTML → text)
- Divide content em chunks de ~500 tokens (~2000 chars) com 50 tokens overlap
- Para chunk único: gera embedding via OpenAI `text-embedding-3-small` (reutilizar lógica do `context-builder.ts`) e atualiza o registro
- Para múltiplos chunks: INSERT registros filhos com `parent_id`, cada um com embedding
- Atualiza status → 'indexed' (ou 'error')
- Chave OpenAI: descriptografar de `platform_config` usando `ENCRYPTION_KEY` (mesmo padrão do context-builder)

## 3. Hook `useKnowledgeBase`

**`src/hooks/painel/useKnowledgeBase.ts`**

- Query `knowledge_bases` filtrado por `tenant_agent_id` (obtido do agente do ISP)
- Separar por `source_type`: faq, document, url
- Stats: counts por tipo, itens com status='indexing'
- Mutations: create, update, delete
- Upload de arquivo → Storage bucket `knowledge-docs`
- Chamada `supabase.functions.invoke('embed-content')` após INSERT

## 4. Página `/painel/knowledge-base`

**`src/pages/painel/KnowledgeBase.tsx`**

### Card de resumo no topo
- "{X} documentos · {Y} perguntas · {Z} URLs indexados"
- Progress bar se há itens com status='indexing'

### Aba 1 — FAQ
- Cards com pergunta + prévia da resposta
- Dialog criar/editar: input pergunta, textarea resposta, input categoria
- Salvar: INSERT `knowledge_bases` com source_type='faq', content formatado
- Invoke `embed-content`

### Aba 2 — Documentos
- Upload dropzone (PDF, TXT, DOCX, max 10MB)
- Lista: nome, tamanho, data, badge de status
- Upload → Storage `knowledge-docs/{tenantAgentId}/` + INSERT + embed-content
- Botão excluir: remove Storage + DELETE knowledge_bases

### Aba 3 — URLs
- Input URL + botão "Adicionar"
- Lista com status por URL
- INSERT + embed-content (EF faz fetch e extração de texto)

## 5. Rota e Sidebar

- **`App.tsx`**: Rota `knowledge-base` dentro de `/painel`
- **`PainelSidebar.tsx`**: Item "Base de Conhecimento" (icon `BookOpen`) após "Agente IA"

## Arquivos

| Ação | Arquivo |
|------|---------|
| Migration | Adicionar colunas a `knowledge_bases` |
| Criar | `supabase/functions/embed-content/index.ts` |
| Criar | `src/hooks/painel/useKnowledgeBase.ts` |
| Criar | `src/pages/painel/KnowledgeBase.tsx` |
| Editar | `src/components/painel/PainelSidebar.tsx` |
| Editar | `src/App.tsx` |

