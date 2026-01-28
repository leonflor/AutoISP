import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type KnowledgeBase = Database["public"]["Tables"]["agent_knowledge_base"]["Row"];

export interface KnowledgeBaseForm {
  question: string;
  answer: string;
  category?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export function useAgentKnowledge(ispAgentId: string | null) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Listar Q&A do agente
  const knowledgeQuery = useQuery({
    queryKey: ["agent-knowledge", ispAgentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_knowledge_base")
        .select("*")
        .eq("isp_agent_id", ispAgentId!)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as KnowledgeBase[];
    },
    enabled: !!ispAgentId,
  });

  // Buscar categorias únicas
  const categoriesQuery = useQuery({
    queryKey: ["agent-knowledge-categories", ispAgentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_knowledge_base")
        .select("category")
        .eq("isp_agent_id", ispAgentId!)
        .not("category", "is", null);

      if (error) throw error;
      
      const categories = [...new Set((data || []).map((d) => d.category).filter(Boolean))];
      return categories as string[];
    },
    enabled: !!ispAgentId,
  });

  // Criar Q&A
  const createKnowledge = useMutation({
    mutationFn: async (form: KnowledgeBaseForm) => {
      const { data, error } = await supabase
        .from("agent_knowledge_base")
        .insert({
          isp_agent_id: ispAgentId!,
          question: form.question,
          answer: form.answer,
          category: form.category || null,
          sort_order: form.sort_order || 0,
          is_active: form.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge", ispAgentId] });
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge-categories", ispAgentId] });
      toast({ title: "Pergunta adicionada com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar pergunta",
        description: error.message,
      });
    },
  });

  // Atualizar Q&A
  const updateKnowledge = useMutation({
    mutationFn: async (data: { id: string; form: Partial<KnowledgeBaseForm> }) => {
      const { data: result, error } = await supabase
        .from("agent_knowledge_base")
        .update({
          question: data.form.question,
          answer: data.form.answer,
          category: data.form.category,
          sort_order: data.form.sort_order,
          is_active: data.form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge", ispAgentId] });
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge-categories", ispAgentId] });
      toast({ title: "Pergunta atualizada com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar pergunta",
        description: error.message,
      });
    },
  });

  // Deletar Q&A
  const deleteKnowledge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agent_knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge", ispAgentId] });
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge-categories", ispAgentId] });
      toast({ title: "Pergunta removida com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover pergunta",
        description: error.message,
      });
    },
  });

  // Importar múltiplas Q&As
  const importKnowledge = useMutation({
    mutationFn: async (items: KnowledgeBaseForm[]) => {
      const records = items.map((item, idx) => ({
        isp_agent_id: ispAgentId!,
        question: item.question,
        answer: item.answer,
        category: item.category || null,
        sort_order: idx,
        is_active: true,
      }));

      const { data, error } = await supabase
        .from("agent_knowledge_base")
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge", ispAgentId] });
      queryClient.invalidateQueries({ queryKey: ["agent-knowledge-categories", ispAgentId] });
      toast({ title: `${data?.length || 0} perguntas importadas com sucesso!` });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao importar perguntas",
        description: error.message,
      });
    },
  });

  // Stats
  const stats = knowledgeQuery.data
    ? {
        total: knowledgeQuery.data.length,
        active: knowledgeQuery.data.filter((k) => k.is_active).length,
        byCategory: categoriesQuery.data?.reduce((acc, cat) => {
          acc[cat] = knowledgeQuery.data.filter((k) => k.category === cat).length;
          return acc;
        }, {} as Record<string, number>) || {},
      }
    : null;

  return {
    knowledge: knowledgeQuery.data,
    categories: categoriesQuery.data,
    stats,
    isLoading: knowledgeQuery.isLoading,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    importKnowledge,
    refetch: knowledgeQuery.refetch,
  };
}
