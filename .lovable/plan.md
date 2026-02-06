

# Adicionar Download de Documentos e Visualizacao Amigavel de Q&A

## Contexto

A base de conhecimento ja e individualizada por agente -- tanto `agent_knowledge_base` quanto `knowledge_documents` filtram por `isp_agent_id` no banco e na Edge Function `ai-chat`. Nao ha alteracao necessaria nesse aspecto.

As duas funcionalidades novas sao:

1. **Download de documento**: Botao para baixar o arquivo original que foi enviado ao agente
2. **Visualizacao de Q&A**: Botao "Visualizar" no menu de acoes de cada pergunta/resposta, abrindo um dialog somente-leitura com suporte a Markdown

---

## Alteracao 1: Download de Documento

### Arquivo: `src/components/painel/ai/DocumentsTable.tsx`

- Adicionar um botao de download (icone `Download`) na coluna "Acoes" de cada documento
- O botao aparece para todos os documentos (nao apenas os com erro, como o "Reprocessar")
- Ao clicar, executa `supabase.storage.from("knowledge-docs").download(doc.storage_path)` e forca o download do arquivo com o nome original (`doc.original_filename`)
- Importar `supabase` do cliente e o icone `Download` do lucide-react

### Logica de download:
```text
1. Chama supabase.storage.from("knowledge-docs").download(storagePath)
2. Recebe um Blob
3. Cria um URL temporario (URL.createObjectURL)
4. Cria um <a> invisivel com download=originalFilename e clica nele
5. Revoga o URL temporario
```

---

## Alteracao 2: Visualizacao Amigavel de Q&A

### Novo arquivo: `src/components/painel/ai/KnowledgeBaseViewDialog.tsx`

- Dialog (modal) somente-leitura com os campos:
  - **Pergunta** (titulo destacado)
  - **Resposta** (renderizada com `react-markdown` para suporte a negrito, listas, links etc.)
  - **Categoria** (badge, se existir)
  - **Status** (ativo/inativo)
  - **Ultima atualizacao** (data formatada)
- Botao "Fechar" no rodape
- Botao "Editar" opcional no rodape para transicao rapida

### Arquivo: `src/components/painel/ai/KnowledgeBaseTable.tsx`

- Adicionar nova prop `onView: (item: KnowledgeBase) => void`
- Adicionar item "Visualizar" (icone `Eye`) no `DropdownMenu`, antes do "Editar"

### Arquivo: `src/pages/painel/AiAgentKnowledge.tsx`

- Adicionar estado `viewingItem` para controlar o dialog de visualizacao
- Passar `onView` para o `KnowledgeBaseTable`
- Renderizar o novo `KnowledgeBaseViewDialog`
- No dialog de visualizacao, incluir botao "Editar" que fecha a visualizacao e abre o formulario de edicao

---

## Secao Tecnica

### Arquivos a criar:
1. `src/components/painel/ai/KnowledgeBaseViewDialog.tsx` -- dialog somente-leitura

### Arquivos a modificar:
1. `src/components/painel/ai/DocumentsTable.tsx` -- botao download
2. `src/components/painel/ai/KnowledgeBaseTable.tsx` -- adicionar acao "Visualizar" e prop `onView`
3. `src/pages/painel/AiAgentKnowledge.tsx` -- orquestrar o novo dialog

### Dependencias:
- `react-markdown` -- ja instalado no projeto
- `supabase` client -- ja importado nos hooks
- Nenhuma dependencia nova

### Sem alteracao de banco:
- Nenhuma migracao necessaria
- O bucket `knowledge-docs` ja existe e os paths estao salvos em `knowledge_documents.storage_path`

