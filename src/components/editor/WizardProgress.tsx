/**
 * WizardProgress - Indicador visual de progresso do Wizard
 */

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionKey } from '@/lib/sectionModels';
import { SECTION_NAMES } from '@/lib/lpContentApi';

interface WizardProgressProps {
  steps: SectionKey[];
  currentStep: number;
  completedSteps: Set<SectionKey>;
}

export const WizardProgress = ({
  steps,
  currentStep,
  completedSteps,
}: WizardProgressProps) => {
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Step counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Passo <span className="font-semibold text-foreground">{currentStep + 1}</span> de {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {Math.round(progress)}% concluído
        </span>
      </div>

      {/* Step indicators - scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step);
          const isCurrent = index === currentStep;
          const isPast = index < currentStep;

          return (
            <motion.div
              key={step}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-colors",
                isCompleted && "bg-green-500/20 text-green-700",
                isCurrent && !isCompleted && "bg-primary/20 text-primary font-medium",
                !isCompleted && !isCurrent && isPast && "bg-muted text-muted-foreground",
                !isCompleted && !isCurrent && !isPast && "bg-muted/50 text-muted-foreground/60"
              )}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {isCompleted ? (
                <Check className="w-3 h-3" />
              ) : isCurrent ? (
                <Circle className="w-3 h-3 fill-current" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">{SECTION_NAMES[step]}</span>
              <span className="sm:hidden">{index + 1}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
