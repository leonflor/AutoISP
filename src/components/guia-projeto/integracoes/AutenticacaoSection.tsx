import SupabaseAuthIntegration from "./SupabaseAuthIntegration";

const AutenticacaoSection = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de Autenticação</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sistemas de autenticação, autorização e gerenciamento de sessões
        </p>
      </div>
      
      <SupabaseAuthIntegration />
    </div>
  );
};

export default AutenticacaoSection;
