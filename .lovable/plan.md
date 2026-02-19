

# Atualizar o Guia do Projeto com o Estado Atual da Implementacao

## Contexto

O guia de projeto (`src/components/guia-projeto/`) esta desatualizado em relacao ao que ja foi implementado. Varias edge functions, modulos compartilhados e funcionalidades foram adicionados sem que o guia refletisse essas mudancas.

## Alteracoes Necessarias

### 1. ImplementacaoTab.tsx — Lista de Edge Functions

**Problema:** Lista 15 funcoes, mas existem 20 implementadas.

**Adicionar 5 funcoes ausentes:**
- `audit-prompt` — Auditoria de prompt dinamico para super admins
- `fetch-onu-signal` — Diagnostico de sinal ONU em tempo real
- `save-whatsapp-config` — Salvar configuracao WhatsApp do ISP
- `send-whatsapp` — Envio de mensagens WhatsApp
- `test-whatsapp-connection` — Testar conexao WhatsApp

**Atualizar descricao do card:** de "Funcoes serverless a serem criadas" para "Funcoes serverless implementadas" (ja que todas estao no ar).

### 2. ImplementacaoTab.tsx — Modulos Compartilhados (_shared/)

**Problema:** Lista apenas 2 modulos, existem 7.

**Adicionar modulos ausentes:**
- `_shared/erp-types.ts` — Tipos padrao de ERP (ErpClient, ErpProvider, ContractStatus)
- `_shared/erp-providers/index.ts` — Registry de providers ERP (IXC, SGP, MK)
- `_shared/erp-providers/ixc.ts` — Conector IXC Soft
- `_shared/erp-providers/sgp.ts` — Conector SGP
- `_shared/erp-providers/mk.ts` — Conector MK-Solutions
- `_shared/onu-signal-analyzer.ts` — Analise de qualidade de sinal ONU (rx/tx)
- `_shared/tool-catalog.ts` — Catalogo de tools para function calling

### 3. ImplementacaoTab.tsx — Adicionar Status por Fase

Adicionar badges de status nas fases para indicar progresso:
- F1 (Database): Concluida
- F2 (Integracoes Core): Concluida
- F3 (Auth e Seguranca): Concluida
- F4 (Plataforma Admin): Concluida
- F5 (Plataforma Cliente): Concluida
- F6 (Landing Page): Concluida
- F7 (Deploy): Em progresso

### 4. ResumoProjetoTab.tsx — Tecnologias Core

**Adicionar tecnologias que ja estao implementadas mas ausentes do resumo:**
- WhatsApp / Meta Business API (Comunicacao)
- ERP (IXC, SGP, MK-Solutions) (Integracao)

### 5. ResumoProjetoTab.tsx — Resumo Executivo

Atualizar o paragrafo do resumo executivo para mencionar:
- Integracao multi-ERP (IXC, SGP, MK-Solutions, Hubsoft)
- Diagnostico ONU em tempo real
- Auditoria de prompts dinamicos
- Sistema de fluxos conversacionais com procedures

### 6. IntegracoesTab.tsx — Contagem de Integracoes

Atualizar o total de "9 integracoes" para refletir o numero real, considerando que agora ha ERP multi-provider.

## Detalhes Tecnicos

Todas as alteracoes sao em componentes React existentes (sem novas dependencias, sem migracoes, sem edge functions). Os arquivos a editar sao:

- `src/components/guia-projeto/ImplementacaoTab.tsx` — Edge functions, shared modules, status das fases
- `src/components/guia-projeto/ResumoProjetoTab.tsx` — Tecnologias e resumo executivo

Estimativa: edicoes pontuais em 2 arquivos.
