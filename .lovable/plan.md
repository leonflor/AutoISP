
# Configuracoes Avancadas de Agentes IA para Clientes

## Visao Geral

Expandir o fluxo de ativacao de agentes para permitir que o cliente ISP configure:

1. **Nome de exibicao** (ja existente)
2. **Upload de Avatar** - imagem personalizada ou avatar generico da plataforma
3. **Tom de voz** - escolhido de uma lista predeterminada pelo superadmin
4. **Regras de escalonamento para humano** - dentro de limites definidos pelo superadmin

---

## Estrutura de Dados

### Novos Campos no Template (ai_agents) - Superadmin Define

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `voice_tones` | JSONB | Lista de tons de voz disponiveis |
| `escalation_options` | JSONB | Opcoes de escalonamento configuraveis |

### Novos Campos na Ativacao (isp_agents) - Cliente Escolhe

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `voice_tone` | TEXT | ID do tom escolhido |
| `escalation_config` | JSONB | Config de escalonamento |

### Nova Configuracao Global (platform_config)

| Chave | Tipo | Descricao |
|-------|------|-----------|
| `default_agent_avatar` | JSONB | URL do avatar generico padrao |

---

## Fluxo de Avatar

```text
Cliente ativa agente
        |
        v
  +-----------------+
  | Faz upload de   |-----> Armazena no bucket "agent-avatars"
  | imagem propria? |       Salva URL em isp_agents.avatar_url
  +-----------------+
        | Nao
        v
  +-----------------+
  | Usa avatar      |-----> Busca platform_config.default_agent_avatar
  | generico        |       (configurado pelo superadmin)
  +-----------------+
```

---

## Interface do Superadmin

### 1. Aba "Personalizacao" no Form de Template (AgentTemplateForm)

```text
+------------------------------------------+
| Basico | Config IA | Features | Person. | Status |
+------------------------------------------+
|                                          |
| Tons de Voz Disponiveis                  |
|  ┌────────────────────────────────────┐  |
|  │ ✓ Formal e Profissional            │  |
|  │ ✓ Amigável e Acolhedor             │  |
|  │ ✓ Casual e Descontraído            │  |
|  │ ✓ Técnico e Preciso                │  |
|  └────────────────────────────────────┘  |
|                                          |
| Regras de Escalonamento                  |
| Gatilhos que o ISP pode escolher:        |
|  ☑ Quando cliente solicitar              |
|  ☑ Quando IA nao souber responder        |
|  ☑ Assuntos sensiveis                    |
|  ☑ Problema recorrente                   |
|                                          |
| Max interacoes antes de escalar:         |
| Minimo: [3] Maximo: [10] Padrao: [5]     |
+------------------------------------------+
```

### 2. Config Global - Avatar Padrao (Admin Config)

Na aba Plataforma, adicionar campo para upload do avatar generico:

```text
+------------------------------------------+
|  Avatar Padrao dos Agentes               |
|  ┌──────┐                                |
|  │  🤖  │  [Alterar Avatar]              |
|  └──────┘                                |
|  Usado quando o ISP nao enviar avatar    |
+------------------------------------------+
```

---

## Interface do Cliente (Ativacao)

Expandir dialog com nova aba "Comportamento" e upload de avatar:

```text
+------------------------------------------------+
| Configuracao | Comportamento | Preview         |
+------------------------------------------------+
|                                                |
| Nome de Exibicao                               |
| [____________________________]                 |
|                                                |
| Avatar do Agente                               |
| ┌──────────┐                                   |
| │          │  [Fazer Upload]                   |
| │   🤖     │  ou usar avatar padrao            |
| └──────────┘                                   |
|                                                |
| Instrucoes Adicionais                          |
| [                              ]               |
+------------------------------------------------+

+------------------------------------------------+
| Configuracao | Comportamento | Preview         |
+------------------------------------------------+
|                                                |
| Tom de Voz                                     |
| ┌──────────────────────────────────────────┐   |
| │ ○ Formal e Profissional                  │   |
| │   Tom corporativo e objetivo             │   |
| │                                          │   |
| │ ● Amigável e Acolhedor                   │   |
| │   Tom caloroso e empático                │   |
| └──────────────────────────────────────────┘   |
|                                                |
| Escalar para Humano Quando:                    |
|  ☑ O cliente solicitar                         |
|  ☑ A IA nao souber responder                   |
|  ☐ Assuntos financeiros/cancelamento           |
|                                                |
| Max interacoes antes de sugerir escalonamento: |
| [ 5 ▼ ] (3-10)                                 |
+------------------------------------------------+
```

