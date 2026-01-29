
# Atualização do Guia de Projeto AutoISP

## Objetivo

Sincronizar o Guia de Projeto com a implementação atual, atualizando contagens de features, edge functions, secrets e tabelas conforme catalogado na auditoria realizada.

---

## Resumo das Atualizações

| Seção | Estado Atual | Atualização |
|-------|--------------|-------------|
| FeaturesTab | 109 Admin / 124 Cliente / 24 Landing | Manter (contagens planejadas) |
| ImplementacaoTab | 6 edge functions listadas | Atualizar para 11 funções implementadas |
| ImplementacaoTab | 4 secrets | Atualizar para incluir novos secrets |
| ResumoProjetoTab | Trial 7 dias | Atualizar para refletir `trial_days` dinâmico |
| IntegracoesTab | 9 integrações | Manter estrutura atual |

---

## Mudanças Detalhadas

### 1. ImplementacaoTab - Edge Functions

**Arquivo:** `src/components/guia-projeto/ImplementacaoTab.tsx`

**Linha 69-76:** Atualizar lista de Edge Functions

Antes:
```typescript
const edgeFunctions = [
  "asaas-create-customer",
  "asaas-create-subscription",
  "asaas-webhook",
  "ai-chat (OpenAI API)",
  "ai-usage",
  "whatsapp-webhook",
];
```

Depois:
```typescript
const edgeFunctions = [
  "asaas-customer",
  "asaas-subscription",
  "asaas-webhook",
  "ai-chat",
  "ai-usage",
  "whatsapp-webhook",
  "check-integration",
  "test-integration",
  "save-integration",
  "send-email",
  "invite-admin",
];
```

### 2. ImplementacaoTab - Secrets

**Arquivo:** `src/components/guia-projeto/ImplementacaoTab.tsx`

**Linha 54-59:** Atualizar lista de secrets

Adicionar novos secrets configurados no projeto:

```typescript
const secrets = [
  { nome: "ASAAS_API_KEY", fase: "F2", descricao: "Chave da API Asaas (sandbox/prod)" },
  { nome: "ASAAS_WEBHOOK_TOKEN", fase: "F2", descricao: "Token para validar webhooks Asaas" },
  { nome: "OPENAI_API_KEY", fase: "F2", descricao: "Chave da API OpenAI" },
  { nome: "WHATSAPP_TOKEN", fase: "F2", descricao: "Token WhatsApp Business" },
  { nome: "RESEND_API_KEY", fase: "F2", descricao: "Chave da API Resend para emails" },
  { nome: "ENCRYPTION_KEY", fase: "F1", descricao: "Chave para criptografia de dados sensíveis" },
];
```

### 3. ResumoProjetoTab - Trial Dinâmico

**Arquivo:** `src/components/guia-projeto/ResumoProjetoTab.tsx`

**Linha 131-134:** Atualizar informação do período de trial

Antes:
```tsx
<div className="flex justify-between">
  <dt className="text-muted-foreground">Duração</dt>
  <dd className="font-medium text-foreground">7 dias</dd>
</div>
```

Depois:
```tsx
<div className="flex justify-between">
  <dt className="text-muted-foreground">Duração</dt>
  <dd className="font-medium text-foreground">Configurável por plano (padrão: 14 dias)</dd>
</div>
```

### 4. ImplementacaoTab - Descrição Backend

**Arquivo:** `src/components/guia-projeto/ImplementacaoTab.tsx`

**Linha 739:** Atualizar descrição das Edge Functions

Antes:
```tsx
<CardDescription>Funções serverless a serem criadas</CardDescription>
```

Depois:
```tsx
<CardDescription>11 funções serverless implementadas</CardDescription>
```

### 5. FeaturesAdminSection - Módulo IA

**Arquivo:** `src/components/guia-projeto/features/FeaturesAdminSection.tsx`

Adicionar novo módulo de IA na lista de módulos do Admin:

