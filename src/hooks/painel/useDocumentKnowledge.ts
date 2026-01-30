import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface KnowledgeDocument {
  id: string;
  isp_agent_id: string;
  isp_id: string;
  name: string;
  original_filename: string;
  storage_path: string;
  size_bytes: number;
  mime_type: string;
  status: "pending" | "processing" | "indexed" | "error";
  error_message: string | null;
  chunk_count: number;
  indexed_at: string | null;
  created_at: string;
  updated_at: string;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function useDocumentKnowledge(ispAgentId: string | null, ispId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Lista documentos do agente
  const documentsQuery = useQuery({
    queryKey: ["knowledge-documents", ispAgentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_documents")
        .select("*")
        .eq("isp_agent_id", ispAgentId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KnowledgeDocument[];
    },
    enabled: !!ispAgentId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if any document is processing
      const data = query.state.data as KnowledgeDocument[] | undefined;
      const hasProcessing = data?.some(d => d.status === "pending" || d.status === "processing");
      return hasProcessing ? 3000 : false;
    },
  });

  // Upload e cria documento
  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      if (!ispAgentId || !ispId) {
        throw new Error("Agent ID e ISP ID são obrigatórios");
      }

      // Validação de tipo
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error("Tipo de arquivo não suportado. Use PDF, TXT, DOCX ou ODT.");
      }

      // Validação de tamanho
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Arquivo muito grande. Máximo: 25MB");
      }

      // Gera path único
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${ispId}/${ispAgentId}/${timestamp}_${sanitizedName}`;

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from("knowledge-docs")
        .upload(storagePath, file);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Cria registro no banco
      const { data: doc, error: insertError } = await supabase
        .from("knowledge_documents")
        .insert({
          isp_agent_id: ispAgentId,
          isp_id: ispId,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
          original_filename: file.name,
          storage_path: storagePath,
          size_bytes: file.size,
          mime_type: file.type,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        // Tenta remover arquivo do storage em caso de erro
        await supabase.storage.from("knowledge-docs").remove([storagePath]);
        throw new Error(`Erro ao registrar documento: ${insertError.message}`);
      }

      // Dispara processamento em background
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.functions.invoke("process-document", {
        body: {
          document_id: doc.id,
          isp_agent_id: ispAgentId,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      return doc as KnowledgeDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents", ispAgentId] });
      toast({
        title: "Documento enviado!",
        description: "O processamento foi iniciado e você será notificado quando concluir.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message,
      });
    },
  });

  // Deletar documento
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Busca path do arquivo
      const { data: doc } = await supabase
        .from("knowledge_documents")
        .select("storage_path")
        .eq("id", documentId)
        .single();

      // Remove do banco (cascade deleta chunks)
      const { error } = await supabase
        .from("knowledge_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      // Remove arquivo do storage
      if (doc?.storage_path) {
        await supabase.storage.from("knowledge-docs").remove([doc.storage_path]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents", ispAgentId] });
      toast({ title: "Documento removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover documento",
        description: error.message,
      });
    },
  });

  // Reprocessar documento com erro
  const reprocessDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Atualiza status para pending
      const { error: updateError } = await supabase
        .from("knowledge_documents")
        .update({ status: "pending", error_message: null })
        .eq("id", documentId);

      if (updateError) throw updateError;

      // Deleta chunks existentes
      await supabase
        .from("document_chunks")
        .delete()
        .eq("document_id", documentId);

      // Dispara processamento
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.functions.invoke("process-document", {
        body: {
          document_id: documentId,
          isp_agent_id: ispAgentId,
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents", ispAgentId] });
      toast({
        title: "Reprocessamento iniciado",
        description: "O documento será processado novamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao reprocessar",
        description: error.message,
      });
    },
  });

  // Estatísticas
  const stats = documentsQuery.data
    ? {
        total: documentsQuery.data.length,
        indexed: documentsQuery.data.filter(d => d.status === "indexed").length,
        processing: documentsQuery.data.filter(d => d.status === "pending" || d.status === "processing").length,
        errors: documentsQuery.data.filter(d => d.status === "error").length,
        totalChunks: documentsQuery.data.reduce((sum, d) => sum + (d.chunk_count || 0), 0),
      }
    : null;

  return {
    documents: documentsQuery.data,
    stats,
    isLoading: documentsQuery.isLoading,
    uploadDocument,
    deleteDocument,
    reprocessDocument,
    refetch: documentsQuery.refetch,
  };
}

// Hook para verificar limites de documentos do plano
export function useDocumentLimits(ispId: string | null, agentId: string | null) {
  return useQuery({
    queryKey: ["document-limits", ispId, agentId],
    queryFn: async () => {
      // Busca subscription ativa
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("isp_id", ispId!)
        .eq("status", "ativa")
        .single();

      if (!subscription) {
        return { limit: 5, canUpload: true }; // Default se não tem subscription
      }

      // Busca limite do plano para este tipo de agente
      const { data: limits } = await supabase
        .from("ai_limits")
        .select("max_documents_per_agent")
        .eq("plan_id", subscription.plan_id)
        .eq("agent_id", agentId!)
        .single();

      return {
        limit: limits?.max_documents_per_agent ?? 5,
        canUpload: true, // Será verificado contra contagem atual
      };
    },
    enabled: !!ispId && !!agentId,
  });
}