---

## Arquivos a Modificar/Criar

| Tipo | Arquivo | Mudanca |
|------|---------|---------|
| SQL | Nova migracao | Criar bucket `agent-avatars`, adicionar colunas `voice_tones`, `escalation_options` em `ai_agents` e `voice_tone`, `escalation_config` em `isp_agents`, adicionar config `default_agent_avatar` |
| Modificar | `src/components/admin/ai-agents/constants.ts` | Adicionar constantes para tons de voz e gatilhos padrao |
| Modificar | `src/components/admin/ai-agents/AgentTemplateForm.tsx` | Adicionar aba "Personalizacao" com configuracao de tons e escalonamento |
| Modificar | `src/hooks/admin/useAiAgentTemplates.ts` | Incluir novos campos nas queries |
| Modificar | `src/pages/admin/Config.tsx` | Adicionar upload de avatar padrao na aba Plataforma |
| Modificar | `src/hooks/painel/useIspAgents.ts` | Expandir `AgentActivationForm` com novos campos e upload |
| Modificar | `src/components/painel/ai/AgentActivationDialog.tsx` | Adicionar aba "Comportamento", componente de upload de avatar |
| Modificar | `src/integrations/supabase/types.ts` | Adicionar tipos para novos campos |

---

## Secao Tecnica

### Migracao SQL

```sql
-- Criar bucket para avatares de agentes
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-avatars', 'agent-avatars', true);

-- Politicas RLS para o bucket
CREATE POLICY "ISPs podem fazer upload de avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-avatars' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Avatares sao publicos para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-avatars');

-- Adicionar campos no template (superadmin define opcoes)
ALTER TABLE ai_agents 
ADD COLUMN IF NOT EXISTS voice_tones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS escalation_options JSONB DEFAULT '{}'::jsonb;

-- Adicionar campos na ativacao (cliente escolhe)
ALTER TABLE isp_agents 
ADD COLUMN IF NOT EXISTS voice_tone TEXT,
ADD COLUMN IF NOT EXISTS escalation_config JSONB DEFAULT '{}'::jsonb;

-- Config para avatar padrao (se nao existir)
INSERT INTO platform_config (key, value, category, description)
VALUES (
  'default_agent_avatar',
  '{"value": null}'::jsonb,
  'identity',
  'Avatar padrao para agentes de IA quando o ISP nao enviar um'
)
ON CONFLICT (key) DO NOTHING;

-- Inserir valores padrao nos templates existentes
UPDATE ai_agents SET 
voice_tones = '[
  {"id": "formal", "label": "Formal e Profissional", "description": "Tom corporativo e objetivo"},
  {"id": "friendly", "label": "Amigável e Acolhedor", "description": "Tom caloroso e empático"},
  {"id": "casual", "label": "Casual e Descontraído", "description": "Tom leve e informal"},
  {"id": "technical", "label": "Técnico e Preciso", "description": "Tom focado em detalhes técnicos"}
]'::jsonb,
escalation_options = '{
  "triggers": [
    {"id": "user_request", "label": "Quando o cliente solicitar", "default": true},
    {"id": "low_confidence", "label": "Quando a IA não souber responder", "default": true},
    {"id": "sensitive_topic", "label": "Assuntos financeiros ou cancelamento", "default": false},
    {"id": "repeated_issue", "label": "Problema recorrente (3+ vezes)", "default": false}
  ],
  "max_interactions": {"min": 3, "max": 10, "default": 5}
}'::jsonb
WHERE scope = 'tenant' AND voice_tones = '[]'::jsonb;
```

### Tipos TypeScript

