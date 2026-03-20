

# Plano: Painel de ISPs (`/admin/isps`)

## Resumo

Expandir a página existente `/admin/isps` com métricas reais e criar página de detalhe `/admin/isps/:id` com informações do agente, ERP, base de conhecimento e estatísticas de conversas. Usar terminologia "ISP" em todo lugar (não "tenant").

## 1. Rotas

- **`App.tsx`**: Adicionar rota `isps/:id` dentro de `/admin` para a página de detalhe

Sidebar já tem item "ISPs" apontando para `/admin/isps` — sem alteração necessária.

## 2. Expandir página existente `/admin/isps`

**`src/pages/admin/Isps.tsx`** — atualizar tabela para incluir colunas extras:

- Agente ativo (template name)
- ERP configurado (provider)
- Total conversas (30d)
- Taxa resolução bot (%)
- Status

Clique na linha → navega para `/admin/isps/:id`

## 3. Hook `useIspDetail`

**`src/hooks/admin/useIspDetail.ts`**

- Query de detalhe por ID com métricas 7d e 30d:
  - Total conversas, resolução bot (%), handovers, tempo médio
- Info do agente: template, nome custom, avatar, whatsapp config
- ERP: provider, base URL mascarada
- Knowledge base: count docs + tamanho

## 4. Página de Detalhe `/admin/isps/:id`

**`src/pages/admin/IspDetail.tsx`**

### Cards de Métricas (7d e 30d)
- Total conversas, Taxa resolução bot (%), Tempo médio atendimento, Handovers humano
- Queries reais em `conversations` filtradas por `isp_id`

### Seção "Agente Configurado"
- Template em uso (link para `/admin/templates`)
- Nome e avatar customizados
- WhatsApp configurado (sim/não)

### Seção "ERP"
- Provider e URL mascarada
- Botão "Testar conexão" → `supabase.functions.invoke('test-erp', { body: { isp_id, is_test: true } })`

### Seção "Base de Conhecimento"
- Count de documentos + tamanho total
- Botão "Forçar reindexação" (toast placeholder)

## 5. Sem Migration

RLS já cobre `super_admin` para todas as tabelas envolvidas.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/hooks/admin/useIspDetail.ts` |
| Criar | `src/pages/admin/IspDetail.tsx` |
| Editar | `src/pages/admin/Isps.tsx` — adicionar colunas de métricas e navegação |
| Editar | `src/hooks/useIsps.ts` — incluir joins para agente/ERP/conversas |
| Editar | `src/App.tsx` — adicionar rota `isps/:id` |

