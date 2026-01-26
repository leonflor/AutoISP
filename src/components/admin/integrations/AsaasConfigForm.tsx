import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIntegrationTest } from "@/hooks/admin/useIntegrationTest";
import { Loader2, CheckCircle2, XCircle, CircleDot } from "lucide-react";

interface AsaasConfigFormProps {
  isConfigured: boolean;
  onSave: (config: { environment: string; tested_at: string }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function AsaasConfigForm({ 
  isConfigured, 
  onSave, 
  onCancel,
  isSaving 
}: AsaasConfigFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
  const [webhookToken, setWebhookToken] = useState("");
  const { testIntegration, isLoading, result, resetResult } = useIntegrationTest();

  useEffect(() => {
    resetResult();
  }, [apiKey, environment, resetResult]);

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    await testIntegration("asaas", { 
      api_key: apiKey.trim(), 
      environment,
      webhook_token: webhookToken || undefined
    });
  };

  const handleSave = () => {
    if (result?.success) {
      onSave({
        environment,
        tested_at: new Date().toISOString(),
      });
    }
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Testando...
        </Badge>
      );
    }
    if (result?.success) {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Conexão válida
        </Badge>
      );
    }
    if (result && !result.success) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Falha na conexão
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <CircleDot className="h-3 w-3" />
        Não testado
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="asaas-api-key">API Key</Label>
        <Input
          id="asaas-api-key"
          type="password"
          placeholder={isConfigured ? "••••••••••••••••••••" : "$aact_..."}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Obtenha sua chave em{" "}
          <a 
            href="https://www.asaas.com/config/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            asaas.com
          </a>
        </p>
      </div>

      <div className="space-y-3">
        <Label>Ambiente</Label>
        <RadioGroup 
          value={environment} 
          onValueChange={(v) => setEnvironment(v as "sandbox" | "production")}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sandbox" id="asaas-sandbox" />
            <Label htmlFor="asaas-sandbox" className="font-normal cursor-pointer">
              Sandbox (testes)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="production" id="asaas-production" />
            <Label htmlFor="asaas-production" className="font-normal cursor-pointer">
              Produção
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="asaas-webhook-token">Webhook Token (opcional)</Label>
        <Input
          id="asaas-webhook-token"
          type="password"
          placeholder="Token para validar webhooks"
          value={webhookToken}
          onChange={(e) => setWebhookToken(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Configure nas Integrações do Asaas para validar webhooks
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Status:</span>
        {getStatusBadge()}
      </div>

      {result && !result.success && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{result.message}</p>
        </div>
      )}

      {result?.success && result.details && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <p className="text-sm text-green-700 dark:text-green-400">
            Conta: {result.details.account_name as string}
            {result.details.environment === "sandbox" && " (Sandbox)"}
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleTest} 
          disabled={!apiKey.trim() || isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Testar Conexão
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!result?.success || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Configuração
          </Button>
        </div>
      </div>
    </div>
  );
}
