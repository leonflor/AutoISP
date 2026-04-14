

# Discovery Técnico — Integração IXC Soft (Estado Atual)

Respostas baseadas na análise completa do código-fonte do projeto atual (SaaS multitenant).

---

## BLOCO 1 — Infraestrutura e Acesso à API

1. **URL base da API**: Configurada por tenant na tabela `erp_configs.api_url`. A função `normalizeUrl()` em `ixc.ts` remove trailing slashes e o sufixo `/webservice/v1` se duplicado. Resultado: `{base}/webservice/v1/{endpoint}`.

2. **Método de autenticação**: **Basic Auth** — `Authorization: Basic base64(username:password)` + header customizado `ixcsoft: listar` para endpoints de listagem.

3. **Token fixo ou por cliente**: Fixo por provedor (ISP). Cada ISP configura suas credenciais na tabela `erp_configs` (campo `username` em texto claro, `password_encrypted` com AES-256-GCM).

4. **Ambiente de homologação**: Não implementado. Apenas um `api_url` por config.

5. **Rate limit**: Não há controle de rate limit implementado no lado do conector. O limite é `rp=5000` registros por request. Do lado do WhatsApp: 30 msg/min por telefone.

6. **Camada intermediária**: Sim — **Supabase Edge Functions (Deno)**. A arquitetura é de 3 camadas:
   - Camada 1: `tool-handlers.ts` (validação de input)
   - Camada 2: `erp-driver.ts` (orquestração, decrypt, normalização)
   - Camada 3: `ixc.ts` (HTTP puro contra a API IXC)

7. **Linguagem/Framework**: **TypeScript/Deno** (Supabase Edge Functions).

---

## BLOCO 2 — Autenticação do Assinante

1-8. **Não existe autenticação de assinante no projeto atual.** O sistema é um SaaS B2B: operadores do ISP se autenticam via Supabase Auth (e-mail/senha). Os assinantes interagem apenas via WhatsApp — são identificados pelo número de telefone e pelo CPF informado durante a conversa com o agente IA.

Para o PWA singletenant, a autenticação do assinante precisará ser **criada do zero**. Opção mais viável: login por CPF + verificação OTP (SMS/WhatsApp), usando os dados do IXC para validar a existência do cliente.

---

## BLOCO 3 — Dados do Assinante

1. **Endpoint cadastral**: `POST {base}/webservice/v1/cliente` com body `{qtype: "cliente.cnpj_cpf", query: "CPF", oper: "="}`. A função `ixc_client_lookup()` em `ixc.ts` faz essa busca.

2. **Campos disponíveis** (mapeados em `ixc-types.ts` — IxcCliente): `id`, `razao`, `fantasia`, `cnpj_cpf`, `email`, `fone`, `telefone_celular`, `whatsapp`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `cep`, `latitude`, `longitude`, `data_nascimento`, `Sexo`, `ativo`, `obs`, `alerta` — mais de 100 campos documentados.

3. **Identificador único**: `id` do endpoint `/cliente` (= `id_cliente` nos contratos).

4. **Endpoint para atualizar dados**: Não implementado. A API IXC suporta PUT/PATCH mas o conector atual é somente leitura (`ixcsoft: listar`).

5. **Múltiplos contratos**: Sim. A função `buscarContratos()` retorna todos os contratos ativos de um `id_cliente`. O sistema numera sequencialmente (`opcao: 1, 2, 3...`) e pede ao assinante para escolher.

---

## BLOCO 4 — Dados Financeiros

1. **Endpoint de faturas**: `POST {base}/webservice/v1/fn_areceber` com filtros `id_contrato` + `status=A` (aberto). Função: `ixc_invoice_search()`.

2. **Linha digitável**: Sim, no campo `linha_digitavel` do response de `fn_areceber`. Também disponível via endpoint dedicado (busca pontual por ID da fatura).

3. **Segunda via de boleto**: `POST {base}/webservice/v1/get_boleto` — retorna PDF em base64. O sistema faz decode, upload para Supabase Storage e gera URL assinada (1h).

4. **PIX**: `POST {base}/webservice/v1/get_pix` — retorna `qrCode.qrcode` (copia-e-cola), `qrCode.imagemSrc` (imagem QR), `dadosPix.expiracaoPix` (expiração DD/MM/YYYY HH:mm:ss).