```typescript
const modulos = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: 9 },
  { id: "clientes", label: "Clientes ISP", icon: Building2, count: 14 },
  { id: "planos", label: "Planos", icon: CreditCard, count: 12 },
  { id: "financeiro", label: "Financeiro", icon: FileText, count: 18 },
  { id: "suporte", label: "Suporte", icon: Headphones, count: 16 },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, count: 15 },
  { id: "equipe", label: "Equipe", icon: Users, count: 11 },
  { id: "configuracoes", label: "Configurações", icon: Settings, count: 14 },
  { id: "ia", label: "IA", icon: Bot, count: 8 },  // NOVO
];
```

Adicionar TabsContent correspondente para o módulo de IA.

---

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/components/guia-projeto/ImplementacaoTab.tsx` | Edge functions, secrets, descrição |
| `src/components/guia-projeto/ResumoProjetoTab.tsx` | Trial dinâmico |
| `src/components/guia-projeto/features/FeaturesAdminSection.tsx` | Adicionar módulo IA |

---

## Novo Arquivo a Criar

### IAFeatures.tsx

**Arquivo:** `src/components/guia-projeto/features/modules/IAFeatures.tsx`

Novo componente para documentar as features do módulo de IA no Admin:

| Feature | Descrição |
|---------|-----------|
| F-ADMIN-108 | Listar Templates de Agentes de IA |
| F-ADMIN-109 | Criar Template de Agente |
| F-ADMIN-110 | Editar Template de Agente |
| F-ADMIN-111 | Duplicar Template de Agente |
| F-ADMIN-112 | Ativar/Desativar Template |
| F-ADMIN-113 | Gerenciar Cláusulas de Segurança LGPD |
| F-ADMIN-114 | Criar Cláusula de Segurança |
| F-ADMIN-115 | Editar Cláusula de Segurança |

---

## Seção Técnica

### Alteração 1: Edge Functions (ImplementacaoTab.tsx, linhas 69-76)

```typescript
const edgeFunctions = [
  "asaas-customer",
  "asaas-subscription", 
  "asaas-webhook",
  "ai-chat",
  "ai-usage",
  "whatsapp-webhook",
  "check-integration",
  "test-integration",
  "save-integration",
  "send-email",
  "invite-admin",
];
```

### Alteração 2: Secrets (ImplementacaoTab.tsx, linhas 54-59)

```typescript
const secrets = [
  { nome: "ASAAS_API_KEY", fase: "F2", descricao: "Chave da API Asaas (sandbox/prod)" },
  { nome: "ASAAS_WEBHOOK_TOKEN", fase: "F2", descricao: "Token para validar webhooks Asaas" },
  { nome: "OPENAI_API_KEY", fase: "F2", descricao: "Chave da API OpenAI" },
  { nome: "WHATSAPP_TOKEN", fase: "F2", descricao: "Token WhatsApp Business" },
  { nome: "RESEND_API_KEY", fase: "F2", descricao: "Chave da API Resend para emails" },
  { nome: "ENCRYPTION_KEY", fase: "F1", descricao: "Chave para criptografia de dados sensíveis" },
];
```

### Alteração 3: Trial Dinâmico (ResumoProjetoTab.tsx, linha 133)

```tsx
<dd className="font-medium text-foreground">Configurável por plano (padrão: 14 dias)</dd>
```

### Alteração 4: Descrição Edge Functions (ImplementacaoTab.tsx, linha 739)

```tsx
<CardDescription>11 funções serverless implementadas</CardDescription>
```

### Alteração 5: Módulo IA no FeaturesAdminSection

Adicionar import do ícone Bot e novo módulo na lista.

### Alteração 6: Criar IAFeatures.tsx

Componente com 8 features documentadas seguindo o padrão dos outros módulos.

---

## Resumo Final

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `ImplementacaoTab.tsx` | Atualizar edge functions (6 -> 11) e secrets (4 -> 6) |
| Modificar | `ResumoProjetoTab.tsx` | Trial dinâmico por plano |
| Modificar | `FeaturesAdminSection.tsx` | Adicionar módulo IA com 8 features |
| Criar | `IAFeatures.tsx` | Documentar features de gestão de agentes e cláusulas LGPD |
