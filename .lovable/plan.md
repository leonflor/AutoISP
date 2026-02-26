

## Plano: Adicionar interface `IxcRadpopRadioClienteFibra` em `ixc-types.ts`

### Novo tipo enumerado

```typescript
/** B = Bridge, R = Router (PPPoE) */
export type IxcTipoOperacao = "B" | "R";
```

### Tipos reutilizados

- `IxcSimNao` → `endereco_padrao_cliente`, `radpop_estrutura`, `onu_rede_neutra`
- `tipo_autenticacao` → `string` (sem documentação completa dos valores)

### FKs

- `id_login` → `/radusuarios.id`
- `id_contrato` → `/cliente_contrato.id`
- `id_transmissor`, `id_caixa_ftth`, `id_radpop_radio_porta`, `id_condominio`, `id_hardware`, `id_perfil`, `id_projeto`, `id_ramal` — FKs internas

### Interface `IxcRadpopRadioClienteFibra`

~70 campos mapeados 1:1 do JSON. Campos de telemetria (`sinal_rx`, `sinal_tx`, `temperatura`, `voltagem`) tipados como `string`.

### Arquivo alterado

Append em `supabase/functions/_shared/erp-providers/ixc-types.ts` após linha 1060.

