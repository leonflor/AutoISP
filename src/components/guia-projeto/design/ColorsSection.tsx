import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface ColorSwatch {
  name: string;
  hsl: string;
  hex: string;
  usage: string;
  cssVar?: string;
}

const ColorsSection = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const primaryColors: ColorSwatch[] = [
    { name: "Primary", hsl: "217 91% 60%", hex: "#3B82F6", usage: "Ações principais, links, CTAs", cssVar: "--primary" },
    { name: "Primary Dark", hsl: "222 84% 5%", hex: "#0F172A", usage: "Fundo dark mode, headers", cssVar: "--foreground" },
    { name: "Secondary", hsl: "25 95% 53%", hex: "#F97316", usage: "Destaques, alertas, CTAs secundários", cssVar: "--accent" },
  ];

  const neutralColors: ColorSwatch[] = [
    { name: "Background", hsl: "210 40% 98%", hex: "#F8FAFC", usage: "Fundo principal light", cssVar: "--background" },
    { name: "Foreground", hsl: "222 84% 5%", hex: "#0F172A", usage: "Texto principal", cssVar: "--foreground" },
    { name: "Muted", hsl: "215 20% 65%", hex: "#94A3B8", usage: "Texto secundário", cssVar: "--muted-foreground" },
    { name: "Border", hsl: "214 32% 91%", hex: "#E2E8F0", usage: "Bordas e divisores", cssVar: "--border" },
  ];

  const semanticColors: ColorSwatch[] = [
    { name: "Success", hsl: "142 76% 36%", hex: "#16A34A", usage: "Sucesso, ativo, online" },
    { name: "Error", hsl: "0 84% 60%", hex: "#DC2626", usage: "Erro, crítico, offline" },
    { name: "Warning", hsl: "45 93% 47%", hex: "#EAB308", usage: "Atenção, pendente" },
    { name: "Info", hsl: "217 91% 60%", hex: "#3B82F6", usage: "Informativo (usa primary)" },
  ];

  const darkModeColors: ColorSwatch[] = [
    { name: "Background", hsl: "222 84% 5%", hex: "#0F172A", usage: "Fundo principal" },
    { name: "Card", hsl: "217 33% 12%", hex: "#1E293B", usage: "Cards e superfícies" },
    { name: "Foreground", hsl: "210 40% 98%", hex: "#F8FAFC", usage: "Texto principal" },
    { name: "Muted", hsl: "215 20% 65%", hex: "#94A3B8", usage: "Texto secundário" },
    { name: "Border", hsl: "217 33% 17%", hex: "#334155", usage: "Bordas e divisores" },
  ];

  const ColorSwatchComponent = ({ color, showCssVar = true }: { color: ColorSwatch; showCssVar?: boolean }) => (
    <div
      className="group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:shadow-md"
      onClick={() => copyToClipboard(color.hex, color.name)}
    >
      <div
        className="mb-3 h-16 rounded-md shadow-sm"
        style={{ backgroundColor: color.hex }}
      />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground">{color.name}</p>
          {copiedColor === color.name ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground">{color.hex}</p>
        <p className="font-mono text-xs text-muted-foreground">hsl({color.hsl})</p>
        {showCssVar && color.cssVar && (
          <Badge variant="outline" className="mt-1 text-xs">
            {color.cssVar}
          </Badge>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{color.usage}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cores Primárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-primary" />
            Cores Primárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {primaryColors.map((color) => (
              <ColorSwatchComponent key={color.name} color={color} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cores Neutras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-muted-foreground" />
            Cores Neutras (Light Mode)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {neutralColors.map((color) => (
              <ColorSwatchComponent key={color.name} color={color} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cores Semânticas */}
      <Card>
        <CardHeader>
          <CardTitle>Cores Semânticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {semanticColors.map((color) => (
              <ColorSwatchComponent key={color.name} color={color} showCssVar={false} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dark Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-muted-foreground" />
            Dark Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-[#0F172A] p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {darkModeColors.map((color) => (
                <div
                  key={color.name}
                  className="group cursor-pointer rounded-lg border border-[#334155] bg-[#1E293B] p-3 transition-all hover:shadow-md"
                  onClick={() => copyToClipboard(color.hex, `dark-${color.name}`)}
                >
                  <div
                    className="mb-3 h-12 rounded-md"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="space-y-1">
                    <p className="font-medium text-[#F8FAFC]">{color.name}</p>
                    <p className="font-mono text-xs text-[#94A3B8]">{color.hex}</p>
                    <p className="mt-2 text-xs text-[#94A3B8]">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorsSection;
