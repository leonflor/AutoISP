import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChunkSizeConfigProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ChunkSizeConfig({ value, onChange, disabled }: ChunkSizeConfigProps) {
  const handleChange = (values: number[]) => {
    onChange(values[0]);
  };

  // Descrição baseada no tamanho
  const getDescription = (size: number) => {
    if (size <= 300) return "Chunks menores = mais precisão, mais fragmentação";
    if (size <= 600) return "Tamanho equilibrado para a maioria dos casos";
    return "Chunks maiores = mais contexto, menos precisão";
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="chunk-size">Tamanho do Chunk</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Define quantas palavras cada fragmento do documento terá. Chunks
                menores são mais precisos, mas podem perder contexto. Chunks maiores
                preservam mais contexto, mas podem incluir informações irrelevantes.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-2">
          <Slider
            id="chunk-size"
            min={250}
            max={1000}
            step={50}
            value={[value]}
            onValueChange={handleChange}
            disabled={disabled}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>250</span>
            <span className="font-medium text-foreground">{value} palavras</span>
            <span>1000</span>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {getDescription(value)}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
