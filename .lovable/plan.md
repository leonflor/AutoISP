
# Corrigir Fallback de Avatar do Template nos Dialogs de Agentes

## Problema Identificado

Ao remover o avatar customizado nas configurações ou ao ativar um novo agente, o avatar do template não está sendo exibido como fallback. Isso ocorre porque:

1. No `AgentActivationDialog`, o `defaultAvatar` só considera a configuração global da plataforma, ignorando o avatar do template do agente
2. A plataforma não tem um `default_agent_avatar` configurado, então o fallback final é uma string vazia

## Solução

Ajustar os dois dialogs para seguir a hierarquia correta de avatares:
1. Avatar customizado do ISP (se houver)
2. Avatar do template (se houver)
3. Avatar padrão da plataforma (se houver)
4. Ícone fallback

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/painel/ai/AgentActivationDialog.tsx` | Usar avatar do template como fallback |

---

## Seção Técnica

### Mudança no AgentActivationDialog.tsx

Na linha 253-258, o componente `AvatarUpload` recebe apenas o avatar da plataforma como `defaultAvatar`. Precisa incluir o avatar do template:

**Antes:**
```tsx
<AvatarUpload
  value={form.watch("avatar_url") || ""}
  onChange={(url) => form.setValue("avatar_url", url, { shouldDirty: true })}
  ispId={membership?.ispId || ""}
  defaultAvatar={defaultAvatar}
/>
```

**Depois:**
```tsx
<AvatarUpload
  value={form.watch("avatar_url") || ""}
  onChange={(url) => form.setValue("avatar_url", url, { shouldDirty: true })}
  ispId={membership?.ispId || ""}
  defaultAvatar={agent?.avatar_url || defaultAvatar}
/>
```

---

## Hierarquia de Avatares Corrigida

```
AgentActivationDialog (Novo Agente):
1. form.avatar_url (upload customizado durante ativação)
2. agent.avatar_url (template)
3. platform_config.default_agent_avatar (plataforma)

AgentConfigDialog (Configurar Agente Ativo):
1. form.avatar_url (upload customizado existente ou novo)
2. agent.ai_agents.avatar_url (template)
3. platform_config.default_agent_avatar (plataforma)
```

---

## Fluxo Corrigido

```
ANTES (ativação):
1. Usuário abre dialog para ativar "Atendente Virtual"
2. Template tem avatar configurado
3. Preview mostra: ícone genérico (User) ❌
4. Usuário não faz upload
5. Agente salvo sem avatar customizado

DEPOIS (ativação):
1. Usuário abre dialog para ativar "Atendente Virtual"
2. Template tem avatar configurado
3. Preview mostra: avatar do template ✅
4. Usuário não faz upload (já está bom)
5. Agente salvo, listagem mostra avatar do template

ANTES (configuração - remover avatar):
1. Usuário abre configurações do agente ativo
2. Clica "Remover" no avatar
3. Preview mostra: avatar do template ✅ (já funciona)
4. Salva
5. Listagem mostra: avatar do template ✅ (já funciona)
```

O `AgentConfigDialog` já está correto (linha 143). Apenas o `AgentActivationDialog` precisa de ajuste.
