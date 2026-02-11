

# Reprocessar documento que perdeu embedding

## O que aconteceu

Na migração do `pgvector` para o schema `extensions`, o `DROP EXTENSION ... CASCADE` removeu a coluna `embedding` e seus dados. A coluna foi recriada, mas o vetor do chunk existente foi perdido.

## Documento afetado

| Campo | Valor |
|-------|-------|
| Documento | "base de conhecimento" |
| ID | `eb4815a4-3f60-47ff-a613-ef203aaafc68` |
| Chunk ID | `7924a1b9-42b2-4fcf-a7c5-6820dce605dc` |
| ISP Agent | `3f9f6fe5-8531-4f40-b547-dc63f88807c7` |
| Status atual | `indexed` (incorreto, pois embedding esta NULL) |

## Plano de execucao

1. **Atualizar status do documento** para `pending` e limpar `error_message` no banco, sinalizando que precisa ser reprocessado.

2. **Deletar chunks existentes** (o chunk com embedding NULL) para que o reprocessamento gere novos chunks com embeddings validos.

3. **Chamar a Edge Function `process-document`** passando o `document_id` e `isp_agent_id` para re-extrair o texto e gerar novos embeddings via OpenAI.

## Secao tecnica

**Passo 1 - Migration SQL:**
```text
UPDATE knowledge_documents 
SET status = 'pending', error_message = NULL, chunk_count = 0
WHERE id = 'eb4815a4-3f60-47ff-a613-ef203aaafc68';

DELETE FROM document_chunks 
WHERE document_id = 'eb4815a4-3f60-47ff-a613-ef203aaafc68';
```

**Passo 2 - Chamar Edge Function:**
Invocar `process-document` com:
```text
{
  "document_id": "eb4815a4-3f60-47ff-a613-ef203aaafc68",
  "isp_agent_id": "3f9f6fe5-8531-4f40-b547-dc63f88807c7"
}
```

**Pre-requisito:** A chave OpenAI deve estar configurada na tabela `platform_config` (integracao `integration_openai`) para que a Edge Function consiga gerar os embeddings.

**Resultado esperado:** O documento voltara ao status `indexed` com chunks contendo embeddings validos de 1536 dimensoes.

