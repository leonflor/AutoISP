import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Globe } from "lucide-react";
import PainelAdminSection from "./plataformas/PainelAdminSection";
import PainelClienteSection from "./plataformas/PainelClienteSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PlataformasTab = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Plataformas do Sistema</h2>
        <p className="text-muted-foreground">
          Documentação detalhada de cada plataforma que compõe o ecossistema AutoISP.
        </p>
      </div>

      <Tabs defaultValue="admin" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Painel Admin</span>
            <span className="sm:hidden">Admin</span>
          </TabsTrigger>
          <TabsTrigger value="cliente" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Painel Cliente</span>
            <span className="sm:hidden">Cliente</span>
          </TabsTrigger>
          <TabsTrigger value="landing" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Landing Page</span>
            <span className="sm:hidden">Landing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <PainelAdminSection />
        </TabsContent>

        <TabsContent value="cliente">
          <PainelClienteSection />
        </TabsContent>

        <TabsContent value="landing">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Landing Page</CardTitle>
                  <CardDescription>Site institucional e captação de leads</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center space-y-2">
                  <Badge variant="outline">Em breve</Badge>
                  <p>O discovery desta plataforma será realizado em breve.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlataformasTab;
