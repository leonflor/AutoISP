import { FinanceKPIs } from '@/components/admin/finance/FinanceKPIs';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useInvoices } from '@/hooks/useInvoices';

export default function FinancePage() {
  const { subscriptions, activeSubscriptions, mrr, isLoading: subsLoading } = useSubscriptions();
  const { pendingTotal, overdueTotal, paidThisMonth, isLoading: invLoading } = useInvoices();

  const isLoading = subsLoading || invLoading;

  // Generate mock revenue data for chart (in production, this would come from real data)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonth = new Date().getMonth();
  const revenueData = months.slice(0, currentMonth + 1).map((month, i) => ({
    month,
    revenue: mrr * (0.7 + (i / 12) * 0.3), // Simulated growth
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Visão geral financeira do sistema.</p>
      </div>

      <FinanceKPIs
        mrr={mrr}
        arr={mrr * 12}
        activeSubscriptions={activeSubscriptions.length}
        pendingAmount={pendingTotal}
        overdueAmount={overdueTotal}
        paidThisMonth={paidThisMonth}
        isLoading={isLoading}
      />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <RevenueChart data={revenueData} isLoading={isLoading} />
      </div>
    </div>
  );
}
