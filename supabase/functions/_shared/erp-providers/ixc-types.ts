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
