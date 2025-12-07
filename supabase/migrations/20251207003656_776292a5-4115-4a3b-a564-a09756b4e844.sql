-- ======================================================================
-- MÓDULO 1: SEGURANÇA & COMPLIANCE
-- ======================================================================

-- 1e) Tabela de logs de autenticação (auth_logs)
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL, -- login_success, login_failed, logout, password_recover, password_change
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Policies for auth_logs
CREATE POLICY "Admin master can view all auth logs" ON public.auth_logs
  FOR SELECT USING (is_admin_master(auth.uid()));

CREATE POLICY "Users can view own auth logs" ON public.auth_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert auth logs" ON public.auth_logs
  FOR INSERT WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON public.auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON public.auth_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON public.auth_logs(event_type);

-- ======================================================================
-- MÓDULO 2: ANALYTICS & PERFORMANCE
-- ======================================================================

-- 2a) Adicionar colunas extras na tabela lp_events para tracking completo
ALTER TABLE public.lp_events 
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS section text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS device_type text, -- mobile, tablet, desktop
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS variant_id text; -- Para A/B Testing

-- Index para consultas de analytics
CREATE INDEX IF NOT EXISTS idx_lp_events_session ON public.lp_events(session_id);
CREATE INDEX IF NOT EXISTS idx_lp_events_device ON public.lp_events(device_type);
CREATE INDEX IF NOT EXISTS idx_lp_events_section ON public.lp_events(section);

-- 2b) Adicionar colunas de device na tabela lp_leads
ALTER TABLE public.lp_leads
  ADD COLUMN IF NOT EXISTS session_id text,
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS variant_id text;

-- 2d) Tabela de experimentos A/B
CREATE TABLE IF NOT EXISTS public.lp_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE NOT NULL,
  section_key text NOT NULL,
  name text NOT NULL,
  variant_a_id text NOT NULL,
  variant_b_id text NOT NULL,
  traffic_split integer DEFAULT 50, -- porcentagem para variant_a
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  winner_variant text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lp_id, section_key, status) -- Apenas um teste ativo por seção
);

-- Enable RLS
ALTER TABLE public.lp_ab_tests ENABLE ROW LEVEL SECURITY;

-- Policies para A/B tests
CREATE POLICY "Editors can view AB tests" ON public.lp_ab_tests
  FOR SELECT USING (can_edit_lp(auth.uid(), lp_id));

CREATE POLICY "Editors can manage AB tests" ON public.lp_ab_tests
  FOR ALL USING (can_edit_lp(auth.uid(), lp_id))
  WITH CHECK (can_edit_lp(auth.uid(), lp_id));

-- Index
CREATE INDEX IF NOT EXISTS idx_ab_tests_lp_section ON public.lp_ab_tests(lp_id, section_key);
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON public.lp_ab_tests(status);

-- ======================================================================
-- MÓDULO 3: SEO PROFISSIONAL
-- ======================================================================

-- Adicionar campos SEO em lp_settings (já existe a tabela, apenas documentar campos)
-- Os campos já são dinâmicos via key-value:
-- meta_title, meta_description, meta_keywords, og_title, og_description, og_image
-- twitter_card, twitter_title, twitter_description, twitter_image
-- schema_type (faq, organization, course, event), schema_data (JSON)
-- robots (index, noindex), canonical_url

-- ======================================================================
-- MÓDULO 4: GESTÃO POR PLANOS (já existe plan_limits, apenas garantir campos)
-- ======================================================================

-- Adicionar campo de features JSON na plan_limits
ALTER TABLE public.plan_limits
  ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS export_leads_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ab_testing_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS advanced_integrations_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_sections_enabled boolean DEFAULT false;

-- Atualizar os planos existentes com as features
UPDATE public.plan_limits SET 
  export_leads_enabled = true,
  ab_testing_enabled = false,
  advanced_integrations_enabled = false,
  premium_sections_enabled = false
WHERE plan = 'free';

UPDATE public.plan_limits SET 
  export_leads_enabled = true,
  ab_testing_enabled = true,
  advanced_integrations_enabled = true,
  premium_sections_enabled = true
WHERE plan = 'pro';

UPDATE public.plan_limits SET 
  export_leads_enabled = true,
  ab_testing_enabled = true,
  advanced_integrations_enabled = true,
  premium_sections_enabled = true
WHERE plan = 'premium';

-- ======================================================================
-- MÓDULO 5: AUDITORIA & LOGS (já existe audit_logs, apenas garantir campos)
-- ======================================================================

-- A tabela audit_logs já existe, mas vamos garantir que tem os campos necessários
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS diff jsonb;

-- Index para consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ======================================================================
-- TABELA DE CONFIGURAÇÕES GLOBAIS DO SISTEMA
-- ======================================================================

