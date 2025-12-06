-- Add new columns to section_templates table
ALTER TABLE public.section_templates 
ADD COLUMN IF NOT EXISTS componente_front text,
ADD COLUMN IF NOT EXISTS preview_dynamic_enabled boolean DEFAULT false;

-- Add separators category to plan_limits
UPDATE public.plan_limits 
SET allowed_separator_categories = ARRAY['básico', 'avançado'] 
WHERE plan = 'free';

UPDATE public.plan_limits 
SET allowed_separator_categories = ARRAY['básico', 'avançado', 'animado'] 
WHERE plan = 'pro';

UPDATE public.plan_limits 
SET allowed_separator_categories = ARRAY['básico', 'avançado', 'animado', 'robusto'] 
WHERE plan = 'premium';

-- Insert premium templates
INSERT INTO public.section_templates (section, name, variant_id, category, min_plan_tier, description, componente_front, preview_dynamic_enabled, is_active)
VALUES 
  ('hero', 'Hero Parallax Mount', 'hero_parallax', 'animado', 'pro', 'Hero fullscreen com camadas em parallax, fade+up+blur em texto e CTA magnético', 'HeroParallax', true, true),
  ('hero', 'Hero Split Navigation', 'hero_split', 'animado', 'pro', 'Colunas verticais interativas com hover expandindo', 'HeroSplit', true, true),
  ('beneficios', '3D Cards Showcase', 'showcase_3d', 'animado', 'pro', 'Cards em 3D com rotateY e destaque central', 'Cards3DShowcase', true, true),
  ('beneficios', 'Features Float Minimal', 'features_float', 'avançado', 'free', 'Benefícios com ícones e flutuação leve', 'FeaturesFloat', true, true),
  ('provas_sociais', 'Depoimento Cinematic', 'testimonial_cinematic', 'animado', 'pro', 'Depoimento central com fade/shadow e alternância suave', 'TestimonialCinematic', true, true),
  ('chamada_final', 'CTA Final Animado', 'cta_final_animated', 'animado', 'free', 'Chamada final com partículas flutuantes e botão animado', 'CTAFinal', true, true)
ON CONFLICT DO NOTHING;

-- Insert default separator templates
INSERT INTO public.section_separators (name, category, min_plan_tier, svg_content, is_active)
VALUES 
  ('Wave Top/Bottom', 'básico', 'free', 'wave', true),
  ('Diagonal Cut', 'básico', 'free', 'diagonal', true),
  ('Zig-Zag Pattern', 'avançado', 'pro', 'zigzag', true),
  ('Glass Overlap', 'animado', 'pro', 'glass', true)
ON CONFLICT DO NOTHING;