import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2 } from "lucide-react";

const ReferencesSection = () => {
  const stripeElements = [
    "Organização de dados em tabelas limpas",
    "Cards de métricas com números grandes",
    "Cores neutras com acentos estratégicos",
    "Tipografia com hierarquia clara",
    "Muito espaço em branco",
    "Gradientes sutis em headers",
    "Transições suaves e elegantes",
    "Formulários bem estruturados",
  ];

  const designPrinciples = [
    {
      title: "Clareza",
      description: "Informação organizada e fácil de escanear. Hierarquia visual clara.",
    },
    {
      title: "Eficiência",
      description: "Fluxos otimizados com mínimo de cliques. Ações principais em destaque.",
    },
    {
      title: "Consistência",
      description: "Padrões visuais repetidos. Componentes reutilizáveis.",
    },
    {
      title: "Feedback",
      description: "Estados visuais claros. Confirmações e mensagens de erro contextuais.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Referência Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-[#635BFF]" />
            Referência Principal: Stripe Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-border bg-gradient-to-br from-[#635BFF]/5 to-[#00D4FF]/5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Badge className="bg-[#635BFF] hover:bg-[#635BFF]">stripe.com/dashboard</Badge>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Visitar <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-muted-foreground">
              O Stripe Dashboard é referência em design de painéis administrativos, combinando 
              funcionalidade complexa com uma interface limpa e intuitiva. É considerado um dos 
              melhores exemplos de UX em produtos B2B.
            </p>
          </div>

          {/* Elementos Inspiradores */}
          <div className="space-y-3">
            <p className="font-medium text-foreground">Elementos Inspiradores</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stripeElements.map((element) => (
                <div key={element} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <p className="text-sm text-muted-foreground">{element}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estilo Desejado */}
      <Card>
        <CardHeader>
          <CardTitle>Estilo Visual Desejado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 font-medium text-foreground">✓ Adotar</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Layout limpo e organizado</li>
                <li>• Foco em dados e métricas</li>
                <li>• Cores neutras como base</li>
                <li>• Acentos de cor estratégicos</li>
                <li>• Espaçamento generoso</li>
                <li>• Tipografia hierárquica</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 font-medium text-foreground">✗ Evitar</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Interfaces poluídas</li>
                <li>• Muitas cores competindo</li>
                <li>• Animações excessivas</li>
                <li>• Texto muito pequeno</li>
                <li>• Elementos sem padding</li>
                <li>• Inconsistência visual</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Princípios de Design */}
      <Card>
        <CardHeader>
          <CardTitle>Princípios de Design</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {designPrinciples.map((principle) => (
              <div
                key={principle.title}
                className="rounded-lg border border-border bg-muted/30 p-4"
              >
                <p className="mb-2 font-semibold text-foreground">{principle.title}</p>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview do Estilo */}
      <Card>
        <CardHeader>
          <CardTitle>Preview do Estilo AutoISP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-[#F8FAFC] p-6">
            {/* Mini Dashboard Preview */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">Dashboard</p>
                <p className="text-sm text-[#94A3B8]">Visão geral do seu ISP</p>
              </div>
              <div className="rounded bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white">
                Novo Chamado
              </div>
            </div>

            {/* Metrics */}
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#94A3B8]">Clientes Ativos</p>
                <p className="text-2xl font-bold text-[#0F172A]">1,234</p>
                <p className="text-xs text-[#16A34A]">+12% este mês</p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#94A3B8]">Receita Mensal</p>
                <p className="text-2xl font-bold text-[#0F172A]">R$ 89,5k</p>
                <p className="text-xs text-[#16A34A]">+8% este mês</p>
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
                <p className="text-sm text-[#94A3B8]">Chamados Abertos</p>
                <p className="text-2xl font-bold text-[#F97316]">23</p>
                <p className="text-xs text-[#94A3B8]">4 urgentes</p>
              </div>
            </div>

            {/* Table Preview */}
            <div className="rounded-lg border border-[#E2E8F0] bg-white">
              <div className="border-b border-[#E2E8F0] p-3">
                <p className="font-medium text-[#0F172A]">Últimos Chamados</p>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] py-2">
                  <span className="text-sm text-[#0F172A]">#1234 - Sem conexão</span>
                  <span className="rounded bg-[#FEE2E2] px-2 py-1 text-xs text-[#991B1B]">Urgente</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#0F172A]">#1235 - Lentidão</span>
                  <span className="rounded bg-[#FEF9C3] px-2 py-1 text-xs text-[#854D0E]">Pendente</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferencesSection;
