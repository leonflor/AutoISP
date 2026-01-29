
# Corrigir Upload de Avatar - Criar Bucket

## Problema Identificado

O componente `TemplateAvatarUpload.tsx` tenta fazer upload para o bucket `agent-avatars`, que **não existe** no Storage do Supabase. Isso faz com que qualquer tentativa de upload falhe silenciosamente ou com erro.

---

## Solução

Criar o bucket `agent-avatars` com as políticas RLS necessárias para permitir:
1. **Admins da plataforma** fazerem upload/gerenciamento de avatares de templates
2. **ISPs** fazerem upload de avatares personalizados (para seus agentes)
3. **Leitura pública** para exibição dos avatares

---

## Arquivos a Modificar

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Criar | `supabase/migrations/xxx_create_agent_avatars_bucket.sql` | Criar bucket e políticas RLS |

---

## Seção Técnica

### Migration SQL

```sql
-- Criar bucket agent-avatars (público para leitura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-avatars', 'agent-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Leitura pública
CREATE POLICY "Agent avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-avatars');

-- Política: Upload para superadmins (templates)
CREATE POLICY "Superadmins can upload agent template avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] = 'templates'
  AND public.has_role(auth.uid(), 'superadmin')
);

-- Política: Update para superadmins
CREATE POLICY "Superadmins can update agent template avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] = 'templates'
  AND public.has_role(auth.uid(), 'superadmin')
);

-- Política: Delete para superadmins
CREATE POLICY "Superadmins can delete agent template avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] = 'templates'
  AND public.has_role(auth.uid(), 'superadmin')
);

-- Políticas para ISPs (avatares customizados)
CREATE POLICY "ISP admins can upload custom agent avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] != 'templates'
  AND (storage.foldername(name))[1] != 'platform'
  AND public.is_isp_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "ISP admins can update custom agent avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] != 'templates'
  AND (storage.foldername(name))[1] != 'platform'
  AND public.is_isp_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "ISP admins can delete custom agent avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] != 'templates'
  AND (storage.foldername(name))[1] != 'platform'
  AND public.is_isp_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
);
```

---

## Estrutura de Pastas no Bucket

```text
agent-avatars/
├── templates/           # Avatares padrão dos templates (superadmin)
│   ├── atendente/
│   ├── cobrador/
│   └── vendedor/
├── platform/            # Avatar padrão global (superadmin)
└── {isp_id}/            # Avatares customizados por ISP
    └── agents/
```

---

## Após Implementação

1. Criar a migration com o SQL acima
2. Testar upload de avatar no formulário de template (Admin > IA > Agentes)
3. Verificar se o arquivo aparece no Storage e a URL é salva no registro
