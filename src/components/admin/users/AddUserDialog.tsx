import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { AppRole, Profile } from '@/types/database';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (email: string) => Promise<Profile | null>;
  onAddUser: (userId: string, role: AppRole) => Promise<void>;
  isSearching?: boolean;
  isAdding?: boolean;
}

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  support: 'Suporte',
  viewer: 'Visualizador',
};

export function AddUserDialog({
  open,
  onOpenChange,
  onSearch,
  onAddUser,
  isSearching,
  isAdding,
}: AddUserDialogProps) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('admin');
  const [foundUser, setFoundUser] = useState<Profile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    
    setSearchError(null);
    setFoundUser(null);
    setHasSearched(true);
    
    const user = await onSearch(email.trim());
    
    if (user) {
      setFoundUser(user);
    } else {
      setSearchError('Usuário não encontrado. Certifique-se de que ele já tenha se cadastrado no sistema.');
    }
  };

  const handleAdd = async () => {
    if (!foundUser) return;
    
    await onAddUser(foundUser.id, selectedRole);
    handleClose();
  };

  const handleClose = () => {
    setEmail('');
    setFoundUser(null);
    setSearchError(null);
    setHasSearched(false);
    setSelectedRole('admin');
    onOpenChange(false);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Administrador</DialogTitle>
          <DialogDescription>
            Busque um usuário pelo email para conceder permissões administrativas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do usuário</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleSearch}
                disabled={isSearching || !email.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {searchError && hasSearched && (
            <p className="text-sm text-destructive">{searchError}</p>
          )}

          {foundUser && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={foundUser.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(foundUser.full_name, foundUser.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{foundUser.full_name || 'Sem nome'}</p>
                  <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Permissão inicial</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">{roleLabels.super_admin}</SelectItem>
                    <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                    <SelectItem value="support">{roleLabels.support}</SelectItem>
                    <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!foundUser || isAdding}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
