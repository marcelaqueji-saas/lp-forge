-- 1. Criar tabela section_model_configs para governança dos modelos
CREATE TABLE IF NOT EXISTS public.section_model_configs (
  id TEXT PRIMARY KEY, -- mesmo id do SectionModel (ex: 'hero-basic')
  enabled BOOLEAN NOT NULL DEFAULT true,
  visible_for_free BOOLEAN NOT NULL DEFAULT true,
  visible_for_pro BOOLEAN NOT NULL DEFAULT true,
  visible_for_premium BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para section_model_configs
ALTER TABLE public.section_model_configs ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler (para filtrar no frontend)
CREATE POLICY "Anyone can read section_model_configs"
ON public.section_model_configs
FOR SELECT
USING (true);

-- Apenas admin_master pode modificar
CREATE POLICY "Admin master can manage section_model_configs"
ON public.section_model_configs
FOR ALL
USING (is_admin_master(auth.uid()))
WITH CHECK (is_admin_master(auth.uid()));

-- 2. Criar tabela saas_settings para configurações globais do SaaS
CREATE TABLE IF NOT EXISTS public.saas_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  home_lp_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir registro default
INSERT INTO public.saas_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- RLS para saas_settings
ALTER TABLE public.saas_settings ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler (para carregar homepage)
CREATE POLICY "Anyone can read saas_settings"
ON public.saas_settings
FOR SELECT
USING (true);

-- Apenas admin_master pode modificar
CREATE POLICY "Admin master can manage saas_settings"
ON public.saas_settings
FOR ALL
USING (is_admin_master(auth.uid()))
WITH CHECK (is_admin_master(auth.uid()));