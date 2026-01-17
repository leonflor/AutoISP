import { useState, useEffect, useMemo } from 'react';
import { useIspMembership } from '@/hooks/useIspMembership';

export type TicketStatus = 'aberto' | 'em_andamento' | 'aguardando' | 'encerrado';
export type TicketChannel = 'whatsapp' | 'telegram' | 'email' | 'telefone' | 'chat';
export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface TicketMessage {
  id: string;
  sender: 'client' | 'agent' | 'ai';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  protocol: string;
  subject: string;
  subscriberId: string;
  subscriberName: string;
  subscriberPhone: string;
  status: TicketStatus;
  channel: TicketChannel;
  priority: TicketPriority;
  assignedTo: string | null;
  assignedToName: string | null;
  resolvedByAi: boolean;
  category: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    protocol: 'TKT-2024-001',
    subject: 'Internet lenta',
    subscriberId: '1',
    subscriberName: 'João Silva',
    subscriberPhone: '(11) 99999-0001',
    status: 'aberto',
    channel: 'whatsapp',
    priority: 'alta',
    assignedTo: null,
    assignedToName: null,
    resolvedByAi: false,
    category: 'Suporte Técnico',
    messages: [
      {
        id: 'm1',
        sender: 'client',
        senderName: 'João Silva',
        content: 'Olá, minha internet está muito lenta desde ontem.',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'm2',
        sender: 'ai',
        senderName: 'Assistente IA',
        content: 'Olá João! Entendo que você está tendo problemas com a velocidade da sua internet. Vou verificar a situação do seu equipamento. Você já tentou reiniciar o roteador?',
        createdAt: '2024-01-15T10:30:15Z',
      },
      {
        id: 'm3',
        sender: 'client',
        senderName: 'João Silva',
        content: 'Sim, já reiniciei várias vezes mas continua lento.',
        createdAt: '2024-01-15T10:31:00Z',
      },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:31:00Z',
    closedAt: null,
  },
  {
    id: '2',
    protocol: 'TKT-2024-002',
    subject: 'Segunda via de boleto',
    subscriberId: '2',
    subscriberName: 'Maria Santos',
    subscriberPhone: '(11) 99999-0002',
    status: 'encerrado',
    channel: 'whatsapp',
    priority: 'baixa',
    assignedTo: null,
    assignedToName: null,
    resolvedByAi: true,
    category: 'Financeiro',
    messages: [
      {
        id: 'm4',
        sender: 'client',
        senderName: 'Maria Santos',
        content: 'Preciso da segunda via do boleto deste mês.',
        createdAt: '2024-01-14T14:00:00Z',
      },
      {
        id: 'm5',
        sender: 'ai',
        senderName: 'Assistente IA',
        content: 'Olá Maria! Claro, vou gerar a segunda via do seu boleto. Aqui está o link para download: https://...',
        createdAt: '2024-01-14T14:00:10Z',
      },
    ],
    createdAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T14:00:30Z',
    closedAt: '2024-01-14T14:00:30Z',
  },
  {
    id: '3',
    protocol: 'TKT-2024-003',
    subject: 'Alteração de plano',
    subscriberId: '5',
    subscriberName: 'Carlos Mendes',
    subscriberPhone: '(11) 99999-0005',
    status: 'em_andamento',
    channel: 'chat',
    priority: 'media',
    assignedTo: 'user-1',
    assignedToName: 'Operador 1',
    resolvedByAi: false,
    category: 'Comercial',
    messages: [
      {
        id: 'm6',
        sender: 'client',
        senderName: 'Carlos Mendes',
        content: 'Gostaria de fazer upgrade do meu plano.',
        createdAt: '2024-01-15T09:00:00Z',
      },
      {
        id: 'm7',
        sender: 'ai',
        senderName: 'Assistente IA',
        content: 'Olá Carlos! Que ótimo que você quer fazer upgrade. Nossos planos disponíveis são: 200 Mega (R$ 99,90), 500 Mega (R$ 149,90) e 1 Giga (R$ 199,90). Qual você prefere?',
        createdAt: '2024-01-15T09:00:10Z',
      },
      {
        id: 'm8',
        sender: 'client',
        senderName: 'Carlos Mendes',
        content: 'Quero falar com um atendente humano para negociar.',
        createdAt: '2024-01-15T09:01:00Z',
      },
      {
        id: 'm9',
        sender: 'agent',
        senderName: 'Operador 1',
        content: 'Olá Carlos, sou o Operador 1 e vou ajudá-lo com a negociação do upgrade.',
        createdAt: '2024-01-15T09:05:00Z',
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:05:00Z',
    closedAt: null,
  },
  {
    id: '4',
    protocol: 'TKT-2024-004',
    subject: 'Sem conexão',
    subscriberId: '3',
    subscriberName: 'Pedro Oliveira',
    subscriberPhone: '(11) 99999-0003',
    status: 'aguardando',
    channel: 'telefone',
    priority: 'urgente',
    assignedTo: 'user-2',
    assignedToName: 'Técnico 1',
    resolvedByAi: false,
    category: 'Suporte Técnico',
    messages: [
      {
        id: 'm10',
        sender: 'client',
        senderName: 'Pedro Oliveira',
        content: 'Estou completamente sem internet desde hoje de manhã.',
        createdAt: '2024-01-15T08:00:00Z',
      },
      {
        id: 'm11',
        sender: 'agent',
        senderName: 'Técnico 1',
        content: 'Identificamos um problema na sua região. Uma equipe técnica foi acionada e deve resolver em até 4 horas.',
        createdAt: '2024-01-15T08:30:00Z',
      },
    ],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:30:00Z',
    closedAt: null,
  },
];

interface UseTicketsOptions {
  search?: string;
  status?: TicketStatus | '';
  channel?: TicketChannel | '';
  page?: number;
  limit?: number;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  stats: {
    total: number;
    abertos: number;
    emAndamento: number;
    aguardando: number;
    encerrados: number;
    resolvidosPorIa: number;
  };
  refetch: () => void;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const { membership } = useIspMembership();
  const { search = '', status = '', channel = '', page = 1, limit = 10 } = options;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, channel, page]);

  const filteredTickets = useMemo(() => {
    let result = mockTickets;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.protocol.toLowerCase().includes(searchLower) ||
          t.subject.toLowerCase().includes(searchLower) ||
          t.subscriberName.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      result = result.filter((t) => t.status === status);
    }

    if (channel) {
      result = result.filter((t) => t.channel === channel);
    }

    return result;
  }, [search, status, channel]);

  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredTickets.slice(start, start + limit);
  }, [filteredTickets, page, limit]);

  const stats = useMemo(() => ({
    total: mockTickets.length,
    abertos: mockTickets.filter((t) => t.status === 'aberto').length,
    emAndamento: mockTickets.filter((t) => t.status === 'em_andamento').length,
    aguardando: mockTickets.filter((t) => t.status === 'aguardando').length,
    encerrados: mockTickets.filter((t) => t.status === 'encerrado').length,
    resolvidosPorIa: mockTickets.filter((t) => t.resolvedByAi).length,
  }), []);

  return {
    tickets: paginatedTickets,
    loading,
    error,
    total: filteredTickets.length,
    totalPages: Math.ceil(filteredTickets.length / limit),
    stats,
    refetch: () => setLoading(true),
  };
}

export function useTicket(id: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const found = mockTickets.find((t) => t.id === id);
    setTimeout(() => {
      setTicket(found || null);
      setLoading(false);
    }, 300);
  }, [id]);

  return { ticket, loading };
}
