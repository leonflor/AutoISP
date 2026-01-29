import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Plus, X, Trash2 } from 'lucide-react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DEFAULT_VOICE_TONES,
  DEFAULT_ESCALATION_TRIGGERS,
  type VoiceTone,
  type EscalationTrigger,
  type EscalationOptions,
} from './constants';

interface PersonalizationTabProps {
  form: UseFormReturn<any>;
  scope: 'tenant' | 'platform';
}

export function PersonalizationTab({ form, scope }: PersonalizationTabProps) {
  const [newTone, setNewTone] = useState({ id: '', label: '', description: '' });
  
  // Obter valores atuais do form
  const voiceTones: VoiceTone[] = form.watch('voice_tones') || [];
  const escalationOptions: EscalationOptions = form.watch('escalation_options') || {
    triggers: [],
    max_interactions: { min: 3, max: 10, default: 5 },
  };

  // Adicionar tom de voz
  const addVoiceTone = () => {
    if (newTone.id && newTone.label) {
      const updated = [...voiceTones, { ...newTone }];
      form.setValue('voice_tones', updated, { shouldDirty: true });
      setNewTone({ id: '', label: '', description: '' });
    }
  };

  // Remover tom de voz
  const removeVoiceTone = (id: string) => {
    const updated = voiceTones.filter(t => t.id !== id);
    form.setValue('voice_tones', updated, { shouldDirty: true });
  };

  // Adicionar tons padrão
  const addDefaultTones = () => {
    const existingIds = new Set(voiceTones.map(t => t.id));
    const newTones = DEFAULT_VOICE_TONES.filter(t => !existingIds.has(t.id));
    form.setValue('voice_tones', [...voiceTones, ...newTones], { shouldDirty: true });
  };

  // Toggle trigger
  const toggleTrigger = (triggerId: string, checked: boolean) => {
    const currentTriggers = escalationOptions.triggers || [];
    let updated: EscalationTrigger[];
    
    if (checked) {
      const defaultTrigger = DEFAULT_ESCALATION_TRIGGERS.find(t => t.id === triggerId);
      if (defaultTrigger && !currentTriggers.some(t => t.id === triggerId)) {
        updated = [...currentTriggers, { ...defaultTrigger }];
      } else {
        updated = currentTriggers;
      }
    } else {
      updated = currentTriggers.filter(t => t.id !== triggerId);
    }
    
    form.setValue('escalation_options', {
      ...escalationOptions,
      triggers: updated,
    }, { shouldDirty: true });
  };

  // Update max interactions
  const updateMaxInteractions = (field: 'min' | 'max' | 'default', value: number) => {
    form.setValue('escalation_options', {
      ...escalationOptions,
      max_interactions: {
        ...escalationOptions.max_interactions,
        [field]: value,
      },
    }, { shouldDirty: true });
  };

  // Apenas para escopo tenant
  if (scope !== 'tenant') {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Personalização disponível apenas para agentes de escopo "Tenant"
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tons de Voz */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tons de Voz Disponíveis</CardTitle>
          <CardDescription>
            Define quais tons de comunicação o ISP pode escolher para este agente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de tons */}
          <div className="space-y-2">
            {voiceTones.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Nenhum tom configurado. Adicione tons ou use os padrões.
              </p>
            ) : (
              voiceTones.map(tone => (
                <div key={tone.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                  <div>
                    <span className="font-medium">{tone.label}</span>
                    {tone.description && (
                      <p className="text-sm text-muted-foreground">{tone.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVoiceTone(tone.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <Separator />

          {/* Adicionar novo tom */}
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="ID (ex: formal)"
              value={newTone.id}
              onChange={e => setNewTone(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
            />
            <Input
              placeholder="Label (ex: Formal)"
              value={newTone.label}
              onChange={e => setNewTone(prev => ({ ...prev, label: e.target.value }))}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={newTone.description}
              onChange={e => setNewTone(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVoiceTone}
              disabled={!newTone.id || !newTone.label}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Tom
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addDefaultTones}
            >
              Adicionar Tons Padrão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Escalonamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Regras de Escalonamento</CardTitle>
          <CardDescription>
            Define quando o agente pode escalar para atendimento humano
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gatilhos disponíveis */}
          <div className="space-y-3">
            <FormLabel>Gatilhos que o ISP pode escolher:</FormLabel>
            {DEFAULT_ESCALATION_TRIGGERS.map(trigger => {
              const isEnabled = escalationOptions.triggers?.some(t => t.id === trigger.id);
              return (
                <div key={trigger.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`trigger-${trigger.id}`}
                    checked={isEnabled}
                    onCheckedChange={checked => toggleTrigger(trigger.id, !!checked)}
                  />
                  <label
                    htmlFor={`trigger-${trigger.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {trigger.label}
                  </label>
                  {trigger.default && (
                    <Badge variant="outline" className="text-xs">Padrão</Badge>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Limites de interações */}
          <div className="space-y-3">
            <FormLabel>Máximo de interações antes de escalar:</FormLabel>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Mínimo</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={escalationOptions.max_interactions?.min || 3}
                  onChange={e => updateMaxInteractions('min', parseInt(e.target.value) || 3)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Máximo</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={escalationOptions.max_interactions?.max || 10}
                  onChange={e => updateMaxInteractions('max', parseInt(e.target.value) || 10)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Padrão</label>
                <Input
                  type="number"
                  min={escalationOptions.max_interactions?.min || 1}
                  max={escalationOptions.max_interactions?.max || 50}
                  value={escalationOptions.max_interactions?.default || 5}
                  onChange={e => updateMaxInteractions('default', parseInt(e.target.value) || 5)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              O ISP pode escolher um valor entre o mínimo e máximo definidos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
