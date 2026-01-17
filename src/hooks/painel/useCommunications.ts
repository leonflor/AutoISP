import { useState, useEffect, useMemo } from 'react';
import { useIspMembership } from '@/hooks/useIspMembership';

export type CampaignStatus = 'rascunho' | 'agendada' | 'enviando' | 'concluida' | 'cancelada';
export type CampaignChannel = 'whatsapp' | 'sms' | 'email' | 'push';

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  message: string;
  targetCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: CampaignChannel;
  content: string;
  variables: string[];
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Promoção Upgrade Plano',
    channel: 'whatsapp',
    status: 'concluida',
    message: 'Olá {{nome}}! Aproveite nossa promoção exclusiva de upgrade de plano.',
    targetCount: 150,
    sentCount: 150,
    deliveredCount: 145,
    readCount: 98,
    scheduledAt: null,
    sentAt: '2024-01-10T10:00:00Z',
    createdAt: '2024-01-09T15:00:00Z',
  },
  {
    id: '2',
    name: 'Lembrete de Vencimento',
    channel: 'sms',
    status: 'agendada',
    message: 'Sua fatura vence dia {{vencimento}}. Evite a suspensão!',
    targetCount: 45,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    scheduledAt: '2024-01-20T08:00:00Z',
    sentAt: null,
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    name: 'Novidades do Mês',
    channel: 'email',
    status: 'rascunho',
    message: 'Confira as novidades do seu provedor de internet!',
    targetCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    scheduledAt: null,
    sentAt: null,
    createdAt: '2024-01-14T09:00:00Z',
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Boas-vindas',
    channel: 'whatsapp',
    content: 'Olá {{nome}}! Seja bem-vindo ao {{provedor}}. Estamos felizes em tê-lo conosco!',
    variables: ['nome', 'provedor'],
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Lembrete de Pagamento',
    channel: 'sms',
    content: '{{provedor}}: Sua fatura de R$ {{valor}} vence dia {{vencimento}}.',
    variables: ['provedor', 'valor', 'vencimento'],
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Aviso de Manutenção',
    channel: 'whatsapp',
    content: 'Prezado(a) {{nome}}, informamos que haverá manutenção programada dia {{data}} das {{inicio}} às {{fim}}.',
    variables: ['nome', 'data', 'inicio', 'fim'],
    createdAt: '2024-01-01T10:00:00Z',
  },
];

interface UseCommunicationsReturn {
  campaigns: Campaign[];
  templates: MessageTemplate[];
  loading: boolean;
  error: string | null;
  stats: {
    totalCampaigns: number;
    enviadas: number;
    agendadas: number;
    taxaEntrega: number;
    taxaLeitura: number;
  };
  refetch: () => void;
}

export function useCommunications(): UseCommunicationsReturn {
  const { membership } = useIspMembership();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [membership?.ispId]);

  const stats = useMemo(() => {
    const concluidas = mockCampaigns.filter((c) => c.status === 'concluida');
    const totalSent = concluidas.reduce((sum, c) => sum + c.sentCount, 0);
    const totalDelivered = concluidas.reduce((sum, c) => sum + c.deliveredCount, 0);
    const totalRead = concluidas.reduce((sum, c) => sum + c.readCount, 0);

    return {
      totalCampaigns: mockCampaigns.length,
      enviadas: concluidas.length,
      agendadas: mockCampaigns.filter((c) => c.status === 'agendada').length,
      taxaEntrega: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      taxaLeitura: totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0,
    };
  }, []);

  return {
    campaigns: mockCampaigns,
    templates: mockTemplates,
    loading,
    error,
    stats,
    refetch: () => setLoading(true),
  };
}
