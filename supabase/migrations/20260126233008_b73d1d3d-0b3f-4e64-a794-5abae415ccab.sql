-- =========================================================================
-- FIX: Add UPDATE and DELETE policies for platform_config table
-- Super admins need these to save configuration changes
-- =========================================================================

-- Super admins can update platform config
CREATE POLICY "Super admins can update platform config"
  ON public.platform_config FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- Super admins can delete platform config
CREATE POLICY "Super admins can delete platform config"
  ON public.platform_config FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));