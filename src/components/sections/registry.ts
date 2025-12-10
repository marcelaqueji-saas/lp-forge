// src/components/sections/registry.ts
// Mapeamento de modelos para componentes React
// noBRon - v2.0

import { Hero } from './Hero';
import HeroCenter from './HeroCenter';
import HeroSplitBasic from './HeroSplitBasic';
import HeroCarousel from './HeroCarousel';
import HeroDark from './HeroDark';
import HeroNeon from './HeroNeon';
import HeroMinimal from './HeroMinimal';

import { Beneficios } from './Beneficios';
import BeneficiosDark from './BeneficiosDark';
import BeneficiosNeon from './BeneficiosNeon';
import BeneficiosMinimal from './BeneficiosMinimal';

import { ProvasSociais } from './ProvasSociais';
import ProvasSociaisDark from './ProvasSociaisDark';
import ProvasSociaisNeon from './ProvasSociaisNeon';
import ProvasSociaisMinimal from './ProvasSociaisMinimal';

import { ComoFunciona } from './ComoFunciona';
import { ParaQuemE } from './ParaQuemE';

import { Planos } from './Planos';
import PlanosDark from './PlanosDark';
import PlanosNeon from './PlanosNeon';
import PlanosMinimal from './PlanosMinimal';

import { FAQ } from './FAQ';
import FAQDark from './FAQDark';
import FAQNeon from './FAQNeon';
import FAQMinimal from './FAQMinimal';

import { ChamadaFinal } from './ChamadaFinal';
import CTAFinalDark from './CTAFinalDark';
import CTAFinalNeon from './CTAFinalNeon';
import CTAFinalMinimal from './CTAFinalMinimal';

import { Rodape } from './Rodape';
import RodapeDark from './RodapeDark';
import RodapeNeon from './RodapeNeon';
import RodapeMinimal from './RodapeMinimal';

import { MenuSection } from './MenuSection';
import MenuDark from './MenuDark';
import MenuNeon from './MenuNeon';
import MenuMinimal from './MenuMinimal';

import StoriesCarousel from './StoriesCarousel';
import LogosInfiniteScroll from './LogosInfiniteScroll';

// Premium components (lazy loaded where applicable)
import HeroParallax from './premium/HeroParallax';

/**
 * Registry de componentes por seção e modelo
 * Cada entrada mapeia um modelId para seu componente React
 * 
 * Fallback: 'default' é usado quando o modelId não é encontrado
 */
