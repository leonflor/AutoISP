

# Atualizar Guia de Projeto — Sincronizar com Estado Atual

## Contexto
O guia de projeto possui informações desatualizadas em relação a mudanças recentes: sistema de contexto explícito no procedure-runner (v19), novas ferramentas de entrega de fatura, medidas de segurança implementadas e descrições de módulos compartilhados.

## Mudanças por arquivo

### 1. `src/components/guia-projeto/ImplementacaoTab.tsx`

**procedure-runner.ts description (linha 773)**: Atualizar para mencionar:
- Contexto explícito com chaves nomeadas (`confirmed_cpf_cnpj`, `selected_client_id`, `confirmed_client_name`, `confirmed_client_provider`)
- Auto-advance com guard `[continuar]` no `evaluateAdvanceCondition`
- Auto-seleção de contrato quando `erp_contract_lookup` retorna apenas 1 resultado

**tool-catalog.ts description (linha 776)**: Adicionar as 4 ferramentas de entrega de fatura que faltam:
- `erp_pix_lookup`, `erp_boleto_lookup`, `erp_boleto_sms`, `erp_linha_digitavel`
- Total de tools passa de 4 para 8

**response-models.ts description (linha 777)**: Adicionar os novos tipos:
- `PixResponse`, `BoletoResponse`, `BoletoSmsResponse`, `LinhaDigitavelResponse`

**erp-driver.ts description (linha 781)**: Mencionar as funções granulares de entrega (buscarPix, buscarBoleto, buscarBoletoSms, buscarLinhaDigitavel)

**Riscos (linha 71)**: Atualizar mitigação de "Perda de contexto" para:
- "Chaves canônicas explícitas (`confirmed_cpf_cnpj`, `selected_client_id`, `selected_contract_id`) + guard `[continuar]` no auto-advance"

### 2. `src/components/guia-projeto/ResumoProjetoTab.tsx`

**Resumo Executivo (linha 345-346)**: Atualizar a lista de ferramentas canônicas para incluir as 8 tools reais:
- `erp_client_lookup`, `erp_contract_lookup`, `erp_invoice_search`, `erp_pix_lookup`, `erp_boleto_lookup`, `erp_boleto_sms`, `erp_linha_digitavel`, `transfer_to_human`

Mencionar o sistema de contexto determinístico com chaves nomeadas (v19).

### 3. `src/components/guia-projeto/seguranca/SecurityOverviewSection.tsx`

**Matriz de Segredos**: Adicionar `WHATSAPP_APP_SECRET` (tipo: Privado, escopo: Global, local: Supabase Secrets, uso: Validação HMAC-SHA256 de webhooks Meta)

Adicionar `ENCRYPTION_KEY` (tipo: Privado, escopo: Global, local: Supabase Secrets, uso: AES-GCM para criptografia de dados sensíveis)

**Checklist de Segurança**: Adicionar itens implementados:
- Verificação HMAC-SHA256 em webhooks WhatsApp
- Rate limiting por telefone (30 msg/min)
- Sanitização de CSS em componentes de gráfico
- Sanitização de respostas de erro em Edge Functions

## Arquivos editados

| Arquivo | Tipo de mudança |
|---|---|
| `ImplementacaoTab.tsx` | Atualizar descrições de 4 módulos _shared, riscos |
| `ResumoProjetoTab.tsx` | Atualizar resumo executivo com tools + contexto v19 |
| `SecurityOverviewSection.tsx` | Adicionar secrets e itens de checklist |

