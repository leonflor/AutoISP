import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Building2, CreditCard, FileText, Settings, Headphones, BarChart3, Users, Bot } from "lucide-react";
import DashboardFeatures from "./modules/DashboardFeatures";
import ClientesFeatures from "./modules/ClientesFeatures";
import PlanosFeatures from "./modules/PlanosFeatures";
import FinanceiroFeatures from "./modules/FinanceiroFeatures";
import SuporteFeatures from "./modules/SuporteFeatures";
import RelatoriosFeatures from "./modules/RelatoriosFeatures";
import EquipeFeatures from "./modules/EquipeFeatures";
import ConfiguracoesFeatures from "./modules/ConfiguracoesFeatures";
import IAFeatures from "./modules/IAFeatures";

const FeaturesAdminSection = () => {
  const modulos = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: 9 },
    { id: "clientes", label: "Clientes ISP", icon: Building2, count: 14 },
    { id: "planos", label: "Planos", icon: CreditCard, count: 12 },
    { id: "financeiro", label: "Financeiro", icon: FileText, count: 18 },
    { id: "suporte", label: "Suporte", icon: Headphones, count: 16 },
    { id: "relatorios", label: "Relatórios", icon: BarChart3, count: 15 },
    { id: "equipe", label: "Equipe", icon: Users, count: 11 },
    { id: "configuracoes", label: "Configurações", icon: Settings, count: 14 },
    { id: "ia", label: "IA", icon: Bot, count: 13 },
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
                  className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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

          <TabsContent value="financeiro" className="mt-0">
            <FinanceiroFeatures />
          </TabsContent>

          <TabsContent value="suporte" className="mt-0">
            <SuporteFeatures />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-0">
            <RelatoriosFeatures />
          </TabsContent>

          <TabsContent value="equipe" className="mt-0">
            <EquipeFeatures />
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-0">
            <ConfiguracoesFeatures />
          </TabsContent>

          <TabsContent value="ia" className="mt-0">
            <IAFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturesAdminSection;
