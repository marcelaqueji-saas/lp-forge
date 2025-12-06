
-- Tabela landing_pages (multi-LP preparado)
CREATE TABLE public.landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nome text NOT NULL,
  slug text UNIQUE NOT NULL,
  dominio text UNIQUE,
  publicado boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabela lp_content (conteúdo das seções)
CREATE TABLE public.lp_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE NOT NULL,
  section text NOT NULL,
  key text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (lp_id, section, key)
);

-- Tabela lp_settings (estilo, rastreio, configs)
CREATE TABLE public.lp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (lp_id, key)
);

-- Tabela lp_leads (captura de leads + UTM)
CREATE TABLE public.lp_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE NOT NULL,
  nome text,
  email text,
  telefone text,
  utm jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lp_leads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para landing_pages
CREATE POLICY "Public can view published LPs" ON public.landing_pages
  FOR SELECT USING (publicado = true);

CREATE POLICY "Owners can manage their LPs" ON public.landing_pages
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR owner_id IS NULL)
  WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

-- Políticas RLS para lp_content
CREATE POLICY "Public can view content of published LPs" ON public.lp_content
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND publicado = true)
  );

CREATE POLICY "Authenticated can manage content" ON public.lp_content
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND (owner_id = auth.uid() OR owner_id IS NULL))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND (owner_id = auth.uid() OR owner_id IS NULL))
  );

-- Políticas RLS para lp_settings
CREATE POLICY "Public can view settings of published LPs" ON public.lp_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND publicado = true)
  );

CREATE POLICY "Authenticated can manage settings" ON public.lp_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND (owner_id = auth.uid() OR owner_id IS NULL))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND (owner_id = auth.uid() OR owner_id IS NULL))
  );

-- Políticas RLS para lp_leads (público pode inserir)
CREATE POLICY "Public can insert leads" ON public.lp_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated can view leads" ON public.lp_leads
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.landing_pages WHERE id = lp_id AND (owner_id = auth.uid() OR owner_id IS NULL))
  );

-- Criar LP padrão
INSERT INTO public.landing_pages (nome, slug, publicado) 
VALUES ('Landing Page Padrão', 'default', true);
