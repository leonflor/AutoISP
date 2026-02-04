import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActiveIspsCount } from '@/hooks/useActiveIspsCount';
import heroRobot from '@/assets/hero-robot.png';

export const Hero = () => {
  const { data: activeIspsCount = 0 } = useActiveIspsCount();
  return (
    <section 
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
      
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 mr-1.5 text-accent" />
              {activeIspsCount}+ ISPs já automatizados
            </Badge>

            {/* Headline */}
            <h1 
              id="hero-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              Automatize seu{' '}
              <span className="text-primary">provedor de internet</span>{' '}
              com IA
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Primeiro e único ecossistema de automação para ISP que agrega Vendas, Suporte N1, Financeiro, Monitoramento, Comunicação Ativa com a base de clientes gerando economia e eficiência para seu provedor.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button size="lg" asChild className="text-base">
                <Link to="/auth?mode=signup">
                  Testar Grátis 7 Dias
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                <Play className="mr-2 h-4 w-4" />
                Ver Demonstração
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>2M+ assinantes gerenciados</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>98% de satisfação</span>
              </div>
            </div>
          </div>

          {/* Hero Image - Robot - Positioned at bottom of hero */}
          <div className="relative flex items-end justify-center lg:-ml-24 self-end">
            <img 
              src={heroRobot} 
              alt="AutoISP Robot - Automação inteligente para provedores"
              className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl h-auto object-contain drop-shadow-lg animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
