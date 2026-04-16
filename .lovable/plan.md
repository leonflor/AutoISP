
Robustecer parsing do Base64 do boleto + aumentar TTL para 24h.

**Arquivos:** `supabase/functions/_shared/erp-providers/ixc.ts` (parsing) e `supabase/functions/_shared/erp-driver.ts` (TTL).

**Mudanças:**

1. **`ixc.ts` — função `ixc_boleto_lookup`**: extrair helper `extractBase64FromIxcResponse(raw)` que tenta em ordem:
   - `raw.boleto` (string direta)
   - `raw.arquivo` / `raw.pdf` / `raw.base64` / `raw.file`
   - `raw.data` (string ou objeto aninhado)
   - varredura recursiva (profundidade ≤ 2) por qualquer string com `length > 1000` que pareça base64 (`/^[A-Za-z0-9+/=\s]+$/`)
   - remove prefixo `data:application/pdf;base64,` se presente
   - strip de whitespace antes de retornar
   - se nada for encontrado, lança erro claro `"Resposta IXC não contém PDF base64"` com log do shape do JSON (chaves de nível 1) para diagnóstico
   - valida assinatura PDF após decode (primeiros bytes = `%PDF`); se inválido, loga warning mas segue (alguns IXC retornam ligeiramente fora do padrão)

2. **`erp-driver.ts` — função `buscarBoleto`**:
   - aumentar TTL do `createSignedUrl` de `3600` → `86400` (24h)
   - adicionar log estruturado: `console.log("[buscarBoleto]", { ispId, faturaId, pdfBytes, latencyMs })`

**Fora do escopo (ficam para depois):** cache de boleto recente, retry automático, e-mail. Tratamos só parsing robusto + TTL agora.

**Não-destrutivo:** mantém assinatura pública das funções e formato de retorno (`{ boleto_url, fatura_id }`). Só endurece a extração interna.
