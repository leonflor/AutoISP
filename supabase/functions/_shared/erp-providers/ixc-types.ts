// ═══ CAMADA 3 — Tipos brutos do IXC Soft ═══
// Modelados 1:1 com a API. Todos os campos são string (a API retorna tudo como string).

// ── Tipos enumerados ──

/** S = Sim, N = Não */
export type IxcSimNao = "S" | "N";

/** S = Sim, N = Não, P = Padrão */
export type IxcSimNaoPadrao = "S" | "N" | "P";

/** F = Física, J = Jurídica, E = Estrangeiro, 1 = Jurídica, 2 = Natural, 3 = Estrangeiro */
export type IxcTipoPessoa = "F" | "J" | "E" | "1" | "2" | "3";

/** F = Feminino, M = Masculino, NB = Não binário, O = Outro, PNI = Prefiro não dizer */
export type IxcSexo = "F" | "M" | "NB" | "O" | "PNI";

/** R = Zona rural, U = Zona urbana */
export type IxcTipoLocalidade = "R" | "U";

/** C = Novo, S = Sondagem, A = Apresentando, N = Negociando, V = Vencemos, P = Perdemos, AB = Abortamos, SV = Sem viabilidade, SP = Sem porta disponível */
export type IxcStatusProspeccao = "C" | "S" | "A" | "N" | "V" | "P" | "AB" | "SV" | "SP";

/** P = Própria, A = Alugada */
export type IxcMoradia = "P" | "A";

// ── Interface principal ──

/** Registro bruto do endpoint /cliente do IXC Soft */
export interface IxcCliente {
  // ── Identificação ──
  id: string;
  razao: string;
  fantasia: string;
  nome_social: string;
  cnpj_cpf: string;
  tipo_pessoa: IxcTipoPessoa;
  tipo_documento_identificacao: string;
  ie_identidade: string;
  /** FK → endpoint /uf */
  uf: string;
  /** YYYY-MM-DD */
  data_cadastro: string;
  /** YYYY-MM-DD */
  data_nascimento: string;
  /** Campo retornado com S maiúsculo pela API */
  Sexo: IxcSexo;
  nacionalidade: string;
  estado_civil: string;
  profissao: string;
  ativo: IxcSimNao;
  rg_orgao_emissor: string;

  // ── Contato ──
  email: string;
  hotsite_email: string;
  fone: string;
  telefone_celular: string;
  telefone_comercial: string;
  whatsapp: string;
  ramal: string;
  contato: string;
  skype: string;
  facebook: string;
  website: string;

  // ── Endereço principal ──
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  /** FK → endpoint /cidade */
  cidade: string;
  cep: string;
  referencia: string;
  latitude: string;
  longitude: string;
  bloco: string;
  apartamento: string;
  id_condominio: string;
  tipo_localidade: IxcTipoLocalidade;

  // ── Endereço de cobrança ──
  endereco_cob: string;
  numero_cob: string;
  complemento_cob: string;
  bairro_cob: string;
  /** FK → endpoint /cidade */
  cidade_cob: string;
  /** FK → endpoint /uf */
  uf_cob: string;
  cep_cob: string;
  referencia_cob: string;

  // ── Comercial / Financeiro ──
  id_tipo_cliente: string;
  id_segmento: string;
  tipo_assinante: string;
  cond_pagamento: string;
  tabela_preco: string;
  filial_id: string;
  id_conta: string;
  id_vendedor: string;
  participa_cobranca: IxcSimNao;
  participa_pre_cobranca: IxcSimNao;
  num_dias_cob: string;
  cob_envia_email: IxcSimNao;
  cob_envia_sms: IxcSimNao;
  deb_automatico: string;
  deb_agencia: string;
  deb_conta: string;
  tipo_pessoa_titular_conta: string;
  cnpj_cpf_titular_conta: string;
  filtra_filial: IxcSimNao;

  // ── Fiscal / Tributário ──
  contribuinte_icms: IxcSimNao;
  im: string;
  inscricao_municipal: string;
  isuf: string;
  cif: string;
  tipo_cliente_scm: string;
  iss_classificacao_padrao: string;
  pis_retem: IxcSimNao;
  cofins_retem: IxcSimNao;
  csll_retem: IxcSimNao;
  irrf_retem: IxcSimNao;
  inss_retem: IxcSimNao;
  desconto_irrf_valor_inferior: IxcSimNao;
  cli_desconta_iss_retido_total: IxcSimNao;
  regime_fiscal_col: string;
  codigo_operacao: string;

  // ── CRM / Prospecção ──
  crm: IxcSimNao;
  status_prospeccao: IxcStatusProspeccao;
  id_candato_tipo: string;
  id_concorrente: string;
  id_campanha: string;
  grau_satisfacao: string;
  indicado_por: string;
  /** YYYY-MM-DD */
  crm_data_novo: string;
  /** YYYY-MM-DD */
  crm_data_sondagem: string;
  /** YYYY-MM-DD */
  crm_data_apresentando: string;
  /** YYYY-MM-DD */
  crm_data_negociando: string;
  /** YYYY-MM-DD */
  crm_data_vencemos: string;
  /** YYYY-MM-DD */
  crm_data_perdemos: string;
  /** YYYY-MM-DD */
  crm_data_abortamos: string;
  /** YYYY-MM-DD */
  crm_data_sem_viabilidade: string;
  /** YYYY-MM-DD */
  crm_data_sem_porta_disponivel: string;

