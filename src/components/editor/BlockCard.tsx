/**
 * BlockCard - Card individual de bloco no editor
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GripVertical, 
  Edit3, 
  Palette, 
  Copy, 
  Trash2, 
  ChevronDown,
  Lock,
  Check
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { SectionKey, SECTION_MODELS_BY_SECTION, PlanLevel } from '@/lib/sectionModels';
import { BlockDefinition, canUseModel } from '@/lib/blockEditorTypes';

interface BlockCardProps {
  block: {
    id: string;
    sectionKey: SectionKey;
    modelId: string;
    order: number;
    isNew?: boolean;
  };
  definition: BlockDefinition;
  userPlan: PlanLevel;
  isDragging?: boolean;
  onEdit: () => void;
  onChangeModel: (modelId: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onUpgradeClick: () => void;
  dragHandleProps?: any;
}

export const BlockCard = ({
  block,
  definition,
  userPlan,
  isDragging = false,
  onEdit,
  onChangeModel,
  onDuplicate,
  onRemove,
  onUpgradeClick,
  dragHandleProps,
}: BlockCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);

  const models = SECTION_MODELS_BY_SECTION[block.sectionKey] || [];
  const currentModel = models.find(m => m.id === block.modelId) || models[0];

  const handleModelSelect = (modelId: string, modelPlan: PlanLevel) => {
    if (!canUseModel(modelPlan, userPlan)) {
      onUpgradeClick();
      return;
    }
    onChangeModel(modelId);
    setModelMenuOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={block.isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30,
          opacity: { duration: 0.2 }
        }}
        className={cn(
          "relative bg-card rounded-2xl border shadow-sm transition-all duration-200",
          isDragging && "shadow-lg ring-2 ring-primary/20 z-50",
          "hover:shadow-md"
        )}
      >
        {/* Header do bloco */}
        <div className="flex items-center gap-3 p-4 border-b">
          {/* Drag handle (apenas para blocos reordenáveis) */}
          {definition.canReorder && (
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-muted"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          {/* Info do bloco */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{definition.name}</h3>
              {definition.isFixed && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Fixo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {currentModel?.name || 'Modelo padrão'}
            </p>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1.5">
            {/* Dropdown de modelos */}
            {models.length > 1 && (
              <DropdownMenu open={modelMenuOpen} onOpenChange={setModelMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Escolher modelo
                  </div>
                  <DropdownMenuSeparator />
                  {models.map(model => {
                    const isLocked = !canUseModel(model.plan, userPlan);
                    const isSelected = model.id === block.modelId;
                    
                    return (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => handleModelSelect(model.id, model.plan)}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isSelected && "bg-primary/10"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm truncate">{model.name}</span>
                            {model.plan !== 'free' && (
                              <Badge 
                                variant={model.plan === 'premium' ? 'default' : 'secondary'}
                                className="text-[9px] px-1 py-0 uppercase"
                              >
                                {model.plan}
                              </Badge>
                            )}
                          </div>
                          {model.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {model.description}
                            </p>
                          )}
                        </div>
                        {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Botão editar */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2"
              onClick={onEdit}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>

            {/* Ações extras (duplicar/remover) */}
            {(definition.canRemove || !definition.isFixed) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Mais opções</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar bloco
                  </DropdownMenuItem>
                  {definition.canRemove && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteConfirm(true)}
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

        {/* Preview compacto (opcional - pode ser expandido) */}
        <div className="p-3 bg-muted/30">
          <div className="text-xs text-muted-foreground text-center">
            Clique em "Editar" para personalizar o conteúdo
          </div>
        </div>
      </motion.div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloco?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o bloco "{definition.name}" e todo seu conteúdo.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
