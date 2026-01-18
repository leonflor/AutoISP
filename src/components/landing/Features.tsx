import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Bot, 
  Send, 
  BarChart3,
  Check,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const features = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard de Atendimentos',
    description: 'Visão completa de todos os atendimentos em tempo real, com métricas de performance e alertas automáticos.',
    items: [
      'Métricas em tempo real',
      'Alertas de SLA',
      'Gráficos de tendência',
      'Filtros avançados',
    ],
  },
  {
    id: 'subscribers',
    icon: Users,
    title: 'Gestão de Assinantes',
    description: 'Sincronização automática com seu ERP e acesso rápido a informações de cada assinante.',
    items: [
      'Sincronização com ERP',
      'Histórico completo',
      'Status de conexão',
      'Dados financeiros',
    ],
  },
  {
    id: 'ai-agents',
    icon: Bot,
    title: 'Agentes IA Configuráveis',
    description: 'Crie agentes personalizados para diferentes tipos de atendimento com base de conhecimento própria.',
    items: [
      'Múltiplos agentes',
      'Base de conhecimento',
      'Fluxos personalizados',
      'Aprendizado contínuo',
    ],
  },
  {
    id: 'communication',
    icon: Send,
    title: 'Comunicação Ativa',
    description: 'Envie campanhas de comunicação em massa via WhatsApp, SMS e Email com segmentação avançada.',
    items: [
      'Campanhas em massa',
      'Segmentação de público',
      'Templates dinâmicos',
      'Agendamento',
    ],
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Relatórios e Analytics',
    description: 'Relatórios detalhados sobre atendimentos, satisfação e performance da equipe e IA.',
    items: [
      'Relatórios customizáveis',
      'Exportação de dados',
      'Comparativos',
      'Insights automáticos',
    ],
  },
];

export const Features = () => {
  const [activeFeature, setActiveFeature] = useState(features[0].id);
  const active = features.find(f => f.id === activeFeature) || features[0];

  return (
    <section 
      id="features" 
      className="py-16 md:py-24"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            id="features-heading"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Tudo que seu ISP precisa
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para automatizar e otimizar 
            o atendimento do seu provedor de internet.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Feature Tabs */}
          <div className="lg:col-span-2 space-y-2">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all duration-200',
                  activeFeature === feature.id
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-card border-border hover:border-primary/30 hover:bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    activeFeature === feature.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={cn(
                      'font-medium transition-colors',
                      activeFeature === feature.id ? 'text-primary' : 'text-foreground'
                    )}>
                      {feature.title}
                    </h4>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border p-8 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <active.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{active.title}</h3>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 text-lg">
                {active.description}
              </p>

              <ul className="space-y-3 mb-8">
                {active.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline">
                Saiba mais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
