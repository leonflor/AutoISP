

# Plano: Transformar edição de Template em página dedicada

## O que muda

O formulário de edição/criação de template deixa de ser um drawer/modal (`Sheet`) e passa a ser uma página própria com rota dedicada e botão voltar.

## Implementação

### 1. Criar página `TemplateForm.tsx`

**Arquivo**: `src/pages/admin/TemplateForm.tsx`

- Reutilizar todo o conteúdo do formulário atual (`TemplateFormDrawer.tsx`), mas renderizado como página full dentro do `AdminLayout`
- Adicionar botão "Voltar" no topo com `useNavigate()` apontando para `/admin/templates`
- Usar `useParams()` para capturar o `id` do template (edição) ou ausência dele (criação)
- Carregar dados do template via `useAgentTemplates` quando houver `id`
- Após salvar com sucesso, `navigate('/admin/templates')`

### 2. Registrar rotas no App.tsx

Adicionar duas rotas dentro do bloco `<Route path="/admin">`:
```
<Route path="templates/novo" element={<TemplateFormPage />} />
<Route path="templates/:id" element={<TemplateFormPage />} />
```

### 3. Atualizar `Templates.tsx`

- Remover `TemplateFormDrawer` e seus estados (`drawerOpen`, `editing`)
- Botão "Novo Template" → `navigate('/admin/templates/novo')`
- Botão editar no card → `navigate(`/admin/templates/${t.id}`)`

### 4. Remover `TemplateFormDrawer.tsx`

Arquivo deixa de ser necessário após a migração.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/admin/TemplateForm.tsx` |
| Editar | `src/App.tsx` (2 rotas) |
| Editar | `src/pages/admin/Templates.tsx` (remover drawer, usar navigate) |
| Deletar | `src/components/admin/templates/TemplateFormDrawer.tsx` |

