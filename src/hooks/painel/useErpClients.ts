import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIspMembership } from "@/hooks/useIspMembership";

export type SignalQuality = 'critical' | 'weak' | 'acceptable' | 'excellent' | 'ideal' | 'saturated' | 'low' | 'unknown';

export interface ErpClient {
  erp_id: string;
  contrato_id: string | null;
  cliente_erp_id: string | null;
  provider: "ixc" | "mk_solutions" | "sgp";
  provider_name: string;
  nome: string;
  cpf_cnpj: string;
  data_vencimento: string | null;
  plano: string | null;
  login: string | null;
  status_contrato: string;
  conectado: boolean;
  signal_db: number | null;
  signal_quality: SignalQuality;
}

interface FetchResponse {
  clients: ErpClient[];
  errors: { provider: string; message: string }[];
  message?: string;
}

interface UseErpClientsOptions {
  search?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}

export function useErpClients(options: UseErpClientsOptions = {}) {
  const { membership } = useIspMembership();
  const { search = "", status = "", provider = "", page = 1, limit = 15 } = options;

  const query = useQuery<FetchResponse>({
    queryKey: ["erp-clients", membership?.ispId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sessão expirada");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-erp-clients`,
        {
          method: "GET",
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
    enabled: !!membership?.ispId,
    staleTime: 1000 * 60 * 2,
  });

  const allClients = query.data?.clients || [];

  // Client-side filtering
  const filtered = allClients.filter((c) => {
    if (search) {
      const s = search.toLowerCase();
      const match =
        c.nome.toLowerCase().includes(s) ||
        c.cpf_cnpj.includes(search) ||
        (c.login && c.login.toLowerCase().includes(s));
      if (!match) return false;
    }
    if (status && status !== "all") {
      if (status === "nao_ativo") {
        if (c.status_contrato === "ativo") return false;
      } else {
        if (c.status_contrato !== status) return false;
      }
    }
    if (provider && provider !== "all" && c.provider !== provider) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const stats = {
    total: allClients.length,
    ativos: allClients.filter((c) => c.status_contrato === "ativo").length,
    suspensos: allClients.filter((c) => c.status_contrato === "suspenso").length,
    bloqueados: allClients.filter((c) => c.status_contrato === "bloqueado").length,
    conectados: allClients.filter((c) => c.conectado).length,
  };

  return {
    clients: paginated,
    allClients: filtered,
    loading: query.isLoading,
    error: query.error?.message || null,
    errors: query.data?.errors || [],
    total: filtered.length,
    totalPages,
    stats,
    refetch: query.refetch,
  };
}
