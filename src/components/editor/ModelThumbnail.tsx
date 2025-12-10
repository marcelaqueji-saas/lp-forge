/**
 * ModelThumbnail - Thumbnail visual dos modelos de seção
 */

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlanLevel } from '@/lib/sectionModels';

interface ModelThumbnailProps {
  modelId: string;
  name: string;
  plan: PlanLevel;
  isLocked: boolean;
  isSelected: boolean;
  onClick: () => void;
}

// Thumbnails visuais simplificados por modelo
const MODEL_THUMBNAILS: Record<string, React.ReactNode> = {
  // Hero variants
  'hero-basic': (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
      <div className="w-3/4 h-2 bg-current/30 rounded" />
      <div className="w-1/2 h-1.5 bg-current/20 rounded" />
      <div className="w-1/4 h-2 bg-current/40 rounded-sm mt-1" />
    </div>
  ),
  'hero-dashboard': (
    <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
      <div className="flex flex-col gap-1">
        <div className="w-full h-1.5 bg-current/30 rounded" />
        <div className="w-3/4 h-1 bg-current/20 rounded" />
        <div className="w-1/2 h-1.5 bg-current/40 rounded-sm" />
      </div>
      <div className="bg-current/10 rounded" />
    </div>
  ),
  'hero-parallax': (
    <div className="w-full h-full relative p-2">
      <div className="absolute inset-2 bg-gradient-to-br from-current/20 to-current/5 rounded" />
      <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
        <div className="w-2/3 h-1.5 bg-current/40 rounded" />
        <div className="w-1/3 h-1 bg-current/30 rounded" />
      </div>
    </div>
  ),
  // Beneficios
  'benefits-basic': (
    <div className="w-full h-full grid grid-cols-3 gap-1 p-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div className="w-3 h-3 bg-current/20 rounded-full" />
          <div className="w-full h-1 bg-current/15 rounded" />
        </div>
      ))}
    </div>
  ),
  'benefits-bento-grid': (
    <div className="w-full h-full grid grid-cols-2 gap-1 p-2">
      <div className="bg-current/20 rounded row-span-2" />
      <div className="bg-current/15 rounded" />
      <div className="bg-current/15 rounded" />
    </div>
  ),
  // Provas Sociais
  'testimonials-basic': (
    <div className="w-full h-full flex flex-col items-center gap-1 p-2">
      <div className="w-4 h-4 bg-current/20 rounded-full" />
      <div className="w-3/4 h-1 bg-current/15 rounded" />
      <div className="w-1/2 h-1 bg-current/15 rounded" />
    </div>
  ),
  'testimonials-slider': (
    <div className="w-full h-full flex items-center gap-1 p-2">
      <div className="w-1 h-4 bg-current/10 rounded" />
      <div className="flex-1 bg-current/15 rounded h-full" />
      <div className="w-1 h-4 bg-current/10 rounded" />
    </div>
  ),
  // Planos
  'pricing-basic': (
    <div className="w-full h-full flex gap-1 p-2">
      {[1, 2, 3].map(i => (
        <div key={i} className={cn(
          "flex-1 rounded border border-current/20",
          i === 2 && "bg-current/10 border-current/30"
        )}>
          <div className="h-1 bg-current/20 rounded-t" />
        </div>
      ))}
    </div>
  ),
  // FAQ
  'faq-accordion': (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex-1 h-1.5 bg-current/15 rounded" />
          <div className="w-1.5 h-1.5 bg-current/20 rounded-sm" />
        </div>
      ))}
    </div>
  ),
  // CTA
  'cta-basic': (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
      <div className="w-2/3 h-1.5 bg-current/30 rounded" />
      <div className="w-1/3 h-2 bg-current/40 rounded-sm" />
    </div>
  ),
  // Default
  default: (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-6 h-6 bg-current/10 rounded" />
    </div>
  ),
};

export const ModelThumbnail = ({
  modelId,
  name,
  plan,
  isLocked,
  isSelected,
  onClick,
}: ModelThumbnailProps) => {
  const thumbnail = MODEL_THUMBNAILS[modelId] || MODEL_THUMBNAILS.default;

  return (
    <motion.button
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full aspect-[4/3] rounded-xl border-2 transition-all overflow-hidden",
        "bg-card text-foreground",
        isSelected 
          ? "border-primary shadow-md" 
          : "border-border hover:border-primary/50",
        isLocked && "opacity-60"
      )}
    >
      {/* Thumbnail visual */}
      <div className="absolute inset-0">
        {thumbnail}
      </div>

      {/* Overlay de seleção */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-primary/10 flex items-center justify-center"
        >
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Badge de plano */}
      {plan !== 'free' && (
        <div className="absolute top-1 right-1">
          <Badge 
            variant={plan === 'premium' ? 'default' : 'secondary'}
            className="text-[8px] px-1 py-0 uppercase"
          >
            {plan === 'premium' && <Sparkles className="w-2 h-2 mr-0.5" />}
            {plan}
          </Badge>
        </div>
      )}

      {/* Nome do modelo */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-1.5">
        <span className="text-[10px] font-medium truncate block">{name}</span>
      </div>
    </motion.button>
  );
};
