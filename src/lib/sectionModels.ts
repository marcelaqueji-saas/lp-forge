// ============================================================
// REGISTRO CENTRAL DE MODELOS DE SEÇÃO (Section Models Registry)
// noBRon - SaaS Landing Page Builder
// v3.0 - Catálogo Simplificado e 100% Editável
// ============================================================
// 
// AUDITORIA SIMPLIFICAÇÃO (v3.0):
// - ANTES: 62+ modelos (com duplicados e modelos sem suporte editável)
// - DEPOIS: 46 modelos (todos editáveis, sem duplicados)
// 
// REMOVIDOS:
// - hero_carousel_autoplay (HeroCarousel sem HeroCarouselEditable)
// - hero_parallax_layers (HeroParallax sem HeroParallaxEditable)
// - provas_sociais_stories (StoriesCarousel sem StoriesCarouselEditable)
// - provas_sociais_logos_scroller duplicado
// - provas_sociais_carrossel_premium duplicado
// - provas_sociais_stats_hybrid duplicado
// 
// MANTIDOS:
// - Todos modelos base por seção (usam componentes genéricos)
// - Todos modelos com style presets (dark/neon/minimal) - Editables suportam via stylePreset
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

export type ModelCategory = 
  | 'navigation'
  | 'hero'
  | 'content'
  | 'social'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'footer';

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
// NOMES DE EXIBIÇÃO DAS SEÇÕES
// ============================================================

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
// CATÁLOGO SIMPLIFICADO v3.0 - 46 MODELOS EDITÁVEIS
// ============================================================

