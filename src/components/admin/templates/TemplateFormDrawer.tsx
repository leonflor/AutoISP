import { useEffect, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { AgentTemplate } from '@/hooks/admin/useAgentTemplates';

const TYPES = [
  { value: 'atendente_geral', label: 'Atendente Geral' },
  { value: 'suporte_n2', label: 'Suporte N2' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial', label: 'Comercial' },
];

const TONES = [
  { value: 'professional', label: 'Profissional' },
  { value: 'friendly', label: 'Amigável' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Descontraído' },
];

const VARIABLES = ['{agent_name}', '{tenant_name}', '{current_date}', '{current_time}'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: AgentTemplate | null;
  onSave: (data: Record<string, unknown>) => void;
  saving?: boolean;
}

export function TemplateFormDrawer({ open, onOpenChange, template, onSave, saving }: Props) {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState(getDefaults());

  function getDefaults() {
    return {
      name: '',
      type: 'atendente_geral',
      system_prompt_base: '',
      temperature: 0.4,
      tone: 'professional',
      default_name: '',
      default_avatar_url: '',
      max_intent_attempts: 3,
      intent_failure_message: '',
      is_active: true,
    };
  }

  useEffect(() => {
    if (open) {
      setForm(
        template
          ? {
              name: template.name,
              type: template.type,
              system_prompt_base: template.system_prompt_base,
              temperature: Number(template.temperature),
              tone: template.tone,
              default_name: template.default_name,
              default_avatar_url: template.default_avatar_url ?? '',
              max_intent_attempts: template.max_intent_attempts,
              intent_failure_message: template.intent_failure_message ?? '',
              is_active: template.is_active ?? true,
            }
          : getDefaults()
      );
    }
  }, [open, template]);

  const insertVariable = (v: string) => {
    const el = promptRef.current;
    if (!el) return;
    const start = el.selectionStart ?? form.system_prompt_base.length;
    const before = form.system_prompt_base.slice(0, start);
    const after = form.system_prompt_base.slice(el.selectionEnd ?? start);
    const newVal = before + v + after;
    setForm((f) => ({ ...f, system_prompt_base: newVal }));
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + v.length;
    }, 0);
  };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = { ...form };
    if (template?.id) payload.id = template.id;
    onSave(payload);
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{template ? 'Editar Template' : 'Novo Template'}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Atendente Padrão" />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => set('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5">
            <Label>System Prompt Base</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {VARIABLES.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => insertVariable(v)}
                >
                  {v}
                </Badge>
              ))}
            </div>
            <Textarea
              ref={promptRef}
              value={form.system_prompt_base}
              onChange={(e) => set('system_prompt_base', e.target.value)}
              rows={8}
              placeholder="Você é um assistente de atendimento..."
            />
          </div>

          {/* Temperatura */}
          <div className="space-y-1.5">
            <Label>Temperatura</Label>
            <div className="flex items-center gap-4">
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[form.temperature]}
                onValueChange={([v]) => set('temperature', v)}
                className="flex-1"
              />
              <span className="text-sm font-mono w-10 text-right tabular-nums">{form.temperature.toFixed(2)}</span>
            </div>
          </div>

          {/* Tom */}
          <div className="space-y-1.5">
            <Label>Tom de Voz</Label>
            <Select value={form.tone} onValueChange={(v) => set('tone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nome padrão */}
          <div className="space-y-1.5">
            <Label>Nome Padrão do Agente</Label>
            <Input value={form.default_name} onChange={(e) => set('default_name', e.target.value)} placeholder="Ex: Lia" />
          </div>

          {/* Avatar */}
          <div className="space-y-1.5">
            <Label>URL do Avatar Padrão</Label>
            <div className="flex items-center gap-3">
              <Input value={form.default_avatar_url} onChange={(e) => set('default_avatar_url', e.target.value)} placeholder="https://..." className="flex-1" />
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={form.default_avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {form.default_name?.[0]?.toUpperCase() ?? 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Max intent attempts */}
          <div className="space-y-1.5">
            <Label>Máx. Tentativas de Intenção</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={form.max_intent_attempts}
              onChange={(e) => set('max_intent_attempts', Math.min(10, Math.max(1, Number(e.target.value))))}
            />
          </div>

          {/* Mensagem de falha */}
          <div className="space-y-1.5">
            <Label>Mensagem de Falha de Intenção</Label>
            <Textarea
              value={form.intent_failure_message}
              onChange={(e) => set('intent_failure_message', e.target.value)}
              rows={3}
              placeholder="Desculpe, não consegui entender. Vou transferir..."
            />
          </div>

          {/* Toggle ativo */}
          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
          </div>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={saving || !form.name || !form.system_prompt_base || !form.default_name} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? 'Salvar Alterações' : 'Criar Template'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
