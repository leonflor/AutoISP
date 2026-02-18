import { TOOL_CATALOG } from '@/constants/tool-catalog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Database, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function AiToolCatalog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ferramentas de IA</h1>
        <p className="text-muted-foreground">
          Catálogo de ferramentas disponíveis para os agentes. As ferramentas são gerenciadas no código e não podem ser editadas pela interface.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOL_CATALOG.map((tool) => (
          <Card key={tool.handler} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Wrench className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tool.display_name}</CardTitle>
                    <code className="text-xs text-muted-foreground">{tool.handler}</code>
                  </div>
                </div>
                {tool.requires_erp && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Database className="h-3 w-3" />
                    ERP
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-sm">{tool.description}</CardDescription>
              
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Parâmetros</p>
                <div className="space-y-1">
                  {tool.parameters.map((param) => (
                    <div key={param.name} className="flex items-center gap-2 text-xs">
                      <code className="bg-muted px-1.5 py-0.5 rounded">{param.name}</code>
                      <span className="text-muted-foreground">({param.type})</span>
                      {param.required && <Badge variant="secondary" className="text-[10px] px-1 py-0">obrigatório</Badge>}
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>{param.description}</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Resposta</p>
                <p className="text-xs text-muted-foreground">{tool.response_description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
