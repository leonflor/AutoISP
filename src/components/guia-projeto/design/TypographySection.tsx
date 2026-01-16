import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TypographySection = () => {
  const typographyScale = [
    { element: "H1", weight: "700 (Bold)", size: "36px", lineHeight: "1.2", tailwind: "text-4xl font-bold" },
    { element: "H2", weight: "600 (Semibold)", size: "28px", lineHeight: "1.3", tailwind: "text-2xl font-semibold" },
    { element: "H3", weight: "600 (Semibold)", size: "22px", lineHeight: "1.4", tailwind: "text-xl font-semibold" },
    { element: "H4", weight: "500 (Medium)", size: "18px", lineHeight: "1.4", tailwind: "text-lg font-medium" },
    { element: "Body", weight: "400 (Regular)", size: "16px", lineHeight: "1.5", tailwind: "text-base" },
    { element: "Small", weight: "400 (Regular)", size: "14px", lineHeight: "1.5", tailwind: "text-sm" },
    { element: "Caption", weight: "500 (Medium)", size: "12px", lineHeight: "1.4", tailwind: "text-xs font-medium" },
  ];

  const fontWeights = [
    { weight: 400, name: "Regular", usage: "Texto corrido, descrições" },
    { weight: 500, name: "Medium", usage: "Labels, captions, ênfase leve" },
    { weight: 600, name: "Semibold", usage: "Subtítulos, botões, destaques" },
    { weight: 700, name: "Bold", usage: "Títulos principais, headers" },
  ];

  return (
    <div className="space-y-6">
      {/* Fonte Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Fonte Principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 px-6 py-4">
              <p className="text-4xl font-bold text-primary">Inter</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Google Fonts</p>
              <Badge variant="secondary">Sans-serif</Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Inter é uma família tipográfica projetada para telas, oferecendo excelente legibilidade em todos os tamanhos.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <code className="text-sm text-muted-foreground">
              {'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Escala Tipográfica */}
      <Card>
        <CardHeader>
          <CardTitle>Escala Tipográfica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview Visual */}
          <div className="space-y-4 rounded-lg border border-border p-6">
            <h1 className="text-4xl font-bold text-foreground">H1 — Título Principal (36px)</h1>
            <h2 className="text-2xl font-semibold text-foreground">H2 — Subtítulo (28px)</h2>
            <h3 className="text-xl font-semibold text-foreground">H3 — Seção (22px)</h3>
            <h4 className="text-lg font-medium text-foreground">H4 — Card Title (18px)</h4>
            <p className="text-base text-foreground">Body — Texto corrido e descrições (16px)</p>
            <p className="text-sm text-muted-foreground">Small — Texto secundário e labels (14px)</p>
            <p className="text-xs font-medium text-muted-foreground">Caption — Metadados e timestamps (12px)</p>
          </div>

          {/* Tabela de Referência */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Elemento</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Line Height</TableHead>
                <TableHead>Tailwind</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {typographyScale.map((item) => (
                <TableRow key={item.element}>
                  <TableCell className="font-medium">{item.element}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.lineHeight}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">{item.tailwind}</code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pesos da Fonte */}
      <Card>
        <CardHeader>
          <CardTitle>Pesos da Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fontWeights.map((item) => (
              <div
                key={item.weight}
                className="rounded-lg border border-border p-4"
              >
                <p
                  className="mb-2 text-2xl text-foreground"
                  style={{ fontWeight: item.weight }}
                >
                  Aa
                </p>
                <p className="font-medium text-foreground">
                  {item.weight} — {item.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TypographySection;
