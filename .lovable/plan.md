

# Auditoria de Prompt Dinamico para Super Admins

## Problema

O prompt do agente de IA e montado dinamicamente em 8 camadas na Edge Function `ai-chat`, combinando template, tom de voz, RAG, FAQ, clausulas de seguranca, ferramentas, fluxos e contexto. Atualmente nao ha como o super admin visualizar o prompt final que esta sendo enviado ao modelo, dificultando a identificacao de comportamentos indesejados.

## Solucao Proposta

Criar uma Edge Function dedicada `audit-prompt` que monta o prompt exatamente como o `ai-chat` faz, mas em vez de enviar ao OpenAI, retorna o prompt completo para o super admin visualizar. Complementar com uma interface no painel admin.

## Arquitetura

A solucao tem 3 partes:

1. **Edge Function `audit-prompt`** - Recebe `isp_agent_id` e retorna o prompt montado com todas as camadas, sem chamar a OpenAI
2. **Hook `useAuditPrompt`** - Hook React para chamar a edge function
3. **Dialog `PromptAuditDialog`** - Modal na pagina de detalhes do agente (admin) para visualizar o prompt

## Detalhes Tecnicos

### 1. Edge Function `audit-prompt` (`supabase/functions/audit-prompt/index.ts`)

- Recebe via POST: `{ isp_agent_id: string }`
- Valida que o usuario autenticado e `super_admin`
- Busca o `isp_agent` com JOIN no template (`ai_agents`)
- Busca ISP name, clausulas de seguranca, knowledge base (sem RAG, pois nao ha query do usuario)
- Busca flows vinculados via `ai_agent_flow_links` (respeitando `is_active`)
- Busca configuracao ERP do ISP
- Chama a mesma logica de `buildSystemPrompt` (copiada/adaptada)
- Retorna JSON com:
  - `prompt`: o texto completo do system prompt
  - `metadata`: informacoes sobre cada camada (template usado, qtd de clausulas, qtd de FAQs, fluxos carregados, ferramentas ativas)
  - `isp_name`, `agent_name`, `template_name`

Exemplo de resposta:

```text
{
  "prompt": "Voce e um atendente virtual...",
  "metadata": {
    "template_id": "...",
    "template_name": "Atendente Virtual",
    "voice_tone": "profissional",
    "security_clauses_count": 2,
    "knowledge_base_count": 15,
    "document_chunks": 0,
    "flows": [{ "name": "Cobranca", "steps_count": 4 }],
    "tools": ["erp_search", "erp_invoice_search"],
    "has_erp": true
  }
}
```

### 2. Hook `useAuditPrompt` (`src/hooks/admin/useAuditPrompt.ts`)

- Mutation que chama `supabase.functions.invoke('audit-prompt', { body: { isp_agent_id } })`
- Retorna o prompt e metadata

### 3. Acesso pela UI

Duas opcoes de acesso:

**Opcao A - Na pagina de Templates (`/admin/ai-agents`):**
- Na tabela de templates, adicionar um botao/menu "Auditar ISPs" que lista os ISPs que usam aquele template
- Ao clicar em um ISP, abre o dialog com o prompt montado para aquele agente especifico

**Opcao B - Nova pagina/secao dedicada:**
- Dropdown para selecionar ISP -> lista agentes ativos daquele ISP -> botao "Ver Prompt"

Recomendo a **Opcao A** pois aproveita o fluxo existente e o hook `useTemplateUsage` que ja lista os ISPs usando cada template.

### 4. Dialog `PromptAuditDialog` (`src/components/admin/ai-agents/PromptAuditDialog.tsx`)

- Modal com layout em duas secoes:
  - **Painel lateral esquerdo**: metadata resumida (template, ISP, fluxos ativos, ferramentas, contagens)
  - **Area principal**: prompt completo em texto monoespacado com scroll, com botao de copiar
- Botao "Copiar Prompt" para facilitar analise externa
- Indicadores visuais por camada (badges coloridos mostrando quais camadas estao presentes)

### 5. Configuracao

- Adicionar `verify_jwt = false` no `config.toml` para a nova funcao (validacao manual no codigo)
- Nenhum secret novo necessario (usa os mesmos ja existentes)
- Nenhuma migracao de banco necessaria

## Fluxo do Super Admin

1. Acessa `/admin/ai-agents`
2. Clica no template suspeito (ex: "Atendente Virtual")
3. Na pagina de detalhes, ve a lista de ISPs que usam o template (via `useTemplateUsage`)
4. Clica em "Auditar Prompt" ao lado de um ISP especifico
5. O dialog abre mostrando o prompt completo montado + metadata
6. Identifica instrucoes problematicas e corrige no template ou clausulas de seguranca