  // ── Régua de cobrança ──
  regua_cobranca_wpp: IxcSimNao;
  regua_cobranca_notificacao: IxcSimNao;
  regua_cobranca_considera: IxcSimNaoPadrao;

  // ── Hotsite / Portal ──
  hotsite_acesso: string;
  senha: string;
  acesso_automatico_central: string;
  alterar_senha_primeiro_acesso: string;
  senha_hotsite_md5: IxcSimNao;

  // ── Dados familiares ──
  nome_pai: string;
  nome_mae: string;
  cpf_pai: string;
  cpf_mae: string;
  identidade_pai: string;
  identidade_mae: string;
  /** YYYY-MM-DD */
  nascimento_pai: string;
  /** YYYY-MM-DD */
  nascimento_mae: string;
  nome_conjuge: string;
  fone_conjuge: string;
  cpf_conjuge: string;
  rg_conjuge: string;
  /** YYYY-MM-DD */
  data_nascimento_conjuge: string;
  quantidade_dependentes: string;

  // ── Representantes ──
  nome_representante_1: string;
  nome_representante_2: string;
  cpf_representante_1: string;
  cpf_representante_2: string;
  identidade_representante_1: string;
  identidade_representante_2: string;

  // ── Referências comerciais / pessoais ──
  ref_com_empresa1: string;
  ref_com_empresa2: string;
  ref_com_fone1: string;
  ref_com_fone2: string;
  ref_pes_nome1: string;
  ref_pes_nome2: string;
  ref_pes_fone1: string;
  ref_pes_fone2: string;

  // ── Emprego ──
  emp_empresa: string;
  emp_cnpj: string;
  emp_cep: string;
  emp_endereco: string;
  emp_cidade: string;
  emp_fone: string;
  emp_cargo: string;
  /** String decimal, ex: "0.00" */
  emp_remuneracao: string;
  /** YYYY-MM-DD */
  emp_data_admissao: string;

  // ── Diversos ──
  responsavel: string;
  obs: string;
  alerta: string;
  tipo_ente_governamental: string;
  orgao_publico: IxcSimNao;
  moradia: IxcMoradia;
  id_perfil: string;
  id_operadora_celular: string;
  idx: string;
  ativo_serasa: string;
  pipe_id_organizacao: string;
  convert_cliente_forn: IxcSimNao;
  cadastrado_via_viabilidade: string;
  cidade_naturalidade: string;
  nome_contador: string;
  telefone_contador: string;
  foto_cartao: string;
  /** YYYY-MM-DD HH:mm:ss */
  ultima_atualizacao: string;
  atualizar_cadastro_galaxPay: IxcSimNao;
  /** String decimal, ex: "0.0000" */
  percentual_reducao: string;
}

// ═══ Tipos enumerados — /cliente_contrato ═══

/** I = Internet, T = Telefonia, S = Serviços, SVA = SVA */
export type IxcTipoContrato = "I" | "T" | "S" | "SVA";

/** P = Pré-contrato, A = Ativo, I = Inativo, N = Negativado, D = Desistiu */
export type IxcStatusContrato = "P" | "A" | "I" | "N" | "D";

/** A = Ativo, D = Desativado, CM = Bloqueio Manual, CA = Bloqueio Automático, FA = Financeiro em atraso, AA = Aguardando Assinatura */
export type IxcStatusInternet = "A" | "D" | "CM" | "CA" | "FA" | "AA";

/** N = Normal, R = Reduzida */
export type IxcStatusVelocidade = "N" | "R";

/** P = Configuração padrão (Parâmetros), N = Competência (Previsão não), S = Caixa (Previsão sim), M = Manual */
export type IxcCcPrevisao = "P" | "N" | "S" | "M";

/** S = Habilitado, N = Desabilitado, P = Padrão */
export type IxcDesbloqueioConfianca = "S" | "N" | "P";

/** H = Habilitado, D = Desabilitado, P = Padrão */
export type IxcLiberacaoSuspensaoParcial = "H" | "D" | "P";

/** P = Configuração padrão, I = Impresso, E = E-mail */
export type IxcTipoCobranca = "P" | "I" | "E";

/** I = Instalação, U = Upgrade, D = Downgrade, M = Mudança de Endereço, T = Mudança de Tecnologia, L = Mudança de titularidade, N = Negociação, R = Reativação */
export type IxcMotivoInclusao = "I" | "U" | "D" | "M" | "T" | "L" | "N" | "R";

/** M = Manual, A = Automático */
export type IxcOrigemCancelamento = "M" | "A";

/** R = Regular (inferido do JSON) — documentação pendente para demais valores */
export type IxcSituacaoFinanceiraContrato = "R" | string;

// ── Interface principal — /cliente_contrato ──

