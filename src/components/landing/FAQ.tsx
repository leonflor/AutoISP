import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'Como funciona o período de trial de 7 dias?',
    answer: 'Você tem acesso completo a todas as funcionalidades do plano Pro durante 7 dias, sem precisar informar cartão de crédito. Ao final do período, você escolhe se quer continuar e seleciona o plano ideal para seu ISP.',
  },
  {
    question: 'Quais ERPs são compatíveis com o AutoISP?',
    answer: 'Temos integração nativa com os principais ERPs do mercado: SGP, IXC Provedor, MK-Auth, Hubsoft, Controllr e Radius. Para outros sistemas, oferecemos integração via API ou desenvolvemos conectores customizados.',
  },
  {
    question: 'Como a IA do AutoISP é treinada para meu provedor?',
    answer: 'Você pode alimentar a base de conhecimento com FAQs, procedimentos e informações específicas do seu ISP. A IA aprende continuamente com as interações e você pode revisar e aprovar as respostas para melhorar a precisão.',
  },
  {
    question: 'Posso migrar de plano a qualquer momento?',
    answer: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. No upgrade, a diferença é cobrada proporcionalmente. No downgrade, o crédito é aplicado nos meses seguintes.',
  },
  {
    question: 'Como funciona a integração com WhatsApp?',
    answer: 'Utilizamos a API oficial do WhatsApp Business. Você conecta seu número comercial e todos os atendimentos ficam centralizados na plataforma, com histórico completo e possibilidade de transferir para atendentes humanos.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Absolutamente. Utilizamos criptografia de ponta a ponta, os dados são isolados por tenant (multi-tenancy seguro), fazemos backup automático diário e estamos em conformidade total com a LGPD.',
  },
  {
    question: 'Qual o suporte oferecido?',
    answer: 'Plano Starter tem suporte por email (resposta em até 24h). Plano Pro tem suporte prioritário via chat e email (resposta em até 4h). Enterprise tem suporte dedicado 24/7 com gerente de conta exclusivo.',
  },
  {
    question: 'Preciso de conhecimento técnico para usar?',
    answer: 'Não! O AutoISP foi desenvolvido para ser intuitivo. Oferecemos onboarding guiado, tutoriais em vídeo e nossa equipe de sucesso do cliente ajuda na configuração inicial. Planos Enterprise incluem treinamento presencial.',
  },
];

export const FAQ = () => {
  return (
    <section 
      id="faq" 
      className="py-16 md:py-24 bg-secondary/30"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas dúvidas sobre o AutoISP. Não encontrou o que procura? 
            Entre em contato conosco.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
