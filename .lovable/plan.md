

# Atualizar Guia com Implementacoes Feitas Nao Documentadas

## Discrepancias Encontradas

Apos varredura completa do codigo vs guia, identifiquei **5 discrepancias** entre o que esta implementado e o que o guia documenta.

---

### Discrepancia 1: ResumoProjetoTab — Referencia a "Procedures" (removido)

**Arquivo:** `src/components/guia-projeto/ResumoProjetoTab.tsx` (linhas 343-346)

O Resumo Executivo menciona:
- "sistema de fluxos conversacionais com procedures"
- "Agent → Procedures → Fluxos → Steps → tool_handler via catalogo hardcoded"

A arquitetura "Procedures" foi completamente removida (tabelas `ai_procedures`, `ai_procedure_tools`, `ai_agent_procedures` dropadas na migracao recente). A arquitetura atual e:
- **Agent → Flow Links → Flows → Steps → tool_handler**

**Correcao:** Atualizar o Resumo Executivo para refletir a arquitetura de fluxos diretos sem procedures.

---

### Discrepancia 2: OpenAIIntegration — Prompt Hierarquico menciona "Procedures" (linhas 156-159)

**Arquivo:** `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx` (linhas 156-159)

Camadas 6 e 7 do prompt hierarquico dizem:
- "Ferramentas (Tools) — Carregadas via Procedures vinculados ao agente"
- "Fluxos Conversacionais — Instrucoes estruturadas via Procedures"

No `ai-chat` real (linhas 228-277), tools e fluxos sao carregados diretamente via `ai_agent_flow_links` → `ai_agent_flows` → `ai_agent_flow_steps`, sem "Procedures".

**Correcao:** Atualizar para:
- "Ferramentas (Tools) — Filtradas do catalogo conforme fluxos vinculados via flow_links"
- "Fluxos Conversacionais — Carregados via ai_agent_flow_links"

---

### Discrepancia 3: AgentesIAClienteFeatures — Menciona "procedures" (linha 118)

**Arquivo:** `src/components/guia-projeto/features/modules/cliente/AgentesIAClienteFeatures.tsx` (linha 118)

Feature F-CLI-052 diz: "tools via procedures"

**Correcao:** Mudar para "tools via catalogo hardcoded e fluxos vinculados"

---

### Discrepancia 4: ResumoProjetoTab — Menciona "Hubsoft" como ERP integrado

**Arquivo:** `src/components/guia-projeto/ResumoProjetoTab.tsx` (linha 343)

Diz: "integracao multi-ERP (IXC, SGP, MK-Solutions, Hubsoft)"

Na realidade, Hubsoft existe apenas como tipo em `erp-types.ts` e display name, mas **nao tem provider implementado** (nao existe `erp-providers/hubsoft.ts`). O guia de ERP corretamente marca Hubsoft como "Pendente" na tabela, mas o Resumo Executivo implica que ja esta integrado.

**Correcao:** Mudar para "integracao multi-ERP (IXC, SGP, MK-Solutions)" e mencionar Hubsoft como planejado.

---

### Discrepancia 5: PainelAdminSection — Falta modulos implementados (WhatsApp, IA submenu)

**Arquivo:** `src/components/guia-projeto/plataformas/PainelAdminSection.tsx` (linhas 23-34)

A lista de modulos no guia tem 10 items mas **falta o modulo WhatsApp** que existe no AdminSidebar e tem pagina implementada (`/admin/whatsapp` → `WhatsApp.tsx`). O sidebar real tambem organiza IA como submenu com 5 itens (Templates, Ferramentas, Fluxos, Logs, Clausulas LGPD), mas o guia lista apenas "Agentes IA Template" como um unico modulo.

**Correcao:** Adicionar "WhatsApp" como modulo e expandir a descricao de IA para refletir os 5 sub-modulos reais.

---

## Plano de Alteracoes

### Arquivo 1: `src/components/guia-projeto/ResumoProjetoTab.tsx`

**Linha 343-346 (Resumo Executivo):**
- Remover "com procedures" da frase
- Trocar "(IXC, SGP, MK-Solutions, Hubsoft)" por "(IXC, SGP, MK-Solutions)"
- Trocar "Agent → Procedures → Fluxos → Steps → tool_handler" por "Agent → Flow Links → Flows → Steps → tool_handler"
- Adicionar "Hubsoft planejado" como nota

### Arquivo 2: `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`

**Linhas 156-159 (Prompt Hierarquico — Camadas 6 e 7):**
- Camada 6: "Ferramentas (Tools) — Filtradas do catalogo conforme fluxos vinculados (ai_agent_flow_links)"
- Camada 7: "Fluxos Conversacionais — Carregados via ai_agent_flow_links com steps e rotas condicionais"

### Arquivo 3: `src/components/guia-projeto/features/modules/cliente/AgentesIAClienteFeatures.tsx`

**Linha 118:**
- Trocar "tools via procedures" por "tools via catalogo hardcoded e fluxos vinculados"

### Arquivo 4: `src/components/guia-projeto/plataformas/PainelAdminSection.tsx`

**Linhas 23-34 (lista de modulos):**
- Adicionar modulo "WhatsApp" com descricao: "Configuracao global da Meta Business API, webhook URL, testes de conexao"
- Expandir "Agentes IA Template" para "IA (5 sub-modulos)" com descricao: "Templates de agentes, catalogo de ferramentas (read-only), fluxos conversacionais globais, logs de processamento RAG, clausulas LGPD"

## Resumo de Impacto

| Arquivo | Alteracao |
|---|---|
| `ResumoProjetoTab.tsx` | Remover "Procedures" e "Hubsoft" do resumo executivo |
| `OpenAIIntegration.tsx` | Corrigir camadas 6-7 do prompt hierarquico |
| `AgentesIAClienteFeatures.tsx` | Corrigir referencia a "procedures" |
| `PainelAdminSection.tsx` | Adicionar WhatsApp + expandir descricao IA |

