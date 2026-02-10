import robotEcosystem from '@/assets/robot-ecosystem.png';

export const Ecosystem = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Image */}
          <div className="flex-1 flex justify-center">
            <img
              src={robotEcosystem}
              alt="Robô AutoISP conectando Atendimento N1, Vendas Ativas, Monitoramento de Ativos, Integração e Automação"
              className="w-full max-w-lg drop-shadow-xl"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Um ecossistema completo para seu provedor
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O AutoISP conecta todas as áreas críticas do seu ISP em uma única plataforma inteligente:
              <strong className="text-foreground"> Atendimento N1</strong>,{' '}
              <strong className="text-foreground">Vendas Ativas</strong>,{' '}
              <strong className="text-foreground">Monitoramento de Ativos</strong>,{' '}
              <strong className="text-foreground">Integração com ERP</strong> e{' '}
              <strong className="text-foreground">Automação</strong> — tudo operando 24/7 com inteligência artificial.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Enquanto seu time descansa, nossos agentes de IA continuam vendendo, atendendo e
              monitorando. Mais eficiência, menos custo operacional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
