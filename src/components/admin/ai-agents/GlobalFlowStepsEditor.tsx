import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useSaveGlobalFlowSteps } from '@/hooks/admin/useGlobalFlows';
import { useGlobalTools } from '@/hooks/admin/useGlobalTools';
import type { AgentFlow, FlowStepInsert } from '@/hooks/admin/useAgentFlows';

interface StepDraft {
  id?: string;
  name: string;
  instruction: string;
  expected_input: string;
  tool_id: string;
  condition_to_advance: string;
  fallback_instruction: string;
}

function emptyStep(): StepDraft {
  return { name: '', instruction: '', expected_input: '', tool_id: '', condition_to_advance: '', fallback_instruction: '' };
}

interface GlobalFlowStepsEditorProps {
  flow: AgentFlow;
}

export function GlobalFlowStepsEditor({ flow }: GlobalFlowStepsEditorProps) {
  const saveSteps = useSaveGlobalFlowSteps();
  const { data: tools = [] } = useGlobalTools();
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (flow.steps && flow.steps.length > 0) {
      setSteps(flow.steps.map(s => ({
        id: s.id, name: s.name, instruction: s.instruction,
        expected_input: s.expected_input || '', tool_id: s.tool_id || '',
        condition_to_advance: s.condition_to_advance || '', fallback_instruction: s.fallback_instruction || '',
      })));
    } else {
      setSteps([]);
    }
    setDirty(false);
  }, [flow]);

  const updateStep = (index: number, field: keyof StepDraft, value: string) => {
    setSteps(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    setDirty(true);
  };

  const addStep = () => { setSteps(prev => [...prev, emptyStep()]); setDirty(true); };
  const removeStep = (index: number) => { setSteps(prev => prev.filter((_, i) => i !== index)); setDirty(true); };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const arr = [...steps]; const [moved] = arr.splice(from, 1); arr.splice(to, 0, moved);
    setSteps(arr); setDirty(true);
  };

  const handleSave = () => {
    const payload: FlowStepInsert[] = steps.filter(s => s.name && s.instruction).map((s, i) => ({
      flow_id: flow.id, step_order: i + 1, name: s.name, instruction: s.instruction,
      expected_input: s.expected_input || undefined, tool_id: s.tool_id || null,
      condition_to_advance: s.condition_to_advance || undefined, fallback_instruction: s.fallback_instruction || undefined,
    }));
    saveSteps.mutate({ flowId: flow.id, steps: payload }, { onSuccess: () => setDirty(false) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Etapas do Fluxo</h4>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={addStep}><Plus className="h-3.5 w-3.5 mr-1" /> Etapa</Button>
          {dirty && <Button size="sm" onClick={handleSave} disabled={saveSteps.isPending}><Save className="h-3.5 w-3.5 mr-1" /> Salvar</Button>}
        </div>
      </div>

      {steps.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhuma etapa. Clique em "+ Etapa" para adicionar.</p>
      ) : (
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="border rounded-md p-3 space-y-2 bg-card">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => moveStep(i, i - 1)} disabled={i === 0}>▲</button>
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => moveStep(i, i + 1)} disabled={i === steps.length - 1}>▼</button>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                <Input value={step.name} onChange={e => updateStep(i, 'name', e.target.value)} placeholder="Nome da etapa" className="h-8 text-sm" />
                <Select value={step.tool_id || 'none'} onValueChange={v => updateStep(i, 'tool_id', v === 'none' ? '' : v)}>
                  <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Sem tool" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem tool</SelectItem>
                    {tools.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{t.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeStep(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Textarea value={step.instruction} onChange={e => updateStep(i, 'instruction', e.target.value)} placeholder="Instrução para o agente nesta etapa" rows={2} className="text-xs resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <Input value={step.expected_input} onChange={e => updateStep(i, 'expected_input', e.target.value)} placeholder="Input esperado (ex: CPF)" className="h-7 text-xs" />
                <Input value={step.condition_to_advance} onChange={e => updateStep(i, 'condition_to_advance', e.target.value)} placeholder="Condição para avançar" className="h-7 text-xs" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
