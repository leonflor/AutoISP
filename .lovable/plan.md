

# Remover aba Features e mover Base de Conhecimento para Basico

## Resumo

Remover a aba "Features" do formulario de template de agente e mover o toggle "Base de Conhecimento" para o final da aba "Basico".

## Alteracoes

### Arquivo: `src/components/admin/ai-agents/AgentTemplateForm.tsx`

1. **Remover a aba "Features" do TabsList** (linha 203) -- remover o TabsTrigger `value="features"`

2. **Mover o toggle "Base de Conhecimento" para dentro da aba "Basico"** -- o bloco `uses_knowledge_base` (linhas 506-527) sera adicionado logo apos o toggle "Ativo" (apos linha 397), mantendo a condicao `scope === 'tenant'`

3. **Remover o TabsContent `value="features"` inteiro** (linhas 491-528) -- que continha o FeatureTagsSelector e o uses_knowledge_base

4. **Remover o import do `FeatureTagsSelector`** (linha 39)

5. **Remover `feature_tags` do schema e defaultValues** -- remover do objeto `agentSchema` (linha 58), dos `defaultValues` (linha 115), e do `form.reset` ao carregar agente (linha 139)

### Arquivo: `src/components/admin/ai-agents/FeatureTagsSelector.tsx`

Nenhuma alteracao -- o arquivo deixa de ser importado mas pode ser mantido no repositorio caso seja reaproveitado futuramente (ou removido se preferir).

## Resultado

- A aba "Features" desaparece do formulario
- O toggle "Base de Conhecimento" aparece na aba "Basico", logo abaixo do toggle "Ativo"
- O campo `feature_tags` deixa de ser gerenciado pelo formulario (permanece na tabela do banco, apenas nao e mais editavel por aqui)