/** Registro bruto do endpoint /cliente_contrato do IXC Soft */
export interface IxcClienteContrato {
  // ── Identificação ──
  id: string;
  /** FK → /cliente.id */
  id_cliente: string;
  /** FK → filial */
  id_filial: string;
  /** P = Pré-contrato, A = Ativo, I = Inativo, N = Negativado, D = Desistiu */
  status: IxcStatusContrato;
  /** A = Ativo, D = Desativado, CM = Bloqueio Manual, CA = Bloqueio Automático, FA = Financeiro em atraso, AA = Aguardando Assinatura */
  status_internet: IxcStatusInternet;
  /** I = Internet, T = Telefonia, S = Serviços, SVA = SVA */
  tipo: IxcTipoContrato;

  // ── Plano / Contrato ──
  /** FK → /vd_contrato.id */
  id_vd_contrato: string;
  /** Nome legível do plano, ex: "Plano Plus 500/100" */
  contrato: string;
  descricao_aux_plano_venda: string;
  /** Tipo de produtos do plano — documentação pendente para valores */
  tipo_produtos_plano: string;
  /** FK → tipo de contrato */
  id_tipo_contrato: string;
  /** FK → modelo de contrato */
  id_modelo: string;

  // ── Datas do contrato ──
  /** YYYY-MM-DD — data de cadastro no sistema */
  data_cadastro_sistema: string;
  /** YYYY-MM-DD */
  data: string;
  /** YYYY-MM-DD */
  data_assinatura: string;
  /** YYYY-MM-DD */
  data_ativacao: string;
  /** YYYY-MM-DD */
  data_renovacao: string;
  /** YYYY-MM-DD */
  data_expiracao: string;
  /** YYYY-MM-DD */
  pago_ate_data: string;
  /** YYYY-MM-DD HH:mm:ss */
  ultima_atualizacao: string;

  // ── Endereço do contrato ──
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  /** FK → /cidade.id ("0" = não definido) */
  cidade: string;
  cep: string;
  referencia: string;
  /** FK → condomínio */
  id_condominio: string;
  bloco: string;
  apartamento: string;
  latitude: string;
  longitude: string;
  /** R = Zona rural, U = Zona urbana */
  tipo_localidade: IxcTipoLocalidade;
  /** S = usar endereço do cliente, N = usar endereço do contrato */
  endereco_padrao_cliente: IxcSimNao;

  // ── Financeiro ──
  /** R = Regular — documentação pendente para demais valores */
  situacao_financeira_contrato: IxcSituacaoFinanceiraContrato;
  /** P = Configuração padrão, I = Impresso, E = E-mail */
  tipo_cobranca: IxcTipoCobranca;
  /** FK → carteira de cobrança */
  id_carteira_cobranca: string;
  /** P = Configuração padrão, N = Competência, S = Caixa, M = Manual */
  cc_previsao: IxcCcPrevisao;
  /** String decimal, ex: "300.00" */
  taxa_instalacao: string;
  /** String decimal, ex: "0.00" */
  comissao: string;
  /** String decimal, ex: "0.00" */
  desconto_fidelidade: string;
  /** String decimal, ex: "0.000" */
  taxa_improdutiva: string;
  /** Meses de fidelidade, ex: "12" */
  fidelidade: string;
  /** FK → condição de pagamento da ativação */
  id_cond_pag_ativ: string;
  /** FK → tipo de documento */
  id_tipo_documento: string;
  tipo_doc_opc: string;
  tipo_doc_opc2: string;
  tipo_doc_opc3: string;
  tipo_doc_opc4: string;
  /** FK → tipo de documento da ativação */
  id_tipo_doc_ativ: string;
  /** FK → produto de ativação */
  id_produto_ativ: string;
  /** Número de parcelas de ativação */
  ativacao_numero_parcelas: string;
  /** Vencimentos das parcelas, ex: "10/12/2019 | 10/01/2020 | " */
  ativacao_vencimentos: string;
  /** String decimal, ex: "100.00" */
  ativacao_valor_parcela: string;
  isentar_contrato: IxcSimNao;
  /** Número de parcelas em atraso */
  num_parcelas_atraso: string;
  /** P = Padrão para agrupar financeiro */
  agrupar_financeiro_contrato: string;
  /** FK → indexador de reajuste */
  id_indexador_reajuste: string;

  // ── Bloqueio / Desbloqueio ──
  bloqueio_automatico: IxcSimNao;
  aviso_atraso: IxcSimNao;
  /** N = Normal, R = Reduzida */
  status_velocidade: IxcStatusVelocidade;
  /** S = Habilitado, N = Desabilitado, P = Padrão */
  desbloqueio_confianca: IxcDesbloqueioConfianca;
  desbloqueio_confianca_ativo: IxcSimNao;
  /** P = Padrão — liberação de bloqueio manual */
  liberacao_bloqueio_manual: string;
  /** H = Habilitado, D = Desabilitado, P = Padrão */
  liberacao_suspensao_parcial: IxcLiberacaoSuspensaoParcial;
  utilizando_auto_libera_susp_parc: IxcSimNao;
  restricao_auto_desbloqueio: IxcSimNao;
  motivo_restricao_auto_desbloq: string;
  restricao_auto_libera_susp_parcial: IxcSimNao;
  motivo_restri_auto_libera_parc: string;
  /** P = Padrão — aplicar desconto por tempo de bloqueio */
  aplicar_desconto_tempo_bloqueio: string;
  /** YYYY-MM-DD */
  nao_avisar_ate: string;
  /** YYYY-MM-DD */
  nao_bloquear_ate: string;
  /** YYYY-MM-DD */
  nao_susp_parc_ate: string;
  /** YYYY-MM-DD */
  dt_ult_bloq_auto: string;
  /** YYYY-MM-DD */
  dt_ult_bloq_manual: string;
  /** YYYY-MM-DD */
  dt_ult_desbloq_auto: string;
  /** YYYY-MM-DD */
  dt_ult_desbloq_manual: string;
  /** YYYY-MM-DD */
  dt_ult_des_bloq_conf: string;
  /** YYYY-MM-DD */
  dt_ult_ativacao: string;
  /** YYYY-MM-DD */
  dt_ult_finan_atraso: string;
  /** YYYY-MM-DD */
  dt_ult_liberacao_susp_parc: string;

