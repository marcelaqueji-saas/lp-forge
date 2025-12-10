-- Add is_official column to landing_pages if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'landing_pages' 
        AND column_name = 'is_official'
    ) THEN
        ALTER TABLE public.landing_pages ADD COLUMN is_official boolean DEFAULT false;
    END IF;
END $$;

-- Create official noBRon landing page
INSERT INTO public.landing_pages (id, slug, nome, publicado, is_official, owner_id)
SELECT 
    gen_random_uuid(),
    'nobron',
    'Site Oficial noBRon',
    true,
    true,
    (SELECT user_id FROM public.user_roles WHERE role = 'admin_master' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM public.landing_pages WHERE slug = 'nobron'
);

-- Get the LP id for content insertion
DO $$
DECLARE
    lp_uuid uuid;
BEGIN
    SELECT id INTO lp_uuid FROM public.landing_pages WHERE slug = 'nobron';
    
    IF lp_uuid IS NOT NULL THEN
        -- Insert minimal content for each section
        INSERT INTO public.lp_content (lp_id, section, key, value, section_order)
        VALUES 
            (lp_uuid, 'menu', 'brand_name', 'noBRon', 1),
            (lp_uuid, 'hero', 'titulo', 'Crie Landing Pages e Sites profissionais em minutos', 2),
            (lp_uuid, 'hero', 'subtitulo', 'Editor visual, templates animados e alto poder de conversão', 2),
            (lp_uuid, 'beneficios', '_initialized', 'true', 3),
            (lp_uuid, 'provas_sociais', '_initialized', 'true', 4),
            (lp_uuid, 'chamada_final', 'titulo', 'Pronto para publicar ainda hoje?', 5),
            (lp_uuid, 'rodape', 'copyright', '© 2024 noBRon. Todos os direitos reservados.', 6)
        ON CONFLICT DO NOTHING;
        
        -- Insert settings with premium variants
        INSERT INTO public.lp_settings (lp_id, key, value)
        VALUES
            (lp_uuid, 'hero_variante', 'hero_parallax'),
            (lp_uuid, 'beneficios_variante', 'features_float'),
            (lp_uuid, 'provas_sociais_variante', 'testimonial_cinematic'),
            (lp_uuid, 'chamada_final_variante', 'cta_final_animated'),
            (lp_uuid, 'meta_title', 'noBRon | Crie Landing Pages Profissionais em Minutos'),
            (lp_uuid, 'meta_description', 'Editor visual, templates animados e alto poder de conversão. Crie landing pages e sites profissionais sem código.')
        ON CONFLICT DO NOTHING;
        
        -- Set as homepage if not already set
        INSERT INTO public.app_settings (key, value)
        VALUES ('saas_home_lp_id', lp_uuid::text)
        ON CONFLICT (key) DO NOTHING;
    END IF;
END $$;