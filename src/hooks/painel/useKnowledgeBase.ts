import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIspMembership } from '@/hooks/useIspMembership';
import { toast } from 'sonner';

interface KnowledgeBaseItem {
  id: string;
  tenant_agent_id: string;
  source_type: string | null;
  title: string | null;
  content: string;
  status: string;
  file_url: string | null;
  file_size: number | null;
  parent_id: string | null;
  error_message: string | null;
  created_at: string | null;
}

export function useKnowledgeBase() {
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;
  const queryClient = useQueryClient();

  // Get tenant agent id
  const { data: tenantAgent } = useQuery({
    queryKey: ['tenant-agent', ispId],
    queryFn: async () => {
      if (!ispId) return null;
      const { data, error } = await supabase
        .from('tenant_agents')
        .select('id')
        .eq('isp_id', ispId)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!ispId,
  });

  const tenantAgentId = tenantAgent?.id;

  // Query all knowledge base items (exclude child chunks)
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['knowledge-base', tenantAgentId],
    queryFn: async () => {
      if (!tenantAgentId) return [];
      const { data, error } = await supabase
        .from('knowledge_bases')
        .select('id, tenant_agent_id, source_type, title, content, created_at, status, file_url, file_size, parent_id, error_message')
        .eq('tenant_agent_id', tenantAgentId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as KnowledgeBaseItem[];
    },
    enabled: !!tenantAgentId,
    refetchInterval: 10000, // poll for status changes
  });

  const faqs = items.filter(i => i.source_type === 'faq');
  const documents = items.filter(i => i.source_type === 'document');
  const urls = items.filter(i => i.source_type === 'url');
  const indexingCount = items.filter(i => i.status === 'indexing').length;

  const stats = {
    faqCount: faqs.filter(f => f.status === 'indexed').length,
    docCount: documents.filter(d => d.status === 'indexed').length,
    urlCount: urls.filter(u => u.status === 'indexed').length,
    indexingCount,
  };

  // Create FAQ
  const createFaq = useMutation({
    mutationFn: async ({ question, answer, category }: { question: string; answer: string; category?: string }) => {
      if (!tenantAgentId) throw new Error('Agente não configurado');
      const content = `Pergunta: ${question}\nResposta: ${answer}`;
      const { data, error } = await supabase
        .from('knowledge_bases')
        .insert({
          tenant_agent_id: tenantAgentId,
          source_type: 'faq',
          title: question,
          content,
          status: 'pending',
        })
        .select('id')
        .single();
      if (error) throw error;

      // Trigger embedding
      await supabase.functions.invoke('embed-content', {
        body: { knowledge_base_id: data.id },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', tenantAgentId] });
      toast.success('FAQ adicionada com sucesso');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Upload document
  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      if (!tenantAgentId) throw new Error('Agente não configurado');
      if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo excede 10MB');

      const filePath = `${tenantAgentId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('knowledge-docs')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      // Read file content (for text-based files)
      let content = '';
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        content = await file.text();
      } else {
        content = `[Documento: ${file.name}]`; // placeholder for binary files
      }

      const { data, error } = await supabase
        .from('knowledge_bases')
        .insert({
          tenant_agent_id: tenantAgentId,
          source_type: 'document',
          title: file.name,
          content,
          file_url: filePath,
          file_size: file.size,
          status: 'pending',
        })
        .select('id')
        .single();
      if (error) throw error;

      await supabase.functions.invoke('embed-content', {
        body: { knowledge_base_id: data.id },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', tenantAgentId] });
      toast.success('Documento enviado para indexação');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Add URL
  const addUrl = useMutation({
    mutationFn: async (url: string) => {
      if (!tenantAgentId) throw new Error('Agente não configurado');
      const { data, error } = await supabase
        .from('knowledge_bases')
        .insert({
          tenant_agent_id: tenantAgentId,
          source_type: 'url',
          title: url,
          content: url,
          status: 'pending',
        })
        .select('id')
        .single();
      if (error) throw error;

      await supabase.functions.invoke('embed-content', {
        body: { knowledge_base_id: data.id },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', tenantAgentId] });
      toast.success('URL adicionada para indexação');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Delete item
  const deleteItem = useMutation({
    mutationFn: async (item: KnowledgeBaseItem) => {
      // Remove file from storage if it's a document
      if (item.source_type === 'document' && item.file_url) {
        await supabase.storage.from('knowledge-docs').remove([item.file_url]);
      }
      // Delete children first (chunks), then parent
      await supabase.from('knowledge_bases').delete().eq('parent_id', item.id);
      const { error } = await supabase.from('knowledge_bases').delete().eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', tenantAgentId] });
      toast.success('Item removido');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    items, faqs, documents, urls,
    stats, isLoading, indexingCount,
    tenantAgentId,
    createFaq, uploadDocument, addUrl, deleteItem,
  };
}
