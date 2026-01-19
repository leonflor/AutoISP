import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useActiveIspsCount = () => {
  return useQuery({
    queryKey: ['active-isps-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('isps')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
