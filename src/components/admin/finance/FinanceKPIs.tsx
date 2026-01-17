import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FinanceKPIsProps {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  pendingAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
  isLoading?: boolean;
}

export function FinanceKPIs({
  mrr,
  arr,
  activeSubscriptions,
  pendingAmount,
  overdueAmount,
  paidThisMonth,
  isLoading,
}: FinanceKPIsProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const kpis = [
    {
      title: 'MRR',
      value: formatCurrency(mrr),
      description: 'Receita Recorrente Mensal',
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      title: 'ARR',
      value: formatCurrency(arr),
      description: 'Receita Recorrente Anual',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Assinaturas Ativas',
      value: activeSubscriptions.toString(),
      description: 'Total de clientes ativos',
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Recebido este Mês',
      value: formatCurrency(paidThisMonth),
      description: 'Faturas pagas no mês',
      icon: DollarSign,
      color: 'text-green-500',
    },
    {
      title: 'Faturas Pendentes',
      value: formatCurrency(pendingAmount),
      description: 'Aguardando pagamento',
      icon: AlertCircle,
      color: 'text-amber-500',
    },
    {
      title: 'Faturas Vencidas',
      value: formatCurrency(overdueAmount),
      description: 'Requer atenção',
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
