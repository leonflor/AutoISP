
Objetivo: corrigir o falso “cliente não encontrado” para o CNPJ `11.248.428/0001-74` no `ai-chat`, mantendo a arquitetura em 3 camadas e sem regressão no fluxo de contratos/faturas.

1) Diagnóstico consolidado (com base nos logs + código atual)

- Nos logs do `ai-chat`, a tool é chamada com `cpf_cnpj` formatado:
  - `erp_client_lookup({"cpf_cnpj":"11.248.428/0001-74"})`
- No handler (`tool-handlers.ts`), o valor é imediatamente sanitizado para apenas dígitos antes de resolver cliente.
- Na resolução leve (`resolveClienteErpId` em `erp-driver.ts`), esse valor sanitizado é enviado para `driver.fetchClientes`.
- No provider IXC (`erp-providers/ixc.ts`), `fetchClientes` usa filtro exato:
  - `qtype: "cliente.cnpj_cpf", oper: "="`
- Resultado provável: IXC espera formato armazenado (com pontuação) em muitos cenários; ao receber só dígitos, retorna vazio.  
  Isso explica o comportamento “não encontrou cliente” mesmo com CNPJ existente.

Indício adicional encontrado:
- logs de `fetch-erp-clients` mostram vários warnings:
  - `Status não mapeado: "A"` e `"CA"`
- Não é a causa principal do “não encontrado”, mas é uma inconsistência real de normalização que afeta qualidade da resposta.

2) Causa raiz

Causa principal:
- Perda de formato do documento cedo demais (Camada 1), combinada com consulta exata no IXC (Camada 3).

Causa secundária:
- Normalização de status incompleta para códigos reais do IXC (`A`, `CA`) na Camada 2.

3) Plano de implementação

3.1 Ajuste robusto de documento (Camada 3 – IXC)
Arquivo: `supabase/functions/_shared/erp-providers/ixc.ts`

- Melhorar `fetchClientes` para aceitar variações de CPF/CNPJ:
  - valor original;
  - somente dígitos;
  - formatado automaticamente (CPF 11 dígitos / CNPJ 14 dígitos).
- Estratégia:
  - gerar variantes únicas;
  - tentar consultas por variante (curto-circuito ao encontrar resultados);
  - normalizar comparação final por dígitos para garantir match determinístico.
- Benefício: corrige lookup sem depender do formato exato digitado pelo usuário ou passado pelo handler.

3.2 Preservar entrada original e sanitizar só para validação (Camada 1)
Arquivo: `supabase/functions/_shared/tool-handlers.ts`

- Em `erp_client_lookup`, `erp_contract_lookup`, `erp_onu_diagnostics` e `erp_invoice_search`:
  - manter `cpfCnpjRaw = String(args.cpf_cnpj || "")`;
  - usar `cpfDigits` apenas para validar tamanho;
  - passar `cpfCnpjRaw` para `resolveClienteErpId` / `fetchInvoices`.
- Benefício: reduz risco de inconsistência entre providers e mantém compatibilidade com IXC.

3.3 Tornar resolução leve tolerante a formato (Camada 2)
Arquivo: `supabase/functions/_shared/erp-driver.ts`

- Em `resolveClienteErpId`:
  - receber entrada raw;
  - comparar docs por forma normalizada (só dígitos), como já ocorre;
  - manter retorno atual (`client | null`, `errors`), sem quebrar contratos existentes.
- Opcional recomendado:
  - incluir pequeno log estruturado quando nenhum cliente for encontrado, contendo quantidade de configs processadas e providers consultados (sem vazar segredo), para facilitar suporte.

3.4 Completar mapeamento de status IXC (Camada 2)
Arquivo: `supabase/functions/_shared/erp-driver.ts`

- Expandir `IXC_INTERNET_STATUS_MAP` para códigos observados:
  - `"a"` -> `"ativo"`
  - `"ca"` -> `"bloqueado"` (ou regra de negócio equivalente para cancelado)
- Manter warning apenas para chaves realmente desconhecidas após esse ajuste.
- Benefício: elimina “Outros” indevido e ruído de logs.

4) Validação e testes (obrigatório)

4.1 Teste funcional E2E no fluxo real do agente
- No “Testar Agente”, enviar:
  - “CNPJ 11.248.428/0001-74”
  - “listar contratos”
- Esperado:
  - não retornar “cliente não encontrado”;
  - retornar contratos do cliente.

4.2 Teste de variação de documento
- Repetir com:
  - `11.248.428/0001-74`
  - `11248428000174`
- Esperado:
  - resultado equivalente nos dois formatos.

4.3 Teste encadeado com cobrança
- Pedir contratos → escolher endereço → pedir faturas.
- Esperado:
  - uso correto de `id_contrato` no financeiro;
  - quando houver múltiplos contratos, filtragem por endereço funciona.

4.4 Teste de regressão de status
- Verificar contratos com status antes mapeados como “Outros”.
- Esperado:
  - “A”/“CA” não caiam mais em “outros”;
  - redução dos warnings no log.

5) Arquivos impactados

- `supabase/functions/_shared/erp-providers/ixc.ts`
- `supabase/functions/_shared/tool-handlers.ts`
- `supabase/functions/_shared/erp-driver.ts`
- Deploy da edge function: `ai-chat` (e validar também `fetch-erp-clients` via logs de comportamento)

6) Riscos e mitigação

Risco:
- múltiplas tentativas de query por variante aumentarem latência no IXC.

Mitigação:
- implementar tentativa em ordem curta com early return ao primeiro hit;
- limitar a 2–3 variantes relevantes;
- manter comparação por dígitos para evitar duplicidades.

7) Critério de aceite

- O CNPJ `11.248.428/0001-74` deixa de retornar “cliente não encontrado” no agente.
- O mesmo cliente é encontrado tanto com documento formatado quanto sem pontuação.
- Fluxo contrato → endereço → cobrança permanece consistente.
- Warnings massivos de status `A`/`CA` deixam de aparecer como “não mapeado”.
