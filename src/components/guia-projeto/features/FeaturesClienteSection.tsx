import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  Bot,
  Activity,
  UserCog,
  Settings,
  Plug,
  BarChart3,
  FileText,
  HelpCircle,
} from "lucide-react";
import DashboardClienteFeatures from "./modules/cliente/DashboardClienteFeatures";
import AtendimentosClienteFeatures from "./modules/cliente/AtendimentosClienteFeatures";
import AssinantesClienteFeatures from "./modules/cliente/AssinantesClienteFeatures";
import ComunicacaoClienteFeatures from "./modules/cliente/ComunicacaoClienteFeatures";
import AgentesIAClienteFeatures from "./modules/cliente/AgentesIAClienteFeatures";
import MonitoramentoClienteFeatures from "./modules/cliente/MonitoramentoClienteFeatures";
import UsuariosClienteFeatures from "./modules/cliente/UsuariosClienteFeatures";
import ConfiguracoesClienteFeatures from "./modules/cliente/ConfiguracoesClienteFeatures";
import IntegracoesClienteFeatures from "./modules/cliente/IntegracoesClienteFeatures";
import RelatoriosClienteFeatures from "./modules/cliente/RelatoriosClienteFeatures";
import LogsAuditoriaClienteFeatures from "./modules/cliente/LogsAuditoriaClienteFeatures";
import HelpCenterClienteFeatures from "./modules/cliente/HelpCenterClienteFeatures";

const FeaturesClienteSection = () => {
  const modulos = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: 8 },
    { id: "atendimentos", label: "Atendimentos", icon: MessageSquare, count: 12 },
    { id: "assinantes", label: "Assinantes", icon: Users, count: 10 },
    { id: "comunicacao", label: "Comunicação Ativa", icon: Send, count: 14 },
    { id: "agentes-ia", label: "Agentes de IA", icon: Bot, count: 16 },
    { id: "monitoramento", label: "Monitoramento", icon: Activity, count: 12 },
    { id: "usuarios", label: "Usuários e Perfis", icon: UserCog, count: 10 },
    { id: "configuracoes", label: "Configurações", icon: Settings, count: 8 },
    { id: "integracoes", label: "Integrações", icon: Plug, count: 12 },
    { id: "relatorios", label: "Relatórios", icon: BarChart3, count: 10 },
    { id: "logs", label: "Logs de Auditoria", icon: FileText, count: 6 },
    { id: "help", label: "Help Center", icon: HelpCircle, count: 6 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Features — Painel Cliente</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          124 funcionalidades documentadas em 12 módulos do painel do ISP cliente
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
                  className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
            <DashboardClienteFeatures />
          </TabsContent>

          <TabsContent value="atendimentos" className="mt-0">
            <AtendimentosClienteFeatures />
          </TabsContent>

          <TabsContent value="assinantes" className="mt-0">
            <AssinantesClienteFeatures />
          </TabsContent>

          <TabsContent value="comunicacao" className="mt-0">
            <ComunicacaoClienteFeatures />
          </TabsContent>

          <TabsContent value="agentes-ia" className="mt-0">
            <AgentesIAClienteFeatures />
          </TabsContent>

          <TabsContent value="monitoramento" className="mt-0">
            <MonitoramentoClienteFeatures />
          </TabsContent>

          <TabsContent value="usuarios" className="mt-0">
            <UsuariosClienteFeatures />
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-0">
            <ConfiguracoesClienteFeatures />
          </TabsContent>

          <TabsContent value="integracoes" className="mt-0">
            <IntegracoesClienteFeatures />
          </TabsContent>

          <TabsContent value="relatorios" className="mt-0">
            <RelatoriosClienteFeatures />
          </TabsContent>

          <TabsContent value="logs" className="mt-0">
            <LogsAuditoriaClienteFeatures />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <HelpCenterClienteFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeaturesClienteSection;
