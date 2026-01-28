import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AGENT_FEATURE_TAGS } from './constants';

interface FeatureTagsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function FeatureTagsSelector({ value, onChange, disabled }: FeatureTagsSelectorProps) {
  const handleToggle = (tagId: string) => {
    if (disabled) return;
    
    if (value.includes(tagId)) {
      onChange(value.filter(id => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Features do Agente</span>
        <Badge variant="secondary" className="text-xs">
          {value.length} selecionadas
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {AGENT_FEATURE_TAGS.map((tag) => {
          const isSelected = value.includes(tag.id);
          const Icon = tag.icon;
          
          return (
            <label
              key={tag.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors",
                isSelected 
                  ? "bg-primary/5 border-primary/30" 
                  : "bg-background border-border hover:bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggle(tag.id)}
                disabled={disabled}
              />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{tag.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
