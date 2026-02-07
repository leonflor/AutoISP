
# Mover campos de Status para aba Basico e remover aba Status

## Alteracoes

**Arquivo:** `src/components/admin/ai-agents/AgentTemplateForm.tsx`

### 1. Reduzir tabs de 5 para 4 colunas e remover "Status"
- Linha 233: mudar `grid-cols-5` para `grid-cols-4`
- Linha 238: remover `<TabsTrigger value="status">Status</TabsTrigger>`

### 2. Mover campos `is_active` e `sort_order` para o final da aba "Basico"
- Os dois `FormField` (linhas 544-580) serao movidos para dentro de `<TabsContent value="basic">`, logo antes do fechamento dessa aba (apos a linha ~348, no final do bloco basico)
- O switch "Ativo" e o campo "Ordem de Exibicao" ficarao no final da aba Basico

### 3. Remover a `<TabsContent value="status">` inteira (linhas 543-581)
- Todo o bloco sera removido, pois seus campos ja estarao na aba Basico
