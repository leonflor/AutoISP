

# Auditoria de Inconsistencies, Redundancias e Codigo Obsoleto

## Problemas Encontrados

### 1. Codigo Frontend Morto (Dead Code) — `src/lib/`

Tres modulos inteiros em `src/lib/` nao sao importados por nenhum arquivo do projeto:

| Arquivo | Problema |
|---------|----------|
| `src/lib/llm/tool-executor.ts` | Nunca importado. A execucao real de tools acontece no edge function via `_shared/tool-handlers.ts` |
| `src/lib/llm/tool-result-formatter.ts` | Nunca importado |
| `src/lib/llm/tools.ts` (`llmTools`) | Nunca importado. O catalogo real esta em `supabase/functions/_shared/tool-catalog.ts` |
| `src/lib/erp/factory.ts` | So importado por `tool-executor.ts` (tambem morto) |
| `src/lib/erp/types.ts` | So importado por `tool-executor.ts` e `tool-result-formatter.ts` (ambos mortos) |
| `src/lib/erp/adapters/ixcsoft.ts` | So importado por `factory.ts` (morto) |

**Acao**: Remover toda a arvore `src/lib/llm/` e `src/lib/erp/`. Esses modulos sao duplicatas frontend de logica que roda exclusivamente no Supabase Edge Functions.

### 2. Duplicacao Massiva — Analytics Pages

`src/pages/painel/Analytics.tsx` e `src/pages/admin/Analytics.tsx` compartilham ~90% do codigo:
- `KpiCard` — componente identico duplicado nos dois arquivos
- `ConversationHistoryDialog` — componente identico duplicado nos dois arquivos
- Toda a estrutura de charts e tabela e identica

**Acao**: Extrair `KpiCard` e `ConversationHistoryDialog` para `src/components/analytics/` como componentes compartilhados. Extrair o layout de charts para um componente `AnalyticsDashboard` que receba os dados como props, usado por ambas as pages.

### 3. Import Nao Utilizado — `Cell` do Recharts

`src/pages/painel/Analytics.tsx` importa `Cell` do recharts mas nunca o usa.

**Acao**: Remover `Cell` do import.

### 4. Duplicacao de Catalogo de Tools

Existem dois catalogos de tools com estruturas diferentes:
- `src/constants/tool-catalog.ts` — Array de `ToolCatalogEntry` (frontend display)
- `supabase/functions/_shared/tool-catalog.ts` — Record de `ToolDefinition` (runtime)

Os campos diferem (`parameters` vs `parameters_schema`) e podem ficar dessincronizados facilmente.

**Acao**: Manter ambos (frontend nao pode importar Deno modules), mas adicionar comentario de sincronizacao no frontend mirror. Ou gerar o frontend mirror a partir de um script.

### 5. Re-export Desnecessario — `use-toast.ts`

`src/components/ui/use-toast.ts` e apenas um re-export de `src/hooks/use-toast.ts`. Nenhum arquivo importa de `@/components/ui/use-toast`, tornando-o morto.

**Acao**: Remover `src/components/ui/use-toast.ts`.

### 6. Inconsistencia de Nomes — Rotas Mixando PT/EN

Rotas admin misturam portugues e ingles sem padrao:
- PT: `planos`, `financeiro`, `faturas`, `assinaturas`, `usuarios`, `suporte`, `relatorios`
- EN: `isps`, `tickets`, `ai-tools`, `templates`, `procedures`, `whatsapp`, `analytics`, `config`

Rotas painel tambem:
- PT: `assinantes`, `atendimentos`, `comunicacao`, `faturas`, `relatorios`, `configuracoes`
- EN: `whatsapp`, `agent-config`, `knowledge-base`, `erp-config`, `analytics`

**Acao**: Definir convencao e padronizar. Recomendacao: manter tudo em portugues (ja e a maioria) ou tudo em ingles. Mudanca de rotas requer redirects, entao pode ser feito incrementalmente.

### 7. Inconsistencia de Nomes — Hooks e Tipos

- Hook `useConversationAnalytics` esta em `src/hooks/painel/` mas e usado tanto pelo admin quanto pelo painel. Deveria estar em `src/hooks/` (raiz).
- Tipo `Period` esta definido em 3 lugares: no hook e em cada page de analytics.

**Acao**: Mover hook para `src/hooks/useConversationAnalytics.ts`. Exportar `Period` do hook e reusar nas pages.

### 8. `as any` Type Casts nas Views

O hook `useConversationAnalytics` usa `.from('conversation_stats' as any)` porque as views nao estao no tipo gerado do Supabase. Isso e esperado (views nao aparecem no tipo automatico), mas prejudica type safety.

**Acao**: Aceitar como limitacao conhecida. Ja esta mitigado com type assertions nos retornos.

### 9. `simulate-agent` Edge Function — Ja Existia Antes

O arquivo `supabase/functions/simulate-agent/index.ts` ja estava no `config.toml` antes de ser criado na sessao anterior, mas isso foi corrigido.

**Nenhuma acao necessaria**.

---

## Plano de Implementacao

| Prioridade | Tarefa | Arquivos |
|------------|--------|----------|
| Alta | Remover dead code `src/lib/llm/` e `src/lib/erp/` | 6 arquivos deletados |
| Alta | Extrair componentes compartilhados de Analytics | Criar `src/components/analytics/KpiCard.tsx`, `ConversationHistoryDialog.tsx`; editar ambas pages |
| Media | Remover import `Cell` nao usado | `src/pages/painel/Analytics.tsx` |
| Media | Remover re-export morto `use-toast` | `src/components/ui/use-toast.ts` |
| Media | Mover `useConversationAnalytics` para `src/hooks/` | Mover arquivo + atualizar 2 imports |
| Baixa | Padronizar nomenclatura de rotas | Multiplos arquivos (breaking change, requer planejamento) |

