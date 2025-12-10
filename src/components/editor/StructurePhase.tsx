/**
 * StructurePhase - Fase de estrutura do editor
 * Sprint 5.0: Escolha sequencial de seções e modelos
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, 
  Check, 
  GripVertical, 
  Trash2, 
  Copy,
  Layout,
  ChevronDown,
  Lock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  SectionKey, 
  SECTION_MODELS_BY_SECTION, 
  PlanLevelWithMaster,
  PlanLevel 
} from '@/lib/sectionModels';
import { 
  EditorBlock, 
  getBlockDefinition, 
  canAddMoreBlocks,
  canUseModel,
  PLAN_LIMITS,
} from '@/lib/blockEditorTypes';
import { SECTION_NAMES } from '@/lib/lpContentApi';
import { ModelThumbnail } from './ModelThumbnail';

interface StructurePhaseProps {
  blocks: EditorBlock[];
  lpId: string;
  userPlan: PlanLevelWithMaster;
  content: Record<string, any>;
  settings: Record<string, any>;
  onAddSection: (sectionKey: SectionKey, modelId: string) => Promise<void>;
  onChangeModel: (blockId: string, modelId: string) => Promise<void>;
  onRemoveBlock: (blockId: string) => Promise<void>;
  onDuplicateBlock: (blockId: string) => Promise<void>;
  onReorder: (newOrder: EditorBlock[]) => void;
  onUpgradeClick: () => void;
}

// Ordem sequencial de seções para adicionar
const SECTION_SEQUENCE: SectionKey[] = [
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

export const StructurePhase = ({
  blocks,
  lpId,
  userPlan,
  content,
  settings,
  onAddSection,
  onChangeModel,
  onRemoveBlock,
  onDuplicateBlock,
  onReorder,
  onUpgradeClick,
}: StructurePhaseProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [previewModel, setPreviewModel] = useState<{ sectionKey: SectionKey; modelId: string } | null>(null);
  const [addingSection, setAddingSection] = useState(false);

  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const isMaster = userPlan === 'master';
  
  // Find which sections are already added
  const existingSectionKeys = blocks.map(b => b.sectionKey);
  
  // Find next section to add (sequential)
  const nextSectionToAdd = SECTION_SEQUENCE.find(
    s => !existingSectionKeys.includes(s)
  );

  // Count dynamic blocks (not fixed: menu, hero, rodape)
  const dynamicBlockCount = blocks.filter(b => {
    const def = getBlockDefinition(b.sectionKey);
    return def && !def.isFixed;
  }).length;

  const canAddMore = isMaster || canAddMoreBlocks(dynamicBlockCount, userPlan);

  // Separate blocks by type
  const menuBlock = blocks.find(b => b.sectionKey === 'menu');
  const heroBlock = blocks.find(b => b.sectionKey === 'hero');
  const footerBlock = blocks.find(b => b.sectionKey === 'rodape');
  const dynamicBlocks = blocks.filter(b => 
    !['menu', 'hero', 'rodape'].includes(b.sectionKey)
  );

  const handleSelectModel = async (sectionKey: SectionKey, modelId: string) => {
    setAddingSection(true);
    try {
      await onAddSection(sectionKey, modelId);
      setPreviewModel(null);
      console.log('[S5.0 QA] StructurePhase: Section added', { sectionKey, modelId });
    } finally {
      setAddingSection(false);
    }
  };

  const handleModelChange = async (blockId: string, modelId: string) => {
    await onChangeModel(blockId, modelId);
    setExpandedSection(null);
    console.log('[S5.0 QA] StructurePhase: Model changed', { blockId, modelId });
  };

  const handleDynamicReorder = useCallback((reorderedDynamic: EditorBlock[]) => {
    // Rebuild full order: menu → hero → dynamic (reordered) → rodape
    const fullOrder = [
      menuBlock,
      heroBlock,
      ...reorderedDynamic,
      footerBlock,
    ].filter(Boolean) as EditorBlock[];
    
    onReorder(fullOrder);
    console.log('[S5.0 QA] StructurePhase: Reordered', reorderedDynamic.map(b => b.sectionKey));
  }, [menuBlock, heroBlock, footerBlock, onReorder]);

  const renderBlockCard = (block: EditorBlock, canModify: boolean = true) => {
    const definition = getBlockDefinition(block.sectionKey);
    if (!definition) return null;

    const models = SECTION_MODELS_BY_SECTION[block.sectionKey] || [];
    const currentModel = models.find(m => m.id === block.modelId);
    const isExpanded = expandedSection === block.id;

    return (
      <Card className={cn(
        "border-2 transition-all duration-200",
        isExpanded ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {definition.canReorder && canModify && (
                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{definition.name}</span>
                  {definition.isFixed && (
                    <Badge variant="outline" className="text-[10px]">Fixo</Badge>
                  )}
                </div>
                {currentModel && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Modelo: {currentModel.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model selector toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(isExpanded ? null : block.id)}
                className="h-8"
              >
                <Layout className="w-4 h-4 mr-1" />
                Trocar modelo
                <ChevronDown className={cn(
                  "w-4 h-4 ml-1 transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </Button>

              {/* Actions for dynamic blocks only */}
              {canModify && definition.canRemove && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateBlock(block.id)}
                    className="h-8 w-8 p-0"
                    disabled={!canAddMore}
                    title="Duplicar bloco"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveBlock(block.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Remover bloco"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Model selector expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t">
                  <p className="text-sm font-medium mb-3 text-foreground">Escolher modelo:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {models.map((model) => {
                      const isLocked = !isMaster && !canUseModel(model.plan, userPlan as PlanLevel);
                      const isSelected = block.modelId === model.id;
                      
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
                              handleModelChange(block.id, model.id);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  };

  const renderAddSectionCard = () => {
    if (!nextSectionToAdd) return null;
    
    const definition = getBlockDefinition(nextSectionToAdd);
    if (!definition) return null;

    // Check if we're at limit for dynamic blocks
    const isDynamic = !definition.isFixed;
    if (isDynamic && !canAddMore) {
      return (
        <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="p-6 text-center">
            <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Limite de {limits.maxDynamicBlocks} blocos atingido no plano {userPlan}
            </p>
            <Button variant="outline" size="sm" onClick={onUpgradeClick}>
              <Sparkles className="w-4 h-4 mr-2" />
              Fazer upgrade
            </Button>
          </CardContent>
        </Card>
      );
    }

    const models = SECTION_MODELS_BY_SECTION[nextSectionToAdd] || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Adicionar: {definition.name}</h3>
                <p className="text-sm text-muted-foreground">{definition.description}</p>
              </div>
            </div>

            <p className="text-sm font-medium mb-3 text-foreground">Escolha um modelo:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {models.map((model) => {
                const isLocked = !isMaster && !canUseModel(model.plan, userPlan as PlanLevel);
                const isSelected = previewModel?.modelId === model.id;
                
                return (
                  <div 
                    key={model.id}
                    className="cursor-pointer"
                    onClick={() => {
                      if (isLocked) {
                        onUpgradeClick();
                      } else {
                        setPreviewModel({ sectionKey: nextSectionToAdd, modelId: model.id });
                      }
                    }}
                  >
                    <ModelThumbnail
                      modelId={model.id}
                      name={model.name}
                      plan={model.plan}
                      isLocked={isLocked}
                      isSelected={isSelected}
                      onClick={() => {}}
                    />
                  </div>
                );
              })}
            </div>

            {/* Preview and confirm */}
            {previewModel && previewModel.sectionKey === nextSectionToAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t"
              >
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewModel(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleSelectModel(nextSectionToAdd, previewModel.modelId)}
                    disabled={addingSection}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Adicionar seção
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
        <div>
          <p className="font-medium text-foreground">Estrutura da página</p>
          <p className="text-sm text-muted-foreground">
            {blocks.length} seções • {dynamicBlockCount} blocos dinâmicos
          </p>
        </div>
        {!isMaster && (
          <Badge variant="outline">
            {dynamicBlockCount}/{limits.maxDynamicBlocks} blocos
          </Badge>
        )}
        {isMaster && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            Master - Ilimitado
          </Badge>
        )}
      </div>

      {/* Menu Block (fixed, first) */}
      {menuBlock && (
        <motion.div layout key={menuBlock.id}>
          {renderBlockCard(menuBlock, false)}
        </motion.div>
      )}

      {/* Hero Block (fixed, second) */}
      {heroBlock && (
        <motion.div layout key={heroBlock.id}>
          {renderBlockCard(heroBlock, false)}
        </motion.div>
      )}

      {/* Dynamic blocks (reorderable) */}
      {dynamicBlocks.length > 0 && (
        <Reorder.Group
          axis="y"
          values={dynamicBlocks}
          onReorder={handleDynamicReorder}
          className="space-y-4"
        >
          {dynamicBlocks.map((block) => (
            <Reorder.Item 
              key={block.id} 
              value={block}
              className="list-none"
            >
              <motion.div layout>
                {renderBlockCard(block, true)}
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Add next section card */}
      {renderAddSectionCard()}

      {/* Footer Block (fixed, last) */}
      {footerBlock && (
        <motion.div layout key={footerBlock.id}>
          {renderBlockCard(footerBlock, false)}
        </motion.div>
      )}

      {/* All sections added message */}
      {!nextSectionToAdd && blocks.length >= SECTION_SEQUENCE.length && (
        <Card className="border-2 border-dashed border-green-500/50 bg-green-500/5">
          <CardContent className="p-6 text-center">
            <Check className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium text-green-700">Estrutura completa!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Vá para a aba "Conteúdo" para editar os textos e imagens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
