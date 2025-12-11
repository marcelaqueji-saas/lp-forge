// src/components/sections/registry.ts
// Mapeamento de modelos para componentes React
// noBRon - v3.0 (Simplificado)
// 
// NOTA: Este registry é mantido para compatibilidade com renderização pública.
// No modo edição, usa-se EDITABLE_COMPONENTS do ContentPhase.tsx
// Todos os modelos agora usam componentes base com stylePreset.

import { Hero } from './Hero';
import HeroCenter from './HeroCenter';
import HeroSplitBasic from './HeroSplitBasic';

import { Beneficios } from './Beneficios';

import { ProvasSociais } from './ProvasSociais';

import { ComoFunciona } from './ComoFunciona';
import { ParaQuemE } from './ParaQuemE';

import { Planos } from './Planos';

import { FAQ } from './FAQ';

import { ChamadaFinal } from './ChamadaFinal';

import { Rodape } from './Rodape';

import { MenuSection } from './MenuSection';

/**
 * Registry de componentes por seção e modelo
 * Cada entrada mapeia um modelId para seu componente React
 * 
 * v3.0: Simplificado para usar componentes base.
 * Variações visuais (dark/neon/minimal) são aplicadas via stylePreset nos componentes.
 * 
 * Fallback: 'default' é usado quando o modelId não é encontrado
 */
export const SECTION_COMPONENT_REGISTRY = {
  // ============================================================
  // MENU
  // ============================================================
  menu: {
    default: MenuSection,
    // Modelos v3.0
    menu_glass_minimal: MenuSection,
    menu_visionos_floating: MenuSection,
    menu_command_center: MenuSection,
    menu_dark: MenuSection,
    menu_neon: MenuSection,
    menu_minimal_preset: MenuSection,
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
    // Modelos v3.0
    hero_glass_aurora: Hero,
    hero_cinematic_video_spotlight: Hero,
    hero_ticket_launch: Hero,
    hero_split_visionos: Hero,
    hero_minimal_centered: Hero,
    hero_dark: Hero,
    hero_neon: Hero,
    // Legado (fallback)
    hero_basic: Hero,
    hero_center: HeroCenter,
    hero_split: HeroSplitBasic,
    hero_split_reverse: HeroSplitBasic,
    hero_gradient: Hero,
    hero_animated_text: Hero,
  },

  // ============================================================
  // COMO FUNCIONA
  // ============================================================
  como_funciona: {
    default: ComoFunciona,
    // Modelos v3.0
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
    // Modelos v3.0
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
    // Modelos v3.0
    beneficios_icon_grid_glass: Beneficios,
    beneficios_timeline_numerada: Beneficios,
    beneficios_showcase_3d: Beneficios,
    beneficios_dark: Beneficios,
    beneficios_neon: Beneficios,
    beneficios_minimal: Beneficios,
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
    // Modelos v3.0
    provas_sociais_depoimentos_glass: ProvasSociais,
    provas_sociais_carrossel_premium: ProvasSociais,
    provas_sociais_stats_hybrid: ProvasSociais,
    provas_sociais_featured_single: ProvasSociais,
    provas_sociais_dark: ProvasSociais,
    provas_sociais_neon: ProvasSociais,
    provas_sociais_minimal: ProvasSociais,
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
    // Modelos v3.0
    planos_glass_three_tiers: Planos,
    planos_cards_pill: Planos,
    planos_tabela_comparativa_modern: Planos,
    planos_dark: Planos,
    planos_neon: Planos,
    planos_minimal: Planos,
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
    // Modelos v3.0
    faq_accordion_glass: FAQ,
    faq_twocolumn_modern: FAQ,
    faq_with_cta_spotlight: FAQ,
    faq_dark: FAQ,
    faq_neon: FAQ,
    faq_minimal: FAQ,
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
    // Modelos v3.0
    chamada_final_simple_glass: ChamadaFinal,
    chamada_final_two_ctas: ChamadaFinal,
    chamada_final_ticket_glow: ChamadaFinal,
    cta_dark: ChamadaFinal,
    cta_neon: ChamadaFinal,
    cta_minimal: ChamadaFinal,
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
    // Modelos v3.0
    rodape_minimal_soft: Rodape,
    rodape_columns_glass: Rodape,
    rodape_visionos_bar: Rodape,
    rodape_dark: Rodape,
    rodape_neon: Rodape,
    rodape_minimal: Rodape,
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
