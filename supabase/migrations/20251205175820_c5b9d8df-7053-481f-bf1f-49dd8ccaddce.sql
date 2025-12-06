-- Create site_pages table for multi-page sites
CREATE TABLE public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE CASCADE NOT NULL,
  slug text NOT NULL,
  nome text NOT NULL,
  section_order text[] DEFAULT '{}'::text[],
  publicado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (lp_id, slug)
);

-- Enable RLS
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Public can view pages of published sites
CREATE POLICY "Public can view pages of published sites"
ON public.site_pages
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.landing_pages lp
    WHERE lp.id = lp_id AND lp.publicado = true
  )
);

-- Authenticated users can view pages of accessible sites
CREATE POLICY "Authenticated users can view accessible site pages"
ON public.site_pages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.landing_pages lp
    WHERE lp.id = lp_id AND lp.publicado = true
  )
  OR public.can_access_lp(auth.uid(), lp_id)
);

-- Editors can manage site pages
CREATE POLICY "Editors can manage site pages"
ON public.site_pages
FOR ALL
TO authenticated
USING (public.can_edit_lp(auth.uid(), lp_id))
WITH CHECK (public.can_edit_lp(auth.uid(), lp_id));

-- Add is_site column to landing_pages to differentiate sites from LPs
ALTER TABLE public.landing_pages ADD COLUMN IF NOT EXISTS is_site boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX idx_site_pages_lp_id ON public.site_pages(lp_id);
CREATE INDEX idx_site_pages_slug ON public.site_pages(lp_id, slug);
CREATE INDEX idx_landing_pages_is_site ON public.landing_pages(is_site);