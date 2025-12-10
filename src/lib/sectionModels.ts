// ============================================================
// REGISTRO CENTRAL DE MODELOS DE SEÇÃO (Section Models Registry)
// noBRon - SaaS Landing Page Builder
// v2.0 - Catálogo Refatorado
// ============================================================

export type SectionKey =
  | 'menu'
  | 'hero'
  | 'como_funciona'
  | 'para_quem_e'
  | 'beneficios'
  | 'provas_sociais'
  | 'planos'
  | 'faq'
  | 'chamada_final'
  | 'rodape';

export type PlanLevel = 'free' | 'pro' | 'premium';
export type PlanLevelWithMaster = PlanLevel | 'master';

// Categorias no banco: básico, avançado, animado
// Categorias internas para organização de componentes
export type ModelCategory = 
  | 'navigation'
  | 'hero'
  | 'content'
  | 'social'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'footer';

// Categoria de template no banco (para TemplatePicker)
export type TemplateCategory = 'básico' | 'avançado' | 'animado';

export type StylePreset = 'glass' | 'visionos' | 'aurora' | 'neumorphic' | 'dark' | 'neon' | 'minimal' | 'gradient' | 'frosted';
export type MotionPreset = 'fade-stagger' | 'parallax' | 'tilt' | 'spotlight' | 'magnetic' | 'slide-in-right' | 'slide-in-up' | 'accordion';

type FieldType = 'text' | 'textarea' | 'url';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
}

export interface ImageConfig {
  key: string;
  label: string;
  maxSizeMB?: number;
  aspectRatio?: string;
}

export interface SectionModel {
  id: string;
  section: SectionKey;
  name: string;
  description?: string;
  plan: PlanLevel;
  category: ModelCategory;
  thumbnail: string;
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
  fields?: FieldConfig[];
  images?: ImageConfig[];
  hasJsonEditor?: boolean;
  component: string;
}

// ============================================================
// CAMPOS PADRÃO REUTILIZÁVEIS
// ============================================================

const MENU_FIELDS: FieldConfig[] = [
  { key: 'marca', label: 'Marca', type: 'text' },
  { key: 'cta_label', label: 'Texto do botão', type: 'text' },
  { key: 'cta_url', label: 'URL do botão', type: 'url' },
];