export const SECTION_COMPONENT_REGISTRY = {
  // ============================================================
  // MENU
  // ============================================================
  menu: {
    default: MenuSection,
    // Novos modelos v2.0
    menu_glass_minimal: MenuSection,
    menu_visionos_floating: MenuSection,
    menu_command_center: MenuSection,
    // Style presets
    menu_dark: MenuDark,
    menu_neon: MenuNeon,
    menu_minimal_preset: MenuMinimal,
    // Legado (fallback)
    menu_horizontal: MenuSection,
    menu_centered: MenuSection,
    menu_sticky_glass: MenuSection,
    menu_minimal: MenuSection,
    menu_basic: MenuSection,
  },

  // ============================================================
  // HERO
  // ============================================================
  hero: {
    default: Hero,
    // Novos modelos v2.0
    hero_glass_aurora: Hero,
    hero_cinematic_video_spotlight: Hero,
    hero_carousel_autoplay: HeroCarousel,
    hero_parallax_layers: HeroParallax,
    hero_ticket_launch: Hero,
    hero_split_visionos: Hero,
    hero_minimal_centered: Hero,
    // Style presets
    hero_dark: HeroDark,
    hero_neon: HeroNeon,
    hero_minimal: HeroMinimal,
    // Legado (fallback)
    hero_basic: Hero,
    hero_center: HeroCenter,
    hero_split: HeroSplitBasic,
    hero_split_reverse: HeroSplitBasic,
    hero_gradient: Hero,
    hero_video_cinematic: Hero,
    hero_parallax: HeroParallax,
    hero_animated_text: Hero,
  },

  // ============================================================
  // COMO FUNCIONA
  // ============================================================
  como_funciona: {
    default: ComoFunciona,
    // Novos modelos v2.0
    como_funciona_timeline_glass: ComoFunciona,
    como_funciona_steps_cards_3d: ComoFunciona,
    como_funciona_horizontal_flow: ComoFunciona,
    // Legado (fallback)
    steps_basic: ComoFunciona,
    steps_timeline: ComoFunciona,
    steps_zigzag: ComoFunciona,
    steps_cards: ComoFunciona,
  },

  // ============================================================
  // PARA QUEM É
  // ============================================================
  para_quem_e: {
    default: ParaQuemE,
    // Novos modelos v2.0
    para_quem_e_chips_personas: ParaQuemE,
    para_quem_e_personas_cards: ParaQuemE,
    para_quem_e_matrix: ParaQuemE,
    // Legado (fallback)
    target_basic: ParaQuemE,
    target_cards: ParaQuemE,
    target_avatars: ParaQuemE,
  },

  // ============================================================
  // BENEFÍCIOS
  // ============================================================
  beneficios: {
    default: Beneficios,
    // Novos modelos v2.0
    beneficios_icon_grid_glass: Beneficios,
    beneficios_timeline_numerada: Beneficios,
    beneficios_showcase_3d: Beneficios,
    // Style presets
    beneficios_dark: BeneficiosDark,
    beneficios_neon: BeneficiosNeon,
    beneficios_minimal: BeneficiosMinimal,
    // Legado (fallback)
    benefits_basic: Beneficios,
    benefits_icons: Beneficios,
    benefits_bento: Beneficios,
  },

  // ============================================================
  // PROVAS SOCIAIS
  // ============================================================
  provas_sociais: {
    default: ProvasSociais,
    // Novos modelos v2.0
    provas_sociais_depoimentos_glass: ProvasSociais,
    provas_sociais_carrossel_premium: ProvasSociais,
    provas_sociais_stories: StoriesCarousel,
    provas_sociais_logos_scroller: LogosInfiniteScroll,
    provas_sociais_stats_hybrid: ProvasSociais,
    provas_sociais_video_testimonials: ProvasSociais,
    provas_sociais_featured_single: ProvasSociais,
    // Style presets
    provas_sociais_dark: ProvasSociaisDark,
    provas_sociais_neon: ProvasSociaisNeon,
    provas_sociais_minimal: ProvasSociaisMinimal,
    // Legado (fallback)
    testimonials_basic: ProvasSociais,
    testimonials_carousel: ProvasSociais,
    testimonials_video: ProvasSociais,
  },

  // ============================================================
  // PLANOS
  // ============================================================
  planos: {
    default: Planos,
    // Novos modelos v2.0
    planos_glass_three_tiers: Planos,
    planos_cards_pill: Planos,
    planos_tabela_comparativa_modern: Planos,
    // Style presets
    planos_dark: PlanosDark,
    planos_neon: PlanosNeon,
    planos_minimal: PlanosMinimal,
    // Legado (fallback)
    pricing_basic: Planos,
    pricing_highlight: Planos,
    pricing_comparison: Planos,
  },

  // ============================================================
  // FAQ
  // ============================================================
  faq: {
    default: FAQ,
    // Novos modelos v2.0
    faq_accordion_glass: FAQ,
    faq_twocolumn_modern: FAQ,
    faq_with_cta_spotlight: FAQ,
    // Style presets
    faq_dark: FAQDark,
    faq_neon: FAQNeon,
    faq_minimal: FAQMinimal,
    // Legado (fallback)
    faq_accordion: FAQ,
    faq_columns: FAQ,
    faq_categorized: FAQ,
    faq_basic: FAQ,
  },

  // ============================================================
  // CHAMADA FINAL
  // ============================================================
  chamada_final: {
    default: ChamadaFinal,
    // Novos modelos v2.0
    chamada_final_simple_glass: ChamadaFinal,
    chamada_final_two_ctas: ChamadaFinal,
    chamada_final_ticket_glow: ChamadaFinal,
    // Style presets
    cta_dark: CTAFinalDark,
    cta_neon: CTAFinalNeon,
    cta_minimal: CTAFinalMinimal,
    // Legado (fallback)
    cta_basic: ChamadaFinal,
    cta_background: ChamadaFinal,
    cta_glass: ChamadaFinal,
  },

  // ============================================================
  // RODAPÉ
  // ============================================================
  rodape: {
    default: Rodape,
    // Novos modelos v2.0
    rodape_minimal_soft: Rodape,
    rodape_columns_glass: Rodape,
    rodape_visionos_bar: Rodape,
    // Style presets
    rodape_dark: RodapeDark,
    rodape_neon: RodapeNeon,
    rodape_minimal: RodapeMinimal,
    // Legado (fallback)
    footer_basic: Rodape,
    footer_columns: Rodape,
    footer_newsletter: Rodape,
  },
} as const;

/**
 * Tipo helper para os nomes de seção disponíveis
 */
export type SectionRegistryKey = keyof typeof SECTION_COMPONENT_REGISTRY;

/**
 * Retorna o componente para uma seção e modelo específicos
 * Faz fallback para 'default' se o modelo não for encontrado
 */
export function getComponentForModel(
  section: SectionRegistryKey,
  modelId?: string
): React.ComponentType<any> {
  const sectionRegistry = SECTION_COMPONENT_REGISTRY[section];
  if (!sectionRegistry) {
    console.warn(`[Registry] Seção não encontrada: ${section}`);
    return () => null;
  }

  if (modelId && modelId in sectionRegistry) {
    return sectionRegistry[modelId as keyof typeof sectionRegistry];
  }

  return sectionRegistry.default;
}
