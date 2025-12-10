/**
 * WizardPhase - Fase do Wizard passo-a-passo
 * Combina seleção de modelo + edição de conteúdo para cada seção
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  PartyPopper,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  SectionKey, 
  PlanLevelWithMaster 
} from '@/lib/sectionModels';
import { 
  EditorBlock,
  canAddMoreBlocks,
  generateBlockId,
  PLAN_LIMITS
} from '@/lib/blockEditorTypes';
import { 
  LPContent, 
  saveSectionContent,
  SECTION_NAMES 
} from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';
import { WizardProgress } from './WizardProgress';
import { WizardStepCard } from './WizardStepCard';

interface WizardPhaseProps {
  blocks: EditorBlock[];
  lpId: string;
  userPlan: PlanLevelWithMaster;
  content: Record<string, LPContent>;
  settings: Record<string, any>;
  onAddSection: (sectionKey: SectionKey, modelId: string) => Promise<void>;
  onContentUpdate: (sectionKey: SectionKey, newContent: LPContent) => void;
  onComplete: () => void;
  onUpgradeClick: () => void;
}

type SelectedModels = Partial<Record<SectionKey, string>>;

// Ordem das seções no wizard (fixas + dinâmicas)
const WIZARD_STEPS: SectionKey[] = [
  'menu',
  'hero',
  'como_funciona',
  'para_quem_e',
  'beneficios',
  'provas_sociais',
  'planos',
  'faq',
  'chamada_final',
  'rodape'
];

export const WizardPhase = ({
  blocks,
  lpId,
  userPlan,
  content,
  settings,
  onAddSection,
  onContentUpdate,
  onComplete,
  onUpgradeClick,
}: WizardPhaseProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<SectionKey>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<SectionKey>>(new Set());
  const [selectedModels, setSelectedModels] = useState<SelectedModels>({});
  const [localContent, setLocalContent] = useState<Record<string, LPContent>>(content);
  const [isFinished, setIsFinished] = useState(false);

  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const isMaster = userPlan === 'master';

  // Initialize with existing blocks
  useEffect(() => {
    const existingModels: SelectedModels = {};
    const existingCompleted = new Set<SectionKey>();

    blocks.forEach(block => {
      existingModels[block.sectionKey] = block.modelId;
      // Consider section completed if it has content beyond __model_id
      const sectionContent = content[block.sectionKey];
      if (sectionContent) {
        const keys = Object.keys(sectionContent).filter(k => !k.startsWith('_'));
        if (keys.length > 0) {
          existingCompleted.add(block.sectionKey);
        }
      }
    });

    setSelectedModels(existingModels);
    setCompletedSteps(existingCompleted);
    setLocalContent(content);

    // Start at first uncompleted step
    const firstUncompleted = WIZARD_STEPS.findIndex(
      s => !existingCompleted.has(s) && !skippedSteps.has(s)
    );
    if (firstUncompleted >= 0) {
      setCurrentStepIndex(firstUncompleted);
    }
  }, [blocks, content]);

  const currentSection = WIZARD_STEPS[currentStepIndex];

  // Count dynamic sections added
  const dynamicSectionsAdded = WIZARD_STEPS.filter(
    s => !['menu', 'hero', 'rodape'].includes(s) && 
         (completedSteps.has(s) || selectedModels[s])
  ).length;

  const canAddMoreDynamic = isMaster || canAddMoreBlocks(dynamicSectionsAdded, userPlan);

  const handleModelSelect = useCallback(async (modelId: string) => {
    const sectionKey = currentSection;
    
    // Check plan limits for dynamic sections
    const isFixedSection = ['menu', 'hero', 'rodape'].includes(sectionKey);
    if (!isFixedSection && !canAddMoreDynamic) {
      onUpgradeClick();
      return;
    }

    setSelectedModels(prev => ({ ...prev, [sectionKey]: modelId }));

    // Check if section already exists in blocks
    const existingBlock = blocks.find(b => b.sectionKey === sectionKey);
    if (!existingBlock) {
      // Add the section
      await onAddSection(sectionKey, modelId);
    }
  }, [currentSection, blocks, canAddMoreDynamic, onAddSection, onUpgradeClick]);

  const handleContentUpdate = useCallback(async (key: string, value: string) => {
    const sectionKey = currentSection;
    const currentContent = localContent[sectionKey] || {};
    const newContent = { ...currentContent, [key]: value };

    setLocalContent(prev => ({ ...prev, [sectionKey]: newContent }));

    // Save to database
    try {
      await saveSectionContent(lpId, sectionKey, newContent);
      onContentUpdate(sectionKey, newContent);
    } catch (error) {
      console.error('[WizardPhase] Save error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  }, [currentSection, localContent, lpId, onContentUpdate]);

  const handleStepComplete = useCallback(() => {
    setCompletedSteps(prev => new Set(prev).add(currentSection));
    
    // Move to next step
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // All steps done
      setIsFinished(true);
    }
  }, [currentSection, currentStepIndex]);

  const handleSkip = useCallback(() => {
    setSkippedSteps(prev => new Set(prev).add(currentSection));
    
    // Move to next step
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentSection, currentStepIndex]);

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleRestartWizard = () => {
    setCurrentStepIndex(0);
    setIsFinished(false);
  };

  // Finished state - celebration!
  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-6"
        >
          <PartyPopper className="w-10 h-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          Página criada com sucesso!
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          Sua landing page está pronta. Você pode visualizar o resultado ou continuar editando.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleRestartWizard}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Revisar seções
          </Button>
          <Button onClick={onComplete}>
            <Check className="w-4 h-4 mr-2" />
            Ver resultado
          </Button>
        </div>

        {/* Summary */}
        <Card className="mt-8 w-full max-w-md">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seções adicionadas</span>
                <span className="font-medium">{completedSteps.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seções puladas</span>
                <span className="font-medium">{skippedSteps.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blocos dinâmicos</span>
                <span className="font-medium">{dynamicSectionsAdded}/{limits.maxDynamicBlocks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <WizardProgress
        steps={WIZARD_STEPS}
        currentStep={currentStepIndex}
        completedSteps={completedSteps}
      />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          {SECTION_NAMES[currentSection]}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextStep}
          disabled={currentStepIndex === WIZARD_STEPS.length - 1}
        >
          Próximo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Current step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <WizardStepCard
            sectionKey={currentSection}
            lpId={lpId}
            userPlan={userPlan}
            content={localContent[currentSection] || {}}
            selectedModelId={selectedModels[currentSection] || null}
            isCompleted={completedSteps.has(currentSection)}
            onModelSelect={handleModelSelect}
            onContentUpdate={handleContentUpdate}
            onComplete={handleStepComplete}
            onSkip={handleSkip}
            onUpgradeClick={onUpgradeClick}
          />
        </motion.div>
      </AnimatePresence>

      {/* Plan limits warning */}
      {!isMaster && !canAddMoreDynamic && !['menu', 'hero', 'rodape'].includes(currentSection) && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-amber-600">
              <span className="text-sm">
                Limite de {limits.maxDynamicBlocks} blocos dinâmicos atingido no plano {userPlan}.
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onUpgradeClick}>
              Fazer upgrade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
