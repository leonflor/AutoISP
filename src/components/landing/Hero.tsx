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
      
      {/* Optical Fiber Network Animation - Behind all content */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1] opacity-30">
        {/* Diagonal fiber lines with data packets */}
        
        {/* Line 1: Diagonal down-right (blue) */}
        <div className="fiber-line fiber-line-1">
          <div className="fiber-trail fiber-trail-blue" />
          <div className="fiber-glow fiber-glow-blue" />
        </div>
        
        {/* Line 2: Diagonal down-left (orange) */}
        <div className="fiber-line fiber-line-2">
          <div className="fiber-trail fiber-trail-orange" />
          <div className="fiber-glow fiber-glow-orange" />
        </div>
        
        {/* Line 3: Slight angle (cyan) */}
        <div className="fiber-line fiber-line-3">
          <div className="fiber-trail fiber-trail-cyan" />
          <div className="fiber-glow fiber-glow-cyan" />
        </div>
        
        {/* Line 4: Steep diagonal (blue) */}
        <div className="fiber-line fiber-line-4">
          <div className="fiber-trail fiber-trail-blue" />
          <div className="fiber-glow fiber-glow-blue" />
        </div>
        
        {/* Line 5: Reverse diagonal (orange) */}
        <div className="fiber-line fiber-line-5">
          <div className="fiber-trail fiber-trail-orange" />
          <div className="fiber-glow fiber-glow-orange" />
        </div>
        
        {/* Line 6: Shallow angle (cyan) */}
        <div className="fiber-line fiber-line-6">
          <div className="fiber-trail fiber-trail-cyan" />
          <div className="fiber-glow fiber-glow-cyan" />
        </div>
        
        {/* Line 7: Cross pattern (blue) */}
        <div className="fiber-line fiber-line-7">
          <div className="fiber-trail fiber-trail-blue" />
          <div className="fiber-glow fiber-glow-blue" />
        </div>
        
        {/* Line 8: Reverse cross (orange) */}
        <div className="fiber-line fiber-line-8">
          <div className="fiber-trail fiber-trail-orange" />
          <div className="fiber-glow fiber-glow-orange" />
        </div>

        {/* Vertical Lines - Bottom to Top */}
        <div className="fiber-line-vertical fiber-line-v1">
          <div className="fiber-trail-vertical fiber-trail-blue" />
          <div className="fiber-glow-vertical fiber-glow-blue" />
        </div>
        
        <div className="fiber-line-vertical fiber-line-v2">
          <div className="fiber-trail-vertical fiber-trail-cyan" />
          <div className="fiber-glow-vertical fiber-glow-cyan" />
        </div>
        
        <div className="fiber-line-vertical fiber-line-v3">
          <div className="fiber-trail-vertical fiber-trail-orange" />
          <div className="fiber-glow-vertical fiber-glow-orange" />
        </div>
        
        <div className="fiber-line-vertical fiber-line-v4">
          <div className="fiber-trail-vertical fiber-trail-blue" />
          <div className="fiber-glow-vertical fiber-glow-blue" />
        </div>

        <div className="fiber-line-vertical fiber-line-v5">
          <div className="fiber-trail-vertical fiber-trail-cyan" />
          <div className="fiber-glow-vertical fiber-glow-cyan" />
        </div>

        {/* Reverse direction lines - Right to Left */}
        <div className="fiber-line fiber-line-reverse-1">
          <div className="fiber-trail fiber-trail-blue fiber-trail-reverse" />
          <div className="fiber-glow fiber-glow-blue fiber-glow-reverse" />
        </div>
        
        <div className="fiber-line fiber-line-reverse-2">
          <div className="fiber-trail fiber-trail-orange fiber-trail-reverse" />
          <div className="fiber-glow fiber-glow-orange fiber-glow-reverse" />
        </div>

        <div className="fiber-line fiber-line-reverse-3">
          <div className="fiber-trail fiber-trail-cyan fiber-trail-reverse" />
          <div className="fiber-glow fiber-glow-cyan fiber-glow-reverse" />
        </div>
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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

          {/* Hero Image - Robot */}
          <div className="relative flex items-center justify-center lg:-mt-16">
            <img 
              src={heroRobot} 
              alt="AutoISP Robot - Automação inteligente para provedores"
              className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl h-auto object-contain drop-shadow-2xl scale-[1.3]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
