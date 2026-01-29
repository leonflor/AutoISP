
# Upload de Avatar no Template de Agente (Admin)

## Objetivo

Substituir o campo de URL de avatar por um componente de upload no formulário de criação/edição de templates de agentes no painel Admin. Este avatar servirá como padrão do template e será usado pelo ISP caso ele não envie uma imagem própria.

---

## Mudança na Interface

**Antes (campo de URL):**
```text
URL do Avatar
[https://...]
```

**Depois (componente de upload):**
```text
Avatar do Agente
┌──────────┐
│    🤖    │  [Fazer Upload] [Remover]
└──────────┘
JPG, PNG ou WEBP. Máx 2MB.
Será usado como padrão se o ISP não enviar avatar próprio.
```

---

## Arquivos a Modificar/Criar

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Criar | `src/components/admin/ai-agents/TemplateAvatarUpload.tsx` | Componente de upload para templates (sem dependência de ispId) |
| Modificar | `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Substituir campo URL pelo componente de upload |

---

## Seção Técnica

### Novo Componente: TemplateAvatarUpload

Adaptação do componente existente `AvatarUpload` para uso no contexto de admin:

```typescript
interface TemplateAvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  slug?: string; // Para organizar por template
}

// Storage path: templates/{slug ou uuid}/avatar-{uuid}.{ext}
// Bucket: agent-avatars (já existente)
```

**Diferenças do AvatarUpload original:**
- Não requer `ispId`
- Usa path `templates/` em vez de `{ispId}/`
- Opcionalmente usa o `slug` do agente para organização

### Modificação no AgentTemplateForm.tsx

**Importação:**
```typescript
import { TemplateAvatarUpload } from './TemplateAvatarUpload';
```

**Substituir campo (linhas 361-373):**

De:
```tsx
<FormField
  control={form.control}
  name="avatar_url"
  render={({ field }) => (
    <FormItem>
      <FormLabel>URL do Avatar</FormLabel>
      <FormControl>
        <Input placeholder="https://..." {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

Para:
```tsx
<FormField
  control={form.control}
  name="avatar_url"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Avatar do Agente</FormLabel>
      <FormControl>
        <TemplateAvatarUpload
          value={field.value}
          onChange={field.onChange}
          slug={form.watch('slug')}
        />
      </FormControl>
      <FormDescription>
        Será usado como padrão se o ISP não enviar avatar próprio.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Fluxo de Dados

```text
1. Admin cria/edita template de agente
2. Faz upload de imagem de avatar
3. Imagem salva em: agent-avatars/templates/{slug}/{uuid}.{ext}
4. URL pública armazenada em ai_agents.avatar_url
5. Quando ISP ativa agente:
   - Se enviar avatar próprio → usa avatar do ISP
   - Se não enviar → usa ai_agents.avatar_url do template
   - Se template também não tiver → usa platform_config.default_agent_avatar
```

---

## Validações

- Formatos aceitos: JPG, PNG, WEBP
- Tamanho máximo: 2MB
- Preview visual no componente
- Botão de remover disponível quando há imagem
