import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Globe } from "lucide-react";
import FeaturesAdminSection from "./features/FeaturesAdminSection";
import FeaturesClienteSection from "./features/FeaturesClienteSection";
import FeaturesLandingSection from "./features/FeaturesLandingSection";

const FeaturesTab = () => {
  const plataformas = [
    { id: "admin", label: "Painel Admin", icon: Settings, count: 9 },
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
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                {plat.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                  {plat.count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="admin" className="mt-0">
          <FeaturesAdminSection />
        </TabsContent>

        <TabsContent value="cliente" className="mt-0">
          <FeaturesClienteSection />
        </TabsContent>

        <TabsContent value="landing" className="mt-0">
          <FeaturesLandingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturesTab;
