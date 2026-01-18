import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, signIn, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (hasRole('super_admin')) {
        navigate('/admin');
      }
    }
  }, [user, loading, hasRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    // Check will happen in useEffect after auth state updates
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User logged in but not super_admin
  if (user && !hasRole('super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl font-bold text-destructive">Acesso Restrito</CardTitle>
            <CardDescription>
              Esta área é exclusiva para administradores do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Você está logado como <strong>{user.email}</strong>, mas esta conta não tem permissões de administrador.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/painel')}
              >
                Ir para Painel ISP
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={async () => {
                  await signOut();
                }}
              >
                Fazer Logout
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Voltar para Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl font-bold text-foreground">AutoISP Admin</CardTitle>
          </div>
          <CardDescription>
            Acesso restrito a administradores do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@autoisp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
