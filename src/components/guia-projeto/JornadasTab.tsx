import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Globe } from "lucide-react";
import JornadasAdminSection from "./jornadas/JornadasAdminSection";

const JornadasTab = () => {
  const plataformas = [
    { id: "admin", label: "Painel Admin", icon: Settings, count: 57 },
    { id: "cliente", label: "Painel Cliente", icon: Users, count: 0 },
    { id: "landing", label: "Landing Page", icon: Globe, count: 0 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          {plataformas.map((plat) => {
            const Icon = plat.icon;
            return (
              <TabsTrigger
                key={plat.id}
                value={plat.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                {plat.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {plat.count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="admin" className="mt-0">
          <JornadasAdminSection />
        </TabsContent>

        <TabsContent value="cliente" className="mt-0">
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="mb-2 text-xl font-semibold text-foreground">Painel Cliente</h2>
              <p className="text-muted-foreground">
                Jornadas serão documentadas após Discovery da Plataforma 2.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="landing" className="mt-0">
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="mb-2 text-xl font-semibold text-foreground">Landing Page</h2>
              <p className="text-muted-foreground">
                Jornadas serão documentadas após Discovery da Plataforma 3.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JornadasTab;
