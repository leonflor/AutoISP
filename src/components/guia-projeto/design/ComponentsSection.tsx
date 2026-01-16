import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ComponentsSection = () => {
  return (
    <div className="space-y-6">
      {/* Botões */}
      <Card>
        <CardHeader>
          <CardTitle>Botões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Variantes */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Variantes</p>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Tamanhos */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Tamanhos</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          {/* Estados */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Estados</p>
            <div className="flex flex-wrap gap-3">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          {/* Especificações */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriedade</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Border Radius</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">4px (0.25rem)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Font Weight</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">500 (Medium)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Transition</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">all 150ms ease</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Card Padrão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards usam border 1px, radius 8px e shadow suave.
                </p>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-border bg-card p-4 shadow-md">
              <p className="font-medium text-foreground">Card com Shadow</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Versão com sombra média para destaque.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriedade</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Border</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">1px solid border</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Border Radius</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">8px (0.5rem)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Padding</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">24px (1.5rem)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shadow</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">0 4px 6px -1px rgba(0,0,0,0.1)</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Normal</Label>
              <Input placeholder="Digite algo..." />
            </div>

            <div className="space-y-2">
              <Label>Focus (clique para ver)</Label>
              <Input placeholder="Input com focus" />
            </div>

            <div className="space-y-2">
              <Label>Disabled</Label>
              <Input placeholder="Input desabilitado" disabled />
            </div>

            <div className="space-y-2">
              <Label className="text-destructive">Com Erro</Label>
              <Input
                placeholder="Input com erro"
                className="border-destructive focus-visible:ring-destructive"
              />
              <p className="text-xs text-destructive">Mensagem de erro</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Badges de Status</p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                ● Ativo
              </Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                ● Offline
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                ● Pendente
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                ● Info
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estilos de Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Estilos de Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aspecto</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Border Radius (sm)</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">4px</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Border Radius (md)</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">6px</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Border Radius (lg)</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">8px</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sombras</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">Médias (4px blur)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Espaçamento Base</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">16px (1rem)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Container Max</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">1400px</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentsSection;
