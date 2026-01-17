import { Building2, Users, DollarSign, Clock, AlertTriangle, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardsProps {
  isps: {
    total: number;
    active: number;
    trial: number;
  };
  mrr: number;
  pendingAmount: number;
  overdueAmount: number;
  isLoading?: boolean;
}

export function StatsCards({ isps, mrr, pendingAmount, overdueAmount, isLoading }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total de ISPs',
      value: isps.total.toString(),
      icon: Building2,
      description: 'Provedores cadastrados',
      color: 'text-blue-500',
    },
    {
      title: 'ISPs Ativos',
      value: isps.active.toString(),
      icon: Users,
      description: 'Com assinatura ativa',
      color: 'text-green-500',
    },
    {
      title: 'Em Trial',
      value: isps.trial.toString(),
      icon: Clock,
      description: 'Período de teste',
      color: 'text-amber-500',
    },
    {
      title: 'MRR',
      value: `R$ ${mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'Receita recorrente mensal',
      color: 'text-emerald-500',
    },
    {
      title: 'Faturas Pendentes',
      value: `R$ ${pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: AlertTriangle,
      description: 'Aguardando pagamento',
      color: 'text-orange-500',
    },
    {
      title: 'Faturas Vencidas',
      value: `R$ ${overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: AlertTriangle,
      description: 'Atenção necessária',
      color: 'text-red-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
