// src/components/sections/registry.ts

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

export const SECTION_COMPONENT_REGISTRY = {
  hero: {
    default: Hero,
    hero_basic: Hero,
    hero_center: HeroCenter,
    hero_split: HeroSplitBasic,
  },
  beneficios: {
    default: Beneficios,
    benefits_basic: Beneficios,
  },
  provas_sociais: {
    default: ProvasSociais,
    testimonials_basic: ProvasSociais,
  },
  como_funciona: {
    default: ComoFunciona,
    steps_basic: ComoFunciona,
  },
  para_quem_e: {
    default: ParaQuemE,
    target_basic: ParaQuemE,
  },
  planos: {
    default: Planos,
    pricing_basic: Planos,
  },
  faq: {
    default: FAQ,
    faq_basic: FAQ,
  },
  chamada_final: {
    default: ChamadaFinal,
    cta_basic: ChamadaFinal,
  },
  rodape: {
    default: Rodape,
    footer_basic: Rodape,
  },
  menu: {
    default: MenuSection,
    menu_basic: MenuSection,
  }
} as const;
