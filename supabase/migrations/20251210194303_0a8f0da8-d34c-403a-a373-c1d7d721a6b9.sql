-- ============================================================
-- MIGRAÇÃO: Reset e Seed do Catálogo de Modelos de Seção v2.0
-- noBRon - SaaS Landing Page Builder
-- Corrigido: usando categorias válidas (básico, avançado, animado)
-- ============================================================

-- 1. Limpar tabela section_templates (catálogo antigo)
DELETE FROM section_templates;

-- 2. Limpar tabela section_model_configs (configurações antigas)
DELETE FROM section_model_configs;

-- 3. Inserir novo catálogo de templates v2.0
-- Categorias: básico (free), avançado (pro), animado (premium)
INSERT INTO section_templates (variant_id, section, name, description, category, min_plan_tier, preview_thumbnail, is_active) VALUES

-- MENU (3 modelos)
('menu_glass_minimal', 'menu', 'Menu glass minimal', 'Menu minimalista com efeito glass sutil', 'básico', 'free', '/thumbnails/menu/menu_glass_minimal.webp', true),
('menu_visionos_floating', 'menu', 'Menu flutuante VisionOS', 'Menu flutuante com estética VisionOS', 'avançado', 'pro', '/thumbnails/menu/menu_visionos_floating.webp', true),
('menu_command_center', 'menu', 'Menu command center (⌘K)', 'Menu com command palette integrado', 'animado', 'premium', '/thumbnails/menu/menu_command_center.webp', true),

-- HERO (4 modelos)
('hero_glass_aurora', 'hero', 'Hero glass aurora', 'Hero com efeito aurora e glass', 'básico', 'free', '/thumbnails/hero/hero_glass_aurora.webp', true),
('hero_cinematic_video_spotlight', 'hero', 'Hero vídeo cinematic + spotlight', 'Hero com vídeo de fundo e efeito spotlight', 'avançado', 'pro', '/thumbnails/hero/hero_cinematic_video_spotlight.webp', true),
('hero_parallax_layers', 'hero', 'Hero com camadas em parallax', 'Hero com múltiplas camadas em parallax', 'animado', 'premium', '/thumbnails/hero/hero_parallax_layers.webp', true),
('hero_ticket_launch', 'hero', 'Hero ticket de lançamento', 'Hero estilo ticket para lançamentos', 'animado', 'premium', '/thumbnails/hero/hero_ticket_launch.webp', true),

-- COMO FUNCIONA (3 modelos)
('como_funciona_timeline_glass', 'como_funciona', 'Timeline glass', 'Timeline vertical com cards glass', 'básico', 'free', '/thumbnails/como_funciona/como_funciona_timeline_glass.webp', true),
('como_funciona_steps_cards_3d', 'como_funciona', 'Passos em cards 3D', 'Cards com efeito 3D e tilt', 'avançado', 'pro', '/thumbnails/como_funciona/como_funciona_steps_cards_3d.webp', true),
('como_funciona_horizontal_flow', 'como_funciona', 'Fluxo horizontal interativo', 'Fluxo horizontal com scroll interativo', 'animado', 'premium', '/thumbnails/como_funciona/como_funciona_horizontal_flow.webp', true),

-- PARA QUEM É (3 modelos)
('para_quem_e_chips_personas', 'para_quem_e', 'Personas em chips', 'Personas exibidas como chips clicáveis', 'básico', 'free', '/thumbnails/para_quem_e/para_quem_e_chips_personas.webp', true),
('para_quem_e_personas_cards', 'para_quem_e', 'Personas em cards ilustrados', 'Cards detalhados com ilustrações', 'avançado', 'pro', '/thumbnails/para_quem_e/para_quem_e_personas_cards.webp', true),
('para_quem_e_matrix', 'para_quem_e', 'Matriz de perfis', 'Matriz interativa de perfis', 'animado', 'premium', '/thumbnails/para_quem_e/para_quem_e_matrix.webp', true),

-- BENEFÍCIOS (3 modelos)
('beneficios_icon_grid_glass', 'beneficios', 'Grid de benefícios glass', 'Grid responsivo com cards glass', 'básico', 'free', '/thumbnails/beneficios/beneficios_icon_grid_glass.webp', true),
('beneficios_timeline_numerada', 'beneficios', 'Benefícios em sequência numerada', 'Timeline numerada com animações', 'avançado', 'pro', '/thumbnails/beneficios/beneficios_timeline_numerada.webp', true),
('beneficios_showcase_3d', 'beneficios', 'Benefícios em cards 3D', 'Cards com efeito 3D interativo', 'animado', 'premium', '/thumbnails/beneficios/beneficios_showcase_3d.webp', true),

-- PROVAS SOCIAIS (4 modelos)
('provas_sociais_depoimentos_glass', 'provas_sociais', 'Depoimentos glass', 'Cards de depoimento com efeito glass', 'básico', 'free', '/thumbnails/provas_sociais/provas_sociais_depoimentos_glass.webp', true),
('provas_sociais_carrossel_premium', 'provas_sociais', 'Carrossel cinematográfico', 'Carrossel de depoimentos animado', 'avançado', 'pro', '/thumbnails/provas_sociais/provas_sociais_carrossel_premium.webp', true),
('provas_sociais_logos_scroller', 'provas_sociais', 'Marcas em scroller infinito', 'Logos de clientes em scroll infinito', 'avançado', 'pro', '/thumbnails/provas_sociais/provas_sociais_logos_scroller.webp', true),
('provas_sociais_stats_hybrid', 'provas_sociais', 'Depoimentos + métricas', 'Depoimentos combinados com estatísticas', 'animado', 'premium', '/thumbnails/provas_sociais/provas_sociais_stats_hybrid.webp', true),

