-- =====================================================
-- MIGRATION: Ensure all tables and policies exist
-- This migration ensures the complete schema is in place
-- =====================================================

-- ENUMS (create if not exists)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin_master', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.lp_role AS ENUM ('owner', 'editor', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CORE FUNCTIONS (security definer functions for RLS)
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_app_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_master(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_app_role(_user_id, 'admin_master')
$$;

CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT plan FROM public.user_profiles WHERE user_id = _user_id),
        'free'
    )
$$;

CREATE OR REPLACE FUNCTION public.has_lp_role(_user_id uuid, _lp_id uuid, _roles lp_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.lp_user_roles
        WHERE user_id = _user_id
        AND lp_id = _lp_id
        AND role = ANY(_roles)
    )
$$;

CREATE OR REPLACE FUNCTION public.is_lp_owner(_user_id uuid, _lp_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.landing_pages
        WHERE id = _lp_id
        AND owner_id = _user_id
    )
$$;

CREATE OR REPLACE FUNCTION public.can_access_lp(_user_id uuid, _lp_id uuid, _min_role lp_role DEFAULT 'viewer'::lp_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = _lp_id
        AND (
            lp.owner_id = _user_id
            OR EXISTS (
                SELECT 1 FROM public.lp_user_roles ur
                WHERE ur.lp_id = _lp_id
                AND ur.user_id = _user_id
                AND (
                    (_min_role = 'viewer') OR
                    (_min_role = 'editor' AND ur.role IN ('owner', 'editor')) OR
                    (_min_role = 'owner' AND ur.role = 'owner')
                )
            )
        )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_lp(_user_id uuid, _lp_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.is_lp_owner(_user_id, _lp_id) 
    OR public.has_lp_role(_user_id, _lp_id, ARRAY['owner'::lp_role, 'editor'::lp_role])
$$;

CREATE OR REPLACE FUNCTION public.can_manage_lp(_user_id uuid, _lp_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.is_lp_owner(_user_id, _lp_id) 
    OR public.has_lp_role(_user_id, _lp_id, ARRAY['owner'::lp_role])
$$;

CREATE OR REPLACE FUNCTION public.get_user_site_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::INTEGER FROM public.landing_pages
    WHERE owner_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.can_create_site(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.get_user_site_count(_user_id) < (
        SELECT max_sites FROM public.plan_limits
        WHERE plan = public.get_user_plan(_user_id)
    )
$$;

-- =====================================================
-- TRIGGER FUNCTION: Auto-create profile on user signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, display_name, plan)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'free'
    );
    
    -- Assign default client role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
    
    RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- =====================================================
-- ENSURE ALL TABLES HAVE RLS ENABLED
-- =====================================================

ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.billing_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_section_separators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lp_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.plan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.saas_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.section_model_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.section_separators ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.section_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.uptime_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_landing_pages_owner ON public.landing_pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_lp_content_lp_id ON public.lp_content(lp_id);
CREATE INDEX IF NOT EXISTS idx_lp_content_section ON public.lp_content(section);
CREATE INDEX IF NOT EXISTS idx_lp_events_lp_id ON public.lp_events(lp_id);
CREATE INDEX IF NOT EXISTS idx_lp_events_created_at ON public.lp_events(created_at);
CREATE INDEX IF NOT EXISTS idx_lp_leads_lp_id ON public.lp_leads(lp_id);
CREATE INDEX IF NOT EXISTS idx_lp_settings_lp_id ON public.lp_settings(lp_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);