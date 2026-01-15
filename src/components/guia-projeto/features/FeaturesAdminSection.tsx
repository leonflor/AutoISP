import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Building2, CreditCard, FileText, Settings, Headphones, BarChart3, Users } from "lucide-react";
import DashboardFeatures from "./modules/DashboardFeatures";
import ClientesFeatures from "./modules/ClientesFeatures";
import PlanosFeatures from "./modules/PlanosFeatures";

const FeaturesAdminSection = () => {
  const modulos = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: 9 },
    { id: "clientes", label: "Clientes ISP", icon: Building2, count: 14 },
    { id: "planos", label: "Planos", icon: CreditCard, count: 12 },
    { id: "financeiro", label: "Financeiro", icon: FileText, count: 0 },
    { id: "suporte", label: "Suporte", icon: Headphones, count: 0 },
    { id: "relatorios", label: "Relatórios", icon: BarChart3, count: 0 },
    { id: "equipe", label: "Equipe", icon: Users, count: 0 },
    { id: "configuracoes", label: "Configurações", icon: Settings, count: 0 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Features — Painel Admin</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Funcionalidades documentadas por módulo do painel administrativo
        </p>
      </div>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            {modulos.map((mod) => {
              const Icon = mod.icon;
              return (
                <TabsTrigger
                  key={mod.id}
                  value={mod.id}
                  disabled={mod.count === 0}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-50"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mod.label}
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                    {mod.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <DashboardFeatures />
          </TabsContent>

          <TabsContent value="clientes" className="mt-0">
            <ClientesFeatures />
          </TabsContent>

          <TabsContent value="planos" className="mt-0">
            <PlanosFeatures />
          </TabsContent>

          {modulos.slice(3).map((mod) => (
            <TabsContent key={mod.id} value={mod.id} className="mt-0">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <mod.icon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Features serão documentadas após o Discovery deste módulo.
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturesAdminSection;