-- Garantir que app_settings tenha campos para configs de segurança
-- Chaves esperadas: 
-- cors_allowed_origins, security_headers_mode (strict/permissive)
-- cookie_consent_enabled, cookie_consent_text, privacy_policy_url, terms_url
-- cdn_base_url, ga4_default_id, meta_pixel_default_id, tiktok_pixel_default_id

-- ======================================================================
-- TABELA DE CONSENTIMENTO DE COOKIES POR SESSÃO (para compliance)
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  consent_given boolean DEFAULT false,
  consent_categories jsonb DEFAULT '{"essential": true, "analytics": false, "marketing": false}',
  ip_address text,
  user_agent text,
  consent_version text DEFAULT 'v1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert consent" ON public.cookie_consents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Editors can view LP consents" ON public.cookie_consents
  FOR SELECT USING (can_edit_lp(auth.uid(), lp_id));

-- Index
CREATE INDEX IF NOT EXISTS idx_cookie_consents_session ON public.cookie_consents(session_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_lp ON public.cookie_consents(lp_id);

-- ======================================================================
-- FUNÇÕES UTILITÁRIAS
-- ======================================================================

-- Função para verificar se um plano tem uma feature específica
CREATE OR REPLACE FUNCTION public.plan_has_feature(_plan text, _feature text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _feature
    WHEN 'export_leads' THEN COALESCE((SELECT export_leads_enabled FROM plan_limits WHERE plan = _plan), false)
    WHEN 'ab_testing' THEN COALESCE((SELECT ab_testing_enabled FROM plan_limits WHERE plan = _plan), false)
    WHEN 'advanced_integrations' THEN COALESCE((SELECT advanced_integrations_enabled FROM plan_limits WHERE plan = _plan), false)
    WHEN 'premium_sections' THEN COALESCE((SELECT premium_sections_enabled FROM plan_limits WHERE plan = _plan), false)
    ELSE false
  END
$$;

-- Função para verificar se o usuário atual tem acesso a uma feature
CREATE OR REPLACE FUNCTION public.user_has_feature(_user_id uuid, _feature text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.plan_has_feature(public.get_user_plan(_user_id), _feature)
$$;

-- Função para obter analytics agregados de uma LP
CREATE OR REPLACE FUNCTION public.get_lp_analytics(_lp_id uuid, _start_date timestamptz DEFAULT NULL, _end_date timestamptz DEFAULT NULL)
RETURNS TABLE (
  total_views bigint,
  total_clicks bigint,
  total_leads bigint,
  unique_sessions bigint,
  conversion_rate numeric,
  top_utm_source text,
  device_breakdown jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _start timestamptz := COALESCE(_start_date, NOW() - INTERVAL '30 days');
  _end timestamptz := COALESCE(_end_date, NOW());
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'view') as views,
      COUNT(*) FILTER (WHERE event_type = 'cta_click') as clicks,
      COUNT(*) FILTER (WHERE event_type = 'lead_submit') as leads,
      COUNT(DISTINCT session_id) as sessions
    FROM lp_events
    WHERE lp_id = _lp_id
      AND created_at BETWEEN _start AND _end
  ),
  top_source AS (
    SELECT utm_source
    FROM lp_events
    WHERE lp_id = _lp_id
      AND utm_source IS NOT NULL
      AND created_at BETWEEN _start AND _end
    GROUP BY utm_source
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  devices AS (
    SELECT jsonb_object_agg(
      COALESCE(device_type, 'unknown'),
      cnt
    ) as breakdown
    FROM (
      SELECT device_type, COUNT(*) as cnt
      FROM lp_events
      WHERE lp_id = _lp_id
        AND created_at BETWEEN _start AND _end
      GROUP BY device_type
    ) d
  )
  SELECT
    s.views::bigint,
    s.clicks::bigint,
    s.leads::bigint,
    s.sessions::bigint,
    CASE WHEN s.views > 0 
      THEN ROUND((s.leads::numeric / s.views::numeric) * 100, 2)
      ELSE 0 
    END as conversion_rate,
    ts.utm_source,
    COALESCE(dv.breakdown, '{}'::jsonb)
  FROM stats s
  CROSS JOIN (SELECT utm_source FROM top_source) ts
  CROSS JOIN devices dv;
END;
$$;

-- Função para registrar log de autenticação
CREATE OR REPLACE FUNCTION public.log_auth_event(
  _event_type text,
  _user_id uuid DEFAULT NULL,
  _ip_address text DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.auth_logs (user_id, event_type, ip_address, user_agent, metadata)
  VALUES (_user_id, _event_type, _ip_address, _user_agent, COALESCE(_metadata, '{}'))
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;