import WhatsAppIntegration from "./WhatsAppIntegration";
import SMSIntegration from "./SMSIntegration";
import PushNotificationsIntegration from "./PushNotificationsIntegration";

const ComunicacaoSection = () => {
  return (
    <div className="space-y-8">
      {/* Header da seção */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Integrações de Comunicação</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Canais de comunicação multi-canal com clientes: WhatsApp, SMS e Push Notifications
        </p>
      </div>

      {/* Integrações documentadas */}
      <WhatsAppIntegration />
      <SMSIntegration />
      <PushNotificationsIntegration />
    </div>
  );
};

export default ComunicacaoSection;
