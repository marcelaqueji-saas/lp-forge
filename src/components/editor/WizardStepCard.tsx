/**
 * WizardStepCard - Card individual do passo do Wizard
 * Combina seleção de modelo + edição de conteúdo
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  SkipForward, 
  Layout,
  Pencil,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  SectionKey, 
  SECTION_MODELS_BY_SECTION, 
  PlanLevelWithMaster,
  PlanLevel 
} from '@/lib/sectionModels';
import { 
  getBlockDefinition,
  canUseModel
} from '@/lib/blockEditorTypes';
import { SECTION_NAMES, LPContent, saveSectionContent } from '@/lib/lpContentApi';
import { ModelThumbnail } from './ModelThumbnail';
import { toast } from '@/hooks/use-toast';

// Editable components
import { HeroEditable } from '@/components/sections/HeroEditable';
import { BeneficiosEditable } from '@/components/sections/BeneficiosEditable';
import { FAQEditable } from '@/components/sections/FAQEditable';
import { ComoFuncionaEditable } from '@/components/sections/ComoFuncionaEditable';
import { ParaQuemEEditable } from '@/components/sections/ParaQuemEEditable';
import { ProvasSociaisEditable } from '@/components/sections/ProvasSociaisEditable';
import { PlanosEditable } from '@/components/sections/PlanosEditable';
import { ChamadaFinalEditable } from '@/components/sections/ChamadaFinalEditable';
import { MenuEditable } from '@/components/sections/MenuEditable';
import { RodapeEditable } from '@/components/sections/RodapeEditable';

interface WizardStepCardProps {
  sectionKey: SectionKey;
  lpId: string;
  userPlan: PlanLevelWithMaster;
  content: LPContent;
  selectedModelId: string | null;
  isCompleted: boolean;
  onModelSelect: (modelId: string) => void;
  onContentUpdate: (key: string, value: string) => void;
  onComplete: () => void;
  onSkip: () => void;
  onUpgradeClick: () => void;
}

// Map of section keys to editable components
const EDITABLE_COMPONENTS: Record<SectionKey, React.ComponentType<any>> = {
  hero: HeroEditable,
  beneficios: BeneficiosEditable,
  faq: FAQEditable,
  como_funciona: ComoFuncionaEditable,
  para_quem_e: ParaQuemEEditable,
  provas_sociais: ProvasSociaisEditable,
  planos: PlanosEditable,
  chamada_final: ChamadaFinalEditable,
  menu: MenuEditable,
  rodape: RodapeEditable,
};

type WizardSubStep = 'model' | 'content';

export const WizardStepCard = ({
  sectionKey,
  lpId,
  userPlan,
  content,
  selectedModelId,
  isCompleted,
  onModelSelect,
  onContentUpdate,
  onComplete,
  onSkip,
  onUpgradeClick,
}: WizardStepCardProps) => {
  const [subStep, setSubStep] = useState<WizardSubStep>(selectedModelId ? 'content' : 'model');
  const [isEditing, setIsEditing] = useState(false);

  const definition = getBlockDefinition(sectionKey);
  const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
  const isMaster = userPlan === 'master';
  const canSkip = !definition?.isFixed;

  const handleSelectModel = (modelId: string) => {
    onModelSelect(modelId);
    setSubStep('content');
    toast({ title: 'Modelo selecionado!' });
  };

  const handleFinishContent = () => {
    setIsEditing(false);
    onComplete();
    toast({ title: `${SECTION_NAMES[sectionKey]} concluído!` });
  };

  const renderEditableComponent = () => {
    const EditableComponent = EDITABLE_COMPONENTS[sectionKey];
    if (!EditableComponent) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Editor não disponível para esta seção
        </div>
      );
    }

    return (
      <EditableComponent
        lpId={lpId}
        content={content}
        userPlan={userPlan}
        editable={isEditing}
        variante={selectedModelId}
        onContentUpdate={onContentUpdate}
      />
    );
  };

  return (
    <Card className="border-2 border-primary/50 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {isCompleted ? (
                <Check className="w-5 h-5 text-primary" />
              ) : subStep === 'model' ? (
                <Layout className="w-5 h-5 text-primary" />
              ) : (
                <Pencil className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                {SECTION_NAMES[sectionKey] || definition?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subStep === 'model' ? 'Escolha o layout' : 'Edite o conteúdo'}
              </p>
            </div>
          </div>

          {/* Sub-step indicator */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={subStep === 'model' ? 'default' : 'outline'}
              className="text-xs"
            >
              1. Modelo
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Badge 
              variant={subStep === 'content' ? 'default' : 'outline'}
              className="text-xs"
            >
              2. Conteúdo
            </Badge>
          </div>
        </div>

        {/* Model Selection Step */}
        <AnimatePresence mode="wait">
          {subStep === 'model' && (
            <motion.div
              key="model"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 sm:p-6"
            >
              <p className="text-sm font-medium mb-4 text-foreground">
                Escolha um modelo para {SECTION_NAMES[sectionKey]}:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {models.map((model) => {
                  const isLocked = !isMaster && !canUseModel(model.plan, userPlan as PlanLevel);
                  const isSelected = selectedModelId === model.id;

                  return (
                    <ModelThumbnail
                      key={model.id}
                      modelId={model.id}
                      name={model.name}
                      plan={model.plan}
                      isLocked={isLocked}
                      isSelected={isSelected}
                      onClick={() => {
                        if (isLocked) {
                          onUpgradeClick();
                        } else {
                          handleSelectModel(model.id);
                        }
                      }}
                    />
                  );
                })}
              </div>

              {/* Skip option for non-fixed sections */}
              {canSkip && (
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Pular esta seção
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Content Editing Step */}
          {subStep === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Editing controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSubStep('model')}
                    className="text-xs"
                  >
                    <Layout className="w-3.5 h-3.5 mr-1" />
                    Trocar modelo
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleFinishContent}
                      className="text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Concluir seção
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-xs"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Editar conteúdo
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleFinishContent}
                        className="text-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5 mr-1" />
                        Próximo
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Editing hint */}
              {isEditing && (
                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
                  <p className="text-xs sm:text-sm text-primary">
                    <strong>Modo edição:</strong> Clique em qualquer texto ou imagem para editar
                  </p>
                </div>
              )}

              {/* Content preview/editor */}
              <div className={cn(
                "relative border-t bg-background",
                !isEditing && "max-h-[400px] overflow-y-auto"
              )}>
                {renderEditableComponent()}

                {/* Click to edit overlay */}
                {!isEditing && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 flex items-end justify-center pb-4 cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  >
                    <Button variant="secondary" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      Clique para editar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
