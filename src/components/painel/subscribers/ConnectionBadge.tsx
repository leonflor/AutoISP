import { Wifi, WifiOff, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ConnectionStatus = 'online' | 'offline' | 'unknown';

const connectionConfig: Record<ConnectionStatus, { color: string; label: string; icon: typeof Wifi }> = {
  online: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Online', icon: Wifi },
  offline: { color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Offline', icon: WifiOff },
  unknown: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'N/D', icon: Minus },
};

interface ConnectionBadgeProps {
  conectado: boolean;
  onlineRaw: string | null;
}

export function ConnectionBadge({ conectado, onlineRaw }: ConnectionBadgeProps) {
  let status: ConnectionStatus;

  if (onlineRaw === null) {
    status = 'unknown';
  } else if (conectado) {
    status = 'online';
  } else {
    status = 'offline';
  }

  const config = connectionConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
