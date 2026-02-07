
# Remover tudo relacionado a "Premium" dos Agentes de IA

Conforme o planejamento do projeto, a indicacao de agente Premium nao faz parte do escopo -- a disponibilidade dos agentes e controlada pelos limites dos planos de assinatura.

## Alteracoes

### 1. `src/components/admin/ai-agents/AgentTemplateForm.tsx`
- Remover `is_premium` do schema Zod (linha 69)
- Remover `is_premium: false` dos valores default (linha 132)
- Remover `is_premium` do reset com dados do agente (linha 158)
- Remover o bloco `FormField` do switch Premium (linhas 565-584)

### 2. `src/hooks/admin/useAiAgentTemplates.ts`
- Remover `isPremium` da interface `UseAiAgentTemplatesOptions`
- Remover `isPremium` da desestruturacao e do `queryKey`
- Remover o bloco condicional que filtra por `is_premium`

### 3. `src/components/painel/ai/AgentCatalogCard.tsx`
- Remover o bloco que exibe o Badge "Premium" no canto superior direito (linhas 43-49)

### 4. `src/components/painel/ai/ActiveAgentCard.tsx`
- Remover o bloco que exibe o Badge "Premium" (linhas 56-61)

### 5. `src/components/painel/ai/AgentTestDialog.tsx`
- Remover a exibicao do Badge "Pro" ao lado do nome do agente (linhas 356-358)

Nenhuma coluna sera removida do banco de dados -- apenas as referencias no frontend serao limpas.
