import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Brain, 
  Mail, 
  Shield, 
  Database, 
  MessageSquare,
  Activity
} from "lucide-react";
import PagamentosSection from "./integracoes/PagamentosSection";
import IASection from "./integracoes/IASection";
import EmailSection from "./integracoes/EmailSection";
import AutenticacaoSection from "./integracoes/AutenticacaoSection";

const IntegracoesTab = () => {
  const categorias = [
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard, count: 1, status: "done" },
    { id: "ia", label: "IA", icon: Brain, count: 1, status: "done" },
    { id: "email", label: "Email", icon: Mail, count: 1, status: "done" },
    { id: "comunicacao", label: "Comunicação", icon: MessageSquare, count: 3, status: "pending" },
    { id: "autenticacao", label: "Autenticação", icon: Shield, count: 1, status: "done" },
    { id: "storage", label: "Storage", icon: Database, count: 1, status: "pending" },
    { id: "erp", label: "ERP", icon: Activity, count: 1, status: "pending" },
    { id: "monitoramento", label: "Monitoramento", icon: Activity, count: 1, status: "pending" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações Externas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Documentação de todas as integrações com serviços externos (APIs, webhooks, SDKs)
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-muted-foreground">Documentada</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
            <span className="text-muted-foreground">Pendente</span>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">10 integrações</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pagamentos" className="w-full">
        <div className="border-b border-border px-6 pt-4">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0 pb-4">
            {categorias.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                  <span className={`ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium ${
                    cat.status === "done" 
                      ? "bg-green-500/20 text-green-600" 
                      : "bg-yellow-500/20 text-yellow-600"
                  }`}>
                    {cat.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="pagamentos" className="mt-0">
            <PagamentosSection />
          </TabsContent>

          <TabsContent value="ia" className="mt-0">
            <IASection />
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            <EmailSection />
          </TabsContent>

          <TabsContent value="comunicacao" className="mt-0">
            <PlaceholderSection 
              title="Integrações de Comunicação" 
              description="WhatsApp, SMS e Push Notifications"
              items={[
                "INT-07 — WhatsApp Cloud API (Meta)",
                "INT-08 — SMS (Twilio/Zenvia)",
                "INT-09 — Push Notifications (FCM/OneSignal)"
              ]}
            />
          </TabsContent>

          <TabsContent value="autenticacao" className="mt-0">
            <AutenticacaoSection />
          </TabsContent>

          <TabsContent value="storage" className="mt-0">
            <PlaceholderSection 
              title="Integrações de Storage" 
              description="Armazenamento de arquivos e imagens"
              items={["INT-05 — Supabase Storage"]}
            />
          </TabsContent>

          <TabsContent value="erp" className="mt-0">
            <PlaceholderSection 
              title="Integrações de ERP" 
              description="Sincronização com sistemas de gestão de ISPs"
              items={["INT-06 — ERPs (SGP, IXC Soft, MK Solutions, Hubsoft)"]}
            />
          </TabsContent>

          <TabsContent value="monitoramento" className="mt-0">
            <PlaceholderSection 
              title="Integrações de Monitoramento" 
              description="Sistemas de monitoramento de rede"
              items={["INT-10 — Sistemas de Monitoramento"]}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

interface PlaceholderSectionProps {
  title: string;
  description: string;
  items: string[];
}

const PlaceholderSection = ({ title, description, items }: PlaceholderSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Discovery pendente para:
          </p>
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li key={item} className="text-sm text-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegracoesTab;
