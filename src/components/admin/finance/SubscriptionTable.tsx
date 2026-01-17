import { MoreHorizontal, XCircle, Eye } from 'lucide-react';
import { Subscription, StatusAssinatura } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SubscriptionWithDetails extends Subscription {
  isp?: { id: string; name: string; email: string };
  plan?: { id: string; name: string; price_monthly: number };
}

interface SubscriptionTableProps {
  subscriptions: SubscriptionWithDetails[];
  isLoading?: boolean;
  onCancel: (id: string) => void;
  onView?: (subscription: SubscriptionWithDetails) => void;
}

const statusConfig: Record<StatusAssinatura, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  trial: { label: 'Trial', variant: 'secondary' },
  ativa: { label: 'Ativa', variant: 'default' },
  suspensa: { label: 'Suspensa', variant: 'destructive' },
  cancelada: { label: 'Cancelada', variant: 'outline' },
};

export function SubscriptionTable({ subscriptions, isLoading, onCancel, onView }: SubscriptionTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ISP</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Valor Mensal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Próximo Período</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma assinatura encontrada
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((subscription) => {
              const status = statusConfig[subscription.status];
              return (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    {subscription.isp?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{subscription.plan?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {subscription.plan?.price_monthly 
                      ? formatCurrency(subscription.plan.price_monthly) 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(subscription.current_period_end), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(subscription)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'ativa' && (
                          <DropdownMenuItem 
                            onClick={() => onCancel(subscription.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
