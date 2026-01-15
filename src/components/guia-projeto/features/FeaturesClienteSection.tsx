import { Users } from "lucide-react";

const FeaturesClienteSection = () => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Features — Painel Cliente</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Funcionalidades documentadas por módulo do painel do cliente ISP
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          Features serão documentadas após o Discovery do Painel Cliente.
        </p>
      </div>
    </div>
  );
};

export default FeaturesClienteSection;
