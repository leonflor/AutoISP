import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIntegrationTest } from "@/hooks/admin/useIntegrationTest";
import { Loader2, CheckCircle2, XCircle, CircleDot } from "lucide-react";

interface ResendConfigFormProps {
  isConfigured: boolean;
  onSave: (config: { from_email: string; tested_at: string }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function ResendConfigForm({ 
  isConfigured, 
  onSave, 
  onCancel,
  isSaving 
}: ResendConfigFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const { testIntegration, isLoading, result, resetResult } = useIntegrationTest();

  useEffect(() => {
    resetResult();
  }, [apiKey, resetResult]);

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    await testIntegration("resend", { api_key: apiKey.trim(), from_email: fromEmail });
  };

  const handleSave = () => {
    if (result?.success) {
      onSave({
        from_email: fromEmail,
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
        <Label htmlFor="resend-api-key">API Key</Label>
        <Input
          id="resend-api-key"
          type="password"
          placeholder={isConfigured ? "••••••••••••••••••••" : "re_..."}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Obtenha sua chave em{" "}
          <a 
            href="https://resend.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            resend.com
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resend-from-email">Email Remetente (From)</Label>
        <Input
          id="resend-from-email"
          type="email"
          placeholder="noreply@seudominio.com"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          O domínio deve estar verificado no Resend
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
            {(result.details.domains_count as number) > 0 
              ? `${result.details.domains_count} domínio(s) configurado(s)` 
              : "Nenhum domínio configurado ainda"}
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
