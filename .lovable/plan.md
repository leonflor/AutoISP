
Traduzir o plano atual para português claro, sem mudar o escopo técnico.

## Enviar PDF do boleto direto no chat do WhatsApp

Sim, dá para anexar o PDF como mensagem de documento no WhatsApp em vez de mandar só o link. O cliente vê o boleto inline no chat e abre sem sair do app. A signed URL de 24h que já geramos serve como fonte do arquivo.

### O que vai ser feito

**1. Nova ferramenta de IA: `erp_boleto_send_pdf`**
Arquivos: `supabase/functions/_shared/tool-handlers.ts` e `supabase/functions/_shared/tool-catalog.ts`.

Parâmetro: `fatura_id`.

Fluxo do handler:
- Chama `buscarBoleto(ispId, faturaId)` — reaproveita toda a stack já endurecida (parsing Base64 robusto, upload no Storage, signed URL de 24h).
- Busca a configuração do WhatsApp do provedor na tabela `whatsapp_configs` e descriptografa o token de acesso.
- Envia para a Graph API do WhatsApp uma mensagem do tipo `document`, contendo:
  - `link`: a signed URL do PDF
  - `filename`: `boleto-<fatura_id>.pdf`
  - `caption`: texto curto, ex.: "Segue seu boleto. Vencimento: <data>"
- Registra o envio em `whatsapp_messages` (direção outbound, tipo document) e em `messages` (papel agent, conteúdo "📎 Boleto enviado").
- Retorna `{ sent: true, fatura_id }` para o LLM.

**2. Sincronizar o catálogo no frontend**
Arquivo: `src/constants/tool-catalog.ts`. Espelhar a nova ferramenta para manter paridade obrigatória entre runtime (edge) e UI.

**3. Atualizar o procedimento de cobrança**
Arquivo: `docs/migrations/f4-procedure-seed.sql` (ou nova migração versionada). Adicionar "PDF no chat" como opção de entrega ao lado de PIX, SMS e linha digitável. Mensagem ao usuário:
"Como prefere receber? 1) PDF aqui mesmo 2) PIX 3) SMS 4) Linha digitável"

### Reaproveitamento
- Mantém `erp_boleto_lookup` (link de download) como alternativa e uso interno.
- Reusa o padrão de envio já implementado em `resolve-conversation/index.ts` (decrypt do token + chamada à Graph API).
- Não altera nenhuma camada de provider/driver validada.

### Fora de escopo
- Upload do PDF como mídia nativa do WhatsApp (endpoint `/media`) — desnecessário, a signed URL pública é suficiente e mais simples.
- Envio por e-mail — fica no backlog separado.

### Como testar depois do deploy
Abrir o simulador em `/admin/test-agent` ou um WhatsApp real, pedir 2ª via, escolher "PDF no chat". O boleto deve aparecer como anexo PDF clicável dentro da própria conversa.
