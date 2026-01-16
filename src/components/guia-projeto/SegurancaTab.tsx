import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Globe, Settings, Users, LayoutGrid, Lock, Key, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LandingSecuritySection from "./seguranca/LandingSecuritySection";
import AdminSecuritySection from "./seguranca/AdminSecuritySection";
import ClienteSecuritySection from "./seguranca/ClienteSecuritySection";
import SecurityOverviewSection from "./seguranca/SecurityOverviewSection";
import RLSMatrixSection from "./seguranca/RLSMatrixSection";

const SegurancaTab = () => {
  const plataformas = [
    { 
      id: "visao-geral", 
      label: "Visão Geral", 
      icon: LayoutGrid, 
      exposicao: null,
      description: "Consolidação de segurança"
    },
    { 
      id: "landing", 
      label: "Landing Page", 
      icon: Globe, 
      exposicao: "publica",
      description: "100% Pública"
    },
    { 
      id: "admin", 
      label: "Painel Admin", 
      icon: Settings, 
      exposicao: "interna",
      description: "100% Interna"
    },
    { 
      id: "cliente", 
      label: "Painel Cliente", 
      icon: Users, 
      exposicao: "interna",
      description: "100% Interna"
    },
    { 
      id: "rls-matrix", 
      label: "Matriz RLS", 
      icon: Lock, 
      exposicao: null,
      description: "Row-Level Security"
    },
  ];

  const getExposicaoBadge = (exposicao: string | null) => {
    if (!exposicao) return null;
    
    if (exposicao === "publica") {
      return (
        <Badge variant="outline" className="ml-2 border-amber-500/50 bg-amber-500/10 text-amber-600 text-xs">
          Pública
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="ml-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-600 text-xs">
        Interna
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">Arquitetura de Segurança</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Documentação completa de autenticação, autorização, RLS, gestão de segredos, validação e auditoria por plataforma.
            </p>
          </div>
        </div>

        {/* Indicadores */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Plataformas Internas (Login)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Plataformas Públicas</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-muted-foreground">
            <Key className="h-4 w-4" />
            <span>3 plataformas documentadas</span>
          </div>
        </div>
      </div>

      {/* Tabs por Plataforma */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <div className="rounded-xl border border-border bg-card">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 border-b border-border bg-transparent p-4">
            {plataformas.map((plat) => {
              const Icon = plat.icon;
              return (
                <TabsTrigger
                  key={plat.id}
                  value={plat.id}
                  className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {plat.label}
                  {getExposicaoBadge(plat.exposicao)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="p-6">
            <TabsContent value="visao-geral" className="mt-0">
              <SecurityOverviewSection />
            </TabsContent>

            <TabsContent value="landing" className="mt-0">
              <LandingSecuritySection />
            </TabsContent>

            <TabsContent value="admin" className="mt-0">
              <AdminSecuritySection />
            </TabsContent>

            <TabsContent value="cliente" className="mt-0">
              <ClienteSecuritySection />
            </TabsContent>

            <TabsContent value="rls-matrix" className="mt-0">
              <RLSMatrixSection />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default SegurancaTab;
