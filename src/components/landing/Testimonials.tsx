import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Carlos Silva',
    role: 'Diretor de Operações',
    company: 'NetFibra Telecom',
    avatar: 'CS',
    rating: 5,
    text: 'O AutoISP revolucionou nosso atendimento. Reduzimos 70% das chamadas repetitivas e nossos clientes nunca estiveram tão satisfeitos. A IA realmente entende o contexto do provedor.',
  },
  {
    id: 2,
    name: 'Ana Rodrigues',
    role: 'Gerente de Suporte',
    company: 'SpeedNet Internet',
    avatar: 'AR',
    rating: 5,
    text: 'Implementamos em uma semana e já vimos resultados. A integração com nosso SGP foi perfeita e a equipe consegue focar em problemas mais complexos agora.',
  },
  {
    id: 3,
    name: 'Roberto Mendes',
    role: 'CEO',
    company: 'ConectaFibra',
    avatar: 'RM',
    rating: 5,
    text: 'Passamos de 500 para 2000 assinantes sem aumentar a equipe de suporte. O ROI foi impressionante já no primeiro mês.',
  },
  {
    id: 4,
    name: 'Mariana Costa',
    role: 'Coordenadora de Atendimento',
    company: 'LinkNet Provedor',
    avatar: 'MC',
    rating: 5,
    text: 'A comunicação via WhatsApp automatizada mudou completamente nossa operação. Clientes recebem respostas instantâneas 24 horas por dia.',
  },
  {
    id: 5,
    name: 'Paulo Ferreira',
    role: 'Diretor Técnico',
    company: 'TurboNet Fibra',
    avatar: 'PF',
    rating: 5,
    text: 'Os relatórios de IA nos ajudaram a identificar problemas recorrentes que nem sabíamos que existiam. Prevenção proativa de churns.',
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const visibleCount = 3;
  const maxIndex = testimonials.length - visibleCount;

  const next = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como o AutoISP está transformando a operação de provedores em todo o Brasil.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              disabled={currentIndex === 0}
              className="rounded-full shadow-lg bg-card"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="rounded-full shadow-lg bg-card"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-out gap-6"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleCount + 2)}%)` 
              }}
            >
              {testimonials.map((testimonial) => (
                <Card 
                  key={testimonial.id}
                  className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] border-border"
                >
                  <CardContent className="p-6">
                    {/* Quote Icon */}
                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                    
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-foreground mb-6 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} • {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Dots Indicator (Mobile) */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(Math.min(index, maxIndex))}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
