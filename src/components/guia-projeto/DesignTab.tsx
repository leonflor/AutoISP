import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Palette, Type, Component, Smartphone, ExternalLink } from "lucide-react";
import BrandingSection from "./design/BrandingSection";
import ColorsSection from "./design/ColorsSection";
import TypographySection from "./design/TypographySection";
import ComponentsSection from "./design/ComponentsSection";
import ResponsiveSection from "./design/ResponsiveSection";
import ReferencesSection from "./design/ReferencesSection";

const DesignTab = () => {
  const designTabs = [
    { id: "branding", label: "Branding", icon: Sparkles },
    { id: "cores", label: "Cores", icon: Palette },
    { id: "tipografia", label: "Tipografia", icon: Type },
    { id: "componentes", label: "Componentes", icon: Component },
    { id: "responsivo", label: "Responsivo", icon: Smartphone },
    { id: "referencias", label: "Referências", icon: ExternalLink },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-bold text-foreground">Sistema de Design</h2>
        <p className="mt-2 text-muted-foreground">
          Diretrizes visuais, componentes e padrões do AutoISP
        </p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          {designTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="branding" className="mt-0">
          <BrandingSection />
        </TabsContent>

        <TabsContent value="cores" className="mt-0">
          <ColorsSection />
        </TabsContent>

        <TabsContent value="tipografia" className="mt-0">
          <TypographySection />
        </TabsContent>

        <TabsContent value="componentes" className="mt-0">
          <ComponentsSection />
        </TabsContent>

        <TabsContent value="responsivo" className="mt-0">
          <ResponsiveSection />
        </TabsContent>

        <TabsContent value="referencias" className="mt-0">
          <ReferencesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignTab;
