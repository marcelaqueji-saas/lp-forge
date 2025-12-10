/**
 * PlanLimitIndicator - Indicador visual de limites do plano
 */

import { motion } from 'framer-motion';
import { Sparkles, Lock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PlanLevel } from '@/lib/sectionModels';
import { PLAN_LIMITS } from '@/lib/blockEditorTypes';

interface PlanLimitIndicatorProps {
  userPlan: PlanLevel;
  currentBlocks: number;
  onUpgradeClick: () => void;
  variant?: 'compact' | 'full';
  className?: string;
}

const PLAN_COLORS: Record<PlanLevel, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  premium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const PLAN_LABELS: Record<PlanLevel, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  premium: 'Premium',
};

export const PlanLimitIndicator = ({
  userPlan,
  currentBlocks,
  onUpgradeClick,
  variant = 'full',
  className,
}: PlanLimitIndicatorProps) => {
  const limits = PLAN_LIMITS[userPlan];
  const maxBlocks = limits.maxDynamicBlocks;
  const percentage = Math.min((currentBlocks / maxBlocks) * 100, 100);
  const isAtLimit = currentBlocks >= maxBlocks;
  const isNearLimit = currentBlocks >= maxBlocks - 1;

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2", className)}>
              <Badge variant="outline" className={cn("text-xs", PLAN_COLORS[userPlan])}>
                {PLAN_LABELS[userPlan]}
              </Badge>
              <span className={cn(
                "text-xs font-medium",
                isAtLimit && "text-destructive",
                isNearLimit && !isAtLimit && "text-warning"
              )}>
                {currentBlocks}/{maxBlocks === 999 ? '∞' : maxBlocks}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentBlocks} de {maxBlocks === 999 ? 'ilimitados' : maxBlocks} blocos usados</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl border bg-card/50 backdrop-blur-sm",
        isAtLimit && "border-destructive/30 bg-destructive/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs border", PLAN_COLORS[userPlan])}>
            {userPlan === 'premium' && <Sparkles className="w-3 h-3 mr-1" />}
            Plano {PLAN_LABELS[userPlan]}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <p>• Máx. {limits.maxLPs} landing page{limits.maxLPs > 1 ? 's' : ''}</p>
                  <p>• Máx. {maxBlocks === 999 ? 'ilimitados' : maxBlocks} blocos por página</p>
                  <p>• {limits.maxStorageMB}MB de armazenamento</p>
                  {limits.canEditBackground && <p>• Personalização de fundo</p>}
                  {limits.canEditGradients && <p>• Gradientes e efeitos glass</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {userPlan !== 'premium' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpgradeClick}
            className="h-7 px-2 text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Blocos utilizados</span>
          <span className={cn(
            "font-medium",
            isAtLimit && "text-destructive",
            isNearLimit && !isAtLimit && "text-warning"
          )}>
            {currentBlocks} / {maxBlocks === 999 ? '∞' : maxBlocks}
          </span>
        </div>
        
        {maxBlocks !== 999 && (
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isAtLimit && "[&>div]:bg-destructive",
              isNearLimit && !isAtLimit && "[&>div]:bg-warning"
            )}
          />
        )}

        {isAtLimit && userPlan !== 'premium' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-2"
          >
            <Button
              onClick={onUpgradeClick}
              size="sm"
              className="w-full"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Desbloquear mais blocos
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
