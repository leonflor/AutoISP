import { Bot, Users, MessageSquare, BarChart3, Clock, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: Bot,
    title: 'Atendimento com IA',
    description: 'Reduza 70% das demandas com chatbot inteligente que entende o contexto do seu ISP.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Users,
    title: 'Gestão de Assinantes',
    description: 'Sincronize automaticamente com seu ERP (SGP, IXC, MK-Auth) e mantenha dados atualizados.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: MessageSquare,
    title: 'Multicanalidade',
    description: 'WhatsApp, Telegram, SMS e Email integrados em uma única plataforma.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Inteligentes',
    description: 'Métricas de atendimento, CSAT, tempo de resposta e uso de IA em tempo real.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Clock,
    title: '24/7 Automatizado',
    description: 'Atendimento ininterrupto sem necessidade de equipe noturna ou fins de semana.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Segurança Enterprise',
    description: 'Dados isolados por tenant, backup automático e conformidade LGPD garantida.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

export const Benefits = () => {
  return (
    <section id="benefits" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que escolher o AutoISP?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido especificamente para provedores de internet, 
            com recursos que realmente fazem diferença no seu dia a dia.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${benefit.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