5. **Histórico de pagamentos**: Não implementado. Apenas faturas com `status=A` (em aberto) são consultadas.

6. **Status financeiro**: Derivado do campo `status_internet` do contrato:
   - `A` → ativo | `CM` → bloqueio manual | `CA` → bloqueio automático | `FA` → financeiro em atraso | `D` → desativado | `AA` → aguardando assinatura

7. **Dia de vencimento**: Campo `dia_vencimento` no endpoint `/cliente_contrato`.

8. **Webhook de pagamento**: Não implementado no lado IXC. Existe webhook da Asaas (`asaas-webhook`) mas não do IXC.

---

## BLOCO 5 — Contratos

1. **Endpoint**: `POST {base}/webservice/v1/cliente_contrato` com filtro `id_cliente` + `status=A`.

2. **Campos disponíveis** (IxcClienteContrato): `id`, `id_cliente`, `contrato` (nome do plano), `id_vd_contrato`, `status`, `status_internet`, `dia_vencimento`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `cep`, `latitude`, `longitude`, `fidelidade`, `data_ativacao`, `taxa_instalacao`, `tipo` (I=Internet, T=Telefonia, S=Serviços).

3. **Status do contrato**: `P` = Pré-contrato, `A` = Ativo, `I` = Inativo, `N` = Negativado, `D` = Desistiu.

4. **Download PDF do contrato**: Não implementado.

5. **Equipamento vinculado**: Parcialmente — via `/radusuarios` temos `onu_mac`, `mac`, `modelo_transmissor`, `tipo_equipamento` (C=Comodato, P=Próprio).

---

## BLOCO 6 — Sinal Óptico e Dados Técnicos

1. **Endpoint de sinal ONU**: `POST {base}/webservice/v1/radpop_radio_cliente_fibra` com filtro `id_login` (correlacionado via `/radusuarios`). Função: `ixc_fibra_by_login()`.

2. **Métricas disponíveis**: `sinal_rx` (RX Power dBm), `sinal_tx` (TX Power dBm). Classificação automática via `onu-signal-analyzer.ts`:
   - RX: saturado (>-8), excelente (-8 a -20), aceitável (-20 a -25), fraco (-25 a -28), crítico (<-28)
   - TX: saturado (>2), ideal (0 a 2), aceitável (-2 a 0), baixo (<-2)
   - Severidade: 0=ok, 1=atenção, 2=problema, 3=crítico

3. **Frequência de atualização**: Depende do IXC (coleta da OLT), tipicamente a cada poucos minutos.

4. **Histórico de sinal**: Não disponível via API. Apenas leitura instantânea.

5. **Status de conexão**: `POST {base}/webservice/v1/radusuarios` com filtro `id_contrato`. Campo `online`: `S` (online), `N` (offline), `SS` (sem status). Função: `ixc_radusuarios_by_contract()`.

6. **Verificação regional**: Não implementado.

7. **Reboot remoto da ONU**: Não implementado.

8. **Eventos RADIUS**: Não implementado. Temos apenas `online`, `ultima_conexao_inicial`, `ultima_conexao_final`, `motivo_desconexao`, `count_desconexao`, `tempo_conexao`, `download_atual`, `upload_atual`.

---

## BLOCO 7 — Suporte e Chamados

1-9. **Não implementado.** O IXC possui endpoint `/su_oss_chamado` para chamados técnicos, mas o conector atual não o utiliza. O sistema de suporte existe apenas no Supabase (`conversations`, `messages`) com o agente IA fazendo a triagem via WhatsApp.

---

## BLOCO 8 — Notificações e Eventos

1. **Push notification**: Não implementado.

2. **Webhooks do IXC**: Não implementado. O único webhook em produção é o da Meta/WhatsApp (`whatsapp-webhook`).

3. **Histórico de notificações**: Mensagens WhatsApp são armazenadas na tabela `whatsapp_messages`. Logs de webhook em `webhook_logs`.

4. **WhatsApp**: Sim — API oficial Meta Cloud API. Configurado na tabela `whatsapp_configs` por ISP.

