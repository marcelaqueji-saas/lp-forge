/**
 * StyleRestrictionOverlay - Overlay para recursos de estilo bloqueados por plano
 */

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlanLevel } from '@/lib/sectionModels';
import { PLAN_LIMITS } from '@/lib/blockEditorTypes';

interface StyleRestrictionOverlayProps {
  feature: 'background' | 'gradients' | 'sectionColors' | 'typography' | 'glassEffects';
  userPlan: PlanLevel;
  onUpgradeClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const FEATURE_LABELS: Record<string, string> = {
  background: 'Personalizar fundo',
  gradients: 'Gradientes',
  sectionColors: 'Cores por seção',
  typography: 'Tipografia',
  glassEffects: 'Efeitos glass',
};

const FEATURE_TO_PERMISSION: Record<string, keyof typeof PLAN_LIMITS['free']> = {
  background: 'canEditBackground',
  gradients: 'canEditGradients',
  sectionColors: 'canEditSectionColors',
  typography: 'canEditTypography',
  glassEffects: 'canEditGlassEffects',
};

export const StyleRestrictionOverlay = ({
  feature,
  userPlan,
  onUpgradeClick,
  children,
  className,
}: StyleRestrictionOverlayProps) => {
  const limits = PLAN_LIMITS[userPlan];
  const permissionKey = FEATURE_TO_PERMISSION[feature];
  const isAllowed = limits[permissionKey] as boolean;

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Conteúdo original (desabilitado visualmente) */}
      <div className="opacity-50 pointer-events-none select-none filter grayscale">
        {children}
      </div>

      {/* Overlay de bloqueio */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center gap-3 p-4"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">{FEATURE_LABELS[feature]}</p>
          <p className="text-xs text-muted-foreground">
            Disponível no plano Pro ou superior
          </p>
        </div>

        <Button
          size="sm"
          onClick={onUpgradeClick}
          className="gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Fazer upgrade
        </Button>
      </motion.div>
    </div>
  );
};

/**
 * Hook para verificar se um recurso de estilo está disponível
 */
export function useStylePermission(feature: string, userPlan: PlanLevel): boolean {
  const limits = PLAN_LIMITS[userPlan];
  const permissionKey = FEATURE_TO_PERMISSION[feature];
  return permissionKey ? (limits[permissionKey] as boolean) : true;
}