  // ── Suspensão ──
  contrato_suspenso: IxcSimNao;
  /** YYYY-MM-DD */
  data_inicial_suspensao: string;
  /** YYYY-MM-DD */
  data_final_suspensao: string;
  /** YYYY-MM-DD */
  data_retomada_contrato: string;
  tempo_permanencia: string;

  // ── Cancelamento / Desistência / Negativação ──
  /** FK → motivo de cancelamento */
  motivo_cancelamento: string;
  /** YYYY-MM-DD */
  data_cancelamento: string;
  obs_cancelamento: string;
  /** M = Manual, A = Automático */
  origem_cancelamento: IxcOrigemCancelamento | "";
  /** FK → responsável pelo cancelamento */
  id_responsavel_cancelamento: string;
  /** YYYY-MM-DD */
  data_desistencia: string;
  /** FK → motivo de desistência */
  motivo_desistencia: string;
  obs_desistencia: string;
  /** FK → responsável pela desistência */
  id_responsavel_desistencia: string;
  /** YYYY-MM-DD */
  dt_ult_desiste: string;
  /** YYYY-MM-DD */
  data_negativacao: string;
  protocolo_negativacao: string;
  /** FK → motivo de negativação */
  id_motivo_negativacao: string;
  obs_negativacao: string;
  /** FK → responsável pela negativação */
  id_responsavel_negativacao: string;
  /** YYYY-MM-DD */
  dt_utl_negativacao: string;
  /** YYYY-MM-DD — data de desativação do acesso */
  data_acesso_desativado: string;

  // ── Vendedor / Responsável ──
  /** FK → vendedor */
  id_vendedor: string;
  /** FK → vendedor da ativação */
  id_vendedor_ativ: string;
  /** FK → instalador */
  id_instalador: string;
  /** FK → responsável */
  id_responsavel: string;

  // ── Motivo de inclusão ──
  /** FK → motivo de inclusão */
  id_motivo_inclusao: string;
  /** I = Instalação, U = Upgrade, D = Downgrade, M = Mudança de Endereço, T = Mudança de Tecnologia, L = Mudança de titularidade, N = Negociação, R = Reativação */
  motivo_inclusao: IxcMotivoInclusao;

  // ── Renovação ──
  renovacao_automatica: IxcSimNao;

  // ── Assinatura digital ──
  /** S = Sim, N = Não, P = Padrão */
  assinatura_digital: IxcSimNaoPadrao;
  /** P = Padrão — integração de assinatura digital */
  integracao_assinatura_digital: string;
  url_assinatura_digital: string;
  token_assinatura_digital: string;
  /** FK → testemunha da assinatura digital */
  testemunha_assinatura_digital: string;
  /** P = Padrão — gerar financeiro na assinatura digital do contrato */
  gerar_finan_assin_digital_contrato: string;
  /** P = Padrão — foto do documento */
  document_photo: string;
  /** P = Padrão — selfie */
  selfie_photo: string;

  // ── Cartão recorrente ──
  credit_card_recorrente_token: string;
  credit_card_recorrente_bandeira_cartao: string;
  status_recorrencia: string;

  // ── Contrato principal / indicação ──
  /** FK → contrato principal (0 = nenhum) */
  id_contrato_principal: string;
  /** FK → contrato de indicação */
  indicacao_contrato_id: string;
  ids_contratos_recorrencia: string;

  // ── Avalistas ──
  /** FK → avalista 1 */
  avalista_1: string;
  /** FK → avalista 2 */
  avalista_2: string;

  // ── NF / Fiscal ──
  nf_info_adicionais: string;
  /** P = Padrão — base para geração de tipo de documento */
  base_geracao_tipo_doc: string;

  // ── Observações / Alertas ──
  obs: string;
  obs_contrato: string;
  alerta_contrato: string;

  // ── Importação (campos imp_*) ──
  imp_carteira: string;
  imp_importacao: string;
  imp_rede: string;
  imp_bkp: string;
  imp_treinamento: string;
  imp_status: string;
  imp_obs: string;
  imp_realizado: string;
  imp_motivo: string;
  /** YYYY-MM-DD */
  imp_inicial: string;
  /** YYYY-MM-DD */
  imp_final: string;

  // ── Diversos ──
  /** Estrato social (Colômbia) */
  estrato_social_col: string;
}

