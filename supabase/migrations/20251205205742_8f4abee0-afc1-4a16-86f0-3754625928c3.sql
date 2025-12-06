-- ============================================
-- PHASE 1: User Roles and Permissions System
-- ============================================

-- Create app_role enum for platform-wide roles
CREATE TYPE public.app_role AS ENUM ('admin_master', 'client');

-- Create user_roles table (separate from profiles as required for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table for additional user data (plans, metadata)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
    storage_used_mb INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create plan_limits configuration table (managed by admin_master)
CREATE TABLE public.plan_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan TEXT NOT NULL UNIQUE CHECK (plan IN ('free', 'pro', 'premium')),
    max_sites INTEGER NOT NULL DEFAULT 1,
    max_storage_mb INTEGER NOT NULL DEFAULT 50,
    custom_domain_limit INTEGER NOT NULL DEFAULT 0,
    allowed_model_categories TEXT[] NOT NULL DEFAULT ARRAY['básico'],
    allowed_separator_categories TEXT[] NOT NULL DEFAULT ARRAY['básico'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Insert default plan limits
INSERT INTO public.plan_limits (plan, max_sites, max_storage_mb, custom_domain_limit, allowed_model_categories, allowed_separator_categories)
VALUES 
    ('free', 1, 50, 0, ARRAY['básico'], ARRAY['básico']),
    ('pro', 5, 500, 2, ARRAY['básico', 'avançado', 'animado'], ARRAY['básico', 'avançado']),
    ('premium', 999, 5000, 10, ARRAY['básico', 'avançado', 'animado', 'robusto'], ARRAY['básico', 'avançado', 'animado', 'robusto']);

-- Create section_templates (models catalog)
CREATE TABLE public.section_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL,
    name TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('básico', 'avançado', 'animado', 'robusto')),
    min_plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (min_plan_tier IN ('free', 'pro', 'premium')),
    preview_thumbnail TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (section, variant_id)
);

ALTER TABLE public.section_templates ENABLE ROW LEVEL SECURITY;

-- Create section_separators catalog
CREATE TABLE public.section_separators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('básico', 'avançado', 'animado', 'robusto')),
    min_plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (min_plan_tier IN ('free', 'pro', 'premium')),
    svg_content TEXT,
    png_url TEXT,
    preview_thumbnail TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.section_separators ENABLE ROW LEVEL SECURITY;

-- Create lp_section_separators (stores separator choices per LP section)
CREATE TABLE public.lp_section_separators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lp_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('above', 'below')),
    separator_id UUID REFERENCES public.section_separators(id) ON DELETE SET NULL,
    custom_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (lp_id, section, position)
);

ALTER TABLE public.lp_section_separators ENABLE ROW LEVEL SECURITY;

-- Create audit_logs for admin actions
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Check if user has a specific app role
CREATE OR REPLACE FUNCTION public.has_app_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Check if user is admin_master
CREATE OR REPLACE FUNCTION public.is_admin_master(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_app_role(_user_id, 'admin_master')
$$;

-- Get user's plan
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id UUID)
RETURNS TEXT
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

-- Check if user can access a feature based on plan
CREATE OR REPLACE FUNCTION public.can_access_feature(_user_id UUID, _category TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.plan_limits pl
        WHERE pl.plan = public.get_user_plan(_user_id)
        AND _category = ANY(pl.allowed_model_categories)
    )
$$;

-- Get user's site count
CREATE OR REPLACE FUNCTION public.get_user_site_count(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::INTEGER FROM public.landing_pages
    WHERE owner_id = _user_id
$$;

-- Check if user can create more sites
CREATE OR REPLACE FUNCTION public.can_create_site(_user_id UUID)
RETURNS BOOLEAN
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

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles policies
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admin master can view all roles"
    ON public.user_roles FOR SELECT
    USING (public.is_admin_master(auth.uid()));

CREATE POLICY "Admin master can manage roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin_master(auth.uid()))
    WITH CHECK (public.is_admin_master(auth.uid()));

-- user_profiles policies
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile basic fields"
    ON public.user_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin master can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (public.is_admin_master(auth.uid()));

CREATE POLICY "Admin master can manage all profiles"
    ON public.user_profiles FOR ALL
    USING (public.is_admin_master(auth.uid()))
    WITH CHECK (public.is_admin_master(auth.uid()));

-- plan_limits policies (only admin_master can modify, everyone can read)
CREATE POLICY "Anyone can read plan limits"
    ON public.plan_limits FOR SELECT
    USING (true);

CREATE POLICY "Admin master can manage plan limits"
    ON public.plan_limits FOR ALL
    USING (public.is_admin_master(auth.uid()))
    WITH CHECK (public.is_admin_master(auth.uid()));

-- section_templates policies
CREATE POLICY "Anyone can view active templates"
    ON public.section_templates FOR SELECT
    USING (is_active = true OR public.is_admin_master(auth.uid()));

CREATE POLICY "Admin master can manage templates"
    ON public.section_templates FOR ALL
    USING (public.is_admin_master(auth.uid()))
    WITH CHECK (public.is_admin_master(auth.uid()));

-- section_separators policies
CREATE POLICY "Anyone can view active separators"
    ON public.section_separators FOR SELECT
    USING (is_active = true OR public.is_admin_master(auth.uid()));

CREATE POLICY "Admin master can manage separators"
    ON public.section_separators FOR ALL
    USING (public.is_admin_master(auth.uid()))
    WITH CHECK (public.is_admin_master(auth.uid()));

-- lp_section_separators policies
CREATE POLICY "Users can view own LP separators"
    ON public.lp_section_separators FOR SELECT
    USING (can_access_lp(auth.uid(), lp_id));

CREATE POLICY "Users can manage own LP separators"
    ON public.lp_section_separators FOR ALL
    USING (can_edit_lp(auth.uid(), lp_id))
    WITH CHECK (can_edit_lp(auth.uid(), lp_id));

-- audit_logs policies
CREATE POLICY "Admin master can view all audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin_master(auth.uid()));

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- TRIGGER: Auto-create profile and role on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
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

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ============================================
-- FUNCTION: Log audit event
-- ============================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
    _action TEXT,
    _target_type TEXT,
    _target_id TEXT DEFAULT NULL,
    _details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, target_type, target_id, details)
    VALUES (auth.uid(), _action, _target_type, _target_id, _details)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;