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
      
      {/* Radial Power Animation - Emanating from center (robot position) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1] opacity-40">
        {/* Radial rays emanating from center */}
        <div className="radial-center">
          {/* Top rays */}
          <div className="radial-ray radial-ray-1"><div className="ray-glow ray-glow-blue" /></div>
          <div className="radial-ray radial-ray-2"><div className="ray-glow ray-glow-cyan" /></div>
          <div className="radial-ray radial-ray-3"><div className="ray-glow ray-glow-orange" /></div>
          
          {/* Top-right rays */}
          <div className="radial-ray radial-ray-4"><div className="ray-glow ray-glow-blue" /></div>
          <div className="radial-ray radial-ray-5"><div className="ray-glow ray-glow-cyan" /></div>
          
          {/* Right rays */}
          <div className="radial-ray radial-ray-6"><div className="ray-glow ray-glow-orange" /></div>
          <div className="radial-ray radial-ray-7"><div className="ray-glow ray-glow-blue" /></div>
          
          {/* Bottom-right rays */}
          <div className="radial-ray radial-ray-8"><div className="ray-glow ray-glow-cyan" /></div>
          <div className="radial-ray radial-ray-9"><div className="ray-glow ray-glow-orange" /></div>
          
          {/* Bottom rays */}
          <div className="radial-ray radial-ray-10"><div className="ray-glow ray-glow-blue" /></div>
          <div className="radial-ray radial-ray-11"><div className="ray-glow ray-glow-cyan" /></div>
          
          {/* Bottom-left rays */}
          <div className="radial-ray radial-ray-12"><div className="ray-glow ray-glow-orange" /></div>
          <div className="radial-ray radial-ray-13"><div className="ray-glow ray-glow-blue" /></div>
          
          {/* Left rays */}
          <div className="radial-ray radial-ray-14"><div className="ray-glow ray-glow-cyan" /></div>
          <div className="radial-ray radial-ray-15"><div className="ray-glow ray-glow-orange" /></div>
          
          {/* Top-left rays */}
          <div className="radial-ray radial-ray-16"><div className="ray-glow ray-glow-blue" /></div>
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
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-accent" />
            {activeIspsCount}+ ISPs já automatizados
          </Badge>

          {/* Headline */}
          <h1 
            id="hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4"
          >
            Automatize seu{' '}
            <span className="text-primary">provedor de internet</span>{' '}
            com IA
          </h1>

          {/* Hero Image - Robot - Right after title */}
          <div className="relative flex items-center justify-center -my-4">
            <img 
              src={heroRobot} 
              alt="AutoISP Robot - Automação inteligente para provedores"
              className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto object-contain drop-shadow-2xl scale-[1.3]"
            />
          </div>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
            Primeiro e único ecossistema de automação para ISP que agrega Vendas, Suporte N1, Financeiro, Monitoramento, Comunicação Ativa com a base de clientes gerando economia e eficiência para seu provedor.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
          <div className="flex flex-wrap items-center gap-6 justify-center text-sm text-muted-foreground">
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
      </div>
    </section>
  );
};
