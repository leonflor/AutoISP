import { InvoiceTable } from '@/components/admin/finance/InvoiceTable';
import { useInvoices } from '@/hooks/useInvoices';

export default function InvoicesPage() {
  const { invoices, isLoading, markAsPaid, cancelInvoice } = useInvoices();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Faturas</h1>
        <p className="text-muted-foreground">Gerencie as faturas do sistema.</p>
      </div>

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        onMarkAsPaid={markAsPaid}
        onCancel={cancelInvoice}
      />
    </div>
  );
}
