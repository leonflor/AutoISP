import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIntegrationTest } from "@/hooks/admin/useIntegrationTest";
import { useSaveIntegration } from "@/hooks/admin/useSaveIntegration";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, CircleDot, AlertTriangle, KeyRound } from "lucide-react";

interface AsaasConfigFormProps {
  isConfigured: boolean;
  existingConfig?: {
    masked_key?: string;
    environment?: "sandbox" | "production";
  };
  onSave: () => void;
  onCancel: () => void;
}

export function AsaasConfigForm({ 
  isConfigured, 
  existingConfig,
  onSave, 
  onCancel,
}: AsaasConfigFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    existingConfig?.environment || "production"
  );
  const [webhookToken, setWebhookToken] = useState("");
  const { testIntegration, isLoading: isTesting, result, resetResult } = useIntegrationTest();
  const { saveIntegration, isSaving } = useSaveIntegration();
  const { toast } = useToast();

  const maskedKey = existingConfig?.masked_key;

  // Detect environment based on key prefix
  const detectedEnvironment = useMemo(() => {
    if (!apiKey || apiKey.length < 10) return null;
    if (apiKey.includes("_prod_")) return "production";
    if (apiKey.includes("_hmlg_") || apiKey.includes("_sandbox_")) return "sandbox";
    return null;
  }, [apiKey]);

  const hasEnvironmentMismatch = detectedEnvironment && detectedEnvironment !== environment;

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

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Chave obrigatória",
        description: "Digite a API Key para salvar.",
      });
      return;
    }

    const saveResult = await saveIntegration("asaas", {
      api_key: apiKey.trim(),
      environment,
      webhook_token: webhookToken || undefined,
    });

    if (saveResult.success) {
      toast({
        title: "Integração salva",
        description: saveResult.message,
      });
      onSave();
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: saveResult.message,
      });
    }
  };

  const getStatusBadge = () => {
    if (isTesting) {
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
        
        {/* Show masked key if configured */}
        {maskedKey && !apiKey && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{maskedKey}</span>
            <Badge variant="outline" className="ml-auto">Configurada</Badge>
          </div>
        )}
        
        <Input
          id="asaas-api-key"
          type="password"
          placeholder={maskedKey ? "Digite nova chave para alterar" : "$aact_..."}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        
        {maskedKey && (
          <p className="text-xs text-muted-foreground">
            Deixe em branco para manter a chave atual (não é possível visualizá-la)
          </p>
        )}
        
        {!maskedKey && (
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
        )}
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

      {/* Environment mismatch warning */}
      {hasEnvironmentMismatch && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              A chave parece ser de <strong>{detectedEnvironment === "production" ? "Produção" : "Sandbox"}</strong>, 
              mas você selecionou <strong>{environment === "production" ? "Produção" : "Sandbox"}</strong>.
            </span>
          </p>
        </div>
      )}

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

      {/* Error message */}
      {result && !result.success && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
          <p className="text-sm font-medium text-destructive">{result.message}</p>
          
          {result.details?.http_status && (
            <p className="text-xs text-muted-foreground">
              Status HTTP: {result.details.http_status}
            </p>
          )}
          
          {result.details?.error_code && result.details.error_code !== "UNKNOWN" && (
            <p className="text-xs text-muted-foreground">
              Código: {result.details.error_code}
            </p>
          )}
          
          {result.details?.suggestion && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              💡 Sugestão: {result.details.suggestion}
            </p>
          )}
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
          disabled={!apiKey.trim() || isTesting}
        >
          {isTesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Testar Conexão
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!apiKey.trim() || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Configuração
          </Button>
        </div>
      </div>
    </div>
  );
}
