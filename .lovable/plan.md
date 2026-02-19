

# Remover feature_tags de todo o sistema

## Resumo

Remover todas as referencias ao campo `feature_tags` nos arquivos do frontend. A coluna permanece no banco de dados (nao sera removida), apenas deixa de ser usada pelo codigo.

## Arquivos a alterar

### 1. `src/components/painel/ai/AgentCatalogCard.tsx`
- Remover a linha que extrai `featureTags` (linha 30)
- Remover o bloco JSX que renderiza os featureTags como badges (linhas 85-98)

### 2. `src/hooks/painel/useIspAgents.ts`
- Remover `feature_tags` da query SELECT do activeAgentsQuery (linha 54)

### 3. `src/components/admin/ai-agents/constants.ts`
- Remover a interface `FeatureTag` (linhas 17-21)
- Remover o array `AGENT_FEATURE_TAGS` (linhas 21-32)
- Remover os imports de icones usados exclusivamente por AGENT_FEATURE_TAGS (`MessageCircle`, `FileText`, `Ticket`, `Wifi`, `DollarSign`, `Calendar`, `Package`, `TrendingUp`, `Wrench`, `UserPlus`)

### 4. `src/components/admin/ai-agents/FeatureTagsSelector.tsx`
- Deletar o arquivo inteiro (ja nao e importado em lugar nenhum)

### 5. `src/components/guia-projeto/features/modules/IAFeatures.tsx`
- Remover `feature_tags` das strings de campos nas linhas 83 e 101

### 6. `src/components/guia-projeto/features/modules/cliente/AgentesIAClienteFeatures.tsx`
- Remover `"feature_tags"` do array de campos na linha 66

## Arquivos NAO alterados
- `src/integrations/supabase/types.ts` -- gerado automaticamente pelo Supabase, nao deve ser editado manualmente
- Banco de dados -- a coluna `feature_tags` permanece na tabela `ai_agents` sem impacto

