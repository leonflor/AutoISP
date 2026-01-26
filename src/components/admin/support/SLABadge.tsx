import { cn } from '@/lib/utils';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SLABadgeProps {
  createdAt: string;
  slaHours: number;
  firstResponseAt?: string | null;
  status: string;
  type?: 'response' | 'resolution';
}

export function SLABadge({ 
  createdAt, 
  slaHours, 
  firstResponseAt, 
  status,
  type = 'response' 
}: SLABadgeProps) {
  // Se já respondido (para SLA de resposta) ou resolvido, mostrar como atendido
  if (type === 'response' && firstResponseAt) {
    const responseTime = new Date(firstResponseAt).getTime() - new Date(createdAt).getTime();
    const slaTime = slaHours * 60 * 60 * 1000;
    const wasOnTime = responseTime <= slaTime;
    
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1",
              wasOnTime ? "border-green-500 text-green-600" : "border-red-500 text-red-600"
            )}
          >
            {wasOnTime ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {wasOnTime ? 'Atendido' : 'Atrasado'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Respondido em {formatDuration(responseTime)}</p>
          <p className="text-muted-foreground">SLA: {slaHours}h</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Se resolvido/fechado
  if (status === 'resolved' || status === 'closed') {
    return (
      <Badge variant="outline" className="gap-1 border-muted text-muted-foreground">
        <CheckCircle className="h-3 w-3" />
        Concluído
      </Badge>
    );
  }

  // Calcular tempo restante
  const now = new Date();
  const deadline = new Date(new Date(createdAt).getTime() + slaHours * 60 * 60 * 1000);
  const remaining = deadline.getTime() - now.getTime();
  const total = slaHours * 60 * 60 * 1000;
  const percentRemaining = (remaining / total) * 100;

  // Determinar cor e ícone
  let colorClass = '';
  let Icon = Clock;
  let label = '';
  let animate = false;

  if (remaining <= 0) {
    // SLA violado
    colorClass = 'bg-destructive text-destructive-foreground';
    Icon = AlertTriangle;
    label = 'Violado';
    animate = true;
  } else if (percentRemaining < 25) {
    // Crítico (< 25%)
    colorClass = 'bg-red-500 text-white';
    Icon = AlertTriangle;
    label = formatTimeRemaining(remaining);
  } else if (percentRemaining < 50) {
    // Atenção (25-50%)
    colorClass = 'bg-yellow-500 text-black';
    Icon = Clock;
    label = formatTimeRemaining(remaining);
  } else {
    // OK (> 50%)
    colorClass = 'bg-green-500 text-white';
    Icon = Clock;
    label = formatTimeRemaining(remaining);
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          className={cn(
            "gap-1",
            colorClass,
            animate && "animate-pulse"
          )}
        >
          <Icon className="h-3 w-3" />
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>SLA de {type === 'response' ? 'resposta' : 'resolução'}: {slaHours}h</p>
        <p className="text-muted-foreground">
          {remaining > 0 
            ? `Vence em ${formatTimeRemaining(remaining)}`
            : `Vencido há ${formatTimeRemaining(Math.abs(remaining))}`
          }
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}
