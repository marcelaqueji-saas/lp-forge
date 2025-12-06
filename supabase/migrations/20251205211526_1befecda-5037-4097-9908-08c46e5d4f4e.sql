-- Create app_settings table for global SaaS configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admin_master can manage app_settings
CREATE POLICY "Admin master can manage app_settings" ON public.app_settings
    FOR ALL USING (public.is_admin_master(auth.uid()))
    WITH CHECK (public.is_admin_master(auth.uid()));

-- Anyone can read app_settings (for homepage LP resolution)
CREATE POLICY "Anyone can read app_settings" ON public.app_settings
    FOR SELECT USING (true);

-- Update landing_pages RLS to allow admin_master to create for any user
DROP POLICY IF EXISTS "Authenticated users can create LPs" ON public.landing_pages;
CREATE POLICY "Admin master can create LPs for anyone" ON public.landing_pages
    FOR INSERT WITH CHECK (
        public.is_admin_master(auth.uid()) OR owner_id = auth.uid()
    );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_landing_pages_owner ON public.landing_pages(owner_id);

-- Insert default app_settings
INSERT INTO public.app_settings (key, value) VALUES ('saas_home_lp_id', NULL) ON CONFLICT (key) DO NOTHING;