// ═══════════════════════════════════════════════════════════════
// Endpoint: /fn_areceber — Contas a Receber (Faturas)
// ═══════════════════════════════════════════════════════════════

/** A = A receber, R = Recebido, P = Parcial, C = Cancelado */
export type IxcStatusFatura = "A" | "R" | "P" | "C";

/** M = Recebido de forma manual, R = Recebido automaticamente */
export type IxcFormaRecebimento = "M" | "R";

/**
 * Tipo de recebimento — valores por extenso usados pela API IXC.
 * Boleto, Cheque, Cartão, Dinheiro, Depósito, Gateway, Débito, Fatura,
 * ArrecadacaoRecebimento, Transferencia, Pix
 */
export type IxcTipoRecebimento =
  | "Boleto"
  | "Cheque"
  | "Cartão"
  | "Dinheiro"
  | "Depósito"
  | "Gateway"
  | "Débito"
  | "Fatura"
  | "ArrecadacaoRecebimento"
  | "Transferencia"
  | "Pix";

/**
 * Registro bruto do endpoint `/fn_areceber` do IXC Soft.
 * Representa uma fatura / título a receber.
 * Todos os campos string — a API IXC retorna tudo como texto.
 */
export interface IxcFnAreceber {
  id: string;

  // ── Identificação e status ──
  /** FK → /cliente.id */
  id_cliente: string;
  /** FK → /cliente_contrato.id */
  id_contrato: string;
  /** A = A receber, R = Recebido, P = Parcial, C = Cancelado */
  status: IxcStatusFatura;
  /** Status da cobrança (documentação pendente) */
  status_cobranca: string;
  filial_id: string;

  // ── Datas ──
  /** YYYY-MM-DD */
  data_emissao: string;
  /** YYYY-MM-DD */
  data_vencimento: string;
  /** YYYY-MM-DD */
  data_inicial: string;
  /** YYYY-MM-DD */
  data_final: string;
  /** YYYY-MM-DD ou vazio */
  data_cancelamento: string;
  /** YYYY-MM-DD HH:MM:SS */
  baixa_data: string;
  /** YYYY-MM-DD */
  pagamento_data: string;
  /** YYYY-MM-DD */
  credito_data: string;
  /** YYYY-MM-DD HH:MM:SS */
  ultima_atualizacao: string;

  // ── Valores ──
  /** Valor nominal da fatura (string numérica) */
  valor: string;
  /** Valor já recebido */
  valor_recebido: string;
  /** Valor em aberto */
  valor_aberto: string;
  /** Valor pago na baixa */
  pagamento_valor: string;
  /** Valor cancelado */
  valor_cancelado: string;

  // ── Pagamento ──
  /** Boleto, Cheque, Cartão, Dinheiro, etc. */
  tipo_recebimento: IxcTipoRecebimento;
  /** M = Manual, R = Automático */
  forma_recebimento: IxcFormaRecebimento;
  /** P = Padrão, I = Impresso, E = E-mail */
  tipo_cobranca: IxcTipoCobranca;
  /** Tipo de pagamento com cartão (vazio se não aplicável) */
  tipo_pagamento_cartao: string;
  /** Bandeira do pagamento (vazio se não aplicável) */
  bandeira_pagamento: string;

  // ── Boleto ──
  /** Linha digitável do boleto */
  linha_digitavel: string;
  /** Nosso número do boleto */
  nn_boleto: string;
  /** Campo boleto */
  boleto: string;
  /** Link do gateway de pagamento */
  gateway_link: string;
  /** Duplicata */
  duplicata: string;

  // ── PIX ──
  pix_txid: string;
  pix_txid_recorrente: string;
  pix_status_recorrente: string;
  /** S/N — recebido via PIX */
  recebido_via_pix: IxcSimNao;

  // ── Flags S/N ──
  /** S/N — título estornado */
  estornado: IxcSimNao;
  /** S/N — título liberado */
  liberado: IxcSimNao;
  /** S/N — boleto impresso */
  impresso: IxcSimNao;
  /** S/N — parcela proporcional */
  parcela_proporcional: IxcSimNao;
  /** S/N — título protestado */
  titulo_protestado: IxcSimNao;
  /** S/N — título importado */
  titulo_importado: IxcSimNao;
  /** S/N — título renegociado */
  titulo_renegociado: IxcSimNao;
  /** S/N — aguardando confirmação de pagamento */
  aguardando_confirmacao_pagamento: IxcSimNao;
  /** S/N — parcelado no cartão */
  parcelado_cartao: IxcSimNao;
  /** S/N — previsão */
  previsao: IxcSimNao;
  /** S/N — libera período */
  libera_periodo: IxcSimNao;
  /** S/N — arquivo remessa baixado */
  arquivo_remessa_baixado: IxcSimNao;

  // ── Referências / FKs ──
  id_remessa: string;
  id_carteira_cobranca: string;
  id_cobranca: string;
  id_conta: string;
  id_saida: string;
  id_mot_cancelamento: string;
  id_renegociacao: string;
  id_renegociacao_novo: string;
  id_contrato_principal: string;
  id_contrato_avulso: string;
  id_nota_gerada: string;
  id_nota_gerada_opc2: string;
  id_nota_gerada_opc3: string;
  id_nota_gerada_opc4: string;
  id_im_imovel: string;
  id_sip: string;
  id_lote_geracao_financeiro_fatura: string;

