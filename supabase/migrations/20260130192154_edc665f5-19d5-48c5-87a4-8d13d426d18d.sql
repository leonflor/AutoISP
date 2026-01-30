-- Tabela de logs detalhados de processamento de documentos
CREATE TABLE public.document_processing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES knowledge_documents(id) ON DELETE SET NULL,
  isp_id uuid NOT NULL REFERENCES isps(id) ON DELETE CASCADE,
  isp_agent_id uuid REFERENCES isp_agents(id) ON DELETE SET NULL,
  error_code text NOT NULL,
  error_message text NOT NULL,
  error_details jsonb,
  processing_step text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_processing_logs_isp ON document_processing_logs(isp_id);
CREATE INDEX idx_processing_logs_code ON document_processing_logs(error_code);
CREATE INDEX idx_processing_logs_created ON document_processing_logs(created_at DESC);

-- RLS: apenas super_admins podem ver
ALTER TABLE document_processing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all logs"
  ON document_processing_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Permitir insert via service role (edge function)
CREATE POLICY "Service role can insert logs"
  ON document_processing_logs FOR INSERT
  WITH CHECK (true);