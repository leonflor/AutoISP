import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import { useOnuSignal } from '@/hooks/painel/useOnuSignal';

const severityColors: Record<number, string> = {
  0: 'bg-green-500/10 text-green-600 border-green-500/20',
  1: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  2: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  3: 'bg-red-500/10 text-red-600 border-red-500/20',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function SignalDiagnosticsDialog({ open, onOpenChange, clientId, clientName }: Props) {
  const { signal, report, loading, error, fetch } = useOnuSignal(clientId);

  useEffect(() => {
    if (open && clientId) fetch();
  }, [open, clientId, fetch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Diagnóstico ONU — {clientName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : report ? (
          <div className="space-y-4">
            {report.needsAttention && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm text-yellow-700">
                {report.summary}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* RX Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-blue-500" /> RX (Recepção)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.rx ? (
                    <>
                      <div className="text-2xl font-bold">{report.rx.value} dBm</div>
                      <Badge variant="outline" className={severityColors[report.rx.severity] || ''}>
                        {report.rx.emoji} {report.rx.classification}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{report.rx.diagnosis}</p>
                      {report.rx.severity >= 2 && (
                        <p className="text-xs font-medium">{report.rx.action}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados</p>
                  )}
                </CardContent>
              </Card>

              {/* TX Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-emerald-500" /> TX (Transmissão)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.tx ? (
                    <>
                      <div className="text-2xl font-bold">{report.tx.value} dBm</div>
                      <Badge variant="outline" className={severityColors[report.tx.severity] || ''}>
                        {report.tx.emoji} {report.tx.classification}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{report.tx.diagnosis}</p>
                      {report.tx.severity >= 2 && (
                        <p className="text-xs font-medium">{report.tx.action}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
