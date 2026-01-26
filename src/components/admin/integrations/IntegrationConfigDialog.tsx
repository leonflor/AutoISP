import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpenAIConfigForm } from "./OpenAIConfigForm";
import { ResendConfigForm } from "./ResendConfigForm";
import { AsaasConfigForm } from "./AsaasConfigForm";
import { Brain, Mail, CreditCard } from "lucide-react";

export type IntegrationType = "openai" | "resend" | "asaas" | null;

interface IntegrationConfigDialogProps {
  open: boolean;
  integration: IntegrationType;
  isConfigured: boolean;
  onClose: () => void;
  onSave: (integration: IntegrationType, config: Record<string, unknown>) => void;
  isSaving: boolean;
}

const INTEGRATION_INFO = {
  openai: {
    title: "Configurar OpenAI",
    description: "Configure a integração com a API da OpenAI para recursos de IA",
    icon: Brain,
  },
  resend: {
    title: "Configurar Resend",
    description: "Configure o envio de emails transacionais via Resend",
    icon: Mail,
  },
  asaas: {
    title: "Configurar Asaas",
    description: "Configure o gateway de pagamentos Asaas",
    icon: CreditCard,
  },
};

export function IntegrationConfigDialog({
  open,
  integration,
  isConfigured,
  onClose,
  onSave,
  isSaving,
}: IntegrationConfigDialogProps) {
  if (!integration) return null;

  const info = INTEGRATION_INFO[integration];
  const Icon = info.icon;

  const handleSave = (config: Record<string, unknown>) => {
    onSave(integration, {
      ...config,
      configured: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {info.title}
          </DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        {integration === "openai" && (
          <OpenAIConfigForm
            isConfigured={isConfigured}
            onSave={handleSave}
            onCancel={onClose}
            isSaving={isSaving}
          />
        )}

        {integration === "resend" && (
          <ResendConfigForm
            isConfigured={isConfigured}
            onSave={handleSave}
            onCancel={onClose}
            isSaving={isSaving}
          />
        )}

        {integration === "asaas" && (
          <AsaasConfigForm
            isConfigured={isConfigured}
            onSave={handleSave}
            onCancel={onClose}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
