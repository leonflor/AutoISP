import { useState } from 'react';
import { UserPlus, Mail, User } from 'lucide-react';
import { AppRole } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteUser: (email: string, fullName: string, role: AppRole) => Promise<void>;
  isInviting?: boolean;
}

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  support: 'Suporte',
  viewer: 'Visualizador',
};

const roleDescriptions: Record<AppRole, string> = {
  super_admin: 'Acesso total ao sistema, incluindo gerenciamento de outros admins',
  admin: 'Gerenciamento de ISPs, planos e configurações',
  support: 'Suporte a clientes e visualização de dados',
  viewer: 'Apenas visualização de dados e relatórios',
};

export function AddUserDialog({
  open,
  onOpenChange,
  onInviteUser,
  isInviting,
}: AddUserDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('admin');
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    setError(null);

    // Validate fields
    if (!email.trim()) {
      setError('Informe o email do usuário');
      return;
    }

    if (!fullName.trim()) {
      setError('Informe o nome completo');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Email inválido');
      return;
    }

    try {
      await onInviteUser(email.trim(), fullName.trim(), selectedRole);
      handleClose();
    } catch (err) {
      // Error is already handled by the hook with toast
    }
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setError(null);
    setSelectedRole('admin');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Administrador</DialogTitle>
          <DialogDescription>
            Envie um convite por email para adicionar um novo administrador ao sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="João da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Perfil de acesso</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">
                  <div className="flex flex-col items-start">
                    <span>{roleLabels.super_admin}</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span>{roleLabels.admin}</span>
                  </div>
                </SelectItem>
                <SelectItem value="support">
                  <div className="flex flex-col items-start">
                    <span>{roleLabels.support}</span>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex flex-col items-start">
                    <span>{roleLabels.viewer}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {roleDescriptions[selectedRole]}
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              O usuário receberá um email com um link para definir sua senha e acessar o sistema.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleInvite} 
            disabled={isInviting || !email.trim() || !fullName.trim()}
          >
            {isInviting ? (
              <>Enviando...</>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Enviar Convite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
