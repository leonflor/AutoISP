-- =============================================
-- SEEDS DE DADOS INICIAIS
-- =============================================

-- 1. Planos padrão da plataforma
INSERT INTO public.plans (name, slug, description, price_monthly, price_yearly, features, limits, is_active, is_featured, trial_days, sort_order)
VALUES
  (
    'Starter',
    'starter',
    'Ideal para provedores iniciantes',
    99.00,
    990.00,
    '["Até 100 assinantes", "2 usuários", "Agente Atendente IA", "Suporte por email", "Relatórios básicos"]'::jsonb,
    '{"max_subscribers": 100, "max_users": 2, "ai_tokens_monthly": 10000, "ai_agents": ["atendente"]}'::jsonb,
    true,
    false,
    14,
    1
  ),
  (
    'Pro',
    'pro',
    'Para provedores em crescimento',
    199.00,
    1990.00,
    '["Até 500 assinantes", "5 usuários", "Todos os Agentes IA", "Suporte prioritário", "Relatórios avançados", "Integrações ERP"]'::jsonb,
    '{"max_subscribers": 500, "max_users": 5, "ai_tokens_monthly": 50000, "ai_agents": ["atendente", "cobrador", "vendedor"]}'::jsonb,
    true,
    true,
    14,
    2
  ),
  (
    'Enterprise',
    'enterprise',
    'Solução completa para grandes provedores',
    499.00,
    4990.00,
    '["Assinantes ilimitados", "Usuários ilimitados", "Todos os Agentes IA", "Suporte 24/7", "Relatórios personalizados", "API dedicada", "SLA garantido"]'::jsonb,
    '{"max_subscribers": -1, "max_users": -1, "ai_tokens_monthly": 200000, "ai_agents": ["atendente", "cobrador", "vendedor", "analista", "suporte"]}'::jsonb,
    true,
    false,
    14,
    3
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  trial_days = EXCLUDED.trial_days,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 2. Agentes IA padrão (templates globais)
INSERT INTO public.ai_agents (name, slug, type, description, system_prompt, model, temperature, max_tokens, features, is_active, is_premium)
VALUES
  (
    'Atendente Virtual',
    'atendente-virtual',
    'atendente',
    'Agente especializado em atendimento ao cliente, resolução de dúvidas e suporte técnico básico.',
    'Você é um atendente virtual profissional de um provedor de internet. Seu objetivo é ajudar os clientes com dúvidas sobre planos, serviços, faturas e problemas técnicos básicos. Seja sempre cordial, empático e objetivo. Se não souber responder, oriente o cliente a entrar em contato com o suporte técnico. Nunca invente informações sobre valores ou serviços específicos.',
    'gpt-4o-mini',
    0.7,
    1000,
    '["Resposta a dúvidas gerais", "Informações sobre planos", "Orientação sobre faturas", "Troubleshooting básico", "Encaminhamento para suporte"]'::jsonb,
    true,
    false
  ),
  (
    'Cobrador Inteligente',
    'cobrador-inteligente',
    'cobrador',
    'Agente especializado em cobrança amigável, negociação de débitos e acordos de pagamento.',
    'Você é um assistente de cobrança profissional e empático. Seu objetivo é lembrar os clientes sobre pagamentos pendentes de forma cordial, oferecer opções de negociação e facilitar acordos de pagamento. Seja sempre respeitoso, entenda a situação do cliente e busque soluções que funcionem para ambas as partes. Nunca seja agressivo ou ameaçador.',
    'gpt-4o-mini',
    0.6,
    800,
    '["Lembrete de vencimento", "Negociação de débitos", "Opções de parcelamento", "Segunda via de boleto", "Registro de promessas de pagamento"]'::jsonb,
    true,
    false
  ),
  (
    'Vendedor Digital',
    'vendedor-digital',
    'vendedor',
    'Agente especializado em vendas, upgrade de planos e captação de novos clientes.',
    'Você é um consultor de vendas especializado em serviços de internet. Seu objetivo é entender as necessidades do cliente, apresentar os planos mais adequados, destacar benefícios e ajudar na decisão de compra ou upgrade. Seja persuasivo mas nunca insistente. Foque em agregar valor e resolver as necessidades reais do cliente.',
    'gpt-4o-mini',
    0.8,
    1200,
    '["Apresentação de planos", "Comparativo de velocidades", "Promoções ativas", "Upgrade de planos", "Captação de leads"]'::jsonb,
    true,
    true
  ),
  (
    'Analista de Dados',
    'analista-dados',
    'analista',
    'Agente especializado em análise de métricas, relatórios e insights de negócio.',
    'Você é um analista de dados especializado no setor de telecomunicações. Seu objetivo é ajudar a interpretar métricas, gerar insights sobre o negócio e sugerir ações baseadas em dados. Seja preciso, use números quando relevante e sempre contextualize as informações para facilitar a tomada de decisão.',
    'gpt-4o-mini',
    0.5,
    1500,
    '["Análise de churn", "Métricas de receita", "Tendências de uso", "Relatórios automatizados", "Previsões e projeções"]'::jsonb,
    true,
    true
  ),
  (
    'Suporte Técnico',
    'suporte-tecnico',
    'suporte',
    'Agente especializado em diagnóstico técnico e resolução de problemas de conexão.',
    'Você é um especialista em suporte técnico de internet. Seu objetivo é diagnosticar problemas de conexão, orientar procedimentos de troubleshooting e resolver questões técnicas. Use linguagem clara e acessível, guie o cliente passo a passo e sempre confirme se o problema foi resolvido antes de encerrar o atendimento.',
    'gpt-4o-mini',
    0.5,
    1000,
    '["Diagnóstico de conexão", "Reset de equipamentos", "Configuração de roteador", "Teste de velocidade", "Escalação para técnico"]'::jsonb,
    true,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt,
  model = EXCLUDED.model,
  temperature = EXCLUDED.temperature,
  max_tokens = EXCLUDED.max_tokens,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  is_premium = EXCLUDED.is_premium,
  updated_at = now();