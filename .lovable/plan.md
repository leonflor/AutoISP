
# Sincronizar Templates com Agentes ISP

## Problema Identificado

A arquitetura atual está correta no frontend - ISP agents fazem JOIN com templates e sempre recebem dados atualizados. Porém, a Edge Function `ai-chat` está quebrada e precisa ser corrigida para usar a estrutura de join corretamente.

### Problemas Atuais:

1. **Edge Function `ai-chat`** busca `ai_agents.isp_id` que não existe
2. Não usa `isp_agents` para obter customizações do ISP
3. Não injeta `voice_tone`, `additional_prompt` ou `security_clauses` no prompt

---

## Solução

Corrigir a Edge Function para buscar corretamente a configuração do agente através do join `isp_agents` → `ai_agents`, garantindo que:
- Mudanças no template (system_prompt, model, temperature) são aplicadas imediatamente
- Customizações do ISP (voice_tone, escalation_config) são respeitadas
- Cláusulas de segurança globais são injetadas

---

## Arquivos a Modificar

| Tipo | Arquivo | Mudança |
|------|---------|---------|
| Modificar | `supabase/functions/ai-chat/index.ts` | Corrigir query para usar isp_agents JOIN ai_agents |

---

## Seção Técnica

### Nova Lógica da Edge Function

```text
1. Receber: ispAgentId (ou agentId + ispId)
2. Buscar: isp_agents JOIN ai_agents WHERE isp_agents.id = ispAgentId
3. Validar: ISP tem acesso, agente está ativo
4. Buscar: ai_security_clauses ativas
5. Buscar: agent_knowledge_base (se uses_knowledge_base = true)
6. Montar prompt final:
   - Base: template.system_prompt
   - + Voice tone injection (se configurado)
   - + Knowledge base context (se houver)
   - + Security clauses (sempre)
7. Chamar AI Gateway com template.model, template.temperature
8. Registrar uso
```

### Estrutura do Prompt Final

```text
[SYSTEM_PROMPT do template]

[Se voice_tone configurado]
Adote o seguinte tom de voz: {voice_tone}

[Se knowledge_base disponível]
Base de conhecimento disponível:
Q: {pergunta1}
A: {resposta1}
...

[Sempre - Security Clauses]
REGRAS OBRIGATÓRIAS:
- {clausula1}
- {clausula2}
```

### Hierarquia de Dados (Template vs ISP)

| Campo | Origem | Descrição |
|-------|--------|-----------|
| system_prompt | Template | Prompt base do agente |
| model | Template | Modelo de IA a usar |
| temperature | Template | Criatividade das respostas |
| max_tokens | Template | Limite de tokens |
| voice_tone | ISP | Tom selecionado pelo ISP |
| escalation_config | ISP | Regras de escalação customizadas |
| avatar_url | ISP > Template | Prioridade para customização do ISP |
| display_name | ISP > Template | Prioridade para customização do ISP |

---

## Fluxo de Dados Corrigido

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AiChat.tsx    │────►│  ai-chat (Edge)  │────►│ AI Gateway      │
│                 │     │                  │     │                 │
│ - ispAgentId    │     │ 1. Query JOIN    │     │ - model         │
│ - messages      │     │ 2. Build prompt  │     │ - temperature   │
│ - ispId         │     │ 3. Add security  │     │ - messages      │
└─────────────────┘     │ 4. Add knowledge │     └─────────────────┘
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   Supabase DB    │
                        │                  │
                        │ - isp_agents     │
                        │ - ai_agents      │
                        │ - security_clauses│
                        │ - knowledge_base │
                        └──────────────────┘
```

---

## Benefícios da Correção

1. **Atualizações Automáticas**: Mudanças no template refletem imediatamente
2. **Segurança Centralizada**: Cláusulas de segurança sempre injetadas
3. **Personalização ISP**: Voice tone e customizações respeitadas
4. **Knowledge Base**: Contexto específico do ISP incluído
5. **Consistência**: Mesmo agente, comportamento uniforme entre ISPs