-- PLANOS (3 modelos)
('planos_glass_three_tiers', 'planos', '3 planos glass', 'Três planos lado a lado com efeito glass', 'básico', 'free', '/thumbnails/planos/planos_glass_three_tiers.webp', true),
('planos_cards_pill', 'planos', 'Cards pill empilhados', 'Cards em formato pill com destaque', 'avançado', 'pro', '/thumbnails/planos/planos_cards_pill.webp', true),
('planos_tabela_comparativa_modern', 'planos', 'Tabela comparativa moderna', 'Tabela de comparação de features', 'animado', 'premium', '/thumbnails/planos/planos_tabela_comparativa_modern.webp', true),

-- FAQ (3 modelos)
('faq_accordion_glass', 'faq', 'FAQ accordion glass', 'Acordeão expansível com efeito glass', 'básico', 'free', '/thumbnails/faq/faq_accordion_glass.webp', true),
('faq_twocolumn_modern', 'faq', 'FAQ duas colunas', 'Layout em duas colunas moderno', 'avançado', 'pro', '/thumbnails/faq/faq_twocolumn_modern.webp', true),
('faq_with_cta_spotlight', 'faq', 'FAQ com CTA spotlight', 'FAQ com CTA destacado no final', 'animado', 'premium', '/thumbnails/faq/faq_with_cta_spotlight.webp', true),

-- CHAMADA FINAL (3 modelos)
('chamada_final_simple_glass', 'chamada_final', 'Chamada final glass', 'CTA simples com efeito glass', 'básico', 'free', '/thumbnails/chamada_final/chamada_final_simple_glass.webp', true),
('chamada_final_two_ctas', 'chamada_final', 'Chamada com dois caminhos', 'Duas opções de CTA lado a lado', 'avançado', 'pro', '/thumbnails/chamada_final/chamada_final_two_ctas.webp', true),
('chamada_final_ticket_glow', 'chamada_final', 'Ticket final com glow', 'CTA estilo ticket com efeito glow', 'animado', 'premium', '/thumbnails/chamada_final/chamada_final_ticket_glow.webp', true),

-- RODAPÉ (3 modelos)
('rodape_minimal_soft', 'rodape', 'Rodapé minimal', 'Rodapé minimalista com copyright', 'básico', 'free', '/thumbnails/rodape/rodape_minimal_soft.webp', true),
('rodape_columns_glass', 'rodape', 'Rodapé com colunas', 'Rodapé com múltiplas colunas de links', 'avançado', 'pro', '/thumbnails/rodape/rodape_columns_glass.webp', true),
('rodape_visionos_bar', 'rodape', 'Barra final VisionOS', 'Barra de rodapé estilo VisionOS', 'animado', 'premium', '/thumbnails/rodape/rodape_visionos_bar.webp', true);

-- 4. Inserir configurações default para todos os novos modelos
INSERT INTO section_model_configs (id, enabled, visible_for_free, visible_for_pro, visible_for_premium, is_featured, sort_order) VALUES
-- Menu
('menu_glass_minimal', true, true, true, true, false, 1),
('menu_visionos_floating', true, false, true, true, false, 2),
('menu_command_center', true, false, false, true, true, 3),
-- Hero
('hero_glass_aurora', true, true, true, true, false, 1),
('hero_cinematic_video_spotlight', true, false, true, true, false, 2),
('hero_parallax_layers', true, false, false, true, true, 3),
('hero_ticket_launch', true, false, false, true, false, 4),
-- Como Funciona
('como_funciona_timeline_glass', true, true, true, true, false, 1),
('como_funciona_steps_cards_3d', true, false, true, true, false, 2),
('como_funciona_horizontal_flow', true, false, false, true, true, 3),
-- Para Quem É
('para_quem_e_chips_personas', true, true, true, true, false, 1),
('para_quem_e_personas_cards', true, false, true, true, false, 2),
('para_quem_e_matrix', true, false, false, true, true, 3),
-- Benefícios
('beneficios_icon_grid_glass', true, true, true, true, false, 1),
('beneficios_timeline_numerada', true, false, true, true, false, 2),
('beneficios_showcase_3d', true, false, false, true, true, 3),
-- Provas Sociais
('provas_sociais_depoimentos_glass', true, true, true, true, false, 1),
('provas_sociais_carrossel_premium', true, false, true, true, false, 2),
('provas_sociais_logos_scroller', true, false, true, true, false, 3),
('provas_sociais_stats_hybrid', true, false, false, true, true, 4),
-- Planos
('planos_glass_three_tiers', true, true, true, true, false, 1),
('planos_cards_pill', true, false, true, true, false, 2),
('planos_tabela_comparativa_modern', true, false, false, true, true, 3),
-- FAQ
('faq_accordion_glass', true, true, true, true, false, 1),
('faq_twocolumn_modern', true, false, true, true, false, 2),
('faq_with_cta_spotlight', true, false, false, true, true, 3),
-- Chamada Final
('chamada_final_simple_glass', true, true, true, true, false, 1),
('chamada_final_two_ctas', true, false, true, true, false, 2),
('chamada_final_ticket_glow', true, false, false, true, true, 3),
-- Rodapé
('rodape_minimal_soft', true, true, true, true, false, 1),
('rodape_columns_glass', true, false, true, true, false, 2),
('rodape_visionos_bar', true, false, false, true, true, 3);