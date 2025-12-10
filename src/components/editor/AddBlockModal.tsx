/**
 * AddBlockModal - Modal para adicionar novo bloco com visualização de thumbnails
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Check, Sparkles, LayoutGrid } from 'lucide-react';
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
import { ModelThumbnail } from './ModelThumbnail';

interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
  position: number;
  userPlan: PlanLevel | 'master';
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
  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const isMaster = userPlan === 'master';
  const isAtLimit = !isMaster && currentDynamicCount >= limits.maxDynamicBlocks;

  const handleSectionSelect = (sectionKey: SectionKey) => {
    setSelectedSection(sectionKey);
    const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
    // Find first accessible model
    const accessibleModel = models.find(m => isMaster || canUseModel(m.plan, userPlan as PlanLevel));
    setSelectedModel(accessibleModel?.id || models[0]?.id || null);
  };

  const handleModelSelect = (modelId: string, modelPlan: PlanLevel) => {
    if (!isMaster && !canUseModel(modelPlan, userPlan as PlanLevel)) {
      onUpgradeClick();
      return;
    }
    setSelectedModel(modelId);
  };

  const handleConfirm = () => {
    if (selectedSection && selectedModel) {
      onAddBlock(selectedSection, selectedModel, position);
      handleClose();
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            Adicionar novo bloco
          </DialogTitle>
          <DialogDescription>
            {isAtLimit ? (
              <span className="text-destructive">
                Limite de {limits.maxDynamicBlocks} blocos atingido no plano {userPlan}.
              </span>
            ) : isMaster ? (
              <span className="text-primary">Plano Master - Todos os modelos disponíveis</span>
            ) : (
              `Escolha o tipo de seção (${currentDynamicCount}/${limits.maxDynamicBlocks} blocos)`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[550px]">
          {/* Lista de seções */}
          <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
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
                          ? "bg-primary/10 border-primary shadow-sm" 
                          : "bg-card hover:bg-muted/50 border-transparent hover:border-border",
                        isAtLimit && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{block.name}</span>
                            {alreadyExists && (
                              <Badge variant="outline" className="text-[9px] py-0">
                                Em uso
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {block.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Lista de modelos com thumbnails */}
          <div className="w-full md:w-3/5">
            <ScrollArea className="h-full">
              <div className="p-4">
                {selectedSection ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Escolher modelo ({models.length} disponíveis)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {models.map((model) => {
                        const isLocked = !isMaster && !canUseModel(model.plan, userPlan as PlanLevel);
                        const isSelected = selectedModel === model.id;
                        
                        return (
                          <ModelThumbnail
                            key={model.id}
                            modelId={model.id}
                            name={model.name}
                            plan={model.plan}
                            isLocked={isLocked}
                            isSelected={isSelected}
                            onClick={() => handleModelSelect(model.id, model.plan)}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Selected model description */}
                    {selectedModel && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        <p className="text-sm font-medium text-primary">
                          {models.find(m => m.id === selectedModel)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {models.find(m => m.id === selectedModel)?.description || 'Clique em "Adicionar bloco" para incluir na página'}
                        </p>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <LayoutGrid className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Selecione um tipo de seção para ver os modelos disponíveis
                    </p>
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
            ) : isMaster ? (
              <span className="text-primary font-medium">♾️ Blocos ilimitados</span>
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
              className="min-w-[140px]"
            >
              {selectedSection && selectedModel ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Adicionar bloco
                </>
              ) : (
                'Selecione um modelo'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