export const SECTION_MODELS: SectionModel[] = [
  // ============================================================
  // MENU (6 modelos: 3 base + 3 style)
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
    name: 'Menu command center',
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
  {
    id: 'menu_dark',
    section: 'menu',
    name: 'Menu Dark',
    description: 'Menu em tema escuro',
    plan: 'pro',
    category: 'navigation',
    component: 'MenuSection',
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
    component: 'MenuSection',
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
    component: 'MenuSection',
    thumbnail: '/thumbnails/menu/menu_minimal_preset.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: MENU_FIELDS,
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
    hasJsonEditor: true,
  },

  // ============================================================
  // HERO (7 modelos: 4 base + 3 style)
  // REMOVIDOS: hero_carousel_autoplay, hero_parallax_layers (sem editables)
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
    name: 'Hero vídeo spotlight',
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
  {
    id: 'hero_dark',
    section: 'hero',
    name: 'Hero Dark Mode',
    description: 'Hero com tema escuro elegante',
    plan: 'pro',
    category: 'hero',
    component: 'Hero',
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
    component: 'Hero',
    thumbnail: '/thumbnails/hero/hero_neon.webp',
    stylePreset: 'neon',
    motionPreset: 'spotlight',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
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
  // BENEFÍCIOS (6 modelos: 3 base + 3 style)
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
  {
    id: 'beneficios_dark',
    section: 'beneficios',
    name: 'Benefícios Dark',
    description: 'Grid de benefícios em tema escuro',
    plan: 'pro',
    category: 'content',
    component: 'Beneficios',
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
    component: 'Beneficios',
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
    component: 'Beneficios',
    thumbnail: '/thumbnails/beneficios/beneficios_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // PROVAS SOCIAIS (7 modelos: 4 base + 3 style)
  // REMOVIDOS: provas_sociais_stories, duplicados
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
    id: 'provas_sociais_dark',
    section: 'provas_sociais',
    name: 'Depoimentos Dark',
    description: 'Depoimentos em tema escuro',
    plan: 'pro',
    category: 'social',
    component: 'ProvasSociais',
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
    component: 'ProvasSociais',
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
    component: 'ProvasSociais',
    thumbnail: '/thumbnails/provas_sociais/provas_sociais_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // PLANOS (6 modelos: 3 base + 3 style)
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
  {
    id: 'planos_dark',
    section: 'planos',
    name: 'Planos Dark',
    description: 'Tabela de preços em tema escuro',
    plan: 'pro',
    category: 'pricing',
    component: 'Planos',
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
    component: 'Planos',
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
    component: 'Planos',
    thumbnail: '/thumbnails/planos/planos_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // FAQ (6 modelos: 3 base + 3 style)
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
  {
    id: 'faq_dark',
    section: 'faq',
    name: 'FAQ Dark',
    description: 'FAQ em tema escuro elegante',
    plan: 'pro',
    category: 'faq',
    component: 'FAQ',
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
    component: 'FAQ',
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
    component: 'FAQ',
    thumbnail: '/thumbnails/faq/faq_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'accordion',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // CHAMADA FINAL (6 modelos: 3 base + 3 style)
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
  {
    id: 'cta_dark',
    section: 'chamada_final',
    name: 'CTA Dark',
    description: 'Chamada final em tema escuro',
    plan: 'pro',
    category: 'cta',
    component: 'ChamadaFinal',
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
    component: 'ChamadaFinal',
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
    component: 'ChamadaFinal',
    thumbnail: '/thumbnails/chamada_final/cta_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: CTA_FIELDS,
  },

  // ============================================================
  // RODAPÉ (6 modelos: 3 base + 3 style)
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
  {
    id: 'rodape_dark',
    section: 'rodape',
    name: 'Rodapé Dark',
    description: 'Rodapé em tema escuro',
    plan: 'pro',
    category: 'footer',
    component: 'Rodape',
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
    component: 'Rodape',
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
    component: 'Rodape',
    thumbnail: '/thumbnails/rodape/rodape_minimal.webp',
    stylePreset: 'minimal',
    motionPreset: 'fade-stagger',
    fields: FOOTER_FIELDS,
    hasJsonEditor: true,
  },
];

// ============================================================
// HELPERS E INDEXAÇÃO
// ============================================================

/**
 * Modelos indexados por seção para lookup rápido
 */
export const SECTION_MODELS_BY_SECTION: Record<SectionKey, SectionModel[]> = 
  SECTION_MODELS.reduce((acc, model) => {
    if (!acc[model.section]) {
      acc[model.section] = [];
    }
    acc[model.section].push(model);
    return acc;
  }, {} as Record<SectionKey, SectionModel[]>);

/**
 * Busca um modelo específico por seção e ID
 */
export function getSectionModel(section: SectionKey, modelId?: string): SectionModel | undefined {
  const models = SECTION_MODELS_BY_SECTION[section];
  if (!models || models.length === 0) return undefined;
  
  if (modelId) {
    const found = models.find(m => m.id === modelId);
    if (found) return found;
  }
  
  return models[0];
}

/**
 * Retorna o primeiro modelo (default) de uma seção
 */
export function getDefaultModel(section: SectionKey): SectionModel | undefined {
  return SECTION_MODELS_BY_SECTION[section]?.[0];
}

/**
 * Filtra modelos por plano do usuário
 */
export function getModelsForPlan(section: SectionKey, userPlan: PlanLevelWithMaster): SectionModel[] {
  const models = SECTION_MODELS_BY_SECTION[section] || [];
  
  if (userPlan === 'master') return models;
  
  const planHierarchy: Record<PlanLevel, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  
  const userLevel = planHierarchy[userPlan as PlanLevel] ?? 0;
  
  return models.filter(model => {
    const modelLevel = planHierarchy[model.plan] ?? 0;
    return modelLevel <= userLevel;
  });
}

/**
 * Mapeia variante/modelId para layout normalizado (modelo_a/b/c)
 * Usado pelos componentes *Editable para determinar qual layout renderizar
 */
export function getLayoutVariant(modelIdOrVariant?: string): string {
  if (!modelIdOrVariant) return 'modelo_a';
  
  // Se já é modelo_a/b/c, retorna direto
  if (modelIdOrVariant.startsWith('modelo_')) {
    return modelIdOrVariant;
  }
  
  // Mapeamento de modelId para layout
  const layoutMap: Record<string, string> = {
    // Hero layouts
    'hero_glass_aurora': 'modelo_a',
    'hero_cinematic_video_spotlight': 'modelo_c',
    'hero_ticket_launch': 'modelo_a',
    'hero_split_visionos': 'modelo_a',
    'hero_minimal_centered': 'modelo_b',
    'hero_dark': 'modelo_a',
    'hero_neon': 'modelo_a',
    
    // Menu - todos usam mesmo layout base
    'menu_glass_minimal': 'modelo_a',
    'menu_visionos_floating': 'modelo_a',
    'menu_command_center': 'modelo_a',
    'menu_dark': 'modelo_a',
    'menu_neon': 'modelo_a',
    'menu_minimal_preset': 'modelo_a',
    
    // Como Funciona
    'como_funciona_timeline_glass': 'modelo_a',
    'como_funciona_steps_cards_3d': 'modelo_a',
    'como_funciona_horizontal_flow': 'modelo_a',
    
    // Para Quem É
    'para_quem_e_chips_personas': 'modelo_a',
    'para_quem_e_personas_cards': 'modelo_a',
    'para_quem_e_matrix': 'modelo_a',
    
    // Benefícios
    'beneficios_icon_grid_glass': 'modelo_a',
    'beneficios_timeline_numerada': 'modelo_a',
    'beneficios_showcase_3d': 'modelo_a',
    'beneficios_dark': 'modelo_a',
    'beneficios_neon': 'modelo_a',
    'beneficios_minimal': 'modelo_a',
    
    // Provas Sociais
    'provas_sociais_depoimentos_glass': 'modelo_a',
    'provas_sociais_carrossel_premium': 'modelo_a',
    'provas_sociais_stats_hybrid': 'modelo_a',
    'provas_sociais_featured_single': 'modelo_a',
    'provas_sociais_dark': 'modelo_a',
    'provas_sociais_neon': 'modelo_a',
    'provas_sociais_minimal': 'modelo_a',
    
    // Planos
    'planos_glass_three_tiers': 'modelo_a',
    'planos_cards_pill': 'modelo_a',
    'planos_tabela_comparativa_modern': 'modelo_a',
    'planos_dark': 'modelo_a',
    'planos_neon': 'modelo_a',
    'planos_minimal': 'modelo_a',
    
    // FAQ
    'faq_accordion_glass': 'modelo_a',
    'faq_twocolumn_modern': 'modelo_a',
    'faq_with_cta_spotlight': 'modelo_a',
    'faq_dark': 'modelo_a',
    'faq_neon': 'modelo_a',
    'faq_minimal': 'modelo_a',
    
    // Chamada Final
    'chamada_final_simple_glass': 'modelo_a',
    'chamada_final_two_ctas': 'modelo_a',
    'chamada_final_ticket_glow': 'modelo_a',
    'cta_dark': 'modelo_a',
    'cta_neon': 'modelo_a',
    'cta_minimal': 'modelo_a',
    
    // Rodapé
    'rodape_minimal_soft': 'modelo_a',
    'rodape_columns_glass': 'modelo_a',
    'rodape_visionos_bar': 'modelo_a',
    'rodape_dark': 'modelo_a',
    'rodape_neon': 'modelo_a',
    'rodape_minimal': 'modelo_a',
  };
  
  return layoutMap[modelIdOrVariant] || 'modelo_a';
}

/**
 * Retorna o stylePreset de um modelo
 */
export function getModelStylePreset(modelId?: string): StylePreset {
  if (!modelId) return 'glass';
  
  const model = SECTION_MODELS.find(m => m.id === modelId);
  return model?.stylePreset || 'glass';
}

// ============================================================
// ESTATÍSTICAS DO CATÁLOGO v3.0
// ============================================================
// Total de modelos: 46
// - Menu: 6 modelos
// - Hero: 7 modelos
// - Como Funciona: 3 modelos
// - Para Quem É: 3 modelos
// - Benefícios: 6 modelos
// - Provas Sociais: 7 modelos
// - Planos: 6 modelos
// - FAQ: 6 modelos
// - Chamada Final: 6 modelos
// - Rodapé: 6 modelos
// 
// Todos os modelos são 100% editáveis via componentes *Editable genéricos
// Variações visuais (dark/neon/minimal) aplicadas via stylePreset
// ============================================================
