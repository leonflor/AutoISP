import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { IspMemberRole } from '@/types/database';

interface IspMembership {
  ispId: string;
  ispName: string;
  ispSlug: string;
  role: IspMemberRole;
}

interface UseIspMembershipReturn {
  membership: IspMembership | null;
  loading: boolean;
  error: string | null;
  hasMembership: boolean;
}

interface IspData {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface IspUserWithIsp {
  role: string;
  isps: IspData | null;
}

export function useIspMembership(): UseIspMembershipReturn {
  const { user, loading: authLoading } = useAuth();
  const [membership, setMembership] = useState<IspMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembership() {
      if (authLoading) return;
      
      if (!user) {
        setMembership(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('isp_users')
          .select(`
            role,
            isps:isp_id (
              id,
              name,
              slug,
              status
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No membership found
            setMembership(null);
          } else {
            throw fetchError;
          }
        } else if (data) {
          const typedData = data as unknown as IspUserWithIsp;
          if (typedData.isps && typedData.isps.status === 'ativo') {
            setMembership({
              ispId: typedData.isps.id,
              ispName: typedData.isps.name,
              ispSlug: typedData.isps.slug,
              role: typedData.role as IspMemberRole,
            });
          } else {
            setMembership(null);
          }
        }
      } catch (err) {
        console.error('Error fetching ISP membership:', err);
        setError('Erro ao carregar informações do provedor');
      } finally {
        setLoading(false);
      }
    }

    fetchMembership();
  }, [user, authLoading]);

  return {
    membership,
    loading: loading || authLoading,
    error,
    hasMembership: !!membership,
  };
}
