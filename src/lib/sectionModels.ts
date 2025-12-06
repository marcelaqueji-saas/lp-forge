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
}

// ============================================================
// DEFINIÇÃO DOS MODELOS DE SEÇÃO
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
    fields: [
      { key: 'brand_name', label: 'Nome/Brand', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão principal (opcional)', type: 'text' },
      { key: 'cta_url', label: 'URL do botão principal', type: 'url' },
    ],
    images: [
      { key: 'menu_logo_url', label: 'Logo do menu' },
    ],
    hasJsonEditor: true, // links_json
  },
  {
    id: 'menu-modelo_b',
    section: 'menu',
    name: 'Menu Centralizado',
    description: 'Logo centralizado, links abaixo',
    plan: 'free',
    fields: [
      { key: 'brand_name', label: 'Nome/Brand', type: 'text' },
      { key: 'cta_label', label: 'Texto do botão principal (opcional)', type: 'text' },
      { key: 'cta_url', label: 'URL do botão principal', type: 'url' },
    ],
    images: [
      { key: 'menu_logo_url', label: 'Logo do menu' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // HERO
  // ─────────────────────────────────────────────────────────
  {
    id: 'hero-modelo_a',
    section: 'hero',
    name: 'Hero Clássico',
    description: 'Imagem à direita, texto à esquerda',
    plan: 'free',
    fields: [
      { key: 'badge', label: 'Badge/Tag', type: 'text' },
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'destaque', label: 'Texto em destaque', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
      { key: 'texto_botao_secundario', label: 'Texto botão secundário', type: 'text' },
      { key: 'url_botao_secundario', label: 'URL botão secundário', type: 'url' },
    ],
    images: [
      { key: 'hero_image_url', label: 'Imagem principal' },
      { key: 'hero_background_url', label: 'Imagem de fundo' },
    ],
  },
  {
    id: 'hero-modelo_b',
    section: 'hero',
    name: 'Hero Centralizado',
    description: 'Texto centralizado com imagem abaixo',
    plan: 'free',
    fields: [
      { key: 'badge', label: 'Badge/Tag', type: 'text' },
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'destaque', label: 'Texto em destaque', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
      { key: 'texto_botao_secundario', label: 'Texto botão secundário', type: 'text' },
      { key: 'url_botao_secundario', label: 'URL botão secundário', type: 'url' },
    ],
    images: [
      { key: 'hero_image_url', label: 'Imagem principal' },
    ],
  },
  {
    id: 'hero-modelo_c',
    section: 'hero',
    name: 'Hero Impactante',
    description: 'Imagem de fundo com texto sobreposto',
    plan: 'free',
    fields: [
      { key: 'badge', label: 'Badge/Tag', type: 'text' },
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'destaque', label: 'Texto em destaque', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
      { key: 'texto_botao_secundario', label: 'Texto botão secundário', type: 'text' },
      { key: 'url_botao_secundario', label: 'URL botão secundário', type: 'url' },
    ],
    images: [
      { key: 'hero_background_url', label: 'Imagem de fundo' },
    ],
  },
  {
    id: 'hero-parallax',
    section: 'hero',
    name: 'Hero Parallax Mount',
    description: 'Hero fullscreen com camadas em parallax',
    plan: 'pro',
    fields: [
      { key: 'badge', label: 'Badge/Tag', type: 'text' },
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'destaque', label: 'Texto em destaque', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
    ],
    images: [
      { key: 'hero_background_url', label: 'Imagem de fundo' },
    ],
  },
  {
    id: 'hero-split',
    section: 'hero',
    name: 'Hero Split Navigation',
    description: 'Colunas verticais interativas',
    plan: 'pro',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao_primario', label: 'Texto botão principal', type: 'text' },
      { key: 'url_botao_primario', label: 'URL botão principal', type: 'url' },
    ],
    images: [],
  },

  // ─────────────────────────────────────────────────────────
  // COMO FUNCIONA
  // ─────────────────────────────────────────────────────────
  {
    id: 'como_funciona-modelo_a',
    section: 'como_funciona',
    name: 'Passos Horizontais',
    description: 'Cards em linha horizontal',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true, // steps_json
  },
  {
    id: 'como_funciona-modelo_b',
    section: 'como_funciona',
    name: 'Timeline Vertical',
    description: 'Lista vertical com ícones',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // PARA QUEM É
  // ─────────────────────────────────────────────────────────
  {
    id: 'para_quem_e-modelo_a',
    section: 'para_quem_e',
    name: 'Cards de Perfil',
    description: 'Perfis em cards lado a lado',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true, // perfis_json
  },
  {
    id: 'para_quem_e-modelo_b',
    section: 'para_quem_e',
    name: 'Lista com Checks',
    description: 'Lista com checks e descrições',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // BENEFÍCIOS
  // ─────────────────────────────────────────────────────────
  {
    id: 'beneficios-modelo_a',
    section: 'beneficios',
    name: 'Grid de Benefícios',
    description: 'Benefícios em grid de cards',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    images: [
      { key: 'beneficios_illustration_url', label: 'Ilustração' },
    ],
    hasJsonEditor: true, // beneficios_json
  },
  {
    id: 'beneficios-modelo_b',
    section: 'beneficios',
    name: 'Lista Vertical',
    description: 'Lista vertical com ícones',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-modelo_c',
    section: 'beneficios',
    name: 'Alternado',
    description: 'Ícones grandes alternados',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-showcase_3d',
    section: 'beneficios',
    name: '3D Cards Slider',
    description: 'Cards em 3D com rotação',
    plan: 'pro',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },
  {
    id: 'beneficios-features_float',
    section: 'beneficios',
    name: 'Float Minimal',
    description: 'Benefícios com flutuação leve',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // PROVAS SOCIAIS
  // ─────────────────────────────────────────────────────────
  {
    id: 'provas_sociais-modelo_a',
    section: 'provas_sociais',
    name: 'Carrossel',
    description: 'Depoimentos em carrossel',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
    ],
    images: [
      { key: 'provas_avatar_default_url', label: 'Avatar padrão' },
    ],
    hasJsonEditor: true, // depoimentos_json
  },
  {
    id: 'provas_sociais-modelo_b',
    section: 'provas_sociais',
    name: 'Grid de Depoimentos',
    description: 'Cards de depoimentos em grid',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
    ],
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais-modelo_c',
    section: 'provas_sociais',
    name: 'Destaque Principal',
    description: 'Um destaque grande + menores',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
    ],
    hasJsonEditor: true,
  },
  {
    id: 'provas_sociais-testimonial_cinematic',
    section: 'provas_sociais',
    name: 'Cinematic',
    description: 'Depoimento central com fade/shadow',
    plan: 'pro',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // PLANOS
  // ─────────────────────────────────────────────────────────
  {
    id: 'planos-modelo_a',
    section: 'planos',
    name: 'Colunas com Destaque',
    description: 'Planos em colunas com destaque',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    images: [
      { key: 'planos_illustration_url', label: 'Ilustração' },
    ],
    hasJsonEditor: true, // planos_json
  },
  {
    id: 'planos-modelo_b',
    section: 'planos',
    name: 'Cards Horizontais',
    description: 'Cards horizontais com detalhes',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // FAQ
  // ─────────────────────────────────────────────────────────
  {
    id: 'faq-modelo_a',
    section: 'faq',
    name: 'Acordeão',
    description: 'Perguntas expansíveis',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true, // faq_json
  },
  {
    id: 'faq-modelo_b',
    section: 'faq',
    name: 'Duas Colunas',
    description: 'Perguntas em duas colunas',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
    ],
    hasJsonEditor: true,
  },

  // ─────────────────────────────────────────────────────────
  // CHAMADA FINAL
  // ─────────────────────────────────────────────────────────
  {
    id: 'chamada_final-modelo_a',
    section: 'chamada_final',
    name: 'CTA Centralizado',
    description: 'CTA centralizado com destaque',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
      { key: 'url_botao', label: 'URL do botão', type: 'url' },
    ],
    images: [
      { key: 'chamada_background_url', label: 'Imagem de fundo' },
    ],
  },
  {
    id: 'chamada_final-modelo_b',
    section: 'chamada_final',
    name: 'CTA com Imagem',
    description: 'CTA com imagem de fundo',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
      { key: 'url_botao', label: 'URL do botão', type: 'url' },
    ],
    images: [
      { key: 'chamada_background_url', label: 'Imagem de fundo' },
    ],
  },
  {
    id: 'chamada_final-modelo_c',
    section: 'chamada_final',
    name: 'CTA Minimalista',
    description: 'Design limpo e direto',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
      { key: 'url_botao', label: 'URL do botão', type: 'url' },
    ],
  },
  {
    id: 'chamada_final-cta_final_animated',
    section: 'chamada_final',
    name: 'CTA Animado',
    description: 'Partículas flutuantes e botão animado',
    plan: 'free',
    fields: [
      { key: 'titulo', label: 'Título', type: 'text' },
      { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
      { key: 'texto_botao', label: 'Texto do botão', type: 'text' },
      { key: 'url_botao', label: 'URL do botão', type: 'url' },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // RODAPÉ
  // ─────────────────────────────────────────────────────────
  {
    id: 'rodape-modelo_a',
    section: 'rodape',
    name: 'Linha Única',
    description: 'Copyright e links na mesma linha',
    plan: 'free',
    fields: [
      { key: 'copyright', label: 'Texto de copyright', type: 'text' },
    ],
    hasJsonEditor: true, // links_json
  },
  {
    id: 'rodape-modelo_b',
    section: 'rodape',
    name: 'Duas Linhas',
    description: 'Links acima, copyright abaixo',
    plan: 'free',
    fields: [
      { key: 'copyright', label: 'Texto de copyright', type: 'text' },
    ],
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