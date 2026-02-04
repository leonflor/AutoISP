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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Optical Fiber Rays - Animated Data Transfer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary rays - Blue tones */}
        <div className="absolute top-[20%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-ray-1" />
        <div className="absolute top-[35%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-ray-2" />
        <div className="absolute top-[50%] left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-ray-3" />
        <div className="absolute top-[65%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-300/60 to-transparent animate-ray-4" />
        <div className="absolute top-[80%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-ray-5" />
        
        {/* Accent rays - Orange/Yellow tones */}
        <div className="absolute top-[25%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-ray-reverse-1" />
        <div className="absolute top-[45%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400/40 to-transparent animate-ray-reverse-2" />
        <div className="absolute top-[70%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-ray-reverse-3" />
        
        {/* Data packets - glowing dots traveling along rays */}
        <div className="absolute top-[20%] w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)),0_0_20px_hsl(var(--primary)/0.5)] animate-packet-1" />
        <div className="absolute top-[35%] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee,0_0_16px_#22d3ee80] animate-packet-2" />
        <div className="absolute top-[50%] w-4 h-4 rounded-full bg-primary/80 shadow-[0_0_12px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.5)] animate-packet-3" />
        <div className="absolute top-[65%] w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_#93c5fd,0_0_16px_#93c5fd80] animate-packet-4" />
        <div className="absolute top-[80%] w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4,0_0_20px_#06b6d480] animate-packet-5" />
        
        {/* Reverse packets */}
        <div className="absolute top-[25%] w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent)),0_0_16px_hsl(var(--accent)/0.5)] animate-packet-reverse-1" />
        <div className="absolute top-[45%] w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_10px_#fb923c,0_0_20px_#fb923c80] animate-packet-reverse-2" />
        <div className="absolute top-[70%] w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15,0_0_16px_#facc1580] animate-packet-reverse-3" />
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative">
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
              Atendimento 24/7, integração com seu ERP e relatórios inteligentes. 
              Tudo que seu ISP precisa em uma plataforma.
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
