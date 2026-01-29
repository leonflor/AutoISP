import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { VoiceTone, EscalationTrigger, EscalationOptions } from '@/components/admin/ai-agents/constants';

interface BehaviorTabProps {
  form: UseFormReturn<any>;
  voiceTones: VoiceTone[];
  escalationOptions: EscalationOptions;
}

export function BehaviorTab({ form, voiceTones, escalationOptions }: BehaviorTabProps) {
  const selectedTone = form.watch('voice_tone') || '';
  const escalationConfig = form.watch('escalation_config') || {
    triggers: [],
    max_interactions: escalationOptions?.max_interactions?.default || 5,
  };

  // Update voice tone
  const handleToneChange = (toneId: string) => {
    form.setValue('voice_tone', toneId, { shouldDirty: true });
  };

  // Toggle escalation trigger
  const toggleEscalationTrigger = (triggerId: string, checked: boolean) => {
    const currentTriggers: string[] = escalationConfig.triggers || [];
    let updated: string[];
    
    if (checked) {
      updated = [...currentTriggers, triggerId];
    } else {
      updated = currentTriggers.filter(t => t !== triggerId);
    }
    
    form.setValue('escalation_config', {
      ...escalationConfig,
      triggers: updated,
    }, { shouldDirty: true });
  };

  // Update max interactions
  const handleMaxInteractionsChange = (value: number[]) => {
    form.setValue('escalation_config', {
      ...escalationConfig,
      max_interactions: value[0],
    }, { shouldDirty: true });
  };

  const hasVoiceTones = voiceTones && voiceTones.length > 0;
  const hasEscalationOptions = escalationOptions?.triggers && escalationOptions.triggers.length > 0;

  return (
    <div className="space-y-6">
      {/* Tom de Voz */}
      {hasVoiceTones && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tom de Voz</CardTitle>
            <CardDescription>
              Escolha o estilo de comunicação do agente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedTone}
              onValueChange={handleToneChange}
              className="space-y-3"
            >
              {voiceTones.map(tone => (
                <div
                  key={tone.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTone === tone.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleToneChange(tone.id)}
                >
                  <RadioGroupItem value={tone.id} id={`tone-${tone.id}`} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={`tone-${tone.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {tone.label}
                    </Label>
                    {tone.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {tone.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Escalonamento para Humano */}
      {hasEscalationOptions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Escalar para Humano</CardTitle>
            <CardDescription>
              Configure quando o agente deve transferir para atendimento humano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gatilhos */}
            <div className="space-y-3">
              <Label>Escalar quando:</Label>
              {escalationOptions.triggers.map(trigger => {
                const isChecked = escalationConfig.triggers?.includes(trigger.id);
                return (
                  <div key={trigger.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`esc-${trigger.id}`}
                      checked={isChecked}
                      onCheckedChange={checked => toggleEscalationTrigger(trigger.id, !!checked)}
                    />
                    <label
                      htmlFor={`esc-${trigger.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {trigger.label}
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Máximo de interações */}
            {escalationOptions.max_interactions && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <Label>Máximo de interações antes de sugerir escalonamento</Label>
                  <span className="text-sm font-medium">
                    {escalationConfig.max_interactions || escalationOptions.max_interactions.default}
                  </span>
                </div>
                <Slider
                  min={escalationOptions.max_interactions.min}
                  max={escalationOptions.max_interactions.max}
                  step={1}
                  value={[escalationConfig.max_interactions || escalationOptions.max_interactions.default]}
                  onValueChange={handleMaxInteractionsChange}
                />
                <p className="text-xs text-muted-foreground">
                  Valor entre {escalationOptions.max_interactions.min} e {escalationOptions.max_interactions.max}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mensagem se não houver opções */}
      {!hasVoiceTones && !hasEscalationOptions && (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          Este agente não possui opções de personalização de comportamento.
        </div>
      )}
    </div>
  );
}
