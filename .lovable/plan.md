
# Simplificar Tela "Ativar Agente" com Upload de Base de Conhecimento

## Objetivo

Modificar o dialog de ativação de agente no Painel ISP para:
1. Remover a aba Preview
2. Remover o campo "Instruções Adicionais"
3. Adicionar upload de arquivo CSV para base de conhecimento (quando configurado no admin)
4. Oferecer opções de "adicionar" ou "substituir" ao importar arquivo

---

## Mudanças na Interface

**Antes:**
```text
Tabs: [Configuração] [Comportamento] [Preview]

Configuração:
- Nome de Exibição
- Avatar do Agente
- Instruções Adicionais  <-- Remover
- Badges de modelo
```

**Depois:**
```text
Tabs: [Configuração] [Comportamento]  (sem Preview)

Configuração:
- Nome de Exibição
- Avatar do Agente
- [Se uses_knowledge_base=true]
  ┌─────────────────────────────────────────────────┐
  │ Base de Conhecimento                            │
  │ ┌─────────────────────────────────────────────┐ │
  │ │  📄  Selecionar arquivo CSV                 │ │
  │ └─────────────────────────────────────────────┘ │
  │                                                 │
  │ Ao importar:                                    │
  │ ○ Adicionar às perguntas existentes            │
  │ ● Substituir toda a base (confirmar)           │
  └─────────────────────────────────────────────────┘
- Badges de modelo
```

---

## Arquivos a Modificar

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `src/components/painel/ai/AgentActivationDialog.tsx` | Remover Preview, Instruções, adicionar upload |
| Modificar | `src/hooks/painel/useIspAgents.ts` | Adicionar lógica de importação na ativação |

---

## Seção Tecnica

### Mudanças no AgentActivationDialog.tsx

**1. Remover importações não utilizadas:**
```typescript
// Remover: Eye (ícone do Preview)
import { Bot, Zap, Settings2 } from "lucide-react";
```

**2. Remover campo do schema:**
```typescript
const activationSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  // REMOVER: additional_prompt
  voice_tone: z.string().optional(),
  escalation_config: z.object({...}).optional(),
  // ADICIONAR:
  knowledge_file: z.any().optional(),
  knowledge_import_mode: z.enum(['append', 'replace']).optional(),
});
```

**3. Adicionar estado para upload:**
```typescript
const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
```

**4. Remover aba Preview e campo Instruções Adicionais:**
- Remover `<TabsTrigger value="preview">` e `<TabsContent value="preview">`
- Remover bloco do campo `additional_prompt`
- Remover função `buildPreviewPrompt`

**5. Adicionar seção de upload (condicional):**
```tsx
{agent.uses_knowledge_base && (
  <div className="space-y-3 pt-4 border-t">
    <Label>Base de Conhecimento</Label>
    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer">
      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm">Selecionar arquivo CSV</p>
      <input type="file" accept=".csv" className="hidden" ... />
    </div>
    
    {knowledgeFile && (
      <>
        <RadioGroup value={importMode} onValueChange={setImportMode}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="append" id="append" />
            <Label htmlFor="append">Adicionar às perguntas existentes</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="replace" id="replace" />
            <Label htmlFor="replace">Substituir toda a base</Label>
          </div>
        </RadioGroup>
      </>
    )}
  </div>
)}
```

**6. Dialog de confirmação para substituição:**
```tsx
<AlertDialog open={showReplaceConfirm} onOpenChange={setShowReplaceConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Substituir Base de Conhecimento?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação irá apagar todas as perguntas existentes e importar 
        apenas as do novo arquivo. Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={confirmActivation}>
        Confirmar e Ativar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Mudanças no useIspAgents.ts

**Estender AgentActivationForm:**
```typescript
export interface AgentActivationForm {
  display_name: string;
  avatar_url?: string;
  // REMOVER: additional_prompt?: string;
  voice_tone?: string;
  escalation_config?: {...};
  // ADICIONAR:
  knowledge_items?: KnowledgeBaseForm[];
  knowledge_import_mode?: 'append' | 'replace';
}
```

**Modificar mutation activateAgent:**
```typescript
const activateAgent = useMutation({
  mutationFn: async (data: { agentId: string; form: AgentActivationForm }) => {
    // 1. Criar o isp_agent
    const { data: ispAgent, error } = await supabase
      .from("isp_agents")
      .insert({...})
      .select()
      .single();
    
    if (error) throw error;
    
    // 2. Se houver items de conhecimento, importar
    if (data.form.knowledge_items?.length) {
      const records = data.form.knowledge_items.map((item, idx) => ({
        isp_agent_id: ispAgent.id,
        question: item.question,
        answer: item.answer,
        category: item.category || null,
        sort_order: idx,
        is_active: true,
      }));
      
      await supabase
        .from("agent_knowledge_base")
        .insert(records);
    }
    
    return ispAgent;
  },
});
```

---

## Fluxo de Ativação com Arquivo

```text
1. ISP clica em "Ativar" no catálogo
2. Dialog abre com campos simplificados
3. Se agent.uses_knowledge_base = true:
   - Mostra seção de upload de arquivo
4. ISP seleciona CSV (opcional)
5. Se selecionou arquivo:
   - Mostra opções: Adicionar / Substituir
6. ISP clica em "Ativar Agente"
7. Se modo = "replace":
   - Mostra dialog de confirmação
8. Sistema:
   - Cria registro em isp_agents
   - Se há arquivo: importa Q&As para agent_knowledge_base
```

---

## Validações

- Arquivo CSV deve ter colunas: Pergunta, Resposta, Categoria (opcional)
- Perguntas devem ter pelo menos 10 caracteres
- Respostas devem ter pelo menos 20 caracteres
- Upload limitado a um arquivo por vez
- Confirmação obrigatória para modo "substituir"
