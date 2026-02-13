

## Atualizar Guia do Projeto com Edge Functions de Seguranca do WhatsApp

### Contexto

Foram implementadas duas novas Edge Functions (`save-whatsapp-config` e `test-whatsapp-connection`) que adicionam criptografia AES-256-GCM e teste de conexao server-side para a integracao WhatsApp. O guia do projeto precisa ser atualizado para refletir essas mudancas.

### Alteracoes

**1. `src/components/guia-projeto/integracoes/WhatsAppIntegration.tsx`**

- **Diagrama de arquitetura (linhas ~93-127)**: Adicionar os blocos `save-whatsapp-config` e `test-whatsapp-connection` ao diagrama ASCII, mostrando o fluxo de configuracao separado do fluxo de envio/recebimento
- **Secao "Implementacao" (linhas ~444-750)**: Adicionar documentacao das duas novas Edge Functions:
  - `save-whatsapp-config`: criptografia AES-256-GCM, validacao JWT, suporte a contextos admin e ISP, mascaramento de token
  - `test-whatsapp-connection`: decriptacao server-side, chamada para Meta Graph API, atualizacao de status de conexao
- **Secao "Seguranca" (linhas ~803-856)**: Atualizar a linha "Token Encryption" para referenciar o fluxo concreto via `save-whatsapp-config` com AES-256-GCM + IV unico. Adicionar linha sobre "Teste de Conexao Server-side" via `test-whatsapp-connection` (credenciais nunca expostas no browser)

**2. `src/components/guia-projeto/seguranca/AdminSecuritySection.tsx`**

- **Card "Integracoes & Webhooks" (linhas ~319-345)**: Adicionar entrada para WhatsApp Business com autenticacao "Bearer Token (AES-256)" e webhook "HMAC SHA-256 + Rate Limiting"
- **Card "Gestao de Segredos" (linhas ~233-249)**: Adicionar `WHATSAPP_ACCESS_TOKEN` com uso "WhatsApp Business API" e local "DB (AES-256-GCM)"
- **Card "Logica Sensivel" (linhas ~278-305)**: Adicionar entrada para "Config WhatsApp" com "Edge Function (save-whatsapp-config)"

**3. `src/components/guia-projeto/seguranca/ClienteSecuritySection.tsx`**

- **Card "Logica Sensivel" (linhas ~307-330)**: A entrada "Disparo WhatsApp" ja existe mas nao menciona a configuracao segura. Atualizar a validacao para incluir "Credenciais criptografadas, config via Edge Function"

### Resumo

| Arquivo | O que muda |
|---|---|
| `WhatsAppIntegration.tsx` | Diagrama + 2 novas Edge Functions na doc + seguranca detalhada |
| `AdminSecuritySection.tsx` | WhatsApp nos cards de integracoes, segredos e logica sensivel |
| `ClienteSecuritySection.tsx` | Referencia a config segura na logica sensivel |

