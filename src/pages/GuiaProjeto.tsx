import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Monitor, Route, Puzzle, Link, Shield, Palette, Rocket } from "lucide-react";
import ResumoProjetoTab from "@/components/guia-projeto/ResumoProjetoTab";
import PlataformasTab from "@/components/guia-projeto/PlataformasTab";
import JornadasTab from "@/components/guia-projeto/JornadasTab";
import FeaturesTab from "@/components/guia-projeto/FeaturesTab";
import IntegracoesTab from "@/components/guia-projeto/IntegracoesTab";

const GuiaProjeto = () => {
  const tabs = [
    { id: "resumo", label: "Resumo do Projeto", icon: FileText },
    { id: "plataformas", label: "Plataformas", icon: Monitor },
    { id: "jornadas", label: "Jornadas", icon: Route },
    { id: "features", label: "Features", icon: Puzzle },
    { id: "integracoes", label: "Integrações", icon: Link },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "design", label: "Design", icon: Palette },
    { id: "implementacao", label: "Implementação", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Guia de Projeto — AutoISP</h1>
          <p className="mt-2 text-muted-foreground">
            Documentação completa do projeto com escopo, jornadas e implementação
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="mb-8 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Aba Resumo do Projeto */}
          <TabsContent value="resumo" className="mt-0">
            <ResumoProjetoTab />
          </TabsContent>

          {/* Aba Plataformas */}
          <TabsContent value="plataformas" className="mt-0">
            <PlataformasTab />
          </TabsContent>

          {/* Aba Jornadas */}
          <TabsContent value="jornadas" className="mt-0">
            <JornadasTab />
          </TabsContent>

          {/* Aba Features */}
          <TabsContent value="features" className="mt-0">
            <FeaturesTab />
          </TabsContent>

          {/* Aba Integrações */}
          <TabsContent value="integracoes" className="mt-0">
            <IntegracoesTab />
          </TabsContent>

          {/* Demais abas - Placeholder */}
          {tabs.slice(5).map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <tab.icon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h2 className="mb-2 text-xl font-semibold text-foreground">{tab.label}</h2>
                  <p className="text-muted-foreground">
                    Conteúdo será preenchido após o Discovery desta aba.
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default GuiaProjeto;
