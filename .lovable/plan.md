

## Plano: Adicionar tipos enumerados do `/radusuarios` e interface `IxcRadusuarios`

### Novos tipos enumerados (append após linha 755)

```typescript
/** S = Sim, N = Não, SS = Sem status */
export type IxcOnlineStatus = "S" | "N" | "SS";

/** H = Configuração padrão, S = Sempre, N = Nunca */
export type IxcAutoPreencherIpv6 = "H" | "S" | "N";

/** N = Não, S = Sim, P = Padrão, MK = Mikrotik, UN = UBNT, WP = WPA2-AES */
export type IxcAutenticacaoPorMac = "N" | "S" | "P" | "MK" | "UN" | "WP";

/** 58 = 5.8GHz, 24 = 2.4GHz, F = Fibra, L = Cabo, A = ADSL, LTE = LTE, LDD = Link dedicado */
export type IxcTipoConexaoMapa = "58" | "24" | "F" | "L" | "A" | "LTE" | "LDD";

/** L = PPPoE, H = Hotspot, M = IP x MAC, V = VLAN, D = IPoE, I = Integração, E = Externa */
export type IxcAutenticacao = "L" | "H" | "M" | "V" | "D" | "I" | "E";

/** D = Padrão, C = Contrato, P = Pré-pago, G = Grátis */
export type IxcTipoVinculoPlano = "D" | "C" | "P" | "G";

/** C = Comodato, P = Próprio */
export type IxcTipoEquipamento = "C" | "P";

/** https = HTTPS, http = HTTP */
export type IxcTipoAcesso = "https" | "http";
```

### Reutilização de tipo existente

- `IxcAutoPreencherIpv6` (`H/S/N`) será reutilizado para todos os 12 campos com padrão `"H"`: `auto_preencher_ip`, `auto_preencher_mac`, `fixar_ip`, `relacionar_ip_ao_login`, `relacionar_mac_ao_login`, `relacionar_concentrador_ao_login`, `auto_preencher_ipv6`, `fixar_ipv6`, `relacionar_ipv6_ao_login`, `framed_fixar_ipv6`, `framed_autopreencher_ipv6`, `framed_relacionar_ipv6_ao_login`

### Interface `IxcRadusuarios`

~100 campos mapeados 1:1 do JSON com JSDoc e FKs inline:
- `id_cliente` → FK `/cliente.id`
- `id_contrato` → FK `/cliente_contrato.id`
- `online` → `IxcOnlineStatus`
- `ativo`, `service_tag_vlan`, `onu_compartilhada`, `senha_md5`, `cliente_tem_a_senha`, `franquia_atingida`, `autenticacao_wps`, `autenticacao_mac`, `endereco_padrao_cliente` → `IxcSimNao`

### Arquivo alterado

Append em `supabase/functions/_shared/erp-providers/ixc-types.ts` após linha 755.