  // ── Parcelas e recorrência ──
  /** Número da parcela */
  nparcela: string;
  /** Número da parcela recorrente */
  numero_parcela_recorrente: string;
  /** Documento (número) */
  documento: string;

  // ── Renegociação ──
  tipo_renegociacao: string;

  // ── Operador ──
  /** ID do operador que cancelou */
  cancelamento_id_operador: string;
  /** ID do operador que deu baixa */
  baixa_id_operador: string;

  // ── Diversos ──
  obs: string;
  /** Conta de recebimento */
  conta_recebimento: string;
  /** Origem de importação */
  origem_importacao: string;
  /** Token GerenciaNet */
  gerencianet_token: string;
  /** Desconto condicional (valor) */
  desconto_condicional_valor: string;
  /** Validade do desconto condicional */
  validade_desconto_condicional: string;
  /** Motivo da alteração */
  motivo_alteracao: string;
  /** ID remessa alteração */
  id_remessa_alteracao: string;
  /** Token recorrente do cartão de crédito */
  credit_card_recorrente_token: string;
  /** Bandeira do cartão recorrente */
  credit_card_recorrente_bandeira_cartao: string;
}

// ═══════════════════════════════════════════════════════════════
// Endpoint: /radusuarios — Usuários RADIUS (conexões PPPoE/Hotspot)
// ═══════════════════════════════════════════════════════════════

/** S = Sim, N = Não, SS = Sem status */
export type IxcOnlineStatus = "S" | "N" | "SS";

/** H = Configuração padrão, S = Sempre, N = Nunca */
export type IxcConfigPadrao = "H" | "S" | "N";

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

/** Registro de usuário RADIUS — mapeamento 1:1 do endpoint `/radusuarios` */
export interface IxcRadusuarios {
  /** ID único do registro RADIUS */
  id: string;
  /** FK → /cliente.id */
  id_cliente: string;
  /** FK → /cliente_contrato.id */
  id_contrato: string;
  /** Login PPPoE/Hotspot */
  login: string;
  /** Senha de autenticação */
  senha: string;
  /** Registro ativo */
  ativo: IxcSimNao;
  /** Status de conexão: S = Online, N = Offline, SS = Sem status */
  online: IxcOnlineStatus;
  /** Observações */
  obs: string;

  // ── Rede / IP ──

  /** Endereço IP atribuído */
  ip: string;
  /** IP de aviso (página de bloqueio) */
  ip_aviso: string;
  /** IP auxiliar */
  ip_aux: string;
  /** Porta auxiliar */
  porta_aux: string;
  /** Porta HTTP */
  porta_http: string;
  /** Porta router 2 */
  porta_router2: string;
  /** Endereço MAC */
  mac: string;
  /** MAC da ONU */
  onu_mac: string;
  /** MTU da conexão */
  mtu: string;
  /** VLAN */
  vlan: string;
  /** IP da rede VLAN */
  vlan_ip_rede: string;
  /** Gateway VLAN */
  gw_vlan: string;
  /** Service tag VLAN */
  service_tag_vlan: IxcSimNao;

  // ── Configuração de preenchimento automático ──

  /** Auto preencher IP */
  auto_preencher_ip: IxcConfigPadrao;
  /** Auto preencher MAC */
  auto_preencher_mac: IxcConfigPadrao;
  /** Fixar IP */
  fixar_ip: IxcConfigPadrao;
  /** Relacionar IP ao login */
  relacionar_ip_ao_login: IxcConfigPadrao;
  /** Relacionar MAC ao login */
  relacionar_mac_ao_login: IxcConfigPadrao;
  /** Relacionar concentrador ao login */
  relacionar_concentrador_ao_login: IxcConfigPadrao;

  // ── IPv6 ──

  /** Auto preencher IPv6 */
  auto_preencher_ipv6: IxcConfigPadrao;
  /** Fixar IPv6 */
  fixar_ipv6: IxcConfigPadrao;
  /** Relacionar IPv6 ao login */
  relacionar_ipv6_ao_login: IxcConfigPadrao;
  /** Prefix Delegation IPv6 */
  pd_ipv6: string;
  /** Framed: fixar IPv6 */
  framed_fixar_ipv6: IxcConfigPadrao;
  /** Framed: auto preencher IPv6 */
  framed_autopreencher_ipv6: IxcConfigPadrao;
  /** Framed: relacionar IPv6 ao login */
  framed_relacionar_ipv6_ao_login: IxcConfigPadrao;
  /** Framed: Prefix Delegation IPv6 */
  framed_pd_ipv6: string;

  // ── Autenticação ──

  /** Tipo de autenticação: L = PPPoE, H = Hotspot, M = IP x MAC, etc. */
  autenticacao: IxcAutenticacao;
  /** Autenticação por MAC: N, S, P = Padrão, MK = Mikrotik, UN = UBNT, WP = WPA2-AES */
  autenticacao_por_mac: IxcAutenticacaoPorMac;
  /** Autenticação MAC habilitada */
  autenticacao_mac: IxcSimNao;
  /** Autenticação WPS habilitada */
  autenticacao_wps: IxcSimNao;
  /** Autenticação WPA */
  autenticacao_wpa: string;
  /** Senha MD5 */
  senha_md5: IxcSimNao;
  /** Login simultâneo permitido */
  login_simultaneo: string;
  /** Usuário WPA2-AES */
  usuario_wpa2aes: string;
  /** Senha WPA2-AES */
  senha_wpa2aes: string;

