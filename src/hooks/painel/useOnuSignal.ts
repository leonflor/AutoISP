import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SignalReport {
  rx: { value: number; classification: string; severity: number; emoji: string; diagnosis: string; action: string } | null;
  tx: { value: number; classification: string; severity: number; emoji: string; diagnosis: string; action: string } | null;
  needsAttention: boolean;
  isUrgent: boolean;
  summary: string;
}

interface OnuSignalResponse {
  signal: { rx: number | null; tx: number | null; raw: Record<string, unknown> };
  report: SignalReport;
  client_id: string;
}

export function useOnuSignal(clientId: string | null) {
  const query = useQuery<OnuSignalResponse>({
    queryKey: ['onu-signal', clientId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Sessão expirada');

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-onu-signal?client_id=${clientId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${resp.status}`);
      }

      return resp.json();
    },
    enabled: false, // manual trigger only
    retry: 1,
  });

  return {
    signal: query.data?.signal ?? null,
    report: query.data?.report ?? null,
    loading: query.isFetching,
    error: query.error?.message ?? null,
    fetch: query.refetch,
  };
}
