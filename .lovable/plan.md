
# Atualizar Guia de Projeto com Correções e Implementações

## Objetivo

Sincronizar a documentação do projeto com as implementações realizadas, incluindo:
1. Correções de segurança pendentes identificadas pelo linter
2. Base de conhecimento por documentos com RAG (embeddings vetoriais)
3. Nova Edge Function `process-document`
4. Novas tabelas e bucket de storage

---

## Correções de Seguranca Pendentes

Duas correções identificadas pelo linter do Supabase que devem ser documentadas:

| Alerta | Descricao | Correcao |
|--------|-----------|----------|
| Extensao no schema public | A extensao `pgvector` esta instalada no schema `public`, o que pode expor funcoes publicamente | Mover extensao para schema dedicado `extensions` em migracao futura |
| Leaked Password Protection | Configuracao do Supabase Auth que previne uso de senhas comprometidas | Ativar em Dashboard > Authentication > Settings > "Leaked Password Protection" |

---

## Novas Tabelas Implementadas

| Tabela | Descricao | Campos Principais |
|--------|-----------|-------------------|
| `knowledge_documents` | Metadados dos documentos enviados para a base de conhecimento | id, isp_agent_id, isp_id, name, original_filename, storage_path, size_bytes, mime_type, status, error_message, chunk_count, indexed_at |
| `document_chunks` | Chunks de texto com embeddings vetoriais | id, document_id, isp_agent_id, isp_id, content, embedding (vector 768), metadata, chunk_index |

---

## Novo Bucket de Storage

| Bucket | Tipo | Descricao |
|--------|------|-----------|
| `knowledge-docs` | Privado | Armazena documentos PDF, TXT, DOCX, ODT para processamento de base de conhecimento |

---

## Nova Edge Function

| Funcao | Descricao | Tecnologias |
|--------|-----------|-------------|
| `process-document` | Processa documentos de forma assincrona: extrai texto, divide em chunks, gera embeddings vetoriais | Lovable AI Gateway (embeddings 768d), pgvector, chunking com overlap |

---

## Campos Adicionados em Tabelas Existentes

| Tabela | Campo | Tipo | Descricao |
|--------|-------|------|-----------|
| `ai_limits` | `max_documents_per_agent` | integer (default 5) | Limite de documentos por agente, controlado pelo plano |
| `isp_agents` | `chunk_size` | integer (250-1000, default 500) | Tamanho configuravel do chunk em tokens |

---

## RAG Implementado

A busca no ai-chat agora utiliza busca hibrida:
1. Gera embedding da pergunta do usuario
2. Busca chunks similares em `document_chunks` (similarity > 0.7)
3. Busca Q&A manual em `agent_knowledge_base`
4. Combina resultados por relevancia no contexto do system prompt

---

## Secao Tecnica - Arquivos a Modificar

### 1. ImplementacaoTab.tsx

Adicionar na lista de Edge Functions:
- `process-document` - Processa documentos e gera embeddings vetoriais

Atualizar Fase F5 checklist:
- Base de conhecimento por documentos funcionando
- Upload assincrono com status
- RAG hibrido operacional

### 2. SecurityOverviewSection.tsx

Adicionar nova secao "Correcoes Pendentes" com:
- Alerta sobre pgvector no schema public
- Alerta sobre Leaked Password Protection desativado

Atualizar Matriz de Segredos (nao requer novos segredos, usa Lovable AI Gateway interno)

### 3. SupabaseStorageIntegration.tsx

Documentar novo bucket:
- `knowledge-docs` - Bucket privado para base de conhecimento RAG

### 4. OpenAIIntegration.tsx

Atualizar secao RAG:
- Dimensoes: 768 (via Lovable AI Gateway)
- Modelo embedding: interno Lovable
- Tabela de chunks: `document_chunks`
- Funcao de busca: `match_document_chunks`

### 5. AgentesIAClienteFeatures.tsx

Atualizar feature F-CLI-058 (Gerenciar Base de Conhecimento):
- Adicionar suporte a upload assincrono
- Status de processamento (pending, processing, indexed, error)
- Limite por plano (`max_documents_per_agent`)
- Chunk size configuravel

---

## Novas Regras de Negocio a Documentar

| Codigo | Descricao |
|--------|-----------|
| RN-CLI-228a | Documentos sao processados de forma assincrona |
| RN-CLI-228b | Status de processamento: pending → processing → indexed ou error |
| RN-CLI-228c | Chunks com overlap de 10% para manter contexto |
| RN-CLI-228d | Limite de 25MB por arquivo |
| RN-CLI-228e | Formatos suportados: PDF, TXT, DOCX, ODT |

---

## Ordem de Modificacao

1. `SecurityOverviewSection.tsx` - Adicionar secao de correcoes pendentes
2. `ImplementacaoTab.tsx` - Adicionar process-document na lista de Edge Functions e atualizar checklist F5
3. `SupabaseStorageIntegration.tsx` - Documentar bucket knowledge-docs
4. `OpenAIIntegration.tsx` - Atualizar secao RAG com nova arquitetura
5. `AgentesIAClienteFeatures.tsx` - Expandir regras da feature F-CLI-058
