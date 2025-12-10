/**
 * AddBlockModal - Modal para adicionar novo bloco
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SectionKey, SECTION_MODELS_BY_SECTION, PlanLevel } from '@/lib/sectionModels';
import { 
  BlockDefinition, 
  getDynamicBlocks, 
  canUseModel,
  PLAN_LIMITS 
} from '@/lib/blockEditorTypes';

interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
  position: number;
  userPlan: PlanLevel;
  currentDynamicCount: number;
  existingBlocks: SectionKey[];
  onAddBlock: (sectionKey: SectionKey, modelId: string, position: number) => void;
  onUpgradeClick: () => void;
}

export const AddBlockModal = ({
  open,
  onClose,
  position,
  userPlan,
  currentDynamicCount,
  existingBlocks,
  onAddBlock,
  onUpgradeClick,
}: AddBlockModalProps) => {
  const [selectedSection, setSelectedSection] = useState<SectionKey | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const dynamicBlocks = getDynamicBlocks();
  const limits = PLAN_LIMITS[userPlan];
  const isAtLimit = currentDynamicCount >= limits.maxDynamicBlocks;

  const handleSectionSelect = (sectionKey: SectionKey) => {
    setSelectedSection(sectionKey);
    const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
    const freeModel = models.find(m => canUseModel(m.plan, userPlan));
    setSelectedModel(freeModel?.id || models[0]?.id || null);
  };

  const handleModelSelect = (modelId: string, modelPlan: PlanLevel) => {
    if (!canUseModel(modelPlan, userPlan)) {
      onUpgradeClick();
      return;
    }
    setSelectedModel(modelId);
  };

  const handleConfirm = () => {
    if (selectedSection && selectedModel) {
      onAddBlock(selectedSection, selectedModel, position);
      onClose();
      setSelectedSection(null);
      setSelectedModel(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSection(null);
    setSelectedModel(null);
  };

  const models = selectedSection ? (SECTION_MODELS_BY_SECTION[selectedSection] || []) : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Adicionar novo bloco</DialogTitle>
          <DialogDescription>
            {isAtLimit ? (
              <span className="text-warning">
                Limite de {limits.maxDynamicBlocks} blocos atingido no plano {userPlan}.
              </span>
            ) : (
              `Escolha o tipo de seção (${currentDynamicCount}/${limits.maxDynamicBlocks} blocos)`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Lista de seções */}
          <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Tipo de seção
                </p>
                {dynamicBlocks.map((block) => {
                  const isSelected = selectedSection === block.key;
                  const alreadyExists = existingBlocks.includes(block.key);
                  
                  return (
                    <motion.button
                      key={block.key}
                      onClick={() => handleSectionSelect(block.key)}
                      disabled={isAtLimit}
                      whileHover={{ scale: isAtLimit ? 1 : 1.01 }}
                      whileTap={{ scale: isAtLimit ? 1 : 0.99 }}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all",
                        isSelected 
                          ? "bg-primary/10 border-primary" 
                          : "bg-card hover:bg-muted/50 border-transparent",
                        isAtLimit && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{block.name}</span>
                            {alreadyExists && (
                              <Badge variant="outline" className="text-[9px]">
                                Em uso
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {block.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Lista de modelos */}
          <div className="w-full md:w-1/2">
            <ScrollArea className="h-full">
              <div className="p-4">
                {selectedSection ? (
                  <>
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Escolher modelo
                    </p>
                    <div className="space-y-2">
                      {models.map((model) => {
                        const isLocked = !canUseModel(model.plan, userPlan);
                        const isSelected = selectedModel === model.id;
                        
                        return (
                          <motion.button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id, model.plan)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                              "w-full text-left p-3 rounded-xl border transition-all",
                              isSelected 
                                ? "bg-primary/10 border-primary" 
                                : "bg-card hover:bg-muted/50 border-transparent",
                              isLocked && "opacity-60"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{model.name}</span>
                                  {model.plan !== 'free' && (
                                    <Badge 
                                      variant={model.plan === 'premium' ? 'default' : 'secondary'}
                                      className="text-[9px] px-1.5 py-0 uppercase"
                                    >
                                      {model.plan === 'premium' && <Sparkles className="w-2.5 h-2.5 mr-0.5" />}
                                      {model.plan}
                                    </Badge>
                                  )}
                                </div>
                                {model.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {model.description}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0 ml-2">
                                {isLocked ? (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                ) : isSelected ? (
                                  <Check className="w-4 h-4 text-primary" />
                                ) : null}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Selecione uma seção
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {isAtLimit ? (
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-primary"
                onClick={onUpgradeClick}
              >
                Fazer upgrade para adicionar mais blocos
              </Button>
            ) : (
              `${limits.maxDynamicBlocks - currentDynamicCount} blocos disponíveis`
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedSection || !selectedModel || isAtLimit}
            >
              Adicionar bloco
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
