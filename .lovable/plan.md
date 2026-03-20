

# Plano: Área Admin — Gerenciamento de Templates

## Resumo

Adicionar página `/admin/templates` com CRUD completo de `agent_templates`, integrando-se ao layout admin existente (`AdminLayout` + `AdminSidebar`). Inclui sidebar atualizada, página de listagem com cards, e formulário em drawer com todos os campos solicitados.

## 1. Migration SQL — RLS para agent_templates

A tabela `agent_templates` existe mas **não tem policies de INSERT/UPDATE/DELETE para super_admin**. Adicionar:

```sql
CREATE POLICY "Super admins can manage agent templates"
ON public.agent_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));
```

## 2. Atualizar AdminSidebar

Adicionar item "Templates" (icon `Bot`) no menu, apontando para `/admin/templates`, entre "Ferramentas IA" e "Relatórios".

## 3. Criar hook `useAgentTemplates`

**`src/hooks/admin/useAgentTemplates.ts`**

- `useQuery` para listar todos os templates (sem filtro `is_active`, admin vê tudo)
- Para cada template, fazer count de `procedures` e `tenant_agents` vinculados (usar subquery ou queries separadas)
- `useMutation` para insert/update em `agent_templates`
- Invalidar query após mutação

## 4. Criar página `/admin/templates`

**`src/pages/admin/Templates.tsx`**

- Grid de cards (responsive: 1-3 colunas)
- Cada card mostra: nome, tipo (badge), temperatura, tom, nº procedures, nº tenants usando, toggle ativo/inativo
- Botão "Novo Template" no header
- Botão editar em cada card
- Ao desativar template em uso: dialog de confirmação mostrando quantos tenants serão afetados

## 5. Criar formulário de template

**`src/components/admin/templates/TemplateFormDrawer.tsx`**

Drawer (Sheet) com campos:
- Nome (input)
- Tipo (select: atendente_geral, suporte_n2, financeiro, comercial)
- System prompt base (textarea grande) + chips clicáveis para variáveis (`{agent_name}`, `{tenant_name}`, `{current_date}`, `{current_time}`)
- Temperatura (Slider 0.0–1.0 + valor numérico)
- Tom de voz (select: profissional, amigável, formal, descontraído)
- Nome padrão do agente (input)
- URL avatar padrão (input) + preview circular (Avatar)
- Máx tentativas de intenção (input number 1–10)
- Mensagem de falha de intenção (textarea)
- Toggle ativo/inativo

## 6. Registrar rota no App.tsx

Adicionar lazy import de `Templates` e rota `<Route path="templates" element={<TemplatesPage />} />` dentro do bloco `/admin`.

## Detalhes Técnicos

- **Proteção de rota**: já existe via `AdminLayout` que verifica `super_admin` — não precisa de novo hook
- **Chips de variáveis**: ao clicar, inserir texto na posição do cursor do textarea usando `useRef` + `selectionStart`
- **Contagem de tenants/procedures**: queries paralelas com `.select('id', { count: 'exact', head: true }).eq('template_id', id)` para cada template, ou uma query agregada
- **Supabase types**: `agent_templates` já existe no schema gerado, pode usar diretamente via `supabase.from('agent_templates')`

## Arquivos

| Ação | Arquivo |
|------|---------|
| Migration | RLS policies para `agent_templates` |
| Criar | `src/hooks/admin/useAgentTemplates.ts` |
| Criar | `src/pages/admin/Templates.tsx` |
| Criar | `src/components/admin/templates/TemplateFormDrawer.tsx` |
| Editar | `src/components/admin/AdminSidebar.tsx` — adicionar item Templates |
| Editar | `src/App.tsx` — adicionar rota `/admin/templates` |

