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
import { usePlatformConfig } from "@/hooks/usePlatformConfig";

export type IntegrationType = "openai" | "resend" | "asaas" | null;

interface IntegrationConfigDialogProps {
  open: boolean;
  integration: IntegrationType;
  isConfigured: boolean;
  onClose: () => void;
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
}: IntegrationConfigDialogProps) {
  const { configMap } = usePlatformConfig();
  
  if (!integration) return null;

  const info = INTEGRATION_INFO[integration];
  const Icon = info.icon;

  // Get existing config for the integration
  const configKey = `integration_${integration}`;
  const existingConfig = configMap?.[configKey] as {
    masked_key?: string;
    default_model?: string;
    from_email?: string;
    environment?: "sandbox" | "production";
  } | undefined;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
            existingConfig={existingConfig}
            onSave={onClose}
            onCancel={onClose}
          />
        )}

        {integration === "resend" && (
          <ResendConfigForm
            isConfigured={isConfigured}
            existingConfig={existingConfig}
            onSave={onClose}
            onCancel={onClose}
          />
        )}

        {integration === "asaas" && (
          <AsaasConfigForm
            isConfigured={isConfigured}
            existingConfig={existingConfig}
            onSave={onClose}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