---

## BLOCO 9 — Agente IA

1. **Modelo**: `gpt-4o` para conversação principal, `gpt-4o-mini` para tarefas auxiliares (detecção de procedimento, resumo de handover, avaliação de avanço de passo).

2. **Hospedagem**: Supabase Edge Functions (Deno). Dois entry points:
   - `whatsapp-webhook/index.ts` — produção WhatsApp
   - `simulate-agent/index.ts` — simulador do painel admin

3. **System prompt**: Sim, definido por `agent_template.system_prompt_base`. Dois templates existentes:
   - **Atendente Geral (Sofia)**: Triagem, consulta de boletos e status de conexão
   - **Suporte N1**: Diagnóstico técnico e orientação de equipamento

4. **Contexto injetado**: Sim. O `context-builder.ts` injeta: dados coletados na conversa (CPF, contrato selecionado, fatura selecionada), data/hora BRT, nome do provedor, base de conhecimento (RAG), procedimento ativo com passo atual, e guardrails dinâmicos baseados em capacidades disponíveis.

5. **Histórico**: Armazenado na tabela `messages` (conversationId). Últimas 20 mensagens são carregadas para o contexto. Sem TTL definido.

6. **Function calling**: Sim, 11 funções implementadas:
   - `erp_client_lookup`, `erp_contract_lookup`, `erp_invoice_search`
   - `erp_pix_lookup`, `erp_boleto_lookup`, `erp_boleto_sms`, `erp_linha_digitavel`
   - `erp_connection_status`, `erp_signal_diagnosis`
   - `transfer_to_human`, `transfer_to_agent`

7. **Controle de custo**: Não implementado.

8. **Fallback**: Sim — `max_intent_attempts` (default 3). Após N tentativas sem detectar procedimento, escala para atendente humano. Também há `stuck_after_turns` por passo e modo `pending_handover` com confirmação do usuário.

---

## BLOCO 10 — Base de Conhecimento

1. **Base estruturada**: Sim — tabela `knowledge_bases` com suporte a embeddings vetoriais.

2. **Formato**: Armazenado no banco Supabase com embeddings gerados via `text-embedding-3-small` (OpenAI).

3. **RAG**: Sim — `match_knowledge()` (pgvector) com threshold 0.78, top 5 chunks. Integrado no `context-builder.ts`.

4. **Categorização**: Por `tenant_agent_id` (cada agente tem sua base).

5. **Gestão**: Via painel do ISP (`/painel/base-conhecimento`).

---

## BLOCO 11 — Entregáveis Disponíveis

| Item | Status |
|---|---|
| Coleção Postman/Insomnia | Não existe — endpoints estão documentados em `ixc.ts` e `ixc-types.ts` |
| Swagger/OpenAPI | Não existe |
| Exemplos de response JSON | Mapeados em `ixc-types.ts` (130+ campos para `/cliente`, 80+ para `/cliente_contrato`) |
| Credenciais homologação | Não disponíveis (produção apenas) |
| Fluxo de autenticação | Descrito acima (Basic Auth para API, Supabase Auth para painel) |
| Limitações conhecidas | `rp=5000` registros max, sem histórico de sinal, sem chamados, sem webhook de pagamento IXC, somente leitura |
| System prompt | Listados acima (2 templates) |
| Repositório Git | Este projeto é o repositório |

---

## Resumo para o PWA Singletenant

O que pode ser **100% reaproveitado**:
- Todo o conector IXC (`ixc.ts`): funções de busca de cliente, contrato, fatura, PIX, boleto, status RADIUS, sinal óptico
- `onu-signal-analyzer.ts`: classificação de sinal
- `field-maps.ts`: mapeamento de campos
- `response-models.ts`: contratos de resposta
- `tool-catalog.ts` + `tool-handlers.ts`: catálogo e handlers de ferramentas

O que precisa ser **criado**:
- Autenticação do assinante (CPF + OTP ou similar)
- UI do portal (dashboard, faturas, suporte, diagnóstico)
- Integração com chamados IXC (`/su_oss_chamado`)
- Histórico de pagamentos (faturas com status pago)
- Push notifications
- Reboot remoto de ONU (se a API IXC suportar)

