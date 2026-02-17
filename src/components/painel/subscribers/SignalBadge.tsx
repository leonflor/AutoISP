import { Signal, SignalLow, SignalMedium, SignalZero, AlertTriangle, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SignalQuality } from '@/hooks/painel/useErpClients';

const signalConfig: Record<SignalQuality, { color: string; label: string; icon: typeof Signal }> = {
  ideal: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Ideal', icon: Signal },
  excellent: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Excelente', icon: Signal },
  acceptable: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Aceitável', icon: SignalMedium },
  weak: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', label: 'Fraco', icon: SignalLow },
  low: { color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', label: 'Baixo', icon: SignalLow },
  critical: { color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Crítico', icon: AlertTriangle },
  saturated: { color: 'bg-red-500/10 text-red-600 border-red-500/20', label: 'Saturado', icon: AlertTriangle },
  unknown: { color: 'bg-gray-500/10 text-gray-500 border-gray-500/20', label: 'N/D', icon: Minus },
};

interface SignalBadgeProps {
  signalQuality: SignalQuality;
  signalDb: number | null;
  clickable?: boolean;
  onClick?: () => void;
}

export function SignalBadge({ signalQuality, signalDb, clickable, onClick }: SignalBadgeProps) {
  const config = signalConfig[signalQuality] || signalConfig.unknown;
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="outline"
      className={`${config.color} gap-1 ${clickable ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <Icon className="h-3 w-3" />
      {signalDb !== null ? `${signalDb} dBm` : config.label}
    </Badge>
  );

  if (signalDb === null) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>{config.label} — {signalDb} dBm</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
