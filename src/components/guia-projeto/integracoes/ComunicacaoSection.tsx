import WhatsAppIntegration from "./WhatsAppIntegration";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

      {/* Integração documentada */}
      <WhatsAppIntegration />

      {/* Integrações pendentes */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-medium text-foreground">Pendentes de Documentação</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-dashed border-border/50 bg-muted/20">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">INT-07 — SMS (Twilio/Zenvia)</h4>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                    Pendente
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  SMS transacionais, fallback do WhatsApp, notificações de emergência, OTP
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-border/50 bg-muted/20">
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Bell className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">INT-08 — Push Notifications</h4>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                    Pendente
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Firebase Cloud Messaging (FCM) / OneSignal para notificações push web e mobile
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComunicacaoSection;
