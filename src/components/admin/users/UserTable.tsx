import { useState } from 'react';
import { MoreHorizontal, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { Profile, AppRole } from '@/types/database';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminUser extends Profile {
  roles: AppRole[];
}

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onAddRole: (userId: string, role: AppRole) => void;
  onRemoveRole: (userId: string, role: AppRole) => void;
  onRemoveAllRoles: (userId: string) => Promise<void>;
  currentUserId?: string;
}

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  support: 'Suporte',
};

const roleColors: Record<AppRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  super_admin: 'destructive',
  admin: 'default',
  support: 'secondary',
};

export function UserTable({ users, isLoading, onAddRole, onRemoveRole, onRemoveAllRoles, currentUserId }: UserTableProps) {
  const [userToRemove, setUserToRemove] = useState<AdminUser | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const allRoles: AppRole[] = ['super_admin', 'admin', 'support'];

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    await onRemoveAllRoles(userToRemove.id);
    setUserToRemove(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.full_name, user.email)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.full_name || 'Sem nome'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={roleColors[role]}>
                          {roleLabels[role]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={user.id === currentUserId}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Adicionar permissão
                        </div>
                        {allRoles
                          .filter(role => !user.roles.includes(role))
                          .map(role => (
                            <DropdownMenuItem
                              key={`add-${role}`}
                              onClick={() => onAddRole(user.id, role)}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {roleLabels[role]}
                            </DropdownMenuItem>
                          ))
                        }
                        {user.roles.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                              Remover permissão
                            </div>
                            {user.roles.map(role => (
                              <DropdownMenuItem
                                key={`remove-${role}`}
                                onClick={() => onRemoveRole(user.id, role)}
                                className="text-destructive focus:text-destructive"
                              >
                                <ShieldOff className="h-4 w-4 mr-2" />
                                {roleLabels[role]}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setUserToRemove(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover administrador
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá todas as permissões de <strong>{userToRemove?.full_name || userToRemove?.email}</strong>.
              O usuário não terá mais acesso ao painel administrativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
