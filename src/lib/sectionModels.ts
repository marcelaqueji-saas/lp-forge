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
  maxSizeMB?: number; // controle de custos de storage
  aspectRatio?: string; // ratio recomendado do template
}

export interface SectionModel {
  id: string;
  section: SectionKey;
  name: string;
  description?: string;
  plan: PlanLevel;
  fields?: FieldConfig[];
  images?: ImageConfig[];
  hasJsonEditor?: boolean;
  component: string;
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
  // MENU
  {
    id: 'menu_horizontal',
    section: 'menu',
    name: 'Menu Horizontal',
    description: 'Logo à esquerda e navegação à direita',
    plan: 'free',
    component: 'MenuSection',
    fields: [
      { key: 'marca', label: 'Marca', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão', type: 'text' },
      { key: 'cta_url', label: 'URL do botão', type: 'url' },
    ],
    images: [
      {
        key: 'logo',
        label: 'Logo',
        maxSizeMB: 1,
        aspectRatio: '1:1',
      },
    ],
  },

  // HERO
  {
    id: 'hero_basic',
    section: 'hero',
    name: 'Simples e Centralizado',
    plan: 'free',
    component: 'Hero',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem principal', maxSizeMB: 2 }],
  },
  {
    id: 'hero_lateral',
    section: 'hero',
    name: 'Imagem Lateral',
    plan: 'pro',
    component: 'HeroSideImage',
    fields: HERO_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem lateral', maxSizeMB: 3 }],
  },
  {
    id: 'hero_video_cinematic',
    section: 'hero',
    name: 'Vídeo Cinemático',
    description: 'Hero fullscreen com vídeo',
    plan: 'premium',
    component: 'HeroCinematicVideo',
    fields: HERO_FIELDS,
    images: [],
  },

  // COMO FUNCIONA
  {
    id: 'steps_basic',
    section: 'como_funciona',
    name: '3 passos básicos',
    plan: 'free',
    component: 'ComoFunciona',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'steps_icons',
    section: 'como_funciona',
    name: 'Ícones ilustrados',
    plan: 'pro',
    component: 'StepsIcons',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // PARA QUEM É
  {
    id: 'target_basic',
    section: 'para_quem_e',
    name: 'Perfis com ícones',
    plan: 'free',
    component: 'ParaQuemE',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'target_avatars',
    section: 'para_quem_e',
    name: 'Cards com fotos',
    plan: 'premium',
    component: 'TargetAvatars',
    fields: SECTION_TITLE_FIELDS,
    images: [{ key: 'avatar_default', label: 'Avatar padrão', maxSizeMB: 1 }],
    hasJsonEditor: true,
  },

  // BENEFÍCIOS
  {
    id: 'benefits_basic',
    section: 'beneficios',
    name: 'Grid simples',
    plan: 'free',
    component: 'Beneficios',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'benefits_bento',
    section: 'beneficios',
    name: 'Bento Grid Moderno',
    plan: 'pro',
    component: 'BenefitsBentoGrid',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // PROVAS SOCIAIS
  {
    id: 'testimonials_basic',
    section: 'provas_sociais',
    name: 'Depoimentos simples',
    plan: 'free',
    component: 'ProvasSociais',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'testimonials_slider',
    section: 'provas_sociais',
    name: 'Carrossel elegante',
    plan: 'pro',
    component: 'TestimonialsSlider',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // PLANOS
  {
    id: 'pricing_basic',
    section: 'planos',
    name: 'Cards básicos',
    plan: 'free',
    component: 'Planos',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },
  {
    id: 'pricing_comparison',
    section: 'planos',
    name: 'Tabela comparativa',
    plan: 'premium',
    component: 'PricingFeatureGrid',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // FAQ
  {
    id: 'faq_accordion',
    section: 'faq',
    name: 'Acordeão clássico',
    plan: 'free',
    component: 'FAQ',
    fields: SECTION_TITLE_FIELDS,
    hasJsonEditor: true,
  },

  // CTA FINAL
  {
    id: 'cta_basic',
    section: 'chamada_final',
    name: 'CTA no centro',
    plan: 'free',
    component: 'ChamadaFinal',
    fields: CTA_FIELDS,
  },
  {
    id: 'cta_glass',
    section: 'chamada_final',
    name: 'CTA com Glass',
    plan: 'pro',
    component: 'CTABannerGlass',
    fields: CTA_FIELDS,
    images: [{ key: 'imagem', label: 'Imagem', maxSizeMB: 2 }],
  },

  // RODAPÉ
  {
    id: 'footer_basic',
    section: 'rodape',
    name: 'Simples com links',
    plan: 'free',
    component: 'Rodape',
    fields: [{ key: 'copyright', label: 'Copyright', type: 'text' }],
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
