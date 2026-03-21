

# Plano: Corrigir Alucinações do Agente no Simulador

## Causa raiz

O logs mostram `proc=no` e `rag=0` — sem procedimento ativo e sem base de conhecimento. Quando não há ferramentas disponíveis (ERP não configurado), o agente recebe apenas o prompt base ("Nunca invente informações — use apenas dados retornados pelas ferramentas") mas sem ferramentas reais. O LLM ignora a restrição e inventa dados.

## Solução

Fortalecer o `buildSystemPrompt` no `context-builder.ts` com guardrails explícitos baseados no estado do contexto:

### 1. `supabase/functions/_shared/context-builder.ts` — guardrails dinâmicos

Adicionar ao final de `buildSystemPrompt`:

- **Sem ERP configurado**: Informar ao agente que ele NÃO tem acesso a sistemas externos e NÃO pode consultar dados de clientes, faturas ou contratos. Deve orientar o usuário a procurar o provedor diretamente.
- **Sem procedimento ativo**: Informar que o agente deve apenas responder perguntas gerais e encaminhar para atendimento humano quando o assunto exigir consulta a sistemas.
- **Sem RAG**: Informar que não há base de conhecimento configurada e que deve evitar respostas técnicas específicas do provedor.

Exemplo de bloco adicionado:

```typescript
// 7. Guardrails based on available capabilities
const hasErp = !!context.erpConfig;
const hasRag = ragChunks.length > 0;
const hasProcedure = !!procedure;

let guardrails = "\n\n## REGRAS OBRIGATÓRIAS:";
guardrails += "\n- NUNCA invente dados de clientes, faturas, contratos, CPF, valores ou endereços.";
guardrails += "\n- NUNCA forneça informações técnicas específicas (velocidade do plano, valor de fatura, status de conexão) sem ter consultado uma ferramenta.";

if (!hasErp) {
  guardrails += "\n- Você NÃO tem acesso ao sistema ERP. Não pode consultar dados de clientes. Informe que o recurso não está disponível no momento.";
}
if (!hasProcedure) {
  guardrails += "\n- Nenhum procedimento está ativo. Responda de forma genérica e ofereça transferir para atendimento humano quando necessário.";
}
if (!hasRag) {
  guardrails += "\n- Não há base de conhecimento configurada. Evite respostas que exijam conhecimento específico do provedor.";
}

prompt += guardrails;
```

### 2. Arquivo afetado

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/_shared/context-builder.ts` | Adicionar seção de guardrails dinâmicos ao final de `buildSystemPrompt` |

### Impacto
- Não altera nenhuma lógica de ferramentas ou procedimentos
- Apenas adiciona instruções restritivas ao prompt quando o agente não tem dados reais para consultar
- Aplica-se tanto ao simulador quanto ao webhook do WhatsApp

