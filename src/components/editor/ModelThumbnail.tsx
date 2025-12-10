/**
 * ModelThumbnail - Thumbnails abstratos para todos os modelos v2.0
 * Gera representações visuais simplificadas dos layouts de seção
 */

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlanLevel, StylePreset } from '@/lib/sectionModels';

interface ModelThumbnailProps {
  modelId: string;
  name: string;
  plan: PlanLevel;
  isLocked: boolean;
  isSelected: boolean;
  onClick: () => void;
  stylePreset?: StylePreset;
}

// ============================================================
// ABSTRACT THUMBNAIL COMPONENTS FOR ALL 32 MODELS
// ============================================================

// MENU THUMBNAILS (3)
const MenuGlassMinimalThumb = () => (
  <div className="w-full h-full flex items-center justify-between px-2 py-1.5">
    <div className="w-6 h-2 bg-current/30 rounded" />
    <div className="flex gap-1">
      {[1, 2, 3].map(i => <div key={i} className="w-3 h-1 bg-current/20 rounded" />)}
    </div>
    <div className="w-5 h-2 bg-current/40 rounded-sm" />
  </div>
);

const MenuVisionosFloatingThumb = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
    <div className="w-3/4 h-2.5 bg-current/15 rounded-full flex items-center justify-between px-2">
      <div className="w-3 h-1 bg-current/40 rounded" />
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => <div key={i} className="w-2 h-1 bg-current/20 rounded" />)}
      </div>
    </div>
  </div>
);

const MenuCommandCenterThumb = () => (
  <div className="w-full h-full flex items-center justify-between px-2 py-1.5">
    <div className="w-4 h-2 bg-current/30 rounded" />
    <div className="w-8 h-2 bg-current/10 rounded border border-current/20 flex items-center justify-center">
      <span className="text-[6px] text-current/40">⌘K</span>
    </div>
    <div className="w-4 h-2 bg-current/40 rounded-sm" />
  </div>
);

// HERO THUMBNAILS (4)
const HeroGlassAuroraThumb = () => (
  <div className="w-full h-full relative p-2 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
    <div className="relative flex flex-col justify-center h-full gap-1">
      <div className="w-2/3 h-2 bg-current/30 rounded" />
      <div className="w-1/2 h-1.5 bg-current/20 rounded" />
      <div className="w-1/4 h-2 bg-current/40 rounded-sm mt-1" />
    </div>
  </div>
);

const HeroCinematicVideoThumb = () => (
  <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
    <div className="flex flex-col justify-center gap-1">
      <div className="w-full h-1.5 bg-current/30 rounded" />
      <div className="w-3/4 h-1 bg-current/20 rounded" />
      <div className="w-1/2 h-1.5 bg-current/40 rounded-sm" />
    </div>
    <div className="bg-current/10 rounded flex items-center justify-center">
      <div className="w-3 h-3 bg-current/20 rounded-full flex items-center justify-center">
        <div className="w-0 h-0 border-l-4 border-l-current/40 border-y-2 border-y-transparent ml-0.5" />
      </div>
    </div>
  </div>
);

const HeroParallaxLayersThumb = () => (
  <div className="w-full h-full relative p-2 overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute inset-x-2 top-1 h-2 bg-current/10 rounded" />
      <div className="absolute inset-x-3 top-3 h-3 bg-current/15 rounded" />
      <div className="absolute inset-x-4 bottom-4 h-2 bg-current/20 rounded" />
    </div>
    <div className="absolute bottom-2 left-2 right-4 space-y-0.5">
      <div className="w-1/2 h-1.5 bg-current/40 rounded" />
      <div className="w-1/4 h-2 bg-current/50 rounded-sm" />
    </div>
  </div>
);

const HeroTicketLaunchThumb = () => (
  <div className="w-full h-full flex items-center justify-center p-2">
    <div className="w-3/4 h-full bg-current/10 rounded-lg border border-current/20 flex flex-col justify-center items-center gap-1 p-1">
      <div className="w-1/2 h-1 bg-current/30 rounded" />
      <div className="w-full h-px bg-current/20 my-0.5 border-t border-dashed border-current/30" />
      <div className="w-1/3 h-1.5 bg-current/40 rounded-sm" />
    </div>
  </div>
);

