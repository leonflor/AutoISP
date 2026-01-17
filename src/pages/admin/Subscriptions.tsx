import { SubscriptionTable } from '@/components/admin/finance/SubscriptionTable';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function SubscriptionsPage() {
  const { subscriptions, isLoading, cancelSubscription } = useSubscriptions();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assinaturas</h1>
        <p className="text-muted-foreground">Gerencie as assinaturas do sistema.</p>
      </div>

      <SubscriptionTable
        subscriptions={subscriptions}
        isLoading={isLoading}
        onCancel={cancelSubscription}
      />
    </div>
  );
}
