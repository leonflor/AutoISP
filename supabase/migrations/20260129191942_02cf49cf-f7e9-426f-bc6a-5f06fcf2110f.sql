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
  AND public.has_role(auth.uid(), 'super_admin')
);

-- Política: Update para superadmins
CREATE POLICY "Superadmins can update agent template avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] = 'templates'
  AND public.has_role(auth.uid(), 'super_admin')
);

-- Política: Delete para superadmins
CREATE POLICY "Superadmins can delete agent template avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-avatars'
  AND (storage.foldername(name))[1] = 'templates'
  AND public.has_role(auth.uid(), 'super_admin')
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