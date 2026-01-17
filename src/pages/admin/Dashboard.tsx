import { Building2, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsps } from '@/hooks/useIsps';

export default function AdminDashboard() {
  const { isps, isLoading } = useIsps();

  const stats = [
    {
      title: 'Total de ISPs',
      value: isLoading ? '-' : isps.length.toString(),
      icon: Building2,
      description: 'Provedores cadastrados',
    },
    {
      title: 'ISPs Ativos',
      value: isLoading ? '-' : isps.filter(i => i.status === 'ativo').length.toString(),
      icon: TrendingUp,
      description: 'Com assinatura ativa',
    },
    {
      title: 'Em Trial',
      value: isLoading ? '-' : isps.filter(i => i.status === 'trial').length.toString(),
      icon: Package,
      description: 'Período de teste',
    },
    {
      title: 'Usuários',
      value: '-',
      icon: Users,
      description: 'Total de usuários',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema AutoISP.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
