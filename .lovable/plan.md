
# Substituir Input de URL por AvatarUpload no AgentConfigDialog

## Problema

No dialog de configuração de agentes ativos ("Meus Agentes" → Configurar), o avatar ainda é configurado via campo de texto URL, enquanto o padrão no dialog de ativação já usa o componente `AvatarUpload` com cropper.

## Solução

Substituir o campo `Input` por `AvatarUpload`, seguindo exatamente o mesmo padrão do `AgentActivationDialog`.

---

## Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/painel/ai/AgentConfigDialog.tsx` | Substituir input URL por AvatarUpload |

---

## Seção Técnica

### Mudanças no AgentConfigDialog.tsx

1. **Adicionar imports:**
```tsx
import { AvatarUpload } from "./AvatarUpload";
import { usePlatformConfig } from "@/hooks/usePlatformConfig";
```

2. **Obter configurações globais:**
```tsx
const { configMap } = usePlatformConfig();
const defaultAvatar = (configMap?.default_agent_avatar?.value as string) || '';
```

3. **Substituir o input URL pelo componente AvatarUpload:**

**Antes (linhas 133-140):**
```tsx
<div className="space-y-2">
  <Label htmlFor="avatar_url">URL do Avatar (opcional)</Label>
  <Input
    id="avatar_url"
    placeholder="https://exemplo.com/avatar.png"
    {...form.register("avatar_url")}
  />
</div>
```

**Depois:**
```tsx
<div className="space-y-2">
  <Label>Avatar do Agente</Label>
  <AvatarUpload
    value={form.watch("avatar_url") || ""}
    onChange={(url) => form.setValue("avatar_url", url, { shouldDirty: true })}
    ispId={agent.isp_id}
    defaultAvatar={agent.ai_agents.default_avatar_url || defaultAvatar}
  />
</div>
```

### Fontes de Dados
- **`ispId`**: vem de `agent.isp_id` (do registro `isp_agents`)
- **`defaultAvatar`**: hierarquia → template (`ai_agents.default_avatar_url`) > platform config (`default_agent_avatar`)

---

## Resultado

```
ANTES:
- Campo de texto para colar URL manualmente
- Sem preview nem validação visual

DEPOIS:
- Botão "Fazer Upload" → Abre dialog de crop
- Preview do avatar atual
- Botão "Remover" para limpar
- Mesmo comportamento do dialog de ativação
```
