-- Tabela de assinaturas de planos
CREATE TABLE public.plan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela de logs de auditoria de billing
CREATE TABLE public.billing_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT,
  plan_from TEXT,
  plan_to TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'brl',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.plan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies para plan_subscriptions
CREATE POLICY "Users can view own subscription"
ON public.plan_subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions"
ON public.plan_subscriptions FOR ALL
USING (true)
WITH CHECK (true);

-- Policies para billing_audit_logs
CREATE POLICY "Users can view own billing logs"
ON public.billing_audit_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admin can view all billing logs"
ON public.billing_audit_logs FOR SELECT
USING (is_admin_master(auth.uid()));

CREATE POLICY "System can insert billing logs"
ON public.billing_audit_logs FOR INSERT
WITH CHECK (true);

-- Função para obter limites efetivos do plano do usuário
CREATE OR REPLACE FUNCTION public.get_effective_plan_limits(_user_id UUID)
RETURNS TABLE (
  plan TEXT,
  max_sites INTEGER,
  max_storage_mb INTEGER,
  max_blocks INTEGER,
  custom_domain_limit INTEGER,
  can_edit_background BOOLEAN,
  can_edit_gradients BOOLEAN,
  can_edit_typography BOOLEAN,
  can_edit_section_colors BOOLEAN,
  can_edit_glass_effects BOOLEAN,
  premium_sections_enabled BOOLEAN,
  export_leads_enabled BOOLEAN,
  ab_testing_enabled BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan TEXT;
BEGIN
  -- Get active plan from subscription or default to user_profiles.plan
  SELECT COALESCE(
    (SELECT ps.plan FROM plan_subscriptions ps 
     WHERE ps.user_id = _user_id AND ps.status IN ('active', 'trialing')
     LIMIT 1),
    (SELECT up.plan FROM user_profiles up WHERE up.user_id = _user_id),
    'free'
  ) INTO user_plan;

  RETURN QUERY
  SELECT 
    user_plan,
    pl.max_sites,
    pl.max_storage_mb,
    CASE user_plan
      WHEN 'free' THEN 2
      WHEN 'pro' THEN 5
      ELSE 999
    END as max_blocks,
    pl.custom_domain_limit,
    CASE WHEN user_plan IN ('pro', 'premium') THEN true ELSE false END,
    CASE WHEN user_plan IN ('pro', 'premium') THEN true ELSE false END,
    CASE WHEN user_plan IN ('pro', 'premium') THEN true ELSE false END,
    CASE WHEN user_plan IN ('pro', 'premium') THEN true ELSE false END,
    CASE WHEN user_plan IN ('pro', 'premium') THEN true ELSE false END,
    pl.premium_sections_enabled,
    pl.export_leads_enabled,
    pl.ab_testing_enabled
  FROM plan_limits pl
  WHERE pl.plan = user_plan;
END;
$$;

-- Função para verificar se usuário pode usar feature
CREATE OR REPLACE FUNCTION public.can_use_feature(_user_id UUID, _feature TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  limits RECORD;
BEGIN
  SELECT * INTO limits FROM get_effective_plan_limits(_user_id);
  
  RETURN CASE _feature
    WHEN 'background' THEN limits.can_edit_background
    WHEN 'gradients' THEN limits.can_edit_gradients
    WHEN 'typography' THEN limits.can_edit_typography
    WHEN 'section_colors' THEN limits.can_edit_section_colors
    WHEN 'glass_effects' THEN limits.can_edit_glass_effects
    WHEN 'premium_sections' THEN limits.premium_sections_enabled
    WHEN 'export_leads' THEN limits.export_leads_enabled
    WHEN 'ab_testing' THEN limits.ab_testing_enabled
    ELSE false
  END;
END;
$$;

-- Índices
CREATE INDEX idx_plan_subscriptions_user ON plan_subscriptions(user_id);
CREATE INDEX idx_plan_subscriptions_stripe_sub ON plan_subscriptions(stripe_subscription_id);
CREATE INDEX idx_billing_audit_user ON billing_audit_logs(user_id);
CREATE INDEX idx_billing_audit_event ON billing_audit_logs(event_type);