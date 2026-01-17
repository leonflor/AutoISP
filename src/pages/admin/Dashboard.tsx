import { StatsCards } from '@/components/admin/dashboard/StatsCards';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { AlertsPanel } from '@/components/admin/dashboard/AlertsPanel';
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';
import { useIsps } from '@/hooks/useIsps';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useInvoices } from '@/hooks/useInvoices';

export default function AdminDashboard() {
  const { isps, isLoading: ispsLoading } = useIsps();
  const { mrr, isLoading: subsLoading } = useSubscriptions();
  const { pendingTotal, overdueTotal, isLoading: invLoading } = useInvoices();

  const isLoading = ispsLoading || subsLoading || invLoading;

  const ispStats = {
    total: isps.length,
    active: isps.filter(i => i.status === 'ativo').length,
    trial: isps.filter(i => i.status === 'trial').length,
  };

  // Mock data for charts and panels (in production, fetch real data)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const revenueData = months.slice(0, currentMonth + 1).map((month, i) => ({
    month,
    revenue: mrr * (0.7 + (i / 12) * 0.3),
  }));

  const alerts = overdueTotal > 0 ? [{
    id: '1',
    type: 'invoice_overdue' as const,
    title: 'Faturas vencidas',
    description: `R$ ${overdueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em faturas vencidas`,
    priority: 'high' as const,
    createdAt: new Date().toISOString(),
  }] : [];

  const activities = isps.slice(0, 5).map(isp => ({
    id: isp.id,
    type: 'isp_created' as const,
    title: `ISP cadastrado: ${isp.name}`,
    description: isp.email,
    createdAt: isp.created_at,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema AutoISP.</p>
      </div>

      <StatsCards
        isps={ispStats}
        mrr={mrr}
        pendingAmount={pendingTotal}
        overdueAmount={overdueTotal}
        isLoading={isLoading}
      />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <RevenueChart data={revenueData} isLoading={isLoading} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <RecentActivity activities={activities} isLoading={isLoading} />
        <AlertsPanel alerts={alerts} isLoading={isLoading} />
      </div>
    </div>
  );
}
