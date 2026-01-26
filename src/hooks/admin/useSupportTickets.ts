import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminSupportTicket {
  id: string;
  isp_id: string;
  isp: { name: string; slug: string } | null;
  user_id: string | null;
  subject: string;
  category: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assigned_to: string | null;
  assigned_user: { full_name: string; email: string } | null;
  first_response_at: string | null;
  sla_response_hours: number;
  sla_resolution_hours: number;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  user: { full_name: string; email: string } | null;
  is_staff: boolean;
  message: string;
  attachments: { name: string; url: string }[];
  created_at: string;
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  user_id: string;
  user: { full_name: string } | null;
  content: string;
  created_at: string;
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
}

export interface TicketStats {
  open: number;
  in_progress: number;
  sla_critical: number;
  resolved_today: number;
}

// Hook para listar tickets com filtros
export function useAdminSupportTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ['admin-support-tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          isp:isps(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assigned_to && filters.assigned_to !== 'all') {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Buscar informações dos usuários atribuídos separadamente
      const assignedIds = [...new Set(data?.filter(t => t.assigned_to).map(t => t.assigned_to) || [])];
      let assignedUsersMap: Record<string, { full_name: string; email: string }> = {};
      
      if (assignedIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', assignedIds);
        
        if (profiles) {
          assignedUsersMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name || 'Usuário', email: p.email };
            return acc;
          }, {} as Record<string, { full_name: string; email: string }>);
        }
      }

      return (data || []).map(ticket => ({
        ...ticket,
        assigned_user: ticket.assigned_to ? assignedUsersMap[ticket.assigned_to] || null : null,
        priority: ticket.priority || 'normal',
        status: ticket.status || 'open',
        sla_response_hours: ticket.sla_response_hours || 24,
        sla_resolution_hours: ticket.sla_resolution_hours || 72,
      })) as AdminSupportTicket[];
    },
  });
}

// Hook para estatísticas de tickets
export function useTicketStats() {
  return useQuery({
    queryKey: ['admin-ticket-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('id, status, created_at, sla_response_hours, first_response_at, resolved_at');

      if (error) throw error;

      const now = new Date();
      let slaCritical = 0;
      let resolvedToday = 0;

      tickets?.forEach(ticket => {
        // Verificar SLA crítico (< 25% do tempo restante)
        if (ticket.status !== 'resolved' && ticket.status !== 'closed' && !ticket.first_response_at) {
          const createdAt = new Date(ticket.created_at);
          const slaHours = ticket.sla_response_hours || 24;
          const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
          const remaining = deadline.getTime() - now.getTime();
          const total = slaHours * 60 * 60 * 1000;
          const percentRemaining = (remaining / total) * 100;
          
          if (percentRemaining < 25) {
            slaCritical++;
          }
        }

        // Verificar resolvidos hoje
        if (ticket.resolved_at) {
          const resolvedDate = new Date(ticket.resolved_at);
          if (resolvedDate >= today) {
            resolvedToday++;
          }
        }
      });

      const stats: TicketStats = {
        open: tickets?.filter(t => t.status === 'open').length || 0,
        in_progress: tickets?.filter(t => t.status === 'in_progress' || t.status === 'waiting').length || 0,
        sla_critical: slaCritical,
        resolved_today: resolvedToday,
      };

      return stats;
    },
  });
}