// COMO FUNCIONA THUMBNAILS (3)
const ComoFuncionaTimelineThumb = () => (
  <div className="w-full h-full flex flex-col items-center gap-1 p-2">
    <div className="w-full h-1 bg-current/20 rounded mb-1" />
    <div className="flex items-start gap-1 w-full">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-2 h-2 rounded-full bg-current/30" />
        <div className="w-0.5 h-3 bg-current/15" />
        <div className="w-2 h-2 rounded-full bg-current/30" />
        <div className="w-0.5 h-3 bg-current/15" />
        <div className="w-2 h-2 rounded-full bg-current/30" />
      </div>
      <div className="flex-1 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-2 bg-current/10 rounded" />
        ))}
      </div>
    </div>
  </div>
);

const ComoFuncionaSteps3DThumb = () => (
  <div className="w-full h-full grid grid-cols-3 gap-1 p-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-current/10 rounded transform rotate-1 shadow-sm flex flex-col items-center justify-center p-1">
        <div className="w-2 h-2 rounded-full bg-current/25 mb-0.5" />
        <div className="w-full h-1 bg-current/15 rounded" />
      </div>
    ))}
  </div>
);

const ComoFuncionaHorizontalThumb = () => (
  <div className="w-full h-full flex items-center gap-1 p-2 overflow-hidden">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex-shrink-0 w-5 h-full bg-current/10 rounded flex flex-col items-center justify-center gap-0.5">
        <div className="w-3 h-3 rounded-full bg-current/20" />
        <div className="w-4 h-0.5 bg-current/15 rounded" />
      </div>
    ))}
    <div className="w-2 h-4 bg-current/5 rounded" />
  </div>
);

// PARA QUEM É THUMBNAILS (3)
const ParaQuemEChipsThumb = () => (
  <div className="w-full h-full flex flex-col items-center gap-1.5 p-2">
    <div className="w-2/3 h-1 bg-current/25 rounded" />
    <div className="flex flex-wrap justify-center gap-1">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="px-1.5 py-0.5 bg-current/15 rounded-full">
          <div className="w-4 h-1 bg-current/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const ParaQuemEPersonasCardsThumb = () => (
  <div className="w-full h-full grid grid-cols-3 gap-1 p-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-current/10 rounded flex flex-col items-center justify-center p-0.5">
        <div className="w-3 h-3 rounded-full bg-current/20 mb-0.5" />
        <div className="w-full h-0.5 bg-current/15 rounded" />
        <div className="w-2/3 h-0.5 bg-current/10 rounded mt-0.5" />
      </div>
    ))}
  </div>
);

const ParaQuemEMatrixThumb = () => (
  <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 p-2">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-current/10 rounded flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-current/20" />
      </div>
    ))}
  </div>
);

// BENEFÍCIOS THUMBNAILS (3)
const BeneficiosIconGridThumb = () => (
  <div className="w-full h-full grid grid-cols-3 gap-1 p-2">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="flex flex-col items-center gap-0.5">
        <div className="w-2.5 h-2.5 bg-current/20 rounded" />
        <div className="w-full h-0.5 bg-current/15 rounded" />
      </div>
    ))}
  </div>
);

const BeneficiosTimelineNumeradaThumb = () => (
  <div className="w-full h-full flex flex-col gap-1 p-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-current/25 flex items-center justify-center text-[6px] text-current/50">{i}</div>
        <div className="flex-1 h-1 bg-current/15 rounded" />
      </div>
    ))}
  </div>
);

const BeneficiosShowcase3DThumb = () => (
  <div className="w-full h-full flex items-center justify-center gap-1 p-2">
    {[-8, 0, 8].map((rotate, i) => (
      <div 
        key={i} 
        className="w-4 h-6 bg-current/15 rounded shadow-sm"
        style={{ transform: `perspective(100px) rotateY(${rotate}deg)` }}
      >
        <div className="w-2 h-2 bg-current/20 rounded mx-auto mt-1" />
      </div>
    ))}
  </div>
);

