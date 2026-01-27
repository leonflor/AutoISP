import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIntegrationTest } from "@/hooks/admin/useIntegrationTest";
import { useSaveIntegration } from "@/hooks/admin/useSaveIntegration";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, CircleDot, KeyRound } from "lucide-react";

interface OpenAIConfigFormProps {
  isConfigured: boolean;
  existingConfig?: {
    masked_key?: string;
    default_model?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Recomendado)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export function OpenAIConfigForm({ 
  isConfigured, 
  existingConfig,
  onSave, 
  onCancel,
}: OpenAIConfigFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [defaultModel, setDefaultModel] = useState(existingConfig?.default_model || "gpt-4o-mini");
  const { testIntegration, isLoading: isTesting, result, resetResult } = useIntegrationTest();
  const { saveIntegration, isSaving } = useSaveIntegration();
  const { toast } = useToast();

  const maskedKey = existingConfig?.masked_key;

  useEffect(() => {
    resetResult();
  }, [apiKey, resetResult]);

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    await testIntegration("openai", { api_key: apiKey.trim() });
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

    const saveResult = await saveIntegration("openai", {
      api_key: apiKey.trim(),
      default_model: defaultModel,
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
        <Label htmlFor="openai-api-key">API Key</Label>
        
        {/* Show masked key if configured */}
        {maskedKey && !apiKey && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{maskedKey}</span>
            <Badge variant="outline" className="ml-auto">Configurada</Badge>
          </div>
        )}
        
        <Input
          id="openai-api-key"
          type="password"
          placeholder={maskedKey ? "Digite nova chave para alterar" : "sk-proj-..."}
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
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              platform.openai.com
            </a>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="openai-model">Modelo Padrão</Label>
        <Select value={defaultModel} onValueChange={setDefaultModel}>
          <SelectTrigger id="openai-model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPENAI_MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            {result.details.available_models as number} modelos GPT disponíveis
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
