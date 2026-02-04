import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActiveIspsCount } from '@/hooks/useActiveIspsCount';

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
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

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border shadow-2xl">
              {/* Mock Dashboard */}
              <div className="bg-card rounded-xl overflow-hidden border border-border">
                {/* Header */}
                <div className="bg-primary/5 px-4 py-3 border-b border-border flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">AutoISP Dashboard</span>
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-primary/5 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-primary">247</div>
                      <div className="text-xs text-muted-foreground">Atendimentos</div>
                    </div>
                    <div className="bg-accent/5 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-accent">89%</div>
                      <div className="text-xs text-muted-foreground">Resolvidos IA</div>
                    </div>
                    <div className="bg-secondary rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">1.2k</div>
                      <div className="text-xs text-muted-foreground">Assinantes</div>
                    </div>
                  </div>

                  {/* Chat Preview */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">AI</span>
                      </div>
                      <div className="bg-secondary rounded-lg px-3 py-2 text-sm">
                        Olá! Como posso ajudar hoje?
                      </div>
                    </div>
                    <div className="flex items-start gap-2 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm">
                        Minha internet está lenta
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">AI</span>
                      </div>
                      <div className="bg-secondary rounded-lg px-3 py-2 text-sm">
                        Identifiquei uma instabilidade na sua região. Resolvendo automaticamente...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card rounded-lg px-3 py-2 shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium">Online 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
