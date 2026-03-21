

# Plano: Upload de Avatar com validação 10MB e JPG/PNG/GIF

## O que muda

Dois pontos de upload de avatar precisam de ajuste:

### 1. Admin — TemplateForm (avatar padrão do template)

Atualmente é um campo de texto URL. Será substituído por um upload com dropzone idêntico ao do ISP.

**Arquivo**: `src/pages/admin/TemplateForm.tsx`
- Adicionar `react-dropzone` e lógica de upload para Supabase Storage (`agent-avatars/templates/{templateId}`)
- Substituir o `Input` de URL (linhas 208-217) por um componente de dropzone com preview
- Validação: `accept: image/jpeg, image/png, image/gif`, `maxSize: 10MB`
- No `handleSubmit`, fazer upload do arquivo antes de salvar e gravar a URL pública no campo `default_avatar_url`

### 2. ISP — AgentConfig (avatar customizado do ISP)

Já tem dropzone mas com limites errados.

**Arquivo**: `src/pages/painel/AgentConfig.tsx`
- Linha 59: Mudar accept de `image/*: [.png, .jpg, .jpeg, .webp]` para `image/jpeg, image/png, image/gif` com extensões `.jpg, .jpeg, .png, .gif`
- Linha 61: Mudar `maxSize` de `2 * 1024 * 1024` para `10 * 1024 * 1024`
- Adicionar feedback de erro ao usuário quando arquivo for rejeitado (tamanho ou formato)

### 3. Hook useAgentConfig — uploadAvatar

**Arquivo**: `src/hooks/painel/useAgentConfig.ts`
- Já funciona corretamente, sem alterações necessárias

### Arquivos afetados

| Ação | Arquivo |
|------|---------|
| Editar | `src/pages/admin/TemplateForm.tsx` — trocar input URL por dropzone + upload |
| Editar | `src/pages/painel/AgentConfig.tsx` — corrigir accept e maxSize |

