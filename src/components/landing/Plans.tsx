import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para ISPs iniciando a automação',
    monthlyPrice: 299,
    yearlyPrice: 249,
    popular: false,
    features: [
      { name: 'Até 500 assinantes', included: true },
      { name: '3 usuários', included: true },
      { name: '1.000 mensagens IA/mês', included: true },
      { name: 'WhatsApp', included: true },
      { name: 'Integração ERP básica', included: true },
      { name: 'Suporte por email', included: true },
      { name: 'Telegram', included: false },
      { name: 'Agentes IA customizados', included: false },
      { name: 'API de integração', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para ISPs em crescimento',
    monthlyPrice: 599,
    yearlyPrice: 499,
    popular: true,
    features: [
      { name: 'Até 2.000 assinantes', included: true },
      { name: '10 usuários', included: true },
      { name: '5.000 mensagens IA/mês', included: true },
      { name: 'WhatsApp + Telegram', included: true },
      { name: 'Integração ERP completa', included: true },
      { name: 'Suporte prioritário', included: true },
      { name: 'Agentes IA customizados', included: true },
      { name: 'API de integração', included: true },
      { name: 'Relatórios avançados', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes operações',
    monthlyPrice: null,
    yearlyPrice: null,
    popular: false,
    features: [
      { name: 'Assinantes ilimitados', included: true },
      { name: 'Usuários ilimitados', included: true },
      { name: 'Mensagens IA ilimitadas', included: true },
      { name: 'Todos os canais', included: true },
      { name: 'Integrações customizadas', included: true },
      { name: 'Suporte dedicado 24/7', included: true },
      { name: 'SLA garantido', included: true },
      { name: 'Onboarding personalizado', included: true },
      { name: 'Servidor dedicado', included: true },
    ],
  },
];

export const Plans = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section 
      id="plans" 
      className="py-16 md:py-24 bg-secondary/30"
      aria-labelledby="plans-heading"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            id="plans-heading"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Planos que crescem com seu ISP
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para o tamanho do seu provedor. 
            Todos incluem 7 dias de teste grátis.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4" role="group" aria-label="Período de cobrança">
            <span 
              id="billing-monthly"
              className={cn(
                'text-sm font-medium transition-colors',
                !isYearly ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              Mensal
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-labelledby={isYearly ? "billing-yearly" : "billing-monthly"}
            />
            <span 
              id="billing-yearly"
              className={cn(
              'text-sm font-medium transition-colors',
              isYearly ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Anual
              <Badge variant="secondary" className="ml-2 bg-accent/10 text-accent">
                -17%
              </Badge>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  'relative transition-all duration-300',
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105 z-10' 
                    : 'border-border hover:border-primary/30'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    {price ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-sm text-muted-foreground">R$</span>
                          <span className="text-4xl font-bold text-foreground">{price}</span>
                          <span className="text-muted-foreground">/mês</span>
                        </div>
                        {isYearly && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cobrado anualmente
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-foreground">
                        Sob consulta
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={price ? '/auth?mode=signup' : '#contact'}>
                      {price ? 'Começar Agora' : 'Falar com Vendas'}
                    </Link>
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className={cn(
                          'text-sm',
                          feature.included ? 'text-foreground' : 'text-muted-foreground/50'
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guarantee */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          ✨ 7 dias de teste grátis • Sem cartão de crédito • Cancele quando quiser
        </p>
      </div>
    </section>
  );
};
