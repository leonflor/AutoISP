import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string | null;
}

export function KpiCard({ icon: Icon, label, value }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        {value !== null ? (
          <p className="text-2xl font-bold">{value}</p>
        ) : (
          <Skeleton className="h-8 w-20" />
        )}
      </CardContent>
    </Card>
  );
}
