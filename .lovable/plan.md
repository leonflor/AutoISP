
# Sistema de Logs de Erros de Processamento de Documentos

## Objetivo

Implementar visibilidade de erros de processamento em dois níveis:
1. **Cliente ISP**: Código de erro + descrição amigável (sem dados sensíveis)
2. **Admin**: Painel completo com logs detalhados de todos os ISPs

---

## Arquitetura da Solução

### 1. Nova Tabela de Logs (Admin)

Criar tabela `document_processing_logs` para armazenar logs detalhados:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | uuid | PK |
| document_id | uuid | FK para knowledge_documents |
| isp_id | uuid | FK para isps |
| isp_agent_id | uuid | FK para isp_agents |
| error_code | text | Codigo padronizado (ERR_EMBED_001, etc) |
| error_message | text | Mensagem amigavel para cliente |
| error_details | jsonb | Detalhes tecnicos (stack trace, request, etc) |
| processing_step | text | Etapa do erro (download, extract, chunk, embed) |
| created_at | timestamptz | Quando ocorreu |

### 2. Codigos de Erro Padronizados

| Codigo | Etapa | Mensagem Cliente |
|--------|-------|------------------|
| ERR_DOC_001 | download | Falha ao baixar arquivo. Tente reenviar. |
| ERR_DOC_002 | extract | Nao foi possivel extrair texto do documento. |
| ERR_DOC_003 | extract | Conteudo insuficiente no documento. |
| ERR_CHUNK_001 | chunk | Erro ao dividir documento em blocos. |
| ERR_EMBED_001 | embed | Falha na geracao de embeddings. Servico temporariamente indisponivel. |
| ERR_EMBED_002 | embed | Documento excede limite de processamento. |
| ERR_DB_001 | insert | Erro ao salvar dados processados. |
| ERR_UNKNOWN | unknown | Erro inesperado. Contate o suporte. |

---

## Secao Tecnica

### Modificacoes na Edge Function

Atualizar `supabase/functions/process-document/index.ts`:

1. Adicionar mapeamento de erros para codigos
2. Usar dois clientes Supabase (como recomendado no stack-overflow):
   - Cliente do usuario: valida permissoes via RLS
   - Cliente admin: grava logs detalhados
3. Salvar log completo na nova tabela
4. Salvar apenas codigo + mensagem amigavel em `knowledge_documents.error_message`

```typescript
// Mapeamento de erros
const ERROR_CODES = {
  DOWNLOAD_FAILED: { code: "ERR_DOC_001", message: "Falha ao baixar arquivo. Tente reenviar." },
  EXTRACT_FAILED: { code: "ERR_DOC_002", message: "Não foi possível extrair texto do documento." },
  CONTENT_TOO_SHORT: { code: "ERR_DOC_003", message: "Conteúdo insuficiente no documento." },
  CHUNK_FAILED: { code: "ERR_CHUNK_001", message: "Erro ao dividir documento em blocos." },
  EMBEDDING_FAILED: { code: "ERR_EMBED_001", message: "Falha na geração de embeddings. Serviço temporariamente indisponível." },
  EMBEDDING_TOO_LARGE: { code: "ERR_EMBED_002", message: "Documento excede limite de processamento." },
  INSERT_FAILED: { code: "ERR_DB_001", message: "Erro ao salvar dados processados." },
  UNKNOWN: { code: "ERR_UNKNOWN", message: "Erro inesperado. Contate o suporte." },
};

// No catch de cada etapa, salvar log detalhado
await supabaseAdmin.from("document_processing_logs").insert({
  document_id: documentId,
  isp_id: doc.isp_id,
  isp_agent_id: ispAgentId,
  error_code: errorInfo.code,
  error_message: errorInfo.message,
  error_details: {
    original_error: error.message,
    stack: error.stack,
    step_context: { ... }
  },
  processing_step: "embed"
});

// Salvar mensagem amigavel no documento
await supabaseAdmin
  .from("knowledge_documents")
  .update({
    status: "error",
    error_message: `${errorInfo.code} - ${errorInfo.message}`
  })
  .eq("id", documentId);
```

### UI do Cliente (DocumentsTable.tsx)

Melhorar exibicao do erro:

1. Separar codigo da mensagem visualmente
2. Mostrar codigo em badge
3. Manter mensagem amigavel no tooltip

