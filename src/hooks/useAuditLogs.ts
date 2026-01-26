import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  isp_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string;
  } | null;
  isp?: {
    name: string;
  } | null;
}

interface UseAuditLogsOptions {
  userId?: string;
  entityType?: string;
  action?: string;
  limit?: number;
}

export const useAuditLogs = (options: UseAuditLogsOptions = {}) => {
  const { userId, entityType, action, limit = 100 } = options;

  return useQuery({
    queryKey: ['audit-logs', { userId, entityType, action, limit }],
    queryFn: async () => {
      // Build query for audit_logs
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (action) {
        query = query.eq('action', action);
      }

      const { data: logsData, error: logsError } = await query;
      
      if (logsError) throw logsError;
      if (!logsData?.length) return [];

      // Get unique user IDs and ISP IDs
      const userIds = [...new Set(logsData.map(l => l.user_id).filter(Boolean))] as string[];
      const ispIds = [...new Set(logsData.map(l => l.isp_id).filter(Boolean))] as string[];

      // Fetch profiles for users
      let profilesMap: Record<string, { full_name: string | null; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = { full_name: p.full_name, email: p.email };
            return acc;
          }, {} as typeof profilesMap);
        }
      }

      // Fetch ISPs
      let ispsMap: Record<string, { name: string }> = {};
      if (ispIds.length > 0) {
        const { data: isps } = await supabase
          .from('isps')
          .select('id, name')
          .in('id', ispIds);
        
        if (isps) {
          ispsMap = isps.reduce((acc, i) => {
            acc[i.id] = { name: i.name };
            return acc;
          }, {} as typeof ispsMap);
        }
      }

      // Combine data
      const enrichedLogs: AuditLog[] = logsData.map(log => ({
        id: log.id,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        user_id: log.user_id,
        isp_id: log.isp_id,
        old_data: log.old_data as Record<string, unknown> | null,
        new_data: log.new_data as Record<string, unknown> | null,
        metadata: log.metadata as Record<string, unknown> | null,
        ip_address: log.ip_address as string | null,
        user_agent: log.user_agent,
        created_at: log.created_at!,
        profile: log.user_id ? profilesMap[log.user_id] || null : null,
        isp: log.isp_id ? ispsMap[log.isp_id] || null : null,
      }));

      return enrichedLogs;
    },
  });
};

export const useUserActions = (userId: string) => {
  return useQuery({
    queryKey: ['user-actions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, entity_type, created_at, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