  // ── Conexão / Concentrador ──

  /** Tipo de conexão no mapa: F = Fibra, L = Cabo, etc. */
  tipo_conexao_mapa: IxcTipoConexaoMapa;
  /** Tipo de conexão (texto): Ethernet, WiFi, etc. */
  tipo_conexao: string;
  /** Nome/perfil da conexão */
  conexao: string;
  /** FK → concentrador */
  id_concentrador: string;
  /** IP do concentrador */
  concentrador: string;
  /** Interface de conexão */
  interface: string;
  /** Interface de transmissão */
  interface_transmissao: string;
  /** Agent Circuit ID */
  agent_circuit_id: string;
  /** Acct Session ID */
  acct_session_id: string;

  // ── Plano / Vínculo ──

  /** Tipo de vínculo com plano: D = Padrão, C = Contrato, P = Pré-pago, G = Grátis */
  tipo_vinculo_plano: IxcTipoVinculoPlano;
  /** FK → grupo */
  id_grupo: string;
  /** Pool RADIUS */
  pool_radius: string;
  /** FK → grupo de pools RADIUS */
  id_radgrupos_pools: string;
  /** FK → DNS RADIUS */
  id_rad_dns: string;

  // ── Equipamento / Infraestrutura ──

  /** Tipo de equipamento: C = Comodato, P = Próprio */
  tipo_equipamento: IxcTipoEquipamento;
  /** FK → transmissor */
  id_transmissor: string;
  /** FK → porta do transmissor */
  id_porta_transmissor: string;
  /** Modelo do transmissor */
  modelo_tranmissor: string;
  /** FK → caixa FTTH */
  id_caixa_ftth: string;
  /** Porta FTTH */
  ftth_porta: string;
  /** FK → hardware */
  id_hardware: string;
  /** ONU compartilhada */
  onu_compartilhada: IxcSimNao;
  /** Tronco */
  tronco: string;
  /** Splitter */
  splitter: string;
  /** Ponta */
  ponta: string;

  // ── Endereço ──

  /** Endereço da conexão */
  endereco: string;
  /** Número */
  numero: string;
  /** Complemento */
  complemento: string;
  /** Bairro */
  bairro: string;
  /** FK → cidade */
  cidade: string;
  /** CEP */
  cep: string;
  /** Referência */
  referencia: string;
  /** Bloco */
  bloco: string;
  /** Apartamento */
  apartamento: string;
  /** Usar endereço padrão do cliente */
  endereco_padrao_cliente: IxcSimNao;
  /** Latitude */
  latitude: string;
  /** Longitude */
  longitude: string;

  // ── Condomínio / Prédio ──

  /** FK → condomínio */
  id_condominio: string;
  /** FK → prédio */
  id_predio: string;

  // ── Franquia ──

  /** Franquia máxima (bytes) */
  franquia_maximo: string;
  /** Franquia consumida (download) */
  franquia_consumo: string;
  /** Franquia consumida (upload) */
  franquia_consumo_up: string;
  /** Franquia atingida */
  franquia_atingida: IxcSimNao;

  // ── Tráfego / Sessão ──

  /** Upload atual (bytes) */
  upload_atual: string;
  /** Download atual (bytes) */
  download_atual: string;
  /** Tempo conectado (segundos) */
  tempo_conectado: string;
  /** Tempo de conexão configurado */
  tempo_conexao: string;
  /** Contagem de desconexões */
  count_desconexao: string;
  /** Motivo da última desconexão */
  motivo_desconexao: string;
  /** Data/hora da última conexão inicial */
  ultima_conexao_inicial: string;
  /** Data/hora da última conexão final */
  ultima_conexao_final: string;
  /** Data/hora da última atualização */
  ultima_atualizacao: string;

  // ── WiFi / Router ──

  /** SSID do roteador WiFi */
  ssid_router_wifi: string;
  /** SSID do roteador WiFi 5GHz */
  ssid_router_wifi_5ghz: string;
  /** Senha da rede sem fio */
  senha_rede_sem_fio: string;
  /** Senha da rede sem fio 5GHz */
  senha_rede_sem_fio_5ghz: string;
  /** Usuário router 1 */
  usuario_router1: string;
  /** Senha router 1 */
  senha_router1: string;
  /** Senha router 2 */
  senha_router2: string;
  /** Cliente tem a senha do equipamento */
  cliente_tem_a_senha: IxcSimNao;

  // ── Acesso / Tipo ──

  /** Tipo de acesso: http ou https */
  tipo_acesso: IxcTipoAcesso;

  // ── Sinal / Atendimento ──

  /** Sinal registrado no último atendimento */
  sinal_ultimo_atendimento: string;
  /** Metragem interna */
  metragem_interna: string;
  /** Metragem externa */
  metragem_externa: string;

  // ── Diversos ──