```text
+------------------------------------------+
| base_conhecimento.pdf    ERR_EMBED_001   |
| arquivo.txt             [i] Ver detalhes |
+------------------------------------------+
            |
            v (tooltip)
  "Falha na geração de embeddings.
   Serviço temporariamente indisponível."
```

### Painel Admin - Logs de Processamento

Adicionar nova pagina `/admin/ai-agents/logs`:

1. Adicionar item no submenu IA do AdminSidebar
2. Criar pagina com tabela de logs:
   - Filtros: ISP, data, codigo de erro, status
   - Colunas: Data, ISP, Documento, Codigo, Etapa, Acoes
   - Acao: expandir para ver detalhes tecnicos

```text
+-----------------------------------------------------------------------+
| Logs de Processamento                               [Filtros] [Busca] |
+-----------------------------------------------------------------------+
| Data/Hora     | ISP          | Documento        | Codigo      | Etapa |
|---------------|--------------|------------------|-------------|-------|
| 30/01 19:15   | TurboNet     | base_conheci...  | ERR_EMBED_001| embed |
| 30/01 19:10   | FibraMax     | termos.pdf       | ERR_DOC_002  | extract|
+-----------------------------------------------------------------------+
           |
           v (expandir)
  +------------------------------------------------------------------+
  | Detalhes Tecnicos                                                 |
  | Erro Original: Embedding error: Bad Request                       |
  | Stack Trace: at generateEmbedding (index.ts:72)...               |
  | Contexto: { chunks: 1, textLength: 1808, model: "text-embed..." } |
  +------------------------------------------------------------------+
```

---

## Arquivos a Criar/Modificar

### Novos Arquivos

1. `src/pages/admin/AiProcessingLogs.tsx` - Pagina de logs
2. `src/hooks/admin/useProcessingLogs.ts` - Hook para buscar logs
3. `src/components/admin/ai-agents/ProcessingLogsTable.tsx` - Tabela de logs
4. `src/components/admin/ai-agents/LogDetailsDialog.tsx` - Dialog com detalhes

### Modificacoes

1. `supabase/functions/process-document/index.ts`
   - Adicionar mapeamento de codigos de erro
   - Inserir logs na nova tabela
   - Formatar error_message como "CODIGO - Mensagem"

2. `src/components/painel/ai/DocumentsTable.tsx`
   - Extrair codigo do error_message
   - Exibir codigo em badge separado
   - Melhorar tooltip com mensagem

3. `src/components/admin/AdminSidebar.tsx`
   - Adicionar "Logs de Processamento" no submenu IA

4. `src/App.tsx`
   - Adicionar rota `/admin/ai-agents/logs`

---

## Migracao SQL

```sql
-- Tabela de logs detalhados
CREATE TABLE public.document_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES knowledge_documents(id) ON DELETE SET NULL,
  isp_id uuid NOT NULL REFERENCES isps(id) ON DELETE CASCADE,
  isp_agent_id uuid REFERENCES isp_agents(id) ON DELETE SET NULL,
  error_code text NOT NULL,
  error_message text NOT NULL,
  error_details jsonb,
  processing_step text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indices para performance
CREATE INDEX idx_processing_logs_isp ON document_processing_logs(isp_id);
CREATE INDEX idx_processing_logs_code ON document_processing_logs(error_code);
CREATE INDEX idx_processing_logs_created ON document_processing_logs(created_at DESC);

-- RLS: apenas superadmins podem ver
ALTER TABLE document_processing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can view all logs"
  ON document_processing_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- Permitir insert via service role (edge function)
CREATE POLICY "Service role can insert logs"
  ON document_processing_logs FOR INSERT
  WITH CHECK (true);
```

---

## Ordem de Implementacao

1. Executar migracao SQL para criar tabela
2. Atualizar edge function com codigos e logs
3. Atualizar DocumentsTable.tsx com exibicao melhorada
4. Criar hook useProcessingLogs
5. Criar componentes da tabela de logs admin
6. Criar pagina AiProcessingLogs
7. Atualizar sidebar e rotas
8. Testar fluxo completo

---

## Beneficios

| Para o Cliente | Para o Admin |
|----------------|--------------|
| Mensagem clara do que ocorreu | Detalhes tecnicos completos |
| Codigo para referenciar no suporte | Stack trace para debug |
| Orientacao de proximos passos | Metricas de erros por tipo |
| Sem exposicao de dados tecnicos | Contexto do processamento |
