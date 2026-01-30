import { Loader2, CheckCircle2, AlertCircle, Clock, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentStatusBadgeProps {
  status: "pending" | "processing" | "indexed" | "error";
  className?: string;
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
  animate?: boolean;
}

const statusConfig: Record<string, StatusConfig> = {
  pending: {
    label: "Pendente",
    icon: Clock,
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  processing: {
    label: "Processando",
    icon: Loader2,
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    animate: true,
  },
  indexed: {
    label: "Indexado",
    icon: CheckCircle2,
    variant: "default",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  error: {
    label: "Erro",
    icon: AlertCircle,
    variant: "destructive",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function DocumentStatusBadge({ status, className }: DocumentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium border-0",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", config.animate && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
