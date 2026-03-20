CREATE POLICY "Super admins can insert procedures"
ON public.procedures FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update procedures"
ON public.procedures FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));