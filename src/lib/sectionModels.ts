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

export type ModelCategory = 
  | 'navigation'
  | 'hero'
  | 'content'
  | 'social'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'footer';

type FieldType = 'text' | 'textarea' | 'url';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
}

export interface ImageConfig {
  key: string;
  label: string;
  maxSizeMB?: number; // controle de custos de storage
  aspectRatio?: string; // ratio recomendado do template
}

export interface SectionModel {
  id: string;
  section: SectionKey;
  name: string;
  description?: string;
  plan: PlanLevel;
  category: ModelCategory;
  fields?: FieldConfig[];
  images?: ImageConfig[];
  hasJsonEditor?: boolean;
  component: string;
  thumbnail?: string;
}

// ============================================================
// CAMPOS PADRÃO REUTILIZÁVEIS
// ============================================================

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
  { key: 'cta_label', label: 'Texto do botão', type: 'text' },
  { key: 'cta_url', label: 'URL do botão', type: 'url' },
];

export const SECTION_MODEL_KEY = '__model_id';


// ============================================================
// MODELOS DE SEÇÃO - CATÁLOGO ESCALADO
// Base: Visual Apple Glass em todas as seções
// ============================================================

export const SECTION_MODELS: SectionModel[] = [
  // ============================================================
  // MENU (4 modelos)
  // ============================================================
  {
    id: 'menu_horizontal',
    section: 'menu',
    name: 'Menu Horizontal',
    description: 'Logo à esquerda e navegação à direita',
    plan: 'free',
    category: 'navigation',
    component: 'MenuSection',
    fields: [
      { key: 'marca', label: 'Marca', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão', type: 'text' },
      { key: 'cta_url', label: 'URL do botão', type: 'url' },
    ],
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1, aspectRatio: '1:1' }],
  },
  {
    id: 'menu_centered',
    section: 'menu',
    name: 'Menu Centralizado',
    description: 'Logo no centro com links laterais',
    plan: 'pro',
    category: 'navigation',
    component: 'MenuSection',
    fields: [
      { key: 'marca', label: 'Marca', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão', type: 'text' },
      { key: 'cta_url', label: 'URL do botão', type: 'url' },
    ],
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1 }],
  },
  {
    id: 'menu_sticky_glass',
    section: 'menu',
    name: 'Menu Sticky Glass',
    description: 'Menu fixo com efeito glassmorphism',
    plan: 'pro',
    category: 'navigation',
    component: 'MenuSection',
    fields: [
      { key: 'marca', label: 'Marca', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão', type: 'text' },
      { key: 'cta_url', label: 'URL do botão', type: 'url' },
    ],
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1 }],
  },
  {
    id: 'menu_minimal',
    section: 'menu',
    name: 'Menu Minimalista',
    description: 'Apenas logo e CTA, sem navegação',
    plan: 'premium',
    category: 'navigation',
    component: 'MenuSection',
    fields: [
      { key: 'marca', label: 'Marca', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão', type: 'text' },
      { key: 'cta_url', label: 'URL do botão', type: 'url' },
    ],
    images: [{ key: 'logo', label: 'Logo', maxSizeMB: 1 }],
  },

  // ============================================================
  // HERO (8 modelos)
  // ============================================================
  {
    id: 'hero_basic',
    section: 'hero',
    name: 'Simples e Centralizado',
    description: 'Texto centralizado com CTA destacado',
    plan: 'free',
    category: 'hero',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  {
    id: 'hero_center',
    section: 'hero',
    name: 'Hero Center',
    description: 'Layout centralizado minimalista',
    plan: 'free',
    category: 'hero',
    component: 'HeroCenter',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem', maxSizeMB: 2 }],
  },
  {
    id: 'hero_split',
    section: 'hero',
    name: 'Split Layout',
    description: 'Texto de um lado, imagem do outro',
    plan: 'pro',
    category: 'hero',
    component: 'HeroSplitBasic',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem lateral', maxSizeMB: 3 }],
  },
  {
    id: 'hero_split_reverse',
    section: 'hero',
    name: 'Split Invertido',
    description: 'Imagem à esquerda, texto à direita',
    plan: 'pro',
    category: 'hero',
    component: 'HeroSplitBasic',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem lateral', maxSizeMB: 3 }],
  },
  {
    id: 'hero_gradient',
    section: 'hero',
    name: 'Hero com Gradiente',
    description: 'Fundo gradiente vibrante',
    plan: 'pro',
    category: 'hero',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem', maxSizeMB: 2 }],
  },
  {
    id: 'hero_video_cinematic',
    section: 'hero',
    name: 'Vídeo Cinemático',
    description: 'Hero fullscreen com vídeo de fundo',
    plan: 'premium',
    category: 'hero',
    component: 'HeroCinematicVideo',
    fields: [
      ...HERO_FIELDS,
      { key: 'video_url', label: 'URL do vídeo', type: 'url' },
    ],
    images: [],
  },
  {
    id: 'hero_parallax',
    section: 'hero',
    name: 'Hero Parallax',
    description: 'Efeito parallax com múltiplas camadas',
    plan: 'premium',
    category: 'hero',
    component: 'HeroParallax',
    fields: HERO_FIELDS,
    images: [
      { key: 'imagem', label: 'Imagem de fundo', maxSizeMB: 3 },
      { key: 'imagem_frente', label: 'Imagem frontal', maxSizeMB: 2 },
    ],
  },
  {
    id: 'hero_animated_text',
    section: 'hero',
    name: 'Texto Animado',
    description: 'Título com animação typewriter',
    plan: 'premium',
    category: 'hero',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem', maxSizeMB: 2 }],
  },

  // ============================================================
  // COMO FUNCIONA (4 modelos)
  // ============================================================
  {
    id: 'steps_basic',
    section: 'como_funciona',
    name: '3 passos básicos',
    description: 'Passos numerados em linha',
    plan: 'free',
    category: 'content',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'steps_timeline',
    section: 'como_funciona',
    name: 'Timeline Vertical',
    description: 'Linha do tempo com ícones',
    plan: 'pro',
    category: 'content',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'steps_zigzag',
    section: 'como_funciona',
    name: 'Zig-Zag Alternado',
    description: 'Passos alternando lados',
    plan: 'pro',
    category: 'content',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'steps_cards',
    section: 'como_funciona',
    name: 'Cards Ilustrados',
    description: 'Passos em cards com ilustrações',
    plan: 'premium',
    category: 'content',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // ============================================================
  // PARA QUEM É (4 modelos)
  // ============================================================
  {
    id: 'target_basic',
    section: 'para_quem_e',
    name: 'Perfis com ícones',
    description: 'Lista simples de perfis',
    plan: 'free',
    category: 'content',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'target_cards',
    section: 'para_quem_e',
    name: 'Cards de Persona',
    description: 'Cards detalhados por persona',
    plan: 'pro',
    category: 'content',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'target_avatars',
    section: 'para_quem_e',
    name: 'Avatares com fotos',
    description: 'Perfis com fotos circulares',
    plan: 'premium',
    category: 'content',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'avatar_default', label: 'Avatar padrão', maxSizeMB: 1 }],
    hasJsonEditor: true,
  },

  // BENEFÍCIOS
  {
    id: 'benefits_basic',
    section: 'beneficios',
    name: 'Grid simples',
    description: 'Benefícios em grade 2x2 ou 3x3',
    plan: 'free',
    category: 'content',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits_icons',
    section: 'beneficios',
    name: 'Lista com ícones',
    description: 'Benefícios com ícones destacados',
    plan: 'pro',
    category: 'content',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits_bento',
    section: 'beneficios',
    name: 'Bento Grid',
    description: 'Layout moderno estilo Apple',
    plan: 'premium',
    category: 'content',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // PROVAS SOCIAIS
  {
    id: 'testimonials_basic',
    section: 'provas_sociais',
    name: 'Depoimentos simples',
    description: 'Cards de depoimento em grade',
    plan: 'free',
    category: 'social',
    component: 'ProvasSociais',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'testimonials_carousel',
    section: 'provas_sociais',
    name: 'Carrossel',
    description: 'Depoimentos em carrossel animado',
    plan: 'pro',
    category: 'social',
    component: 'ProvasSociais',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'testimonials_video',
    section: 'provas_sociais',
    name: 'Vídeo Depoimentos',
    description: 'Depoimentos em vídeo',
    plan: 'premium',
    category: 'social',
    component: 'ProvasSociais',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // PLANOS
  {
    id: 'pricing_basic',
    section: 'planos',
    name: 'Cards básicos',
    description: '2 ou 3 planos lado a lado',
    plan: 'free',
    category: 'pricing',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'pricing_highlight',
    section: 'planos',
    name: 'Destaque central',
    description: 'Plano do meio em destaque',
    plan: 'pro',
    category: 'pricing',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'pricing_comparison',
    section: 'planos',
    name: 'Tabela comparativa',
    description: 'Comparação detalhada de features',
    plan: 'premium',
    category: 'pricing',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // FAQ
  {
    id: 'faq_accordion',
    section: 'faq',
    name: 'Acordeão clássico',
    description: 'Perguntas expansíveis',
    plan: 'free',
    category: 'faq',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq_columns',
    section: 'faq',
    name: 'Duas colunas',
    description: 'FAQ em duas colunas',
    plan: 'pro',
    category: 'faq',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'faq_categorized',
    section: 'faq',
    name: 'Por categorias',
    description: 'FAQ organizado por temas',
    plan: 'premium',
    category: 'faq',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // CTA FINAL
  {
    id: 'cta_basic',
    section: 'chamada_final',
    name: 'CTA Simples',
    description: 'Texto e botão centralizados',
    plan: 'free',
    category: 'cta',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
  },
  {
    id: 'cta_background',
    section: 'chamada_final',
    name: 'CTA com Background',
    description: 'Fundo colorido ou com imagem',
    plan: 'pro',
    category: 'cta',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem de fundo', maxSizeMB: 2 }],
  },
  {
    id: 'cta_glass',
    section: 'chamada_final',
    name: 'CTA Glass Premium',
    description: 'Efeito glass com animações',
    plan: 'premium',
    category: 'cta',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem', maxSizeMB: 2 }],
  },

  // RODAPÉ
  {
    id: 'footer_basic',
    section: 'rodape',
    name: 'Simples',
    description: 'Uma linha com copyright',
    plan: 'free',
    category: 'footer',
    component: 'Rodape',
    fields: [{ key: 'copyright', label: 'Copyright', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'footer_columns',
    section: 'rodape',
    name: 'Múltiplas colunas',
    description: 'Footer com colunas de links',
    plan: 'pro',
    category: 'footer',
    component: 'Rodape',
    fields: [{ key: 'copyright', label: 'Copyright', type: 'text' }],
    hasJsonEditor: true,
  },
  {
    id: 'footer_newsletter',
    section: 'rodape',
    name: 'Com Newsletter',
    description: 'Footer com formulário de newsletter',
    plan: 'premium',
    category: 'footer',
    component: 'Rodape',
    fields: [
      { key: 'copyright', label: 'Copyright', type: 'text' },
      { key: 'newsletter_titulo', label: 'Título Newsletter', type: 'text' },
    ],
    hasJsonEditor: true,
  },
];

// ============================================================
// UTILITÁRIOS
// ============================================================

export const SECTION_MODELS_BY_SECTION: Record<SectionKey, SectionModel[]> =
  SECTION_MODELS.reduce((acc, model) => {
    (acc[model.section] ||= []).push(model);
    return acc;
  }, {} as Record<SectionKey, SectionModel[]>);

export function getSectionModel(section: SectionKey, variant?: string) {
  const list = SECTION_MODELS_BY_SECTION[section] || [];
  if (!variant) return list[0];
  return list.find(v => v.id === variant) || list[0];
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
