/**
 * EnhancedBlockCard - Card de bloco com UX melhorada
 * Sprint 4: Drag handle visível, duplicar, snap animation
 */

import { motion } from 'framer-motion';
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ModelThumbnail } from './ModelThumbnail';
import { BlockDefinition, EditorBlock, canUseModel } from '@/lib/blockEditorTypes';
import { SECTION_MODELS_BY_SECTION, PlanLevel, PlanLevelWithMaster } from '@/lib/sectionModels';

interface EnhancedBlockCardProps {
  block: EditorBlock;
  definition: BlockDefinition;
  userPlan: PlanLevelWithMaster;
  onEdit: () => void;
  onChangeModel: (modelId: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onUpgradeClick: () => void;
  isDragging?: boolean;
}

export const EnhancedBlockCard = ({
  block,
  definition,
  userPlan,
  onEdit,
  onChangeModel,
  onDuplicate,
  onRemove,
  onUpgradeClick,
  isDragging = false,
}: EnhancedBlockCardProps) => {
  const models = SECTION_MODELS_BY_SECTION[block.sectionKey] || [];
  const currentModel = models.find(m => m.id === block.modelId) || models[0];
  const isMaster = userPlan === 'master';

  const handleModelSelect = (modelId: string, modelPlan: PlanLevel) => {
    if (!isMaster && !canUseModel(modelPlan, userPlan)) {
      onUpgradeClick();
      return;
    }
    onChangeModel(modelId);
  };

  return (
    <motion.div
      layout
      initial={block.isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        boxShadow: isDragging ? '0 10px 40px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)'
      }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        "group relative bg-card rounded-xl border transition-all",
        isDragging && "z-50 ring-2 ring-primary shadow-2xl",
        !isDragging && "hover:border-primary/30 hover:shadow-md"
      )}
    >
      <div className="flex items-stretch">
        {/* Drag Handle - Mais visível */}
        {definition.canReorder && (
          <div
            className={cn(
              "flex items-center justify-center w-10 rounded-l-xl cursor-grab active:cursor-grabbing",
              "bg-muted/50 hover:bg-muted transition-colors border-r"
            )}
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between">
            {/* Left: Info */}
            <div className="flex items-center gap-3">
              {/* Mini thumbnail */}
              <div className="w-12 h-9 rounded-lg overflow-hidden border bg-muted/30 shrink-0">
                <ModelThumbnail
                  modelId={block.modelId}
                  name=""
                  plan={currentModel?.plan || 'free'}
                  isLocked={false}
                  isSelected={false}
                  onClick={() => {}}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{definition.name}</h3>
                  {definition.isFixed && (
                    <Badge variant="outline" className="text-[10px]">
                      Fixo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentModel?.name || 'Modelo padrão'}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 px-3"
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                Editar
              </Button>

              {/* Model selector dropdown */}
              {models.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      Modelo
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {models.map(model => {
                        const isLocked = !isMaster && !canUseModel(model.plan, userPlan);
                        const isSelected = model.id === block.modelId;

                        return (
                          <div
                            key={model.id}
                            onClick={() => handleModelSelect(model.id, model.plan)}
                            className={cn(
                              "relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all",
                              isSelected && "border-primary ring-2 ring-primary/20",
                              !isSelected && "border-transparent hover:border-muted-foreground/30",
                              isLocked && "opacity-60"
                            )}
                          >
                            <div className="aspect-[4/3]">
                              <ModelThumbnail
                                modelId={model.id}
                                name={model.name}
                                plan={model.plan}
                                isLocked={isLocked}
                                isSelected={isSelected}
                                onClick={() => {}}
                              />
                            </div>
                            
                            {isLocked && (
                              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* More actions */}
              {(definition.canRemove || !definition.isFixed) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!definition.isFixed && (
                      <DropdownMenuItem onClick={onDuplicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar bloco
                      </DropdownMenuItem>
                    )}
                    {definition.canRemove && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={onRemove}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover bloco
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium indicator */}
      {currentModel?.plan === 'premium' && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
