import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConversationAnalytics, PERIOD_OPTIONS, type Period } from '@/hooks/useConversationAnalytics';
import { useIsps } from '@/hooks/useIsps';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default function AdminAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = (searchParams.get('period') as Period) || '7d';
  const [selectedIspId, setSelectedIspId] = useState<string | undefined>();
  const { isps } = useIsps();

  const analytics = useConversationAnalytics({ period, ispId: selectedIspId });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Métricas globais de conversas e agentes</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedIspId || 'all'} onValueChange={v => setSelectedIspId(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os ISPs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os ISPs</SelectItem>
              {isps?.map(isp => (
                <SelectItem key={isp.id} value={isp.id}>{isp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map(p => (
              <Button key={p.value} variant={period === p.value ? 'default' : 'outline'} size="sm" onClick={() => setSearchParams({ period: p.value })}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AnalyticsDashboard {...analytics} />
    </div>
  );
}
