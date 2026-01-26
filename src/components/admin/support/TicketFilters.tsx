import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { TicketFilters as FilterType } from '@/hooks/admin/useSupportTickets';

interface TicketFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

const statusOptions = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'waiting', label: 'Aguardando' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

const categoryOptions = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'ouvidoria', label: 'Ouvidoria' },
  { value: 'outros', label: 'Outros' },
];

const priorityOptions = [
  { value: 'all', label: 'Todas as Prioridades' },
  { value: 'urgent', label: 'Urgente' },
  { value: 'high', label: 'Alta' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Baixa' },
];

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por assunto..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>
      
      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => onChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category || 'all'}
        onValueChange={(value) => onChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || 'all'}
        onValueChange={(value) => onChange({ ...filters, priority: value })}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getStatusLabel(status: string): string {
  return statusOptions.find(o => o.value === status)?.label || status;
}

export function getCategoryLabel(category: string): string {
  return categoryOptions.find(o => o.value === category)?.label || category;
}

export function getPriorityLabel(priority: string): string {
  return priorityOptions.find(o => o.value === priority)?.label || priority;
}
