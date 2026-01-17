import { useState, useMemo } from 'react';
import { useIspMembership } from '@/hooks/useIspMembership';

export interface ReportData {
  period: string;
  atendimentosTotal: number;
  atendimentosIA: number;
  atendimentosHumano: number;
  tempoMedioResposta: number; // in minutes
  csat: number;
  tokensUsados: number;
  requestsIA: number;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  type: 'atendimentos' | 'ia' | 'csat';
}

// Mock data for reports
const generateMockReportData = (startDate: Date, endDate: Date): ReportData[] => {
  const data: ReportData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    data.push({
      period: currentDate.toISOString().split('T')[0],
      atendimentosTotal: Math.floor(Math.random() * 50) + 10,
      atendimentosIA: Math.floor(Math.random() * 30) + 5,
      atendimentosHumano: Math.floor(Math.random() * 20) + 5,
      tempoMedioResposta: Math.floor(Math.random() * 10) + 1,
      csat: Math.floor(Math.random() * 20) + 80,
      tokensUsados: Math.floor(Math.random() * 10000) + 1000,
      requestsIA: Math.floor(Math.random() * 100) + 20,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

interface UseReportsReturn {
  data: ReportData[];
  loading: boolean;
  error: string | null;
  summary: {
    totalAtendimentos: number;
    taxaResolucaoIA: number;
    csatMedio: number;
    tempoMedioResposta: number;
    totalTokens: number;
    totalRequests: number;
  };
  refetch: () => void;
}

export function useReports(filters: ReportFilters): UseReportsReturn {
  const { membership } = useIspMembership();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(() => {
    return generateMockReportData(filters.startDate, filters.endDate);
  }, [filters.startDate, filters.endDate]);

  const summary = useMemo(() => {
    const totalAtendimentos = data.reduce((sum, d) => sum + d.atendimentosTotal, 0);
    const totalIA = data.reduce((sum, d) => sum + d.atendimentosIA, 0);
    const csatSum = data.reduce((sum, d) => sum + d.csat, 0);
    const tempoSum = data.reduce((sum, d) => sum + d.tempoMedioResposta, 0);
    const totalTokens = data.reduce((sum, d) => sum + d.tokensUsados, 0);
    const totalRequests = data.reduce((sum, d) => sum + d.requestsIA, 0);

    return {
      totalAtendimentos,
      taxaResolucaoIA: totalAtendimentos > 0 ? Math.round((totalIA / totalAtendimentos) * 100) : 0,
      csatMedio: data.length > 0 ? Math.round(csatSum / data.length) : 0,
      tempoMedioResposta: data.length > 0 ? Math.round(tempoSum / data.length) : 0,
      totalTokens,
      totalRequests,
    };
  }, [data]);

  return {
    data,
    loading,
    error,
    summary,
    refetch: () => setLoading(true),
  };
}
