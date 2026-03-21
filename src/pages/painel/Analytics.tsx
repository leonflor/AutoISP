import { useSearchParams } from 'react-router-dom';
import { useConversationAnalytics, PERIOD_OPTIONS, type Period } from '@/hooks/useConversationAnalytics';
import { useIspMembership } from '@/hooks/useIspMembership';
import { Button } from '@/components/ui/button';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = (searchParams.get('period') as Period) || '7d';
  const { membership } = useIspMembership();
  const ispId = membership?.ispId;

  const analytics = useConversationAnalytics({ period, ispId });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Métricas de conversas e performance do agente</p>
        </div>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map(p => (
            <Button key={p.value} variant={period === p.value ? 'default' : 'outline'} size="sm" onClick={() => setSearchParams({ period: p.value })}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <AnalyticsDashboard {...analytics} />
    </div>
  );
}
