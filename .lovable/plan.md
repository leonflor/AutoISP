
Objetivo
- Corrigir o `erp_contract_lookup` para enviar ao agente de IA o payload estruturado “dado original por contrato” (com `ordem`, `endereco`, `numero`, etc.), em vez de depender de `lista_formatada` pronta.

Diagnóstico atual
- Hoje o handler retorna:
  - `encontrados`
  - `lista_formatada` (string pronta)
  - `erros`
- Isso força formatação no backend e perde granularidade dos campos originais.
- No `erp-driver.ts`, já existe composição de `endereco_completo`, mas os campos crus não estão sendo devolvidos no contrato final da Camada 2 para a Camada 1 (tool handler).
- O bug de `nº SN` também acontece porque o prefixo `nº` é aplicado antes da filtragem semântica.

Plano de implementação (arquivo por arquivo)

1) `supabase/functions/_shared/erp-driver.ts`
- Expandir `ContractResult` para incluir campos estruturados de endereço:
  - `endereco`
  - `numero`
  - `complemento`
  - `bairro`
  - `cidade`
  - `estado`
  - `cep`
- No mapeamento de `detalhados.map((ct) => ...)`:
  - Preservar os campos crus (string ou null) vindos do provider.
  - Ajustar saneamento de `endereco_completo`:
    - remover vírgula no final de `endereco` (`replace(/,\s*$/, "")`)
    - só incluir `numero` quando válido (`!== ""`, `!== "0"`, `!== "SN"`)
    - manter `cidade/estado` fora do `endereco_completo` se continuarem vindo como ID numérico.
- Resultado: Camada 2 passa a entregar contrato com campos estruturados + campo composto opcional.

2) `supabase/functions/_shared/tool-handlers.ts` (handler `erp_contract_lookup`)
- Alterar o payload final para estrutura orientada a objeto:
  - substituir (ou despriorizar) `lista_formatada`
  - adicionar `contratos: []` com itens no formato:
    - `ordem`
    - `contrato_id`
    - `endereco`
    - `numero`
    - `complemento`
    - `bairro`
    - `cidade`
    - `estado`
    - `cep`
    - `endereco_completo` (opcional para fallback)
    - `provider_name`
- Filtrar contratos “vazios de endereço” no payload final apenas se todos os campos de endereço vierem nulos/vazios (decisão para reduzir ruído), mantendo `contrato_id` quando necessário para rastreabilidade.
- Manter `encontrados` coerente com o array efetivamente retornado.
- Manter `erros` inalterado.

3) `supabase/functions/_shared/tool-catalog.ts`
- Atualizar `response_description` de `erp_contract_lookup` para refletir o novo contrato estruturado.
- Isso melhora a expectativa do modelo ao interpretar o retorno da tool.

4) (Opcional, recomendado) `supabase/functions/ai-chat/index.ts`
- Manter log atual de resultado completo (`JSON.stringify(result)`), pois ele já permite auditoria do payload exato enviado ao modelo.
- Sem mudança funcional adicional obrigatória aqui.

Formato alvo do payload (exemplo)
```json
{
  "success": true,
  "data": {
    "encontrados": 6,
    "contratos": [
      {
        "ordem": 1,
        "contrato_id": "123",
        "endereco": "Quadra Central 1",
        "numero": null,
        "complemento": null,
        "bairro": "Sobradinho",
        "cidade": "5564",
        "estado": "8",
        "cep": null,
        "endereco_completo": "Quadra Central 1, Sobradinho",
        "provider_name": "IXC Soft"
      }
    ],
    "erros": []
  }
}
```

Compatibilidade e risco
- Risco principal: fluxos/prompts que esperam `lista_formatada`.
- Mitigação recomendada:
  - fase 1: retornar `contratos` + manter `lista_formatada` temporariamente (compatível)
  - fase 2: remover `lista_formatada` após confirmar que o agente está formatando via estrutura.
- Isso evita quebra imediata em produção.

Validação (obrigatória)
1. Redeploy da edge function `ai-chat`.
2. Executar fluxo com CNPJ `12.059.400/0001-51`.
3. Conferir log `🔧 Tool result: erp_contract_lookup` e validar:
   - presença de `data.contratos[]` estruturado
   - ausência de dependência exclusiva de `lista_formatada`
   - `encontrados` consistente com quantidade retornada.
4. Teste ponta a ponta no chat:
   - agente deve montar lista numerada a partir de `contratos[].ordem` e campos de endereço.
   - validar desktop e mobile.

Seção técnica (resumo para implementação)
- Camada 2 (`erp-driver`) deve carregar dados estruturados.
- Camada 1 (`tool-handlers`) deve expor estrutura em JSON sem “render pronto”.
- Catálogo (`tool-catalog`) deve descrever novo shape para orientar function-calling.
- Logging existente em `ai-chat` já é suficiente para depurar o payload final enviado ao modelo.

<lov-actions>
<lov-suggestion message="Teste o fluxo de consulta de contratos ponta a ponta com o CNPJ 12.059.400/0001-51 e valide no log que o payload chega com data.contratos estruturado.">Validar ponta a ponta</lov-suggestion>
<lov-suggestion message="Implemente compatibilidade temporária retornando contratos estruturados e lista_formatada ao mesmo tempo, depois remova lista_formatada em uma segunda etapa.">Compatibilidade gradual</lov-suggestion>
<lov-suggestion message="Adicione uma etapa de normalização para resolver cidade/estado quando vierem como IDs do IXC, consultando tabela de referência antes de enviar ao agente.">Resolver cidade/estado por ID</lov-suggestion>
</lov-actions>