// PROVAS SOCIAIS THUMBNAILS (4)
const ProvasSociaisDepoimentosGlassThumb = () => (
  <div className="w-full h-full flex flex-col items-center gap-1 p-2">
    <div className="w-4 h-4 rounded-full bg-current/20" />
    <div className="w-3/4 h-1 bg-current/15 rounded" />
    <div className="w-1/2 h-0.5 bg-current/10 rounded" />
  </div>
);

const ProvasSociaisCarrosselThumb = () => (
  <div className="w-full h-full flex items-center gap-1 p-2">
    <div className="w-1 h-3 bg-current/15 rounded" />
    <div className="flex-1 h-full bg-current/10 rounded flex flex-col items-center justify-center">
      <div className="w-3 h-3 rounded-full bg-current/20" />
      <div className="w-4 h-0.5 bg-current/15 rounded mt-0.5" />
    </div>
    <div className="w-1 h-3 bg-current/15 rounded" />
  </div>
);

const ProvasSociaisLogosScrollerThumb = () => (
  <div className="w-full h-full flex items-center gap-2 p-2 overflow-hidden">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex-shrink-0 w-4 h-3 bg-current/15 rounded" />
    ))}
  </div>
);

const ProvasSociaisStatsHybridThumb = () => (
  <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
    <div className="bg-current/10 rounded flex flex-col items-center justify-center">
      <div className="w-3 h-3 rounded-full bg-current/20" />
      <div className="w-4 h-0.5 bg-current/15 rounded mt-0.5" />
    </div>
    <div className="flex flex-col gap-0.5 justify-center">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-0.5">
          <div className="w-3 h-2 bg-current/25 rounded text-[6px] flex items-center justify-center text-current/50">+</div>
          <div className="flex-1 h-0.5 bg-current/15 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// PLANOS THUMBNAILS (3)
const PlanosGlassThreeTiersThumb = () => (
  <div className="w-full h-full flex gap-1 p-2">
    {[1, 2, 3].map(i => (
      <div key={i} className={cn(
        "flex-1 rounded border border-current/20 flex flex-col items-center p-0.5",
        i === 2 && "bg-current/10 border-current/30 scale-105"
      )}>
        <div className="w-full h-1 bg-current/20 rounded-t mb-0.5" />
        <div className="w-2/3 h-0.5 bg-current/15 rounded" />
      </div>
    ))}
  </div>
);

const PlanosCardsPillThumb = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
    {[1, 2].map(i => (
      <div key={i} className="w-3/4 h-3 bg-current/15 rounded-full flex items-center justify-between px-1">
        <div className="w-2 h-1 bg-current/20 rounded" />
        <div className="w-3 h-1.5 bg-current/25 rounded-full" />
      </div>
    ))}
  </div>
);

const PlanosComparativaThumb = () => (
  <div className="w-full h-full flex flex-col gap-0.5 p-2">
    <div className="flex gap-1">
      <div className="flex-1" />
      {[1, 2, 3].map(i => <div key={i} className="w-4 h-1 bg-current/20 rounded" />)}
    </div>
    {[1, 2, 3].map(row => (
      <div key={row} className="flex gap-1 items-center">
        <div className="flex-1 h-0.5 bg-current/15 rounded" />
        {[1, 2, 3].map(i => <div key={i} className="w-4 h-1 bg-current/10 rounded" />)}
      </div>
    ))}
  </div>
);

// FAQ THUMBNAILS (3)
const FaqAccordionGlassThumb = () => (
  <div className="w-full h-full flex flex-col gap-1 p-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-1 bg-current/5 rounded p-0.5">
        <div className="flex-1 h-1 bg-current/15 rounded" />
        <div className="w-1.5 h-1.5 bg-current/20 rounded-sm" />
      </div>
    ))}
  </div>
);

