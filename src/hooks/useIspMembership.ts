import { useState, useEffect, useRef } from 'react';
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
  const membershipRef = useRef<IspMembership | null>(null);

  useEffect(() => {
    async function fetchMembership() {
      if (authLoading) return;
      
      if (!user) {
        setMembership(null);
        membershipRef.current = null;
        setLoading(false);
        return;
      }

      try {
        if (!membershipRef.current) setLoading(true);
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
            membershipRef.current = null;
          } else {
            throw fetchError;
          }
        } else if (data) {
          const typedData = data as unknown as IspUserWithIsp;
          if (typedData.isps && typedData.isps.status === 'ativo') {
            const m: IspMembership = {
              ispId: typedData.isps.id,
              ispName: typedData.isps.name,
              ispSlug: typedData.isps.slug,
              role: typedData.role as IspMemberRole,
            };
            setMembership(m);
            membershipRef.current = m;
          } else {
            setMembership(null);
            membershipRef.current = null;
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
