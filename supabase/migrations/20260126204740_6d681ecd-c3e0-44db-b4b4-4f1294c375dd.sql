-- Política para admins e suporte visualizarem todos os perfis
-- Justificativa LGPD: Funcionários com papel administrativo têm acesso legítimo para atendimento ao cliente
CREATE POLICY "Admins and support can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'support')
  );

-- Política para membros ISP visualizarem colegas de equipe
-- Justificativa LGPD: Membros da mesma organização têm interesse legítimo em ver colegas para colaboração
CREATE POLICY "ISP members can view team profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.isp_users my_isp
      JOIN public.isp_users their_isp ON my_isp.isp_id = their_isp.isp_id
      WHERE my_isp.user_id = auth.uid()
        AND their_isp.user_id = profiles.id
        AND my_isp.is_active = true
        AND their_isp.is_active = true
    )
  );