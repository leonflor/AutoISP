
# Atualizar Guia do Projeto - Revisao Completa

## Discrepancias Identificadas

Apos revisao completa do codigo implementado versus a documentacao no guia, foram encontradas as seguintes inconsistencias:

### 1. Motor de IA: OpenAI vs Lovable AI Gateway
O guia documenta extensivamente a integracao com OpenAI direta, mas a implementacao real usa o **Lovable AI Gateway** (`ai.gateway.lovable.dev`) com suporte multi-modelo.

**O que esta errado no guia:**
- Titulo da integracao diz "INT-02 -- OpenAI"
- Secret documentado como `OPENAI_API_KEY` (real: `LOVABLE_API_KEY`)
- Endpoint documentado como `api.openai.com` (real: `ai.gateway.lovable.dev`)
- Modelo listado como apenas "GPT-4o" (real: suporta GPT-4o, GPT-4o-mini, Gemini Flash, Gemini Pro, Claude Sonnet)
- Payloads de exemplo usam formato OpenAI direto
- Custos referem-se a precos OpenAI diretos (agora via Gateway com pricing diferente)
- ResumoProjetoTab lista "OpenAI" como tecnologia

### 2. Lista de Edge Functions Desatualizada
O guia lista 12 edge functions, mas existem 14 implementadas:
- Faltam: `save-erp-config`, `test-erp`
- Nome diferente: `whatsapp-webhook` esta implementado mas guia lista como parte generica

### 3. Lista de Secrets Desatualizada
Secrets reais configurados:
- `ENCRYPTION_KEY`
- `LOVABLE_API_KEY` (auto-provisionado)
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_URL`
- `WHATSAPP_APP_SECRET`

Guia lista incorretamente:
- `OPENAI_API_KEY` (nao existe, e `LOVABLE_API_KEY`)
- `ASAAS_API_KEY` (nao configurado ainda)
- `ASAAS_WEBHOOK_TOKEN` (nao configurado ainda)
- `WHATSAPP_TOKEN` (real: `WHATSAPP_APP_SECRET`)
- `RESEND_API_KEY` (nao configurado ainda)
- Falta documentar que `LOVABLE_API_KEY` e auto-provisionado

### 4. Logica de Nomes dos Agentes de IA Nao Documentada
A recente implementacao da separacao entre Nome do Template e Nome de Apresentacao nao consta no guia.

### 5. Backend: Supabase Externo vs Lovable Cloud
O guia referencia "Supabase externo conectado", mas o projeto agora roda em **Lovable Cloud**.

### 6. Consolidacao - Decisoes Desatualizadas
- "Integrações: Core primeiro (Asaas -> OpenAI -> WhatsApp)" deveria mencionar Lovable AI Gateway
- "Complexidade IA: Estrutura + 1 agente (Atendente)" - Na realidade ja existem multiplos tipos de agentes (atendente, cobrador, vendedor, analista, suporte)

---

## Alteracoes Planejadas

### Arquivo 1: `src/components/guia-projeto/ImplementacaoTab.tsx`
- Atualizar array `edgeFunctions` de 12 para 14 itens (adicionar `save-erp-config`, `test-erp`)
- Atualizar array `secrets` com os secrets reais (`LOVABLE_API_KEY` auto-provisionado, `WHATSAPP_APP_SECRET`, remover `OPENAI_API_KEY`)
- Atualizar consolidacao: "Integrações" mencionar Lovable AI Gateway, "Complexidade IA" mencionar sistema multi-agente
- Atualizar `backendConfig` para refletir Lovable Cloud
- Atualizar Fase F2 para referenciar Lovable AI Gateway em vez de OpenAI

### Arquivo 2: `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx`
- Renomear para refletir "Lovable AI Gateway" (ou atualizar conteudo interno)
- Titulo: "INT-02 -- Lovable AI Gateway (Multi-Modelo)"
- Modelos suportados: GPT-4o, GPT-4o-mini, Gemini Flash, Gemini Pro, Claude Sonnet
- Secret: `LOVABLE_API_KEY` (auto-provisionado pelo Lovable Cloud)
- Endpoint: `ai.gateway.lovable.dev/v1/chat/completions`
- Embeddings: `ai.gateway.lovable.dev/v1/embeddings` com modelo `text-embedding-3-small`
- Atualizar payloads de exemplo com formato real
- Atualizar secao de custos (via Lovable AI Gateway, pricing baseado em uso)
- Remover referencia a `OPENAI_MODEL` e variaveis OpenAI especificas
- Atualizar troubleshooting para referenciar Gateway

### Arquivo 3: `src/components/guia-projeto/integracoes/IASection.tsx`
- Atualizar titulo e descricao para "Lovable AI Gateway e modelos multi-provider"

### Arquivo 4: `src/components/guia-projeto/ResumoProjetoTab.tsx`
- Trocar "OpenAI" por "Lovable AI Gateway" na lista de tecnologias
- Ajustar icone/categoria para "IA Multi-Modelo"
- Atualizar periodo de trial para consistencia (usar "Configuravel" como ja esta)
- Atualizar resumo executivo mencionando multi-modelo

### Arquivo 5: `src/components/guia-projeto/FeaturesTab.tsx`
- Verificar se contagens de features estao atualizadas (nenhuma alteracao necessaria se contagens estiverem corretas)

---

## Secao Tecnica

### Arquivos a modificar:
1. `src/components/guia-projeto/ImplementacaoTab.tsx` -- edge functions, secrets, consolidacao, backend config
2. `src/components/guia-projeto/integracoes/OpenAIIntegration.tsx` -- reescrita quase completa para Lovable AI Gateway
3. `src/components/guia-projeto/integracoes/IASection.tsx` -- titulo/descricao
4. `src/components/guia-projeto/ResumoProjetoTab.tsx` -- tecnologias, resumo executivo

### Sem alteracao de banco:
- Todas as alteracoes sao em componentes de documentacao do guia
- Nenhuma logica de negocio e afetada
- Nenhuma migracao necessaria
