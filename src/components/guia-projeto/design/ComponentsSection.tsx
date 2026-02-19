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
      {/* Modais / Dialogs */}
      <Card>
        <CardHeader>
          <CardTitle>Modais / Dialogs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Padrão adotado para modais de formulários complexos (ex: Fluxos Conversacionais).
            O modal é alinhado ao topo da viewport com scroll interno, mantendo header e footer fixos.
          </p>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propriedade</TableHead>
                  <TableHead>Classe / Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Posição</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">top-[5vh] translate-y-0</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Altura Máxima</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">max-h-[90vh]</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Layout</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">flex flex-col overflow-hidden</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Scroll</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">ScrollArea (flex-1 overflow-y-auto)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Largura (complexo)</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">max-w-2xl (672px)</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Header / Footer</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">Fixos, fora do ScrollArea</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Fechamento</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">onInteractOutside + onEscapeKeyDown prevenidos; botão X funcional</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Formulários com Switches */}
      <Card>
        <CardHeader>
          <CardTitle>Formulários com Switches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Padrão para switches que precisam de texto explicativo abaixo do label (ex: "Roteiro Fixo" nos fluxos conversacionais).
          </p>

          {/* Exemplo visual */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent bg-primary">
                  <span className="pointer-events-none block h-5 w-5 translate-x-5 rounded-full bg-background shadow-lg" />
                </div>
                <span className="text-sm font-medium">Roteiro Fixo</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ativado: etapas seguidas na ordem exata. Desativado: agente adapta a ordem conforme o contexto.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Elemento</TableHead>
                  <TableHead>Classe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Container (FormItem)</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">flex flex-col gap-1</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Switch + Label</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">flex items-center gap-2</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Texto de ajuda</TableCell>
                  <TableCell><code className="rounded bg-muted px-2 py-1 text-xs">FormDescription text-xs</code></TableCell>
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