```typescript
// Em constants.ts
export interface VoiceTone {
  id: string;
  label: string;
  description?: string;
}

export interface EscalationTrigger {
  id: string;
  label: string;
  default?: boolean;
}

export interface EscalationOptions {
  triggers: EscalationTrigger[];
  max_interactions: {
    min: number;
    max: number;
    default: number;
  };
}

export interface EscalationConfig {
  triggers: string[];
  max_interactions: number;
}

// Constantes padrao
export const DEFAULT_VOICE_TONES: VoiceTone[] = [
  { id: 'formal', label: 'Formal e Profissional', description: 'Tom corporativo e objetivo' },
  { id: 'friendly', label: 'Amigável e Acolhedor', description: 'Tom caloroso e empático' },
  { id: 'casual', label: 'Casual e Descontraído', description: 'Tom leve e informal' },
  { id: 'technical', label: 'Técnico e Preciso', description: 'Tom focado em detalhes técnicos' },
];

export const DEFAULT_ESCALATION_TRIGGERS: EscalationTrigger[] = [
  { id: 'user_request', label: 'Quando o cliente solicitar', default: true },
  { id: 'low_confidence', label: 'Quando a IA não souber responder', default: true },
  { id: 'sensitive_topic', label: 'Assuntos financeiros ou cancelamento', default: false },
  { id: 'repeated_issue', label: 'Problema recorrente (3+ vezes)', default: false },
];
```

### Schema Zod Atualizado (AgentActivationDialog)

```typescript
const activationSchema = z.object({
  display_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  avatar_url: z.string().url("URL inválida").or(z.literal("")).optional(),
  additional_prompt: z.string().optional(),
  voice_tone: z.string().optional(),
  escalation_config: z.object({
    triggers: z.array(z.string()),
    max_interactions: z.number().min(3).max(10),
  }).optional(),
});
```

### Componente de Upload de Avatar

```typescript
// Logica de upload no AgentActivationDialog
const handleAvatarUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${membership.ispId}/${crypto.randomUUID()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('agent-avatars')
    .upload(fileName, file, { upsert: true });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('agent-avatars')
    .getPublicUrl(fileName);
    
  form.setValue('avatar_url', publicUrl);
};
```

### Integracao com Prompt

```typescript
const buildFinalPrompt = (template, ispConfig, securityClauses) => {
  let prompt = template.system_prompt;
  
  // Injetar tom de voz
  if (ispConfig.voice_tone) {
    const tone = template.voice_tones.find(t => t.id === ispConfig.voice_tone);
    if (tone) {
      prompt += `\n\n## Tom de Comunicação\nAdote um tom ${tone.label}: ${tone.description}`;
    }
  }
  
  // Injetar regras de escalonamento
  if (ispConfig.escalation_config?.triggers?.length) {
    const triggers = ispConfig.escalation_config.triggers
      .map(id => template.escalation_options.triggers.find(t => t.id === id)?.label)
      .filter(Boolean);
    prompt += `\n\n## Escalonamento para Humano`;
    prompt += `\nTransfira para atendente humano quando: ${triggers.join(', ')}.`;
    prompt += `\nApós ${ispConfig.escalation_config.max_interactions} interações sem resolução, sugira transferência.`;
  }
  
  return prompt;
};
```

---

## Fluxo de Dados Completo

```text
Superadmin                           Cliente ISP
    │                                     │
    ├──> Define template                  │
    │    - voice_tones: [...]             │
    │    - escalation_options: {...}      │
    │                                     │
    ├──> Configura avatar padrao          │
    │    - default_agent_avatar           │
    │                                     │
    │                                     ├──> Ativa agente
    │                                     │    - display_name: "Assistente"
    │                                     │    - avatar_url: (upload ou null)
    │                                     │    - voice_tone: "friendly"
    │                                     │    - escalation_config: {
    │                                     │        triggers: ["user_request"],
    │                                     │        max_interactions: 5
    │                                     │      }
    │                                     │
    └─────────────────────────────────────┴──> Agente configurado
                                                Avatar: upload ou padrao
                                                Prompt: base + tom + escalonamento
```

---

## Validacoes

1. **Avatar**: Aceitar apenas imagens (jpg, png, webp) com max 2MB
2. **Tom de voz**: Cliente so pode escolher tons definidos no template
3. **Gatilhos**: Cliente so pode selecionar gatilhos habilitados pelo superadmin
4. **Max interacoes**: Valor deve estar entre min e max definidos no template
5. **Defaults**: Se cliente nao configurar, usar valores `default` do template
