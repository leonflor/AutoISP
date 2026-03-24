import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, Plus, Trash2, X, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOOL_CATALOG } from '@/constants/tool-catalog';
import type { AgentTemplate } from '@/hooks/admin/useAgentTemplates';
import type { ProcedureDefinition, ProcedureWithMeta } from '@/hooks/admin/useProcedures';

/** UI-internal rich step type (differs from DB ProcedureStep) */
type UIStep = {
  name: string;
  instruction: string;
  available_functions: { handler: string; required: boolean }[];
  advance_condition: {
    type: string;
    function_name?: string;
    fields?: string[];
  };
  on_complete: {
    type: string;
    resolution?: string;
    agent_type?: string;
    conditions?: { if: string; then: string }[];
  };
  stuck_config: {
    max_turns: number;
    action: string;
  };
};

/** Normalize a step from DB/backend format to UI format */
function normalizeStep(raw: any): UIStep {
  // available_functions: string[] → { handler, required }[]
  const fns = Array.isArray(raw.available_functions)
    ? raw.available_functions.map((f: any) =>
        typeof f === 'string' ? { handler: f, required: false } : f
      )
    : [];

  // stuck_config vs stuck_after_turns/stuck_action
  const stuck_config = raw.stuck_config ?? {
    max_turns: raw.stuck_after_turns ?? 5,
    action: raw.stuck_action ?? 'escalate_human',
  };

  // advance_condition: string → { type: string, ... }
  const advance_condition = typeof raw.advance_condition === 'string'
    ? { type: raw.advance_condition }
    : raw.advance_condition ?? { type: 'always' };

  // on_complete: action → type (UI key), if_context → if
  const oc = raw.on_complete ?? {};
  const on_complete = {
    type: oc.type ?? oc.action ?? 'next_step',
    resolution: oc.resolution,
    agent_type: oc.agent_type,
    conditions: (oc.conditions ?? oc.rules)?.map((c: any) => ({
      if: c.if ?? c.if_context ?? '',
      then: typeof c.then === 'string' ? c.then : JSON.stringify(c.then ?? ''),
    })),
  };

  return {
    name: raw.name ?? '',
    instruction: raw.instruction ?? '',
    available_functions: fns,
    advance_condition,
    on_complete,
    stuck_config,
  };
}

function normalizeSteps(steps: any[] | undefined): UIStep[] {
  if (!steps?.length) return [{ ...EMPTY_STEP }];
  return steps.map(normalizeStep);
}

// Full list of available functions as specified
const AVAILABLE_FUNCTIONS = [
  { handler: 'get_customer_by_document', label: 'Buscar cliente por documento' },
  { handler: 'get_customer_by_email', label: 'Buscar cliente por email' },
  { handler: 'get_open_invoices', label: 'Consultar faturas abertas' },
  { handler: 'get_service_status', label: 'Status do serviço' },
  { handler: 'get_contract', label: 'Consultar contrato' },
  { handler: 'generate_payment_link', label: 'Gerar link de pagamento' },
  { handler: 'send_invoice_by_email', label: 'Enviar fatura por email' },
];

const EMPTY_STEP: UIStep = {
  name: '',
  instruction: '',
  available_functions: [],
  advance_condition: { type: 'always' },
  on_complete: { type: 'next_step' },
  stuck_config: { max_turns: 5, action: 'escalate_human' },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure?: ProcedureWithMeta | null;
  templates: AgentTemplate[];
  onSave: (data: {
    name: string;
    description: string | null;
    template_id: string;
    is_active: boolean;
    definition: ProcedureDefinition;
  }) => void;
  saving?: boolean;
}

