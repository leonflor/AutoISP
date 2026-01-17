import { useState, useEffect, useMemo } from 'react';
import { useIspMembership } from '@/hooks/useIspMembership';

// Mock data for subscribers - in real scenario, this would come from ERP integration
export interface Subscriber {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  contract: string;
  plan: string;
  status: 'ativo' | 'suspenso' | 'cancelado' | 'inadimplente';
  address: string;
  city: string;
  monthlyValue: number;
  dueDate: number;
  createdAt: string;
}

const mockSubscribers: Subscriber[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    cpf: '123.456.789-00',
    phone: '(11) 99999-0001',
    contract: 'CTR-001',
    plan: '200 Mega',
    status: 'ativo',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    monthlyValue: 99.90,
    dueDate: 10,
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    cpf: '234.567.890-11',
    phone: '(11) 99999-0002',
    contract: 'CTR-002',
    plan: '500 Mega',
    status: 'ativo',
    address: 'Av. Principal, 456',
    city: 'São Paulo',
    monthlyValue: 149.90,
    dueDate: 15,
    createdAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    cpf: '345.678.901-22',
    phone: '(11) 99999-0003',
    contract: 'CTR-003',
    plan: '100 Mega',
    status: 'inadimplente',
    address: 'Rua do Comércio, 789',
    city: 'Guarulhos',
    monthlyValue: 79.90,
    dueDate: 5,
    createdAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    cpf: '456.789.012-33',
    phone: '(11) 99999-0004',
    contract: 'CTR-004',
    plan: '200 Mega',
    status: 'suspenso',
    address: 'Praça Central, 100',
    city: 'Osasco',
    monthlyValue: 99.90,
    dueDate: 20,
    createdAt: '2023-04-05',
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    cpf: '567.890.123-44',
    phone: '(11) 99999-0005',
    contract: 'CTR-005',
    plan: '1 Giga',
    status: 'ativo',
    address: 'Alameda dos Anjos, 200',
    city: 'São Paulo',
    monthlyValue: 199.90,
    dueDate: 10,
    createdAt: '2023-05-01',
  },
];

interface UseSubscribersOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseSubscribersReturn {
  subscribers: Subscriber[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  stats: {
    total: number;
    ativos: number;
    suspensos: number;
    inadimplentes: number;
  };
  refetch: () => void;
}

export function useSubscribers(options: UseSubscribersOptions = {}): UseSubscribersReturn {
  const { membership } = useIspMembership();
  const { search = '', status = '', page = 1, limit = 10 } = options;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, page]);

  const filteredSubscribers = useMemo(() => {
    let result = mockSubscribers;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower) ||
          s.cpf.includes(search) ||
          s.contract.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      result = result.filter((s) => s.status === status);
    }

    return result;
  }, [search, status]);

  const paginatedSubscribers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSubscribers.slice(start, start + limit);
  }, [filteredSubscribers, page, limit]);

  const stats = useMemo(() => ({
    total: mockSubscribers.length,
    ativos: mockSubscribers.filter((s) => s.status === 'ativo').length,
    suspensos: mockSubscribers.filter((s) => s.status === 'suspenso').length,
    inadimplentes: mockSubscribers.filter((s) => s.status === 'inadimplente').length,
  }), []);

  return {
    subscribers: paginatedSubscribers,
    loading,
    error,
    total: filteredSubscribers.length,
    totalPages: Math.ceil(filteredSubscribers.length / limit),
    stats,
    refetch: () => setLoading(true),
  };
}

export function useSubscriber(id: string) {
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const found = mockSubscribers.find((s) => s.id === id);
    setTimeout(() => {
      setSubscriber(found || null);
      setLoading(false);
    }, 300);
  }, [id]);

  return { subscriber, loading };
}