const FaqTwoColumnThumb = () => (
  <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
    {[1, 2].map(col => (
      <div key={col} className="flex flex-col gap-1">
        {[1, 2].map(i => (
          <div key={i} className="bg-current/10 rounded p-0.5">
            <div className="w-full h-0.5 bg-current/20 rounded mb-0.5" />
            <div className="w-2/3 h-0.5 bg-current/15 rounded" />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const FaqWithCtaThumb = () => (
  <div className="w-full h-full flex flex-col gap-1 p-2">
    {[1, 2].map(i => (
      <div key={i} className="flex items-center gap-1">
        <div className="flex-1 h-1 bg-current/15 rounded" />
        <div className="w-1 h-1 bg-current/20 rounded-sm" />
      </div>
    ))}
    <div className="mt-auto pt-1 border-t border-current/10">
      <div className="w-1/2 h-2 bg-current/25 rounded-sm mx-auto" />
    </div>
  </div>
);

// CHAMADA FINAL THUMBNAILS (3)
const ChamadaFinalSimpleGlassThumb = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 bg-current/5 rounded">
    <div className="w-2/3 h-1.5 bg-current/25 rounded" />
    <div className="w-1/3 h-2 bg-current/35 rounded-sm" />
  </div>
);

const ChamadaFinalTwoCtasThumb = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
    <div className="w-2/3 h-1 bg-current/25 rounded" />
    <div className="flex gap-1 mt-0.5">
      <div className="w-5 h-2 bg-current/35 rounded-sm" />
      <div className="w-5 h-2 bg-current/20 rounded-sm border border-current/30" />
    </div>
  </div>
);

const ChamadaFinalTicketGlowThumb = () => (
  <div className="w-full h-full flex items-center justify-center p-2">
    <div className="w-4/5 h-3/4 bg-current/10 rounded-lg border border-current/20 flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent rounded-lg" />
      <div className="w-1/2 h-1 bg-current/30 rounded relative z-10" />
      <div className="w-1/3 h-1.5 bg-current/40 rounded-sm mt-0.5 relative z-10" />
    </div>
  </div>
);

// RODAPÉ THUMBNAILS (3)
const RodapeMinimalSoftThumb = () => (
  <div className="w-full h-full flex flex-col justify-end p-2">
    <div className="flex items-center justify-between">
      <div className="w-4 h-1 bg-current/20 rounded" />
      <div className="flex gap-1">
        {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-current/15" />)}
      </div>
    </div>
  </div>
);

const RodapeColumnsGlassThumb = () => (
  <div className="w-full h-full flex gap-2 p-2 pt-1">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex-1 flex flex-col gap-0.5">
        <div className="w-full h-1 bg-current/25 rounded mb-0.5" />
        {[1, 2].map(j => <div key={j} className="w-2/3 h-0.5 bg-current/15 rounded" />)}
      </div>
    ))}
  </div>
);

const RodapeVisionosBarThumb = () => (
  <div className="w-full h-full flex flex-col justify-end p-2">
    <div className="h-3 bg-current/10 rounded-lg flex items-center justify-between px-1.5">
      <div className="w-3 h-1 bg-current/25 rounded" />
      <div className="flex gap-1">
        {[1, 2, 3].map(i => <div key={i} className="w-2 h-0.5 bg-current/20 rounded" />)}
      </div>
    </div>
  </div>
);

// ============================================================
// THUMBNAIL REGISTRY
// ============================================================

const MODEL_THUMBNAIL_COMPONENTS: Record<string, React.FC> = {
  // Menu
  menu_glass_minimal: MenuGlassMinimalThumb,
  menu_visionos_floating: MenuVisionosFloatingThumb,
  menu_command_center: MenuCommandCenterThumb,
  
  // Hero
  hero_glass_aurora: HeroGlassAuroraThumb,
  hero_cinematic_video_spotlight: HeroCinematicVideoThumb,
  hero_parallax_layers: HeroParallaxLayersThumb,
  hero_ticket_launch: HeroTicketLaunchThumb,
  
  // Como Funciona
  como_funciona_timeline_glass: ComoFuncionaTimelineThumb,
  como_funciona_steps_cards_3d: ComoFuncionaSteps3DThumb,
  como_funciona_horizontal_flow: ComoFuncionaHorizontalThumb,
  
  // Para Quem É
  para_quem_e_chips_personas: ParaQuemEChipsThumb,
  para_quem_e_personas_cards: ParaQuemEPersonasCardsThumb,
  para_quem_e_matrix: ParaQuemEMatrixThumb,
  
  // Benefícios
  beneficios_icon_grid_glass: BeneficiosIconGridThumb,
  beneficios_timeline_numerada: BeneficiosTimelineNumeradaThumb,
  beneficios_showcase_3d: BeneficiosShowcase3DThumb,
  
  // Provas Sociais
  provas_sociais_depoimentos_glass: ProvasSociaisDepoimentosGlassThumb,
  provas_sociais_carrossel_premium: ProvasSociaisCarrosselThumb,
  provas_sociais_logos_scroller: ProvasSociaisLogosScrollerThumb,
  provas_sociais_stats_hybrid: ProvasSociaisStatsHybridThumb,
  
  // Planos
  planos_glass_three_tiers: PlanosGlassThreeTiersThumb,
  planos_cards_pill: PlanosCardsPillThumb,
  planos_tabela_comparativa_modern: PlanosComparativaThumb,
  
  // FAQ
  faq_accordion_glass: FaqAccordionGlassThumb,
  faq_twocolumn_modern: FaqTwoColumnThumb,
  faq_with_cta_spotlight: FaqWithCtaThumb,
  
  // Chamada Final
  chamada_final_simple_glass: ChamadaFinalSimpleGlassThumb,
  chamada_final_two_ctas: ChamadaFinalTwoCtasThumb,
  chamada_final_ticket_glow: ChamadaFinalTicketGlowThumb,
  
  // Rodapé
  rodape_minimal_soft: RodapeMinimalSoftThumb,
  rodape_columns_glass: RodapeColumnsGlassThumb,
  rodape_visionos_bar: RodapeVisionosBarThumb,
};

// Default fallback thumbnail
const DefaultThumbnail = () => (
  <div className="w-full h-full flex items-center justify-center p-2">
    <div className="w-6 h-6 bg-current/10 rounded" />
  </div>
);

// Style preset backgrounds
const STYLE_PRESET_GRADIENTS: Record<StylePreset, string> = {
  glass: 'bg-gradient-to-br from-background via-background to-muted/20',
  visionos: 'bg-gradient-to-br from-slate-100/50 to-slate-200/30 dark:from-slate-800/50 dark:to-slate-900/30',
  aurora: 'bg-gradient-to-br from-violet-500/10 via-background to-cyan-500/10',
  neumorphic: 'bg-muted/40',
};

export const ModelThumbnail = ({
  modelId,
  name,
  plan,
  isLocked,
  isSelected,
  onClick,
  stylePreset = 'glass',
}: ModelThumbnailProps) => {
  const ThumbnailComponent = MODEL_THUMBNAIL_COMPONENTS[modelId] || DefaultThumbnail;

  return (
    <motion.button
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full aspect-[4/3] rounded-xl border-2 transition-all overflow-hidden",
        "text-foreground",
        STYLE_PRESET_GRADIENTS[stylePreset],
        isSelected 
          ? "border-primary shadow-md ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Thumbnail visual */}
      <div className="absolute inset-0">
        <ThumbnailComponent />
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-primary/10 flex items-center justify-center"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Plan badge */}
      {plan !== 'free' && (
        <div className="absolute top-1.5 right-1.5">
          <Badge 
            variant={plan === 'premium' ? 'default' : 'secondary'}
            className={cn(
              "text-[9px] px-1.5 py-0.5 uppercase font-semibold",
              plan === 'premium' && "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
            )}
          >
            {plan === 'premium' && <Sparkles className="w-2.5 h-2.5 mr-0.5" />}
            {plan}
          </Badge>
        </div>
      )}

      {/* Model name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-2 pt-4">
        <span className="text-[11px] font-medium truncate block leading-tight">{name}</span>
      </div>
    </motion.button>
  );
};

export default ModelThumbnail;
