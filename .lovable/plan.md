
Objetivo

Corrigir 3 regressões do fluxo de cobrança:
1. a fatura não pode aparecer antes da escolha explícita do contrato;
2. o SMS não pode ser tentado automaticamente;
3. `dias_atraso` não deve mais ser mostrado ao cliente.

O que eu encontrei no código

- `procedure-runner.ts` faz auto-avanço recursivo entre passos. Isso é útil, mas hoje o fluxo de cobrança não está travado por dados estruturados suficientes.
- A migration atual (`v15`) só endureceu o texto do passo financeiro. Ela não corrigiu o passo de seleção de contrato nem a exposição precoce das tools de pagamento.
- `mergeToContext()` grava envelopes completos no `collected_context` e sobrescreve a chave genérica `itens`. Resultado: quando `erp_invoice_search` roda cedo, ele apaga do contexto a lista de contratos; depois disso, um `"7"` deixa de ser interpretado como contrato.
- `FaturaResponse`, `erp-driver.ts` e os catálogos de tools ainda expõem `dias_atraso`, então o LLM continua vendo esse campo como dado válido para renderizar.
- O passo de pagamento ainda deixa `erp_boleto_sms` disponível cedo demais, então o modelo pode disparar SMS sem intenção explícita do usuário.

Fluxo alvo

```text
Identificar cliente
  -> Listar contratos e esperar escolha explícita
  -> Consultar faturas do contrato escolhido
  -> Se houver 1 fatura, selecionar automaticamente
     Se houver várias, esperar escolha da fatura
  -> Oferecer modalidades e esperar escolha explícita
  -> Executar somente a modalidade escolhida
```

Plano de implementação

1. Estruturar o contexto da cobrança para não haver colisão entre contratos e faturas
- Em `procedure-runner.ts`, parar de depender da chave genérica `itens`.
- Salvar dados em chaves nomeadas, por exemplo:
  - `contract_options`
  - `selected_contract_id`
  - `invoice_options`
  - `selected_invoice_id`
  - `selected_payment_method`
- Atualizar `resolveContractSelectionFromMessage()` para ler `contract_options`, não `ctx.itens`.
- Adicionar um resolvedor semelhante para:
  - seleção de fatura, quando houver mais de uma;
  - seleção de modalidade (`linha_digitavel`, `pix`, `boleto_pdf`, `boleto_sms`).
- Limpar chaves antigas da cobrança ao iniciar o procedimento ou ao reconsultar cliente/contratos, para evitar estado sobrando de turnos anteriores.

2. Colocar travas determinísticas antes da execução das tools
- Em `procedure-runner.ts`, bloquear `erp_invoice_search` se houver múltiplos contratos e `selected_contract_id` ainda não estiver definido.
- Bloquear tools de pagamento se `selected_payment_method` não estiver definido.
- No passo final, permitir somente a tool que corresponde exatamente à modalidade escolhida:
  - PIX -> `erp_pix_lookup`
  - PDF -> `erp_boleto_lookup`
  - SMS -> `erp_boleto_sms`
  - Linha digitável -> lookup dedicado/on-demand
- Se a tool falhar, responder com erro amigável e voltar a pedir outra modalidade; sem fallback automático para SMS, PIX ou PDF.

3. Reescrever o procedimento “Cobrança de fatura” em uma nova migration completa (v16)
- Em vez de mais um patch parcial com `jsonb_set`, inserir uma nova versão inteira do procedimento, para evitar herdar regras quebradas.
- Fluxo proposto:
  - Passo 0: identificar cliente
  - Passo 1: listar contratos e só avançar com `required_fields: ["selected_contract_id"]`
  - Passo 2: consultar faturas do contrato escolhido; se houver só 1, preencher `selected_invoice_id`; se houver várias, pedir escolha explícita
  - Passo 3: oferecer modalidades e só avançar com `required_fields: ["selected_payment_method"]`
  - Passo 4: executar apenas a entrega escolhida
- No passo 2, instrução explícita para mostrar somente valor e vencimento.
- No passo 3, instrução explícita para não chamar nenhuma tool ainda.
- No passo 4, instrução explícita para nunca tentar SMS sem escolha literal do usuário.

4. Remover `dias_atraso` da superfície entregue ao modelo
- Em `supabase/functions/_shared/response-models.ts`, remover `dias_atraso` de `FaturaResponse`.
- Em `supabase/functions/_shared/erp-driver.ts`, parar de calcular e retornar `dias_atraso`.
- Em `supabase/functions/_shared/tool-catalog.ts` e `src/constants/tool-catalog.ts`, atualizar a descrição de `erp_invoice_search` para refletir o contrato real: valor, vencimento e identificação técnica da fatura, sem `dias_atraso` e sem linha digitável.

5. Fechar a lacuna da linha digitável sem voltar a vazá-la cedo demais
- Hoje a linha digitável não deve ficar no `erp_invoice_search`, mas o fluxo ainda precisa entregá-la depois da escolha da modalidade.
- Vou resolver isso de forma on-demand no IXC:
  - ou generalizando a busca em `fn_areceber` por `fatura_id`;
  - ou estendendo o fluxo de boleto para também hidratar `linha_digitavel` apenas no passo final.
- Arquivos prováveis: `supabase/functions/_shared/erp-providers/ixc.ts`, `erp-driver.ts` e `response-models.ts`.
- Resultado: a linha digitável continua disponível para o cliente, mas só aparece depois da escolha do contrato e da modalidade.

6. Validação do cenário exato que você reportou
- Revalidar o transcript real:
  1. `boleto` -> pede CPF/CNPJ
  2. documento -> confirma identidade
  3. `sim` -> mostra apenas contratos
  4. `7` -> mostra apenas fatura(s) do contrato 7, sem `dias_atraso`
  5. se houver 1 fatura -> oferece modalidades
  6. `2`/`pix` -> chama somente `erp_pix_lookup`
  7. `sms` -> chama somente `erp_boleto_sms`
  8. falha no SMS -> pede outra modalidade, sem disparar nada sozinho

Arquivos que pretendo alterar

- `supabase/functions/_shared/procedure-runner.ts`
- `supabase/functions/_shared/context-builder.ts` (tipagem de `required_fields`, se necessário)
- `supabase/functions/_shared/erp-driver.ts`
- `supabase/functions/_shared/response-models.ts`
- `supabase/functions/_shared/tool-catalog.ts`
- `src/constants/tool-catalog.ts`
- `supabase/functions/_shared/erp-providers/ixc.ts`
- `supabase/migrations/<nova_migration_v16>.sql`

Detalhes técnicos importantes

- A correção principal não é só “mexer no prompt”; ela precisa de trava de estado no runner.
- O ponto mais crítico hoje é a sobrescrita de `collected_context.itens`, porque ela destrói a memória da lista de contratos assim que a busca de faturas roda cedo.
- A nova migration deve ser uma versão completa do procedimento, não mais um ajuste incremental em cima da v15.
- Não vou mexer em UI do React para isso; o problema é de engine/procedimento/modelo de resposta.
