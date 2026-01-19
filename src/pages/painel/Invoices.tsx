import { FileText, Download, ExternalLink, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIspMembership } from "@/hooks/useIspMembership";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "secondary" },
  pago: { label: "Pago", variant: "default" },
  vencido: { label: "Vencido", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "outline" },
};

const InvoicesPage = () => {
  const { membership } = useIspMembership();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["isp-invoices", membership?.ispId],
    queryFn: async () => {
      if (!membership?.ispId) return [];

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("isp_id", membership.ispId)
        .order("due_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!membership?.ispId,
  });

  // Calculate summary stats
  const pendingInvoices = invoices?.filter((i) => i.status === "pendente") || [];
  const overdueInvoices = invoices?.filter((i) => i.status === "vencido") || [];
  const totalPending = pendingInvoices.reduce((acc, i) => acc + Number(i.amount), 0);
  const totalOverdue = overdueInvoices.reduce((acc, i) => acc + Number(i.amount), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Minhas Faturas</h1>
          <p className="text-muted-foreground">Gerencie suas faturas e pagamentos</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas Faturas</h1>
        <p className="text-muted-foreground">Gerencie suas faturas e pagamentos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Faturas</CardDescription>
            <CardTitle className="text-2xl">{invoices?.length || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendentes</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {pendingInvoices.length} ({new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalPending)})
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vencidas</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              {overdueInvoices.length} ({new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalOverdue)})
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusConfig[invoice.status || "pendente"];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(invoice.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.paid_at
                          ? format(new Date(invoice.paid_at), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.invoice_url && invoice.status === "pendente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={invoice.invoice_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pagar
                              </a>
                            </Button>
                          )}
                          {invoice.pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={invoice.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold">Nenhuma fatura encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Suas faturas aparecerão aqui quando forem geradas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPage;