  /** FK → projeto (design de rede) */
  id_df_projeto: string;
  /** FK → filial */
  id_filial: string;
  /** FK → reserva de rede neutra */
  id_reserva_rede_neutra: string;
  /** Pacote LTE */
  pacote_lte: string;
  /** LTE ID */
  lte_id: string;
  /** FK → integração externa */
  id_integracao: string;
}

// ═══════════════════════════════════════════════════════════════
//  Enum — Tipo de Operação (Bridge / Router)
// ═══════════════════════════════════════════════════════════════

/** B = Bridge, R = Router (PPPoE) */
export type IxcTipoOperacao = "B" | "R";

// ═══════════════════════════════════════════════════════════════
//  Interface — /radpop_radio_cliente_fibra
//  Dados de ONUs/ONTs de clientes em rede FTTH.
// ═══════════════════════════════════════════════════════════════

export interface IxcRadpopRadioClienteFibra {
  /** ID único do registro */
  id: string;
  /** Nome/identificador da ONU */
  nome: string;

  // ── FKs ──

  /** FK → /radusuarios.id */
  id_login: string;
  /** FK → /cliente_contrato.id */
  id_contrato: string;
  /** FK → transmissor/OLT */
  id_transmissor: string;
  /** FK → caixa FTTH */
  id_caixa_ftth: string;
  /** FK → porta do transmissor */
  id_radpop_radio_porta: string;
  /** FK → condomínio */
  id_condominio: string;
  /** FK → hardware */
  id_hardware: string;
  /** FK → perfil */
  id_perfil: string;
  /** FK → projeto */
  id_projeto: string;
  /** FK → ramal */
  id_ramal: string;
  /** FK → ONU UNMS */
  id_onu_unms: string;
  /** FK → activity */
  id_activity: string;

  // ── ONU / PON ──

  /** Número da ONU na PON */
  onu_numero: string;
  /** Service port */
  service_port: string;
  /** Modelo/tipo da ONU */
  onu_tipo: string;
  /** Identificador PON (ex: "1/1/1") */
  ponid: string;
  /** Endereço MAC da ONU */
  mac: string;
  /** Slot number */
  slotno: string;
  /** PON number */
  ponno: string;
  /** Tipo de autenticação (ex: "MAC") */
  tipo_autenticacao: string;
  /** Versão do firmware */
  versao: string;
  /** B = Bridge, R = Router (PPPoE) */
  tipo_operacao: IxcTipoOperacao | "";
  /** Comandos de provisionamento */
  comandos: string;
  /** GEMPORT */
  gemport: string;
  /** Sensor ID */
  senorid: string;
  /** Causa da última queda */
  causa_ultima_queda: string;
  /** S = ONU em rede neutra */
  onu_rede_neutra: IxcSimNao;
  /** S = Estrutura radpop */
  radpop_estrutura: IxcSimNao;
  /** S = ONU compartilhada */
  /** (campo não presente no JSON, mas comum na API) */

  // ── Telemetria (strings decimais da API) ──

  /** Sinal RX em dBm (ex: "-22.50") */
  sinal_rx: string;
  /** Sinal TX em dBm */
  sinal_tx: string;
  /** Temperatura em °C */
  temperatura: string;
  /** Voltagem em V */
  voltagem: string;
  /** Data/hora da última leitura de sinal */
  data_sinal: string;

  // ── Acesso / Gerência ──

  /** Login da ONU no cliente */
  login_onu_cliente: string;
  /** Senha da ONU no cliente */
  senha_onu_cliente: string;
  /** Porta Telnet da ONU */
  porta_telnet_onu_cliente: string;
  /** Porta Web da ONU */
  porta_web_onu_cliente: string;
  /** IP de gerência */
  ip_gerencia: string;
  /** Perfil da ONU no cliente */
  perfil_onu_cliente: string;
  /** Script de provisionamento */
  script_onu_cliente: string;

  // ── VLANs ──

  /** VLAN principal */
  vlan: string;
  /** VLAN DHCP */
  vlan_dhcp: string;
  /** VLAN TR-069 */
  vlan_tr69: string;
  /** VLAN IPTV */
  vlan_iptv: string;
  /** VLAN VoIP */
  vlan_voip: string;
  /** VLAN PPPoE */
  vlan_pppoe: string;
  /** VLAN outros */
  vlan_outros: string;

  // ── Endereço (quando endereco_padrao_cliente = "N") ──

  /** S = usa endereço do cadastro do cliente */
  endereco_padrao_cliente: IxcSimNao;
  /** CEP */
  cep: string;
  /** Logradouro */
  endereco: string;
  /** Número */
  numero: string;
  /** Bairro */
  bairro: string;
  /** Cidade */
  cidade: string;
  /** Complemento */
  complemento: string;
  /** Referência */
  referencia: string;

  // ── Condomínio ──

  /** Bloco */
  bloco: string;
  /** Apartamento */
  apartamento: string;

  // ── Geolocalização ──

  /** Latitude */
  latitude: string;
  /** Longitude */
  longitude: string;
  /** Distância da ONU (metros) */
  distancia_onu: string;

  // ── FTTH ──

  /** Porta FTTH na caixa */
  porta_ftth: string;
}
