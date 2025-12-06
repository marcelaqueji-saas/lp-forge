// ============================================================
// REGISTRO CENTRAL DE MODELOS DE SEÇÃO (Section Models Registry)
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

type FieldType = 'text' | 'textarea' | 'url';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
}

export interface ImageConfig {
  key: string;
  label: string;
}

export interface SectionModel {
  id: string;          // ex: 'hero-basic'
  section: SectionKey; // ex: 'hero'
  name: string;
  description?: string;
  plan: PlanLevel;
  fields?: FieldConfig[];
  images?: ImageConfig[];
  hasJsonEditor?: boolean;
  component?: string;  // Nome do componente React
}

// ============================================================
// CAMPOS PADRÃO REUTILIZÁVEIS
// ============================================================

const HERO_FIELDS: FieldConfig[] = [
  { key: 'badge', label: 'Badge/Tag', type: 'text' },
  { key: 'titulo', label: 'Título', type: 'text' },
  { key: 'destaque', label: 'Texto em destaque', type: 'text' },
  { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
  { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
  { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
  { key: 'texto_botao_secundario', label: 'Texto botão secundário', type: 'text' },
  { key: 'url_botao_secundario', label: 'URL botão secundário', type: 'url' },
];

const SECTION_TITLE_FIELDS: FieldConfig[] = [
  { key: 'titulo', label: 'Título', type: 'text' },
  { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
];

const CTA_FIELDS: FieldConfig[] = [
  { key: 'titulo', label: 'Título', type: 'text' },
  { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
  { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
  { key: 'url_botao', label: 'URL do botão', type: 'url' },
];

// ============================================================
// DEFINIÇÃO DOS MODELOS DE SEÇÃO - CATÁLOGO COMPLETO
// ============================================================

export const SECTION_MODELS: SectionModel[] = [
  // ─────────────────────────────────────────────────────────
  // MENU
  // ─────────────────────────────────────────────────────────
  {
    id: 'menu-modelo_a',
    section: 'menu',
    name: 'Menu Horizontal',
    description: 'Logo à esquerda, links à direita',
    plan: 'free',
    component: 'MenuSection',
    fields: [
      { key: 'brand_name', label: 'Nome/Brand', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão principal', type: 'text' },
      { key: 'cta_url', label: 'URL do botão principal', type: 'url' },
    ],
    images: [{ key: 'menu_logo_url', label: 'Logo do menu' }],
    hasJsonEditor: true,
  },
  {
    id: 'menu-modelo_b',
    section: 'menu',
    name: 'Menu Centralizado',
    description: 'Logo centralizado, links abaixo',
    plan: 'free',
    component: 'MenuSection',
    fields: [
      { key: 'brand_name', label: 'Nome/Brand', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão principal', type: 'text' },
      { key: 'cta_url', label: 'URL do botão principal', type: 'url' },
    ],
    images: [{ key: 'menu_logo_url', label: 'Logo do menu' }],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // HERO
  // ─────────────────────────────────────────────────────────
  {
    id: 'hero-basic',
    section: 'hero',
    name: 'Hero Simples',
    description: 'Título, subtítulo e um botão principal',
    plan: 'free',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'hero_image_url', label: 'Imagem principal' }],
  },
  {
    id: 'hero-modelo_a',
    section: 'hero',
    name: 'Hero Clássico',
    description: 'Imagem à direita, texto à esquerda',
    plan: 'free',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [
      { key: 'hero_image_url', label: 'Imagem principal' },
      { key: 'hero_background_url', label: 'Imagem de fundo' },
    ],
  },
  {
    id: 'hero-side-image',
    section: 'hero',
    name: 'Hero com Imagem Lateral',
    description: 'Texto à esquerda com imagem grande ao lado',
    plan: 'free',
    component: 'HeroSideImage',
    fields: HERO_FIELDS,
    images: [{ key: 'hero_image_url', label: 'Imagem lateral' }],
  },
  {
    id: 'hero-modelo_b',
    section: 'hero',
    name: 'Hero Centralizado',
    description: 'Texto centralizado com imagem abaixo',
    plan: 'free',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'hero_image_url', label: 'Imagem principal' }],
  },
  {
    id: 'hero-modelo_c',
    section: 'hero',
    name: 'Hero Impactante',
    description: 'Imagem de fundo com texto sobreposto',
    plan: 'free',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'hero_background_url', label: 'Imagem de fundo' }],
  },
  {
    id: 'hero-dashboard',
    section: 'hero',
    name: 'Hero com Dashboard',
    description: 'Hero com mockup do sistema e cards flutuantes',
    plan: 'pro',
    component: 'HeroDashboard',
    fields: HERO_FIELDS,
    images: [{ key: 'mockup_image', label: 'Imagem do dashboard' }],
  },
  {
    id: 'hero-cards',
    section: 'hero',
    name: 'Hero com Cards',
    description: 'Hero com cards de features destacados',
    plan: 'pro',
    component: 'HeroCards',
    fields: HERO_FIELDS,
    images: [{ key: 'hero_image_url', label: 'Imagem principal' }],
  },
  {
    id: 'hero-parallax',
    section: 'hero',
    name: 'Hero Parallax',
    description: 'Hero fullscreen com camadas em parallax',
    plan: 'pro',
    component: 'HeroParallax',
    fields: HERO_FIELDS,
    images: [{ key: 'hero_background_url', label: 'Imagem de fundo' }],
  },
  {
    id: 'hero-split',
    section: 'hero',
    name: 'Hero Split',
    description: 'Colunas verticais interativas com hover',
    plan: 'pro',
    component: 'HeroSplit',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
    ],
  },
  {
    id: 'hero-cinematic-video',
    section: 'hero',
    name: 'Hero Cinematic Video',
    description: 'Hero com vídeo de fundo em fullscreen',
    plan: 'premium',
    component: 'HeroCinematicVideo',
    fields: [
      ...HERO_FIELDS,
      { key: 'video_url', label: 'URL do vídeo', type: 'url' },
    ],
  },
  {
    id: 'hero-parallax-glass',
    section: 'hero',
    name: 'Hero Parallax Glass',
    description: 'Hero com efeito glass e parallax avançado',
    plan: 'premium',
    component: 'HeroParallaxGlass',
    fields: HERO_FIELDS,
    images: [
      { key: 'hero_background_url', label: 'Imagem de fundo' },
      { key: 'hero_foreground_url', label: 'Elemento frontal' },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // COMO FUNCIONA
  // ─────────────────────────────────────────────────────────
  {
    id: 'steps-basic',
    section: 'como_funciona',
    name: 'Passos Básico',
    description: 'Cards numerados em linha horizontal',
    plan: 'free',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'como_funciona-modelo_a',
    section: 'como_funciona',
    name: 'Passos Horizontais',
    description: 'Cards em linha horizontal',
    plan: 'free',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'steps-icons',
    section: 'como_funciona',
    name: 'Passos com Ícones',
    description: 'Passos com ícones destacados e conexões visuais',
    plan: 'pro',
    component: 'StepsIcons',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'como_funciona-modelo_b',
    section: 'como_funciona',
    name: 'Timeline Vertical',
    description: 'Lista vertical com ícones',
    plan: 'free',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'steps-image-left',
    section: 'como_funciona',
    name: 'Passos com Imagem',
    description: 'Imagem grande à esquerda, passos à direita',
    plan: 'pro',
    component: 'StepsImageLeft',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'steps_image_url', label: 'Imagem ilustrativa' }],
    hasJsonEditor: true,
  },
  {
    id: 'steps-vertical-timeline',
    section: 'como_funciona',
    name: 'Timeline Vertical Premium',
    description: 'Timeline vertical com animações e ícones',
    plan: 'premium',
    component: 'StepsVerticalTimeline',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // PARA QUEM É
  // ─────────────────────────────────────────────────────────
  {
    id: 'target-basic',
    section: 'para_quem_e',
    name: 'Perfis Básico',
    description: 'Lista simples de perfis alvo',
    plan: 'free',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'para_quem_e-modelo_a',
    section: 'para_quem_e',
    name: 'Cards de Perfil',
    description: 'Perfis em cards lado a lado',
    plan: 'free',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'target-grid',
    section: 'para_quem_e',
    name: 'Grid de Perfis',
    description: 'Perfis em grid responsivo com ícones',
    plan: 'pro',
    component: 'TargetGrid',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'para_quem_e-modelo_b',
    section: 'para_quem_e',
    name: 'Lista com Checks',
    description: 'Lista com checks e descrições',
    plan: 'free',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'target-cards',
    section: 'para_quem_e',
    name: 'Cards Interativos',
    description: 'Cards com hover e destaque',
    plan: 'pro',
    component: 'TargetCards',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'target-avatars',
    section: 'para_quem_e',
    name: 'Perfis com Avatares',
    description: 'Cards com avatares e descrições detalhadas',
    plan: 'premium',
    component: 'TargetAvatars',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'default_avatar_url', label: 'Avatar padrão' }],
    hasJsonEditor: true,
  },
  {
    id: 'target-lit-line',
    section: 'para_quem_e',
    name: 'Linha Iluminada',
    description: 'Perfis conectados por linha animada',
    plan: 'premium',
    component: 'TargetLitLine',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // BENEFÍCIOS
  // ─────────────────────────────────────────────────────────
  {
    id: 'benefits-basic',
    section: 'beneficios',
    name: 'Lista de Benefícios',
    description: 'Lista simples de benefícios',
    plan: 'free',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-modelo_a',
    section: 'beneficios',
    name: 'Grid de Benefícios',
    description: 'Benefícios em grid de cards',
    plan: 'free',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'beneficios_illustration_url', label: 'Ilustração' }],
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-modelo_b',
    section: 'beneficios',
    name: 'Lista Vertical',
    description: 'Lista vertical com ícones',
    plan: 'free',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-modelo_c',
    section: 'beneficios',
    name: 'Alternado',
    description: 'Ícones grandes alternados',
    plan: 'free',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits-carousel',
    section: 'beneficios',
    name: 'Carrossel de Benefícios',
    description: 'Benefícios em carrossel deslizante',
    plan: 'pro',
    component: 'BenefitsCarousel',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits-bento-grid',
    section: 'beneficios',
    name: 'Bento Grid',
    description: 'Layout bento moderno com tamanhos variados',
    plan: 'pro',
    component: 'BenefitsBentoGrid',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-showcase_3d',
    section: 'beneficios',
    name: '3D Cards Slider',
    description: 'Cards em 3D com rotação',
    plan: 'pro',
    component: 'Cards3DShowcase',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-features_float',
    section: 'beneficios',
    name: 'Float Minimal',
    description: 'Benefícios com flutuação leve',
    plan: 'free',
    component: 'FeaturesFloat',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits-pictures',
    section: 'beneficios',
    name: 'Benefícios com Imagens',
    description: 'Cada benefício com sua própria imagem',
    plan: 'premium',
    component: 'BenefitsPictures',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits-motion-icons',
    section: 'beneficios',
    name: 'Ícones Animados',
    description: 'Benefícios com ícones em motion',
    plan: 'premium',
    component: 'BenefitsMotionIcons',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // PROVAS SOCIAIS
  // ─────────────────────────────────────────────────────────
  {
    id: 'testimonials-basic',
    section: 'provas_sociais',
    name: 'Depoimentos Básico',
    description: 'Cards de depoimentos simples',
    plan: 'free',
    component: 'ProvasSociais',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais-modelo_a',
    section: 'provas_sociais',
    name: 'Carrossel',
    description: 'Depoimentos em carrossel',
    plan: 'free',
    component: 'ProvasSociais',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    images: [{ key: 'provas_avatar_default_url', label: 'Avatar padrão' }],
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais-modelo_b',
    section: 'provas_sociais',
    name: 'Grid de Depoimentos',
    description: 'Cards de depoimentos em grid',
    plan: 'free',
    component: 'ProvasSociais',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'testimonials-slider',
    section: 'provas_sociais',
    name: 'Slider de Depoimentos',
    description: 'Slider suave com autoplay',
    plan: 'pro',
    component: 'TestimonialsSlider',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'testimonials-cards',
    section: 'provas_sociais',
    name: 'Cards Premium',
    description: 'Cards com design moderno e animações',
    plan: 'pro',
    component: 'TestimonialsCards',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais-modelo_c',
    section: 'provas_sociais',
    name: 'Destaque Principal',
    description: 'Um destaque grande + menores',
    plan: 'free',
    component: 'ProvasSociais',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais-testimonial_cinematic',
    section: 'provas_sociais',
    name: 'Cinematic',
    description: 'Depoimento central com fade/shadow',
    plan: 'pro',
    component: 'TestimonialCinematic',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'testimonials-profile-feed',
    section: 'provas_sociais',
    name: 'Feed de Perfis',
    description: 'Estilo feed de redes sociais',
    plan: 'premium',
    component: 'TestimonialsProfileFeed',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'testimonials-video-grid',
    section: 'provas_sociais',
    name: 'Grid de Vídeos',
    description: 'Depoimentos em vídeo em grid',
    plan: 'premium',
    component: 'TestimonialsVideoGrid',
    fields: [{ key: 'titulo', label: 'Título', type: 'text' }],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // PLANOS
  // ─────────────────────────────────────────────────────────
  {
    id: 'pricing-basic',
    section: 'planos',
    name: 'Planos Básico',
    description: 'Cards de planos simples',
    plan: 'free',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'planos-modelo_a',
    section: 'planos',
    name: 'Colunas com Destaque',
    description: 'Planos em colunas com destaque',
    plan: 'free',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'planos_illustration_url', label: 'Ilustração' }],
    hasJsonEditor: true,
  },
  {
    id: 'pricing-feature-grid',
    section: 'planos',
    name: 'Grid de Features',
    description: 'Comparação de features em grid',
    plan: 'pro',
    component: 'PricingFeatureGrid',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'planos-modelo_b',
    section: 'planos',
    name: 'Cards Horizontais',
    description: 'Cards horizontais com detalhes',
    plan: 'free',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'pricing-tabs',
    section: 'planos',
    name: 'Planos com Tabs',
    description: 'Alternância mensal/anual com tabs',
    plan: 'pro',
    component: 'PricingTabs',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // FAQ
  // ─────────────────────────────────────────────────────────
  {
    id: 'faq-accordion',
    section: 'faq',
    name: 'Acordeão',
    description: 'Perguntas expansíveis em acordeão',
    plan: 'free',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq-modelo_a',
    section: 'faq',
    name: 'Acordeão Clássico',
    description: 'Perguntas expansíveis',
    plan: 'free',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq-cards',
    section: 'faq',
    name: 'FAQ em Cards',
    description: 'Perguntas em cards individuais',
    plan: 'pro',
    component: 'FAQCards',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq-modelo_b',
    section: 'faq',
    name: 'Duas Colunas',
    description: 'Perguntas em duas colunas',
    plan: 'free',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq-sections',
    section: 'faq',
    name: 'FAQ por Categorias',
    description: 'Perguntas organizadas por categoria',
    plan: 'pro',
    component: 'FAQSections',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // CHAMADA FINAL
  // ─────────────────────────────────────────────────────────
  {
    id: 'cta-basic',
    section: 'chamada_final',
    name: 'CTA Básico',
    description: 'CTA simples e direto',
    plan: 'free',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
  },
  {
    id: 'chamada_final-modelo_a',
    section: 'chamada_final',
    name: 'CTA Centralizado',
    description: 'CTA centralizado com destaque',
    plan: 'free',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
    images: [{ key: 'chamada_background_url', label: 'Imagem de fundo' }],
  },
  {
    id: 'chamada_final-modelo_b',
    section: 'chamada_final',
    name: 'CTA com Imagem',
    description: 'CTA com imagem de fundo',
    plan: 'free',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
    images: [{ key: 'chamada_background_url', label: 'Imagem de fundo' }],
  },
  {
    id: 'cta-showcase',
    section: 'chamada_final',
    name: 'CTA Showcase',
    description: 'CTA com preview do produto',
    plan: 'pro',
    component: 'CTAShowcase',
    fields: CTA_FIELDS,
    images: [{ key: 'showcase_image_url', label: 'Imagem do produto' }],
  },
  {
    id: 'chamada_final-modelo_c',
    section: 'chamada_final',
    name: 'CTA Minimalista',
    description: 'Design limpo e direto',
    plan: 'free',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
  },
  {
    id: 'cta-banner-glass',
    section: 'chamada_final',
    name: 'CTA Banner Glass',
    description: 'Banner com efeito glass moderno',
    plan: 'pro',
    component: 'CTABannerGlass',
    fields: CTA_FIELDS,
    images: [{ key: 'chamada_background_url', label: 'Imagem de fundo' }],
  },
  {
    id: 'chamada_final-cta_final_animated',
    section: 'chamada_final',
    name: 'CTA Animado',
    description: 'Partículas flutuantes e botão animado',
    plan: 'free',
    component: 'CTAFinal',
    fields: CTA_FIELDS,
  },

  // ─────────────────────────────────────────────────────────
  // RODAPÉ
  // ─────────────────────────────────────────────────────────
  {
    id: 'footer-basic',
    section: 'rodape',
    name: 'Rodapé Básico',
    description: 'Rodapé simples com copyright',
    plan: 'free',
    component: 'Rodape',
    fields: [{ key: 'copyright', label: 'Texto de copyright', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'rodape-modelo_a',
    section: 'rodape',
    name: 'Linha Única',
    description: 'Copyright e links na mesma linha',
    plan: 'free',
    component: 'Rodape',
    fields: [{ key: 'copyright', label: 'Texto de copyright', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'footer-columns',
    section: 'rodape',
    name: 'Rodapé com Colunas',
    description: 'Rodapé com múltiplas colunas de links',
    plan: 'pro',
    component: 'FooterColumns',
    fields: [
      { key: 'copyright', label: 'Texto de copyright', type: 'text' },
      { key: 'brand_name', label: 'Nome da marca', type: 'text' },
    ],
    hasJsonEditor: true,
  },
  {
    id: 'rodape-modelo_b',
    section: 'rodape',
    name: 'Duas Linhas',
    description: 'Links acima, copyright abaixo',
    plan: 'free',
    component: 'Rodape',
    fields: [{ key: 'copyright', label: 'Texto de copyright', type: 'text' }],
    hasJsonEditor: true,
  },
];

// ============================================================
// UTILITÁRIOS
// ============================================================

/**
 * Agrupa modelos por seção
 */
export const SECTION_MODELS_BY_SECTION: Record<SectionKey, SectionModel[]> =
  SECTION_MODELS.reduce((acc, model) => {
    (acc[model.section] ||= []).push(model);
    return acc;
  }, {} as Record<SectionKey, SectionModel[]>);

/**
 * Obtém um modelo específico por seção e variante
 * Se não encontrar a variante especificada, retorna o primeiro modelo da seção
 */
export function getSectionModel(section: SectionKey, variant?: string): SectionModel | undefined {
  const all = SECTION_MODELS_BY_SECTION[section] || [];
  
  if (!variant) {
    return all[0];
  }
  
  // Tenta encontrar pelo id exato
  let found = all.find((m) => m.id === variant);
  if (found) return found;
  
  // Tenta encontrar por sufixo (ex: 'modelo_a' -> 'hero-modelo_a')
  found = all.find((m) => m.id === `${section}-${variant}`);
  if (found) return found;
  
  // Tenta encontrar pelo nome da variante legado
  found = all.find((m) => m.id.endsWith(`-${variant}`));
  if (found) return found;
  
  // Fallback para o primeiro modelo da seção
  return all[0];
}

/**
 * Obtém modelo por ID único
 */
export function getModelById(modelId: string): SectionModel | undefined {
  return SECTION_MODELS.find(m => m.id === modelId);
}

/**
 * Lista de seções disponíveis
 */
export const SECTION_KEYS: SectionKey[] = [
  'menu',
  'hero',
  'como_funciona',
  'para_quem_e',
  'beneficios',
  'provas_sociais',
  'planos',
  'faq',
  'chamada_final',
  'rodape',
];

/**
 * Nomes amigáveis para exibição
 */
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