export function ProcedureEditor({ open, onOpenChange, procedure, templates, onSave, saving }: Props) {
  const isEdit = !!procedure;

  const [name, setName] = useState(procedure?.name ?? '');
  const [description, setDescription] = useState(procedure?.description ?? '');
  const [templateId, setTemplateId] = useState(procedure?.template_id ?? '');
  const [isActive, setIsActive] = useState(procedure?.is_active ?? true);

  // Triggers
  const [keywords, setKeywords] = useState<string[]>(procedure?.definition?.triggers?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState('');
  const [minConfidence, setMinConfidence] = useState(() => {
    const raw = procedure?.definition?.triggers?.min_confidence ?? 0.7;
    return raw <= 1 ? Math.round(raw * 100) : raw;
  });

  // Steps
  const [steps, setSteps] = useState<UIStep[]>(
    normalizeSteps(procedure?.definition?.steps)
  );
  const [openSteps, setOpenSteps] = useState<Record<number, boolean>>({ 0: true });

  useEffect(() => {
    if (procedure) {
      setName(procedure.name ?? '');
      setDescription(procedure.description ?? '');
      setTemplateId(procedure.template_id ?? '');
      setIsActive(procedure.is_active ?? true);
      setKeywords(procedure.definition?.triggers?.keywords ?? []);
      const raw = procedure.definition?.triggers?.min_confidence ?? 0.7;
      setMinConfidence(raw <= 1 ? Math.round(raw * 100) : raw);
      setSteps(normalizeSteps(procedure.definition?.steps));
      setOpenSteps({ 0: true });
    }
  }, [procedure]);

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw));

  const updateStep = useCallback((idx: number, patch: Partial<UIStep>) => {
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }, []);

  const addStep = () => {
    setSteps([...steps, { ...EMPTY_STEP }]);
    setOpenSteps(prev => ({ ...prev, [steps.length]: true }));
  };

  const removeStep = (idx: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    const copy = [...steps];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setSteps(copy);
  };

  const toggleFunction = (stepIdx: number, handler: string) => {
    const step = steps[stepIdx];
    const exists = step.available_functions.find(f => f.handler === handler);
    const newFns = exists
      ? step.available_functions.filter(f => f.handler !== handler)
      : [...step.available_functions, { handler, required: false }];
    updateStep(stepIdx, { available_functions: newFns });
  };

  const toggleFnRequired = (stepIdx: number, handler: string) => {
    const step = steps[stepIdx];
    const newFns = step.available_functions.map(f =>
      f.handler === handler ? { ...f, required: !f.required } : f
    );
    updateStep(stepIdx, { available_functions: newFns });
  };

  const handleSubmit = () => {
    if (!name || !templateId) return;
    // Convert back to backend format for compatibility
    const backendSteps = steps.map(s => ({
      name: s.name,
      instruction: s.instruction,
      available_functions: s.available_functions.map(f => f.handler),
      advance_condition: s.advance_condition.type, // UI object → DB string
      on_complete: {
        action: s.on_complete.type, // UI "type" → DB "action"
        resolution: s.on_complete.resolution,
        agent_type: s.on_complete.agent_type,
        conditions: s.on_complete.conditions?.map(c => ({
          if_context: c.if, // UI "if" → DB "if_context"
          then: c.then,
        })),
      },
      stuck_after_turns: s.stuck_config.max_turns,
      stuck_action: s.stuck_config.action,
    }));
    onSave({
      name,
      description: description || null,
      template_id: templateId,
      is_active: isActive,
      definition: {
        triggers: { keywords, min_confidence: minConfidence / 100 },
        steps: backendSteps as any,
      },
    });
  };

  // Reset state when dialog opens with new procedure
  const handleOpenChange = (v: boolean) => {
    if (v && !procedure) {
      setName('');
      setDescription('');
      setTemplateId('');
      setIsActive(true);
      setKeywords([]);
      setMinConfidence(70);
      setSteps([{ ...EMPTY_STEP }]);
      setOpenSteps({ 0: true });
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEdit ? 'Editar Procedimento' : 'Novo Procedimento'}</DialogTitle>
          {isEdit && procedure?.active_conversations > 0 && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md mt-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{procedure.active_conversations} conversa(s) ativa(s) na versão atual. Ao salvar, uma nova versão será criada.</span>
            </div>
          )}
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Section 1 — General */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Geral</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="ex: Consulta de Faturas" />
              </div>
              <div className="space-y-2">
                <Label>Template vinculado</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Breve descrição do procedimento..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Ativo</Label>
            </div>
          </section>

          <Separator />

          {/* Section 2 — Triggers */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Triggers</h3>
            <div className="space-y-2">
              <Label>Keywords (Enter para adicionar)</Label>
              <Input
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
                placeholder="ex: fatura, boleto..."
              />
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Confiança mínima: {minConfidence}%</Label>
              <Slider
                value={[minConfidence]}
                onValueChange={([v]) => setMinConfidence(v)}
                min={5}
                max={100}
                step={5}
                className="max-w-sm"
              />
            </div>
          </section>

          <Separator />

          {/* Section 3 — Steps */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Steps ({steps.length})</h3>
              <Button variant="outline" size="sm" onClick={addStep} className="gap-1.5">
                <Plus className="h-4 w-4" /> Adicionar Step
              </Button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <StepCard
                  key={idx}
                  step={step}
                  index={idx}
                  total={steps.length}
                  isOpen={!!openSteps[idx]}
                  onToggle={() => setOpenSteps(p => ({ ...p, [idx]: !p[idx] }))}
                  onChange={patch => updateStep(idx, patch)}
                  onRemove={() => removeStep(idx)}
                  onMove={dir => moveStep(idx, dir)}
                  onToggleFunction={handler => toggleFunction(idx, handler)}
                  onToggleFnRequired={handler => toggleFnRequired(idx, handler)}
                />
              ))}
            </div>
          </section>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving || !name || !templateId}>
              {saving ? 'Salvando...' : isEdit ? 'Salvar Nova Versão' : 'Criar Procedimento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Step Card ─── */

function StepCard({
  step, index, total, isOpen, onToggle, onChange, onRemove, onMove, onToggleFunction, onToggleFnRequired,
}: {
  step: UIStep;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<UIStep>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onToggleFunction: (handler: string) => void;
  onToggleFnRequired: (handler: string) => void;
}) {
  const [fieldInput, setFieldInput] = useState('');

  const addField = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && fieldInput.trim()) {
      e.preventDefault();
      const fields = step.advance_condition.fields ?? [];
      if (!fields.includes(fieldInput.trim())) {
        onChange({
          advance_condition: { ...step.advance_condition, fields: [...fields, fieldInput.trim()] },
        });
      }
      setFieldInput('');
    }
  };

  const removeField = (f: string) => {
    onChange({
      advance_condition: {
        ...step.advance_condition,
        fields: (step.advance_condition.fields ?? []).filter(x => x !== f),
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="border border-border rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-t-lg">
            <ChevronDown className={cn('h-4 w-4 transition-transform shrink-0', isOpen && 'rotate-180')} />
            <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
            <span className="font-medium text-sm flex-1 truncate">{step.name || 'Step sem nome'}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); onMove(-1); }} disabled={index === 0}>
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); onMove(1); }} disabled={index === total - 1}>
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => { e.stopPropagation(); onRemove(); }} disabled={total <= 1}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border">
            {/* Name & Instruction */}
            <div className="space-y-2">
              <Label>Nome do step</Label>
              <Input value={step.name} onChange={e => onChange({ name: e.target.value })} placeholder="ex: Identificar cliente" />
            </div>
            <div className="space-y-2">
              <Label>Instrução (system prompt)</Label>
              <Textarea value={step.instruction} onChange={e => onChange({ instruction: e.target.value })} rows={3} placeholder="Instrução para o LLM neste passo..." />
            </div>

            {/* Function calls */}
            <div className="space-y-2">
              <Label>Function calls disponíveis</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_FUNCTIONS.map(fn => {
                  const selected = step.available_functions.find(f => f.handler === fn.handler);
                  return (
                    <div key={fn.handler} className="flex items-center gap-2 p-2 rounded-md border border-border bg-background">
                      <Checkbox
                        checked={!!selected}
                        onCheckedChange={() => onToggleFunction(fn.handler)}
                      />
                      <span className="text-sm flex-1">{fn.label}</span>
                      {selected && (
                        <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                          <Checkbox
                            checked={selected.required}
                            onCheckedChange={() => onToggleFnRequired(fn.handler)}
                            className="h-3.5 w-3.5"
                          />
                          Obrig.
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advance condition */}
            <div className="space-y-2">
              <Label>Condição de avanço</Label>
              <Select
                value={step.advance_condition.type}
                onValueChange={v =>
                  onChange({ advance_condition: { type: v as string } })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="function_success">Sucesso de function</SelectItem>
                  <SelectItem value="data_collected">Dados coletados</SelectItem>
                  <SelectItem value="user_confirmation">Confirmação do usuário</SelectItem>
                  <SelectItem value="llm_judge">LLM Judge</SelectItem>
                  <SelectItem value="always">Sempre (automático)</SelectItem>
                </SelectContent>
              </Select>

              {step.advance_condition.type === 'function_success' && (
                <Select
                  value={step.advance_condition.function_name ?? ''}
                  onValueChange={v =>
                    onChange({ advance_condition: { ...step.advance_condition, function_name: v } })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Qual function?" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FUNCTIONS.map(fn => (
                      <SelectItem key={fn.handler} value={fn.handler}>{fn.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {step.advance_condition.type === 'data_collected' && (
                <div className="space-y-2">
                  <Input
                    value={fieldInput}
                    onChange={e => setFieldInput(e.target.value)}
                    onKeyDown={addField}
                    placeholder="Nome do campo (Enter para adicionar)"
                  />
                  {(step.advance_condition.fields ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {step.advance_condition.fields!.map(f => (
                        <Badge key={f} variant="secondary" className="gap-1 pr-1">
                          {f}
                          <button onClick={() => removeField(f)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* On complete */}
            <div className="space-y-2">
              <Label>Ao concluir</Label>
              <Select
                value={step.on_complete.type}
                onValueChange={v =>
                  onChange({ on_complete: { type: v as string } })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="next_step">Próximo step</SelectItem>
                  <SelectItem value="end_procedure">Encerrar procedimento</SelectItem>
                  <SelectItem value="handover_agent">Transferir para agente IA</SelectItem>
                  <SelectItem value="handover_human">Transferir para humano</SelectItem>
                  <SelectItem value="conditional">Condicional</SelectItem>
                </SelectContent>
              </Select>

              {step.on_complete.type === 'end_procedure' && (
                <Select
                  value={step.on_complete.resolution ?? 'resolved'}
                  onValueChange={v =>
                    onChange({ on_complete: { ...step.on_complete, resolution: v as 'resolved' | 'unresolved' } })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="unresolved">Não resolvido</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {step.on_complete.type === 'handover_agent' && (
                <Select
                  value={step.on_complete.agent_type ?? ''}
                  onValueChange={v =>
                    onChange({ on_complete: { ...step.on_complete, agent_type: v } })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Tipo de agente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="suporte_n2">Suporte N2</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Stuck config */}
            <div className="space-y-2">
              <Label>Se travar</Label>
              <div className="flex items-center gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-muted-foreground">Máx mensagens</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={step.stuck_config.max_turns}
                    onChange={e => onChange({ stuck_config: { ...step.stuck_config, max_turns: parseInt(e.target.value) || 5 } })}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-muted-foreground">Ação</Label>
                  <Select
                    value={step.stuck_config.action}
                    onValueChange={v =>
                      onChange({ stuck_config: { ...step.stuck_config, action: v as string } })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="escalate_human">Escalar para humano</SelectItem>
                      <SelectItem value="repeat">Repetir instrução</SelectItem>
                      <SelectItem value="skip">Pular step</SelectItem>
                      <SelectItem value="never">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
