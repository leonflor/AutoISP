import { useState } from 'react';
import { MoreHorizontal, Check, X, ExternalLink, Eye } from 'lucide-react';
import { Invoice, StatusFatura } from '@/types/database';
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

interface InvoiceWithDetails extends Invoice {
  isp?: { id: string; name: string; email: string };
}

interface InvoiceTableProps {
  invoices: InvoiceWithDetails[];
  isLoading?: boolean;
  onMarkAsPaid: (id: string) => void;
  onCancel: (id: string) => void;
  onView?: (invoice: InvoiceWithDetails) => void;
}

const statusConfig: Record<StatusFatura, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendente: { label: 'Pendente', variant: 'secondary' },
  pago: { label: 'Pago', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
  estornado: { label: 'Estornado', variant: 'outline' },
};

export function InvoiceTable({ invoices, isLoading, onMarkAsPaid, onCancel, onView }: InvoiceTableProps) {
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
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pago em</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhuma fatura encontrada
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const status = statusConfig[invoice.status];
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.isp?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.paid_at
                      ? format(new Date(invoice.paid_at), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
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
                          <DropdownMenuItem onClick={() => onView(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                        )}
                        {invoice.invoice_url && (
                          <DropdownMenuItem asChild>
                            <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver fatura
                            </a>
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'pendente' && (
                          <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como pago
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === 'pendente' || invoice.status === 'vencido') && (
                          <DropdownMenuItem 
                            onClick={() => onCancel(invoice.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <X className="h-4 w-4 mr-2" />
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
