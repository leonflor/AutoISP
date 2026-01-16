import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Smartphone, Tablet, Monitor, MonitorPlay, Menu } from "lucide-react";

const ResponsiveSection = () => {
  const breakpoints = [
    {
      name: "Mobile",
      width: "< 768px",
      icon: Smartphone,
      usage: "Smartphones",
      tailwind: "default",
    },
    {
      name: "Tablet",
      width: "768px - 1024px",
      icon: Tablet,
      usage: "Tablets, iPads",
      tailwind: "md:",
    },
    {
      name: "Desktop",
      width: "> 1024px",
      icon: Monitor,
      usage: "Notebooks, Monitores",
      tailwind: "lg:",
    },
    {
      name: "Wide",
      width: "> 1400px",
      icon: MonitorPlay,
      usage: "Monitores grandes",
      tailwind: "2xl:",
    },
  ];

  const mobileNavigation = [
    { feature: "Menu Principal", behavior: "Hamburger → Fullscreen overlay" },
    { feature: "Sidebar", behavior: "Collapsible em tablets, hidden em mobile" },
    { feature: "Bottom Actions", behavior: "Fixas quando necessário (ex: checkout)" },
    { feature: "Tabs Horizontais", behavior: "Scroll horizontal com indicador" },
    { feature: "Tabelas", behavior: "Cards em stack ou scroll horizontal" },
    { feature: "Modais", behavior: "Fullscreen em mobile, centered em desktop" },
  ];

  return (
    <div className="space-y-6">
      {/* Abordagem */}
      <Card>
        <CardHeader>
          <CardTitle>Abordagem Responsiva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base">Mobile-First</Badge>
            <p className="text-muted-foreground">
              Estilos base para mobile, media queries para telas maiores
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <code className="text-sm text-muted-foreground">
              {`/* Mobile base */
.component { padding: 16px; }

/* Tablet and up */
@media (min-width: 768px) {
  .component { padding: 24px; }
}`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Breakpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {breakpoints.map((bp) => {
              const Icon = bp.icon;
              return (
                <div
                  key={bp.name}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{bp.name}</p>
                  </div>
                  <p className="font-mono text-lg font-medium text-foreground">{bp.width}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{bp.usage}</p>
                  <Badge variant="outline" className="mt-2">
                    {bp.tailwind}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Visual Diagram */}
          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Visualização</p>
            <div className="flex items-end justify-center gap-2">
              <div className="flex flex-col items-center">
                <div className="h-12 w-6 rounded border-2 border-primary bg-primary/20" />
                <p className="mt-1 text-xs text-muted-foreground">Mobile</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-14 w-10 rounded border-2 border-primary/60 bg-primary/10" />
                <p className="mt-1 text-xs text-muted-foreground">Tablet</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-16 rounded border-2 border-primary/40 bg-primary/5" />
                <p className="mt-1 text-xs text-muted-foreground">Desktop</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-10 w-24 rounded border-2 border-primary/20 bg-primary/5" />
                <p className="mt-1 text-xs text-muted-foreground">Wide</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação Mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="h-5 w-5" />
            Navegação Mobile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Menu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Hamburger Menu → Fullscreen Overlay</p>
              <p className="text-sm text-muted-foreground">
                Menu ocupa tela inteira com animação fade-in, links empilhados
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionalidade</TableHead>
                <TableHead>Comportamento Mobile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mobileNavigation.map((item) => (
                <TableRow key={item.feature}>
                  <TableCell className="font-medium">{item.feature}</TableCell>
                  <TableCell className="text-muted-foreground">{item.behavior}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Espaçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Espaçamento por Breakpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Elemento</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Tablet+</TableHead>
                <TableHead>Desktop+</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Container Padding</TableCell>
                <TableCell>16px</TableCell>
                <TableCell>24px</TableCell>
                <TableCell>32px</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Card Padding</TableCell>
                <TableCell>16px</TableCell>
                <TableCell>20px</TableCell>
                <TableCell>24px</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Section Gap</TableCell>
                <TableCell>24px</TableCell>
                <TableCell>32px</TableCell>
                <TableCell>48px</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Grid Columns</TableCell>
                <TableCell>1</TableCell>
                <TableCell>2</TableCell>
                <TableCell>3-4</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveSection;