const HERO_FIELDS: FieldConfig[] = [
  { key: 'pre_titulo', label: 'Chamada curta', type: 'text' },
  { key: 'titulo', label: 'Título', type: 'text' },
  { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
  { key: 'cta_primaria_label', label: 'Texto CTA principal', type: 'text' },
  { key: 'cta_primaria_url', label: 'URL CTA principal', type: 'url' },
];

const SECTION_TITLE_FIELDS: FieldConfig[] = [
  { key: 'titulo', label: 'Título', type: 'text' },
  { key: 'subtitulo', label: 'Descrição curta', type: 'textarea' },
];

const CTA_FIELDS: FieldConfig[] = [
  { key: 'titulo', label: 'Título', type: 'text' },
  { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
  { key: 'cta_label', label: 'Texto do botão', type: 'text' },
  { key: 'cta_url', label: 'URL do botão', type: 'url' },
];

const FOOTER_FIELDS: FieldConfig[] = [
  { key: 'copyright', label: 'Copyright', type: 'text' },
];

export const SECTION_MODEL_KEY = '__model_id';

// ============================================================
// NOVO CATÁLOGO DE MODELOS v2.0
// Thumbnails: /public/thumbnails/{sectionKey}/{modelId}.webp
// ============================================================

export const SECTION_MODELS: SectionModel[] = [
  // ============================================================
  // MENU (3 modelos)
  // ============================================================
  {
    id: 'menu_glass_minimal',
    section: 'menu',
    name: 'Menu glass minimal',
    description: 'Menu minimalista com efeito glass sutil',
    plan: 'free',
    category: 'navigation',
    component: 'MenuSection',
    thumbnail: '/thumbnails/menu/menu_glass_minimal.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },
  {
    id: 'menu_visionos_floating',
    section: 'menu',
    name: 'Menu flutuante VisionOS',
    description: 'Menu flutuante com estética VisionOS',
    plan: 'pro',
    category: 'navigation',
    component: 'MenuSection',
    thumbnail: '/thumbnails/menu/menu_visionos_floating.webp',
    stylePreset: 'visionos',
    motionPreset: 'spotlight',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },
  {
    id: 'menu_command_center',
    section: 'menu',
    name: 'Menu command center (⌘K)',
    description: 'Menu com command palette integrado',
    plan: 'premium',
    category: 'navigation',
    component: 'MenuSection',
    thumbnail: '/thumbnails/menu/menu_command_center.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },

  // ============================================================
  // HERO (7 modelos)
  // ============================================================
  {
    id: 'hero_glass_aurora',
    section: 'hero',
    name: 'Hero glass aurora',
    description: 'Hero com efeito aurora e glass',
    plan: 'free',
    category: 'hero',
    component: 'Hero',
    thumbnail: '/thumbnails/hero/hero_glass_aurora.webp',
    stylePreset: 'aurora',
    motionPreset: 'fade-stagger',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  {
    id: 'hero_cinematic_video_spotlight',
    section: 'hero',
    name: 'Hero vídeo cinematic + spotlight',
    description: 'Hero com vídeo de fundo e efeito spotlight',
    plan: 'pro',
    category: 'hero',
    component: 'Hero',
    thumbnail: '/thumbnails/hero/hero_cinematic_video_spotlight.webp',
    stylePreset: 'glass',
    motionPreset: 'spotlight',
    fields: [
      ...HERO_FIELDS,
      { key: 'video_url', label: 'URL do vídeo', type: 'url' as const },
    ],
    images: [],
  },
  {
    id: 'hero_carousel_autoplay',
    section: 'hero',
    name: 'Hero carrossel automático',
    description: 'Hero com carrossel de imagens automático',
    plan: 'pro',
    category: 'hero',
    component: 'HeroCarousel',
    thumbnail: '/thumbnails/hero/hero_carousel_autoplay.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: HERO_FIELDS,
    images: [],
    hasJsonEditor: true, // For imagens_json
  },
  {
    id: 'hero_parallax_layers',
    section: 'hero',
    name: 'Hero com camadas em parallax',
    description: 'Hero com múltiplas camadas em parallax',
    plan: 'premium',
    category: 'hero',
    component: 'HeroParallax',
    thumbnail: '/thumbnails/hero/hero_parallax_layers.webp',
    stylePreset: 'aurora',
    motionPreset: 'parallax',
    fields: HERO_FIELDS,
    images: [
      { key: 'imagem', label: 'Imagem de fundo', maxSizeMB: 3 },
      { key: 'imagem_frente', label: 'Imagem frontal', maxSizeMB: 2 },
    ],
  },
  {
    id: 'hero_ticket_launch',
    section: 'hero',
    name: 'Hero ticket de lançamento',
    description: 'Hero estilo ticket para lançamentos',
    plan: 'premium',
    category: 'hero',
    component: 'Hero',
    thumbnail: '/thumbnails/hero/hero_ticket_launch.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem do ticket', maxSizeMB: 2 }],
  },
  {
    id: 'hero_split_visionos',
    section: 'hero',
    name: 'Hero split VisionOS',
    description: 'Hero dividido com estética VisionOS',
    plan: 'premium',
    category: 'hero',
    component: 'Hero',
    thumbnail: '/thumbnails/hero/hero_split_visionos.webp',
    stylePreset: 'visionos',
    motionPreset: 'spotlight',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  {
    id: 'hero_minimal_centered',
    section: 'hero',
    name: 'Hero minimalista centralizado',
    description: 'Hero centralizado com foco no texto',
    plan: 'free',
    category: 'hero',
    component: 'Hero',
    thumbnail: '/thumbnails/hero/hero_minimal_centered.webp',
    stylePreset: 'neumorphic',
    motionPreset: 'fade-stagger',
    fields: HERO_FIELDS,
    images: [],
  },

  // ============================================================
  // COMO FUNCIONA (3 modelos)
  // ============================================================
  {
    id: 'como_funciona_timeline_glass',
    section: 'como_funciona',
    name: 'Timeline glass',
    description: 'Timeline vertical com cards glass',
    plan: 'free',
    category: 'content',
    component: 'ComoFunciona',
    thumbnail: '/thumbnails/como_funciona/como_funciona_timeline_glass.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'como_funciona_steps_cards_3d',
    section: 'como_funciona',
    name: 'Passos em cards 3D',
    description: 'Cards com efeito 3D e tilt',
    plan: 'pro',
    category: 'content',
    component: 'ComoFunciona',
    thumbnail: '/thumbnails/como_funciona/como_funciona_steps_cards_3d.webp',
    stylePreset: 'glass',
    motionPreset: 'tilt',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'como_funciona_horizontal_flow',
    section: 'como_funciona',
    name: 'Fluxo horizontal interativo',
    description: 'Fluxo horizontal com scroll interativo',
    plan: 'premium',
    category: 'content',
    component: 'ComoFunciona',
    thumbnail: '/thumbnails/como_funciona/como_funciona_horizontal_flow.webp',
    stylePreset: 'glass',
    motionPreset: 'parallax',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // PARA QUEM É (3 modelos)
  // ============================================================
  {
    id: 'para_quem_e_chips_personas',
    section: 'para_quem_e',
    name: 'Personas em chips',
    description: 'Personas exibidas como chips clicáveis',
    plan: 'free',
    category: 'content',
    component: 'ParaQuemE',
    thumbnail: '/thumbnails/para_quem_e/para_quem_e_chips_personas.webp',
    stylePreset: 'neumorphic',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'para_quem_e_personas_cards',
    section: 'para_quem_e',
    name: 'Personas em cards ilustrados',
    description: 'Cards detalhados com ilustrações',
    plan: 'pro',
    category: 'content',
    component: 'ParaQuemE',
    thumbnail: '/thumbnails/para_quem_e/para_quem_e_personas_cards.webp',
    stylePreset: 'glass',
    motionPreset: 'tilt',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'avatar_default', label: 'Avatar padrão', maxSizeMB: 1 }],
    hasJsonEditor: true,
  },
  {
    id: 'para_quem_e_matrix',
    section: 'para_quem_e',
    name: 'Matriz de perfis',
    description: 'Matriz interativa de perfis',
    plan: 'premium',
    category: 'content',
    component: 'ParaQuemE',
    thumbnail: '/thumbnails/para_quem_e/para_quem_e_matrix.webp',
    stylePreset: 'visionos',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // BENEFÍCIOS (3 modelos)
  // ============================================================
  {
    id: 'beneficios_icon_grid_glass',
    section: 'beneficios',
    name: 'Grid de benefícios glass',
    description: 'Grid responsivo com cards glass',
    plan: 'free',
    category: 'content',
    component: 'Beneficios',
    thumbnail: '/thumbnails/beneficios/beneficios_icon_grid_glass.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios_timeline_numerada',
    section: 'beneficios',
    name: 'Benefícios em sequência numerada',
    description: 'Timeline numerada com animações',
    plan: 'pro',
    category: 'content',
    component: 'Beneficios',
    thumbnail: '/thumbnails/beneficios/beneficios_timeline_numerada.webp',
    stylePreset: 'aurora',
    motionPreset: 'slide-in-right',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios_showcase_3d',
    section: 'beneficios',
    name: 'Benefícios em cards 3D',
    description: 'Cards com efeito 3D interativo',
    plan: 'premium',
    category: 'content',
    component: 'Beneficios',
    thumbnail: '/thumbnails/beneficios/beneficios_showcase_3d.webp',
    stylePreset: 'glass',
    motionPreset: 'tilt',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // PROVAS SOCIAIS (7 modelos)
  // ============================================================
  {
    id: 'provas_sociais_depoimentos_glass',
    section: 'provas_sociais',
    name: 'Depoimentos glass',
    description: 'Cards de depoimento com efeito glass',
    plan: 'free',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_depoimentos_glass.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_carrossel_premium',
    section: 'provas_sociais',
    name: 'Carrossel cinematográfico',
    description: 'Carrossel de depoimentos animado',
    plan: 'pro',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_carrossel_premium.webp',
    stylePreset: 'aurora',
    motionPreset: 'slide-in-right',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_stories',
    section: 'provas_sociais',
    name: 'Stories de clientes',
    description: 'Histórias estilo Instagram Stories',
    plan: 'pro',
    category: 'social',
    component: 'StoriesCarousel',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_stories.webp',
    stylePreset: 'glass',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true, // For stories_json
  },
  {
    id: 'provas_sociais_logos_scroller',
    section: 'provas_sociais',
    name: 'Marcas em scroller infinito',
    description: 'Logos de clientes em scroll infinito',
    plan: 'pro',
    category: 'social',
    component: 'LogosInfiniteScroll',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_logos_scroller.webp',
    stylePreset: 'glass',
    motionPreset: 'parallax',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true, // For logos_json
  },
  {
    id: 'provas_sociais_stats_hybrid',
    section: 'provas_sociais',
    name: 'Depoimentos + métricas',
    description: 'Depoimentos combinados com estatísticas',
    plan: 'premium',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_stats_hybrid.webp',
    stylePreset: 'visionos',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_video_testimonials',
    section: 'provas_sociais',
    name: 'Depoimentos em vídeo',
    description: 'Grid de vídeos de clientes',
    plan: 'premium',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_video_testimonials.webp',
    stylePreset: 'glass',
    motionPreset: 'tilt',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_featured_single',
    section: 'provas_sociais',
    name: 'Depoimento destaque único',
    description: 'Um depoimento grande em destaque',
    plan: 'free',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_featured_single.webp',
    stylePreset: 'aurora',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_carrossel_premium',
    section: 'provas_sociais',
    name: 'Carrossel cinematográfico',
    description: 'Carrossel de depoimentos animado',
    plan: 'pro',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_carrossel_premium.webp',
    stylePreset: 'aurora',
    motionPreset: 'slide-in-right',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_logos_scroller',
    section: 'provas_sociais',
    name: 'Marcas em scroller infinito',
    description: 'Logos de clientes em scroll infinito',
    plan: 'pro',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_logos_scroller.webp',
    stylePreset: 'glass',
    motionPreset: 'parallax',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_stats_hybrid',
    section: 'provas_sociais',
    name: 'Depoimentos + métricas',
    description: 'Depoimentos combinados com estatísticas',
    plan: 'premium',
    category: 'social',
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_stats_hybrid.webp',
    stylePreset: 'visionos',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // PLANOS (3 modelos)
  // ============================================================
  {
    id: 'planos_glass_three_tiers',
    section: 'planos',
    name: '3 planos glass',
    description: 'Três planos lado a lado com efeito glass',
    plan: 'free',
    category: 'pricing',
    component: 'Planos',
    thumbnail: '/thumbnails/planos/planos_glass_three_tiers.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'planos_cards_pill',
    section: 'planos',
    name: 'Cards pill empilhados',
    description: 'Cards em formato pill com destaque',
    plan: 'pro',
    category: 'pricing',
    component: 'Planos',
    thumbnail: '/thumbnails/planos/planos_cards_pill.webp',
    stylePreset: 'neumorphic',
    motionPreset: 'slide-in-up',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'planos_tabela_comparativa_modern',
    section: 'planos',
    name: 'Tabela comparativa moderna',
    description: 'Tabela de comparação de features',
    plan: 'premium',
    category: 'pricing',
    component: 'Planos',
    thumbnail: '/thumbnails/planos/planos_tabela_comparativa_modern.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // FAQ (3 modelos)
  // ============================================================
  {
    id: 'faq_accordion_glass',
    section: 'faq',
    name: 'FAQ accordion glass',
    description: 'Acordeão expansível com efeito glass',
    plan: 'free',
    category: 'faq',
    component: 'FAQ',
    thumbnail: '/thumbnails/faq/faq_accordion_glass.webp',
    stylePreset: 'glass',
    motionPreset: 'accordion',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq_twocolumn_modern',
    section: 'faq',
    name: 'FAQ duas colunas',
    description: 'Layout em duas colunas moderno',
    plan: 'pro',
    category: 'faq',
    component: 'FAQ',
    thumbnail: '/thumbnails/faq/faq_twocolumn_modern.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq_with_cta_spotlight',
    section: 'faq',
    name: 'FAQ com CTA spotlight',
    description: 'FAQ com CTA destacado no final',
    plan: 'premium',
    category: 'faq',
    component: 'FAQ',
    thumbnail: '/thumbnails/faq/faq_with_cta_spotlight.webp',
    stylePreset: 'visionos',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // CHAMADA FINAL (3 modelos)
  // ============================================================
  {
    id: 'chamada_final_simple_glass',
    section: 'chamada_final',
    name: 'Chamada final glass',
    description: 'CTA simples com efeito glass',
    plan: 'free',
    category: 'cta',
    component: 'ChamadaFinal',
    thumbnail: '/thumbnails/chamada_final/chamada_final_simple_glass.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: CTA_FIELDS,
  },
  {
    id: 'chamada_final_two_ctas',
    section: 'chamada_final',
    name: 'Chamada com dois caminhos',
    description: 'Duas opções de CTA lado a lado',
    plan: 'pro',
    category: 'cta',
    component: 'ChamadaFinal',
    thumbnail: '/thumbnails/chamada_final/chamada_final_two_ctas.webp',
    stylePreset: 'glass',
    motionPreset: 'tilt',
    fields: [
      ...CTA_FIELDS,
      { key: 'cta_secundario_label', label: 'Texto CTA secundário', type: 'text' as const },
      { key: 'cta_secundario_url', label: 'URL CTA secundário', type: 'url' as const },
    ],
  },
  {
    id: 'chamada_final_ticket_glow',
    section: 'chamada_final',
    name: 'Ticket final com glow',
    description: 'CTA estilo ticket com efeito glow',
    plan: 'premium',
    category: 'cta',
    component: 'ChamadaFinal',
    thumbnail: '/thumbnails/chamada_final/chamada_final_ticket_glow.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: CTA_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem de fundo', maxSizeMB: 2 }],
  },

  // ============================================================
  // RODAPÉ (3 modelos)
  // ============================================================
  {
    id: 'rodape_minimal_soft',
    section: 'rodape',
    name: 'Rodapé minimal',
    description: 'Rodapé minimalista com copyright',
    plan: 'free',
    category: 'footer',
    component: 'Rodape',
    thumbnail: '/thumbnails/rodape/rodape_minimal_soft.webp',
    stylePreset: 'neumorphic',
    motionPreset: 'fade-stagger',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'rodape_columns_glass',
    section: 'rodape',
    name: 'Rodapé com colunas',
    description: 'Rodapé com múltiplas colunas de links',
    plan: 'pro',
    category: 'footer',
    component: 'Rodape',
    thumbnail: '/thumbnails/rodape/rodape_columns_glass.webp',
    stylePreset: 'glass',
    motionPreset: 'fade-stagger',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'rodape_visionos_bar',
    section: 'rodape',
    name: 'Barra final VisionOS',
    description: 'Barra de rodapé estilo VisionOS',
    plan: 'premium',
    category: 'footer',
    component: 'Rodape',
    thumbnail: '/thumbnails/rodape/rodape_visionos_bar.webp',
    stylePreset: 'visionos',
    motionPreset: 'spotlight',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // VARIAÇÕES DE ESTILO - DARK / NEON / MINIMAL
  // ============================================================
  
  // Hero variations
  {
    id: 'hero_dark',
    section: 'hero',
    name: 'Hero Dark Mode',
    description: 'Hero com tema escuro elegante',
    plan: 'pro',
    category: 'hero',
    component: 'HeroDark',
    thumbnail: '/thumbnails/hero/hero_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  {
    id: 'hero_neon',
    section: 'hero',
    name: 'Hero Neon Glow',
    description: 'Hero com efeitos neon brilhantes',
    plan: 'premium',
    category: 'hero',
    component: 'HeroNeon',
    thumbnail: '/thumbnails/hero/hero_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  {
    id: 'hero_minimal',
    section: 'hero',
    name: 'Hero Minimalista',
    description: 'Hero limpo e minimalista',
    plan: 'free',
    category: 'hero',
    component: 'HeroMinimal',
    thumbnail: '/thumbnails/hero/hero_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  
  // Benefícios variations
  {
    id: 'beneficios_dark',
    section: 'beneficios',
    name: 'Benefícios Dark',
    description: 'Grid de benefícios em tema escuro',
    plan: 'pro',
    category: 'content',
    component: 'BeneficiosDark',
    thumbnail: '/thumbnails/beneficios/beneficios_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios_neon',
    section: 'beneficios',
    name: 'Benefícios Neon',
    description: 'Cards de benefícios com glow neon',
    plan: 'premium',
    category: 'content',
    component: 'BeneficiosNeon',
    thumbnail: '/thumbnails/beneficios/beneficios_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios_minimal',
    section: 'beneficios',
    name: 'Benefícios Clean',
    description: 'Benefícios em estilo minimalista',
    plan: 'free',
    category: 'content',
    component: 'BeneficiosMinimal',
    thumbnail: '/thumbnails/beneficios/beneficios_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  
  // Planos variations
  {
    id: 'planos_dark',
    section: 'planos',
    name: 'Planos Dark',
    description: 'Tabela de preços em tema escuro',
    plan: 'pro',
    category: 'pricing',
    component: 'PlanosDark',
    thumbnail: '/thumbnails/planos/planos_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'planos_neon',
    section: 'planos',
    name: 'Planos Neon',
    description: 'Cards de preços com efeito neon',
    plan: 'premium',
    category: 'pricing',
    component: 'PlanosNeon',
    thumbnail: '/thumbnails/planos/planos_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'planos_minimal',
    section: 'planos',
    name: 'Planos Minimal',
    description: 'Tabela de preços minimalista',
    plan: 'free',
    category: 'pricing',
    component: 'PlanosMinimal',
    thumbnail: '/thumbnails/planos/planos_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  
  // CTA Final variations
  {
    id: 'cta_dark',
    section: 'chamada_final',
    name: 'CTA Dark',
    description: 'Chamada final em tema escuro',
    plan: 'pro',
    category: 'cta',
    component: 'CTAFinalDark',
    thumbnail: '/thumbnails/chamada_final/cta_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: CTA_FIELDS,
  },
  {
    id: 'cta_neon',
    section: 'chamada_final',
    name: 'CTA Neon',
    description: 'Chamada final com glow neon',
    plan: 'premium',
    category: 'cta',
    component: 'CTAFinalNeon',
    thumbnail: '/thumbnails/chamada_final/cta_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: CTA_FIELDS,
  },
  {
    id: 'cta_minimal',
    section: 'chamada_final',
    name: 'CTA Minimal',
    description: 'Chamada final minimalista',
    plan: 'free',
    category: 'cta',
    component: 'CTAFinalMinimal',
    thumbnail: '/thumbnails/chamada_final/cta_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: CTA_FIELDS,
  },

  // FAQ variations
  {
    id: 'faq_dark',
    section: 'faq',
    name: 'FAQ Dark',
    description: 'FAQ em tema escuro elegante',
    plan: 'pro',
    category: 'faq',
    component: 'FAQDark',
    thumbnail: '/thumbnails/faq/faq_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'accordion',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq_neon',
    section: 'faq',
    name: 'FAQ Neon',
    description: 'FAQ com glow neon',
    plan: 'premium',
    category: 'faq',
    component: 'FAQNeon',
    thumbnail: '/thumbnails/faq/faq_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq_minimal',
    section: 'faq',
    name: 'FAQ Minimal',
    description: 'FAQ limpo e minimalista',
    plan: 'free',
    category: 'faq',
    component: 'FAQMinimal',
    thumbnail: '/thumbnails/faq/faq_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'accordion',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // Provas Sociais variations
  {
    id: 'provas_sociais_dark',
    section: 'provas_sociais',
    name: 'Depoimentos Dark',
    description: 'Depoimentos em tema escuro',
    plan: 'pro',
    category: 'social',
    component: 'ProvasSociaisDark',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_neon',
    section: 'provas_sociais',
    name: 'Depoimentos Neon',
    description: 'Depoimentos com glow neon',
    plan: 'premium',
    category: 'social',
    component: 'ProvasSociaisNeon',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais_minimal',
    section: 'provas_sociais',
    name: 'Depoimentos Minimal',
    description: 'Depoimentos limpos e minimalistas',
    plan: 'free',
    category: 'social',
    component: 'ProvasSociaisMinimal',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // Menu variations
  {
    id: 'menu_dark',
    section: 'menu',
    name: 'Menu Dark',
    description: 'Menu em tema escuro',
    plan: 'pro',
    category: 'navigation',
    component: 'MenuDark',
    thumbnail: '/thumbnails/menu/menu_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },
  {
    id: 'menu_neon',
    section: 'menu',
    name: 'Menu Neon',
    description: 'Menu com efeitos neon',
    plan: 'premium',
    category: 'navigation',
    component: 'MenuNeon',
    thumbnail: '/thumbnails/menu/menu_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },
  {
    id: 'menu_minimal_preset',
    section: 'menu',
    name: 'Menu Minimal',
    description: 'Menu limpo e minimalista',
    plan: 'free',
    category: 'navigation',
    component: 'MenuMinimal',
    thumbnail: '/thumbnails/menu/menu_minimal_preset.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },

  // Rodapé variations
  {
    id: 'rodape_dark',
    section: 'rodape',
    name: 'Rodapé Dark',
    description: 'Rodapé em tema escuro',
    plan: 'pro',
    category: 'footer',
    component: 'RodapeDark',
    thumbnail: '/thumbnails/rodape/rodape_dark.webp',
    stylePreset: 'dark',
    motionPreset: 'fade-stagger',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'rodape_neon',
    section: 'rodape',
    name: 'Rodapé Neon',
    description: 'Rodapé com efeitos neon',
    plan: 'premium',
    category: 'footer',
    component: 'RodapeNeon',
    thumbnail: '/thumbnails/rodape/rodape_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'rodape_minimal',
    section: 'rodape',
    name: 'Rodapé Minimal',
    description: 'Rodapé limpo e minimalista',
    plan: 'free',
    category: 'footer',
    component: 'RodapeMinimal',
    thumbnail: '/thumbnails/rodape/rodape_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },
];

// ============================================================
// MAPEAMENTO DE IDs ANTIGOS PARA NOVOS (FALLBACK)
// Garante compatibilidade com LPs criadas com catálogo anterior
// ============================================================

const LEGACY_MODEL_FALLBACK: Record<string, string> = {
  // Menu antigos
  'menu_horizontal': 'menu_glass_minimal',
  'menu_centered': 'menu_visionos_floating',
  'menu_sticky_glass': 'menu_visionos_floating',
  'menu_minimal': 'menu_command_center',
  'menu_basic': 'menu_glass_minimal',
  
  // Hero antigos
  'hero_basic': 'hero_glass_aurora',
  'hero_center': 'hero_glass_aurora',
  'hero_split': 'hero_cinematic_video_spotlight',
  'hero_split_reverse': 'hero_cinematic_video_spotlight',
  'hero_gradient': 'hero_glass_aurora',
  'hero_video_cinematic': 'hero_cinematic_video_spotlight',
  'hero_parallax': 'hero_parallax_layers',
  'hero_animated_text': 'hero_ticket_launch',
  
  // Como funciona antigos
  'steps_basic': 'como_funciona_timeline_glass',
  'steps_timeline': 'como_funciona_timeline_glass',
  'steps_zigzag': 'como_funciona_steps_cards_3d',
  'steps_cards': 'como_funciona_horizontal_flow',
  
  // Para quem é antigos
  'target_basic': 'para_quem_e_chips_personas',
  'target_cards': 'para_quem_e_personas_cards',
  'target_avatars': 'para_quem_e_matrix',
  
  // Benefícios antigos
  'benefits_basic': 'beneficios_icon_grid_glass',
  'benefits_icons': 'beneficios_timeline_numerada',
  'benefits_bento': 'beneficios_showcase_3d',
  
  // Provas sociais antigas
  'testimonials_basic': 'provas_sociais_depoimentos_glass',
  'testimonials_carousel': 'provas_sociais_carrossel_premium',
  'testimonials_video': 'provas_sociais_stats_hybrid',
  
  // Planos antigos
  'pricing_basic': 'planos_glass_three_tiers',
  'pricing_highlight': 'planos_cards_pill',
  'pricing_comparison': 'planos_tabela_comparativa_modern',
  
  // FAQ antigos
  'faq_accordion': 'faq_accordion_glass',
  'faq_columns': 'faq_twocolumn_modern',
  'faq_categorized': 'faq_with_cta_spotlight',
  'faq_basic': 'faq_accordion_glass',
  
  // CTA antigos
  'cta_basic': 'chamada_final_simple_glass',
  'cta_background': 'chamada_final_two_ctas',
  'cta_glass': 'chamada_final_ticket_glow',
  
  // Rodapé antigos
  'footer_basic': 'rodape_minimal_soft',
  'footer_columns': 'rodape_columns_glass',
  'footer_newsletter': 'rodape_visionos_bar',
};

// ============================================================
// UTILITÁRIOS
// ============================================================

export const SECTION_MODELS_BY_SECTION: Record<SectionKey, SectionModel[]> =
  SECTION_MODELS.reduce((acc, model) => {
    (acc[model.section] ||= []).push(model);
    return acc;
  }, {} as Record<SectionKey, SectionModel[]>);

/**
 * Retorna o modelo de seção pelo sectionKey e variant (modelId).
 * Se o variant for um ID legado, faz fallback para o novo ID equivalente.
 * Se não encontrar, retorna o primeiro modelo da seção (free).
 */
export function getSectionModel(section: SectionKey, variant?: string): SectionModel | undefined {
  const list = SECTION_MODELS_BY_SECTION[section] || [];
  if (!list.length) return undefined;
  
  if (!variant) return list[0];
  
  // Tenta encontrar pelo ID exato
  let found = list.find(v => v.id === variant);
  if (found) return found;
  
  // Tenta fallback de modelo legado
  const fallbackId = LEGACY_MODEL_FALLBACK[variant];
  if (fallbackId) {
    found = list.find(v => v.id === fallbackId);
    if (found) return found;
  }
  
  // Retorna primeiro modelo como fallback final
  return list[0];
}

/**
 * Retorna o ID do modelo resolvido (considerando fallbacks)
 */
export function resolveModelId(section: SectionKey, variant?: string): string {
  const model = getSectionModel(section, variant);
  return model?.id || SECTION_MODELS_BY_SECTION[section]?.[0]?.id || '';
}

/**
 * Verifica se um modelId é legado e precisa de migração
 */
export function isLegacyModelId(modelId: string): boolean {
  return modelId in LEGACY_MODEL_FALLBACK;
}

export const SECTION_DISPLAY_NAMES: Record<SectionKey, string> = {
  menu: 'Menu',
  hero: 'Hero',
  como_funciona: 'Como Funciona',
  para_quem_e: 'Para Quem É',
  beneficios: 'Benefícios',
  provas_sociais: 'Provas Sociais',
  planos: 'Planos',
  faq: 'FAQ',
  chamada_final: 'Chamada Final',
  rodape: 'Rodapé',
};

/**
 * Retorna todos os IDs de modelos para uma seção
 */
export function getModelIdsForSection(section: SectionKey): string[] {
  return (SECTION_MODELS_BY_SECTION[section] || []).map(m => m.id);
}

/**
 * Retorna o primeiro modelo free de uma seção (fallback seguro)
 */
export function getDefaultModel(section: SectionKey): SectionModel | undefined {
  const list = SECTION_MODELS_BY_SECTION[section] || [];
  return list.find(m => m.plan === 'free') || list[0];
}
