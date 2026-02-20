import { Plus, Trash2, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { ConditionalRoute } from '@/hooks/admin/useAgentFlows';

interface ConditionalRoutesEditorProps {
  routes: ConditionalRoute[];
  onChange: (routes: ConditionalRoute[]) => void;
  totalSteps: number;
  currentStepIndex: number;
}

export function ConditionalRoutesEditor({ routes, onChange, totalSteps, currentStepIndex }: ConditionalRoutesEditorProps) {
  const addRoute = () => {
    onChange([...routes, { condition: '', goto_step: null, label: '' }]);
  };

  const updateRoute = (index: number, field: keyof ConditionalRoute, value: string | number | null) => {
    onChange(routes.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const removeRoute = (index: number) => {
    onChange(routes.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <GitFork className="h-3 w-3" /> Rotas Condicionais
        </span>
        <Button type="button" size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={addRoute}>
          <Plus className="h-3 w-3 mr-1" /> Rota
        </Button>
      </div>
      {routes.map((route, ri) => (
        <div key={ri} className="flex items-center gap-1.5 pl-2 border-l-2 border-muted">
          <Input
            value={route.condition}
            onChange={e => updateRoute(ri, 'condition', e.target.value)}
            placeholder="Condição (ex: cliente offline)"
            className="h-7 text-xs flex-1"
          />
          <Select
            value={route.goto_step === null ? 'next' : String(route.goto_step)}
            onValueChange={v => updateRoute(ri, 'goto_step', v === 'next' ? null : Number(v))}
          >
            <SelectTrigger className="w-[120px] h-7 text-xs shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Próxima</SelectItem>
              {Array.from({ length: totalSteps }, (_, si) => si + 1)
                .filter(n => n !== currentStepIndex + 1)
                .map(n => (
                  <SelectItem key={n} value={String(n)}>Etapa {n}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            value={route.label}
            onChange={e => updateRoute(ri, 'label', e.target.value)}
            placeholder="Label"
            className="h-7 text-xs w-[100px] shrink-0"
          />
          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeRoute(ri)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
