import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIspMembership } from '@/hooks/useIspMembership';
import { Users, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

const PainelDashboard = () => {
  const { membership } = useIspMembership();

  const stats = [
    {
      title: 'Assinantes Ativos',
      value: '0',
      description: 'Total de clientes ativos',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Atendimentos Abertos',
      value: '0',
      description: 'Tickets em andamento',
      icon: MessageSquare,
      color: 'text-accent',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 0,00',
      description: 'Previsão do mês atual',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Alertas',
      value: '0',
      description: 'Problemas que requerem atenção',
      icon: AlertTriangle,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel de controle do {membership?.ispName || 'seu provedor'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma atividade recente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Vencimentos</CardTitle>
            <CardDescription>Faturas que vencem em breve</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum vencimento próximo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PainelDashboard;
