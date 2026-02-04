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
      
      {/* Data Web Animation - Spider web pattern with flowing particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        {/* Floating data particles - scattered across the screen */}
        {/* Row 1 */}
        <div className="particle particle-blue-1" style={{ top: '8%', left: '5%' }} />
        <div className="particle particle-cyan-1" style={{ top: '12%', left: '20%' }} />
        <div className="particle particle-orange-1" style={{ top: '5%', left: '35%' }} />
        <div className="particle particle-blue-2" style={{ top: '15%', left: '50%' }} />
        <div className="particle particle-cyan-2" style={{ top: '10%', left: '65%' }} />
        <div className="particle particle-orange-2" style={{ top: '18%', left: '80%' }} />
        <div className="particle particle-blue-3" style={{ top: '6%', left: '92%' }} />
        
        {/* Row 2 */}
        <div className="particle particle-cyan-3" style={{ top: '25%', left: '10%' }} />
        <div className="particle particle-orange-3" style={{ top: '30%', left: '25%' }} />
        <div className="particle particle-blue-4" style={{ top: '22%', left: '42%' }} />
        <div className="particle particle-cyan-4" style={{ top: '28%', left: '58%' }} />
        <div className="particle particle-orange-4" style={{ top: '32%', left: '75%' }} />
        <div className="particle particle-blue-5" style={{ top: '26%', left: '88%' }} />
        
        {/* Row 3 */}
        <div className="particle particle-orange-5" style={{ top: '42%', left: '8%' }} />
        <div className="particle particle-blue-6" style={{ top: '48%', left: '22%' }} />
        <div className="particle particle-cyan-5" style={{ top: '45%', left: '38%' }} />
        <div className="particle particle-orange-6" style={{ top: '50%', left: '55%' }} />
        <div className="particle particle-blue-7" style={{ top: '44%', left: '70%' }} />
        <div className="particle particle-cyan-6" style={{ top: '52%', left: '85%' }} />
        
        {/* Row 4 */}
        <div className="particle particle-blue-8" style={{ top: '62%', left: '12%' }} />
        <div className="particle particle-orange-7" style={{ top: '68%', left: '28%' }} />
        <div className="particle particle-cyan-7" style={{ top: '65%', left: '45%' }} />
        <div className="particle particle-blue-9" style={{ top: '70%', left: '62%' }} />
        <div className="particle particle-orange-8" style={{ top: '64%', left: '78%' }} />
        <div className="particle particle-cyan-8" style={{ top: '72%', left: '95%' }} />
        
        {/* Row 5 */}
        <div className="particle particle-cyan-9" style={{ top: '82%', left: '6%' }} />
        <div className="particle particle-blue-10" style={{ top: '88%', left: '18%' }} />
        <div className="particle particle-orange-9" style={{ top: '85%', left: '32%' }} />
        <div className="particle particle-cyan-10" style={{ top: '90%', left: '48%' }} />
        <div className="particle particle-blue-11" style={{ top: '84%', left: '65%' }} />
        <div className="particle particle-orange-10" style={{ top: '92%', left: '82%' }} />
        
        {/* Connection lines - subtle web structure */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Diagonal lines creating web effect */}
          <line x1="0%" y1="20%" x2="100%" y2="60%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-line-pulse" />
          <line x1="0%" y1="50%" x2="100%" y2="30%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-line-pulse-delay" />
          <line x1="0%" y1="80%" x2="100%" y2="40%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-line-pulse-delay-2" />
          <line x1="100%" y1="10%" x2="0%" y2="70%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-line-pulse" />
          <line x1="100%" y1="50%" x2="0%" y2="90%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-line-pulse-delay" />
          <line x1="20%" y1="0%" x2="80%" y2="100%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-line-pulse-delay-2" />
          <line x1="60%" y1="0%" x2="40%" y2="100%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-line-pulse" />
        </svg>
      </div>
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-15"
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
