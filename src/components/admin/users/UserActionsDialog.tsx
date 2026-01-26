import { Activity, Clock, ChevronRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUserActions } from '@/hooks/useAuditLogs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const actionLabels: Record<string, string> = {
  create: 'Criou',
  update: 'Atualizou',
  delete: 'Excluiu',
  login: 'Fez login',
  logout: 'Fez logout',
  invite: 'Convidou',
  role_add: 'Adicionou permissão',
  role_remove: 'Removeu permissão',
};

const entityLabels: Record<string, string> = {
  user: 'usuário',
  isp: 'ISP',
  plan: 'plano',
  subscription: 'assinatura',
  invoice: 'fatura',
  ticket: 'ticket',
  user_role: 'permissão',
  settings: 'configurações',
};

export function UserActionsDialog({ open, onOpenChange, userId, userName }: UserActionsDialogProps) {
  const { data: actions, isLoading } = useUserActions(userId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Ações
          </DialogTitle>
          <DialogDescription>
            Ações realizadas por <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !actions?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma ação registrada</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-4">
                {actions.map((action, index) => (
                  <div 
                    key={`${action.created_at}-${index}`}
                    className="relative pl-10"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 top-2 h-3 w-3 rounded-full bg-primary border-2 border-background" />

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {actionLabels[action.action] || action.action}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {entityLabels[action.entity_type] || action.entity_type}
                            </span>
                          </div>

                          {action.metadata && Object.keys(action.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {Object.entries(action.metadata as Record<string, unknown>)
                                .slice(0, 3)
                                .map(([key, value]) => (
                                  <span key={key} className="mr-3">
                                    <strong>{key}:</strong> {String(value).slice(0, 50)}
                                  </span>
                                ))
                              }
                            </div>
                          )}
                        </div>

                        <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          <div>{format(new Date(action.created_at), "dd/MM/yyyy")}</div>
                          <div>{format(new Date(action.created_at), "HH:mm:ss")}</div>
                          <div className="mt-1">
                            {formatDistanceToNow(new Date(action.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