// Hook para detalhe de um ticket
export function useTicketDetail(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['admin-ticket-detail', ticketId],
    queryFn: async () => {
      if (!ticketId) throw new Error('Ticket ID required');

      // Buscar ticket com ISP
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          isp:isps(id, name, slug, status, email, phone)
        `)
        .eq('id', ticketId)
        .single();

      if (ticketError) throw ticketError;

      // Buscar subscription e plano do ISP
      let subscription = null;
      if (ticket.isp_id) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*, plan:plans(name)')
          .eq('isp_id', ticket.isp_id)
          .single();
        subscription = sub;
      }

      // Buscar usuário atribuído
      let assignedUser = null;
      if (ticket.assigned_to) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', ticket.assigned_to)
          .single();
        assignedUser = profile;
      }

      // Buscar usuário que criou o ticket
      let createdByUser = null;
      if (ticket.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', ticket.user_id)
          .single();
        createdByUser = profile;
      }

      return {
        ...ticket,
        subscription,
        assigned_user: assignedUser,
        created_by_user: createdByUser,
        priority: ticket.priority || 'normal',
        status: ticket.status || 'open',
        sla_response_hours: ticket.sla_response_hours || 24,
        sla_resolution_hours: ticket.sla_resolution_hours || 72,
      };
    },
    enabled: !!ticketId,
  });
}

// Hook para mensagens de um ticket
export function useTicketMessages(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['admin-ticket-messages', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];

      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Buscar perfis dos usuários
      const userIds = [...new Set(data?.filter(m => m.user_id).map(m => m.user_id) || [])];
      let usersMap: Record<string, { full_name: string; email: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (profiles) {
          usersMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name || 'Usuário', email: p.email };
            return acc;
          }, {} as Record<string, { full_name: string; email: string }>);
        }
      }

      return (data || []).map(msg => ({
        ...msg,
        user: msg.user_id ? usersMap[msg.user_id] || null : null,
        attachments: (msg.attachments as { name: string; url: string }[]) || [],
      })) as TicketMessage[];
    },
    enabled: !!ticketId,
  });
}

// Hook para notas internas de um ticket
export function useTicketNotes(ticketId: string | undefined) {
  return useQuery({
    queryKey: ['admin-ticket-notes', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];

      const { data, error } = await supabase
        .from('support_ticket_notes')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Buscar perfis dos usuários
      const userIds = [...new Set(data?.filter(n => n.user_id).map(n => n.user_id) || [])];
      let usersMap: Record<string, { full_name: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        if (profiles) {
          usersMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name || 'Usuário' };
            return acc;
          }, {} as Record<string, { full_name: string }>);
        }
      }

      return (data || []).map(note => ({
        ...note,
        user: note.user_id ? usersMap[note.user_id] || null : null,
      })) as TicketNote[];
    },
    enabled: !!ticketId,
  });
}

// Hook para enviar mensagem
export function useSendTicketMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('support_ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          is_staff: true,
        });

      if (error) throw error;

      // Atualizar first_response_at se for a primeira resposta do staff
      const { data: ticket } = await supabase
        .from('support_tickets')
        .select('first_response_at')
        .eq('id', ticketId)
        .single();

      if (!ticket?.first_response_at) {
        await supabase
          .from('support_tickets')
          .update({ 
            first_response_at: new Date().toISOString(),
            status: 'in_progress'
          })
          .eq('id', ticketId);
      }
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-messages', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-detail', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      toast({ title: 'Mensagem enviada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao enviar mensagem', description: error.message, variant: 'destructive' });
    },
  });
}

// Hook para adicionar nota interna
export function useAddTicketNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('support_ticket_notes')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-notes', ticketId] });
      toast({ title: 'Nota adicionada' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar nota', description: error.message, variant: 'destructive' });
    },
  });
}

// Hook para atualizar status/prioridade/atendente do ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      updates 
    }: { 
      ticketId: string; 
      updates: { 
        status?: string; 
        priority?: string; 
        assigned_to?: string | null;
      } 
    }) => {
      const updateData: Record<string, unknown> = { ...updates };
      
      // Se resolvendo, adicionar data de resolução
      if (updates.status === 'resolved' || updates.status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
    },
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-detail', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-stats'] });
      toast({ title: 'Ticket atualizado' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar ticket', description: error.message, variant: 'destructive' });
    },
  });
}

// Hook para listar usuários disponíveis para atribuição
export function useAvailableAgents() {
  return useQuery({
    queryKey: ['available-agents'],
    queryFn: async () => {
      // Buscar usuários com roles admin ou support
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['super_admin', 'admin', 'support']);

      if (rolesError) throw rolesError;

      const userIds = [...new Set(roles?.map(r => r.user_id) || [])];
      
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    },
  });
}

// Hook para configurações de SLA
export function useSLAConfigs() {
  return useQuery({
    queryKey: ['sla-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sla_configs')
        .select('*, plan:plans(name)')
        .order('category');

      if (error) throw error;
      return data || [];
    },
  });
}

// Hook para atualizar configuração de SLA
export function useUpdateSLAConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id, 
      response_hours, 
      resolution_hours 
    }: { 
      id: string; 
      response_hours: number; 
      resolution_hours: number;
    }) => {
      const { error } = await supabase
        .from('sla_configs')
        .update({ response_hours, resolution_hours })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-configs'] });
      toast({ title: 'SLA atualizado' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar SLA', description: error.message, variant: 'destructive' });
    },
  });
}
