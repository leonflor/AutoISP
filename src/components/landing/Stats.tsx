import { Users, Building2, Star, TrendingDown } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    value: '500+',
    label: 'ISPs atendidos',
    description: 'Provedores de todos os portes',
  },
  {
    icon: Users,
    value: '2M+',
    label: 'Assinantes gerenciados',
    description: 'Em toda a plataforma',
  },
  {
    icon: Star,
    value: '98%',
    label: 'Taxa de satisfação',
    description: 'Avaliação dos clientes',
  },
  {
    icon: TrendingDown,
    value: '70%',
    label: 'Redução em custos',
    description: 'De atendimento ao cliente',
  },
];

export const Stats = () => {
  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-primary-foreground/90 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-primary-foreground/60">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
