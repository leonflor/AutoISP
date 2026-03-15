import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useSaveFlowStates, type AgentFlow, type FlowStateInsert, type TransitionRule } from '@/hooks/admin/useAgentFlows';
import { TOOL_CATALOG } from '@/constants/tool-catalog';

interface StateDraft {
  id?: string;
  state_key: string;
  objective: string;
  allowed_tools: string[];
  transition_rules: TransitionRule[];
  fallback_message: string;
  max_attempts: number;
}

interface FlowStateEditorProps {
  flow: AgentFlow;
  agentId: string;
}

function emptyState(): StateDraft {
  return {
    state_key: '', objective: '', allowed_tools: [], transition_rules: [],
    fallback_message: '', max_attempts: 5,
  };
}

const TRANSITION_TYPES = [
  { value: 'tool_success', label: 'Tool com sucesso' },
  { value: 'user_input', label: 'Input do usuário' },
  { value: 'option_selected', label: 'Opção selecionada' },
  { value: 'auto', label: 'Automática' },
];

export function FlowStateEditor({ flow, agentId }: FlowStateEditorProps) {
  const saveStates = useSaveFlowStates();
  const [states, setStates] = useState<StateDraft[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (flow.states && flow.states.length > 0) {
      setStates(flow.states.map(s => ({
        id: s.id, state_key: s.state_key, objective: s.objective,
        allowed_tools: s.allowed_tools || [],
        transition_rules: (s.transition_rules || []) as TransitionRule[],
        fallback_message: s.fallback_message || '',
        max_attempts: s.max_attempts || 5,
      })));
    } else {
      setStates([]);
    }
    setDirty(false);
  }, [flow]);

  const updateState = (index: number, field: keyof StateDraft, value: any) => {
    setStates(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    setDirty(true);
  };

  const addState = () => { setStates(prev => [...prev, emptyState()]); setDirty(true); };
  const removeState = (index: number) => { setStates(prev => prev.filter((_, i) => i !== index)); setDirty(true); };

  const moveState = (from: number, to: number) => {
    if (to < 0 || to >= states.length) return;
    const arr = [...states]; const [moved] = arr.splice(from, 1); arr.splice(to, 0, moved);
    setStates(arr); setDirty(true);
  };

  const toggleTool = (stateIndex: number, handler: string) => {
    const current = states[stateIndex].allowed_tools;
    const updated = current.includes(handler)
      ? current.filter(t => t !== handler)
      : [...current, handler];
    updateState(stateIndex, 'allowed_tools', updated);
  };

  const addTransition = (stateIndex: number) => {
    const current = states[stateIndex].transition_rules;
    updateState(stateIndex, 'transition_rules', [
      ...current,
      { type: 'user_input' as const, goto_state: '' },
    ]);
  };

  const updateTransition = (stateIndex: number, ruleIndex: number, field: keyof TransitionRule, value: any) => {
    const rules = [...states[stateIndex].transition_rules];
    rules[ruleIndex] = { ...rules[ruleIndex], [field]: value };
    updateState(stateIndex, 'transition_rules', rules);
  };

  const removeTransition = (stateIndex: number, ruleIndex: number) => {
    const rules = states[stateIndex].transition_rules.filter((_, i) => i !== ruleIndex);
    updateState(stateIndex, 'transition_rules', rules);
  };

  const handleSave = () => {
    const payload: FlowStateInsert[] = states.filter(s => s.state_key && s.objective).map((s, i) => ({
      flow_id: flow.id, step_order: i + 1, state_key: s.state_key, objective: s.objective,
      allowed_tools: s.allowed_tools,
      transition_rules: s.transition_rules.filter(r => r.goto_state),
      fallback_message: s.fallback_message || undefined,
      max_attempts: s.max_attempts,
    }));
    saveStates.mutate({ flowId: flow.id, agentId, states: payload }, { onSuccess: () => setDirty(false) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estados do Fluxo</h4>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={addState}><Plus className="h-3.5 w-3.5 mr-1" /> Estado</Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty || saveStates.isPending}><Save className="h-3.5 w-3.5 mr-1" /> Salvar</Button>
        </div>
      </div>

      {states.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhum estado. Clique em "+ Estado" para adicionar.</p>
      ) : (
        <div className="space-y-2">
          {states.map((state, i) => (
            <div key={i} className="border rounded-md p-3 space-y-2 bg-card">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => moveState(i, i - 1)} disabled={i === 0}>▲</button>
                  <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => moveState(i, i + 1)} disabled={i === states.length - 1}>▼</button>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{i + 1}</Badge>
                <Input value={state.state_key} onChange={e => updateState(i, 'state_key', e.target.value.toLowerCase().replace(/\s+/g, '_'))} placeholder="state_key (ex: identificar_cliente)" className="h-8 text-sm font-mono" />
                <Input value={String(state.max_attempts)} onChange={e => updateState(i, 'max_attempts', Number(e.target.value) || 5)} placeholder="Max" className="h-8 text-xs w-16 shrink-0" title="Máximo de tentativas" />
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeState(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Objective */}
              <Textarea value={state.objective} onChange={e => updateState(i, 'objective', e.target.value)} placeholder="Objetivo do estado (ex: Solicite o CPF ou CNPJ do cliente)" rows={2} className="text-xs resize-none" />

              {/* Fallback */}
              <Input value={state.fallback_message} onChange={e => updateState(i, 'fallback_message', e.target.value)} placeholder="Mensagem de fallback (quando max_attempts atingido)" className="h-7 text-xs" />

              {/* Tools */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wrench className="h-3 w-3" /> Ferramentas permitidas
                </span>
                <div className="flex flex-wrap gap-1">
                  {TOOL_CATALOG.map(t => (
                    <Badge
                      key={t.handler}
                      variant={state.allowed_tools.includes(t.handler) ? 'default' : 'outline'}
                      className="text-xs cursor-pointer"
                      onClick={() => toggleTool(i, t.handler)}
                    >
                      {t.display_name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Transitions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> Transições
                  </span>
                  <Button type="button" size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => addTransition(i)}>
                    <Plus className="h-3 w-3 mr-1" /> Transição
                  </Button>
                </div>
                {state.transition_rules.map((rule, ri) => (
                  <div key={ri} className="flex items-center gap-1.5 pl-2 border-l-2 border-muted">
                    <Select
                      value={rule.type}
                      onValueChange={v => updateTransition(i, ri, 'type', v)}
                    >
                      <SelectTrigger className="w-[140px] h-7 text-xs shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSITION_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {rule.type === 'tool_success' && (
                      <Select
                        value={rule.tool_name || 'any'}
                        onValueChange={v => updateTransition(i, ri, 'tool_name', v === 'any' ? undefined : v)}
                      >
                        <SelectTrigger className="w-[140px] h-7 text-xs shrink-0">
                          <SelectValue placeholder="Qualquer tool" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Qualquer tool</SelectItem>
                          {TOOL_CATALOG.map(t => (
                            <SelectItem key={t.handler} value={t.handler}>{t.display_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {rule.type === 'user_input' && (
                      <Input
                        value={rule.pattern || ''}
                        onChange={e => updateTransition(i, ri, 'pattern', e.target.value || undefined)}
                        placeholder="Regex (vazio = qualquer)"
                        className="h-7 text-xs flex-1"
                      />
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">→</span>
                      <Select
                        value={rule.goto_state || ''}
                        onValueChange={v => updateTransition(i, ri, 'goto_state', v)}
                      >
                        <SelectTrigger className="w-[150px] h-7 text-xs">
                          <SelectValue placeholder="Estado destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.filter((_, si) => si !== i).map(s => (
                            <SelectItem key={s.state_key || `idx-${i}`} value={s.state_key}>
                              {s.state_key || '(sem key)'}
                            </SelectItem>
                          ))}
                          <SelectItem value="__complete__">✓ Finalizar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeTransition(i, ri)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
