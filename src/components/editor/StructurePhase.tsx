/**
 * StructurePhase - Fase de estrutura do editor
 * Sprint 5.0: Escolha sequencial de seções e modelos
 * Com preview em tempo real do modelo antes de adicionar
 */

import { useState, useCallback, useMemo } from 'react';
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
  Sparkles,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  SectionKey, 
  SECTION_MODELS_BY_SECTION, 
  PlanLevelWithMaster,
  PlanLevel,
  getSectionModel,
  SECTION_MODEL_KEY
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
import { SectionLoader } from '@/components/sections/SectionLoader';

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

// Conteúdo de exemplo para preview de cada seção
const getPreviewContent = (sectionKey: SectionKey): Record<string, any> => {
  const baseContent: Record<SectionKey, Record<string, any>> = {
    menu: {
      brand_name: 'Sua Marca',
      links: JSON.stringify([
        { label: 'Início', url: '#' },
        { label: 'Recursos', url: '#recursos' },
        { label: 'Preços', url: '#precos' }
      ]),
      cta_label: 'Começar agora',
      cta_url: '#'
    },
    hero: {
      titulo: 'Título principal da sua página',
      subtitulo: 'Um subtítulo impactante que descreve seu produto ou serviço de forma clara e objetiva.',
      cta_primary_label: 'Começar agora',
      cta_primary_url: '#',
      cta_secondary_label: 'Saiba mais',
      cta_secondary_url: '#'
    },
    como_funciona: {
      titulo: 'Como funciona',
      subtitulo: 'Veja como é fácil começar',
      passos: JSON.stringify([
        { numero: '1', titulo: 'Cadastre-se', descricao: 'Crie sua conta em segundos' },
        { numero: '2', titulo: 'Configure', descricao: 'Personalize do seu jeito' },
        { numero: '3', titulo: 'Aproveite', descricao: 'Comece a usar imediatamente' }
      ])
    },
    para_quem_e: {
      titulo: 'Para quem é',
      subtitulo: 'Solução ideal para diferentes perfis',
      perfis: JSON.stringify([
        { titulo: 'Empreendedores', descricao: 'Que querem escalar seus negócios' },
        { titulo: 'Freelancers', descricao: 'Que buscam mais clientes' },
        { titulo: 'Empresas', descricao: 'Que precisam de resultados' }
      ])
    },
    beneficios: {
      titulo: 'Benefícios',
      subtitulo: 'Por que escolher nossa solução',
      items: JSON.stringify([
        { titulo: 'Rápido', descricao: 'Resultados em minutos' },
        { titulo: 'Fácil', descricao: 'Sem complicação' },
        { titulo: 'Seguro', descricao: 'Proteção total' }
      ])
    },
    provas_sociais: {
      titulo: 'O que nossos clientes dizem',
      subtitulo: 'Depoimentos reais',
      depoimentos: JSON.stringify([
        { nome: 'João Silva', cargo: 'CEO', empresa: 'TechCorp', texto: 'Excelente solução!' },
        { nome: 'Maria Santos', cargo: 'Gerente', empresa: 'StartupX', texto: 'Recomendo!' }
      ])
    },
    planos: {
      titulo: 'Nossos planos',
      subtitulo: 'Escolha o ideal para você',
      planos: JSON.stringify([
        { nome: 'Básico', preco: 'R$ 29', periodo: '/mês', recursos: ['Recurso 1', 'Recurso 2'], destaque: false },
        { nome: 'Pro', preco: 'R$ 79', periodo: '/mês', recursos: ['Tudo do Básico', 'Recurso 3'], destaque: true }
      ])
    },
    faq: {
      titulo: 'Perguntas frequentes',
      subtitulo: 'Tire suas dúvidas',
      perguntas: JSON.stringify([
        { pergunta: 'Como funciona?', resposta: 'É muito simples...' },
        { pergunta: 'Tem garantia?', resposta: 'Sim, 30 dias!' }
      ])
    },
    chamada_final: {
      titulo: 'Pronto para começar?',
      subtitulo: 'Junte-se a milhares de clientes satisfeitos',
      cta_label: 'Criar conta grátis',
      cta_url: '#'
    },
    rodape: {
      copyright: '© 2024 Sua Marca. Todos os direitos reservados.',
      links: JSON.stringify([
        { label: 'Termos', url: '#' },
        { label: 'Privacidade', url: '#' }
      ])
    }
  };
  
  return baseContent[sectionKey] || {};
};

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
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

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

  // Preview content memoizado - inclui o model ID para o SectionLoader resolver
  const previewContent = useMemo(() => {
    if (!previewModel) return {};
    const baseContent = getPreviewContent(previewModel.sectionKey);
    return {
      ...baseContent,
      [SECTION_MODEL_KEY]: previewModel.modelId
    };
  }, [previewModel]);

  const handleSelectModel = async (sectionKey: SectionKey, modelId: string) => {
    setAddingSection(true);
    try {
      await onAddSection(sectionKey, modelId);
      setPreviewModel(null);
      setShowPreviewPanel(false);
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

  const handlePreviewModel = (sectionKey: SectionKey, modelId: string) => {
    setPreviewModel({ sectionKey, modelId });
    setShowPreviewPanel(true);
  };

  const renderBlockCard = (block: EditorBlock, canModify: boolean = true) => {
    const definition = getBlockDefinition(block.sectionKey);
    if (!definition) return null;

    const models = SECTION_MODELS_BY_SECTION[block.sectionKey] || [];
    const currentModel = models.find(m => m.id === block.modelId);
    const isExpanded = expandedSection === block.id;

    return (
      <Card className={cn(
        "border-2 transition-all duration-200 overflow-hidden",
        isExpanded ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
      )}>
        <CardContent className="p-3 sm:p-4">
          {/* Header - Mobile-first responsive layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {definition.canReorder && canModify && (
                <div className="cursor-grab text-muted-foreground hover:text-foreground flex-shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground text-sm sm:text-base truncate">{definition.name}</span>
                  {definition.isFixed && (
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] flex-shrink-0">Fixo</Badge>
                  )}
                </div>
                {currentModel && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    {currentModel.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Model selector toggle - Compact on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(isExpanded ? null : block.id)}
                className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Trocar modelo</span>
                <span className="sm:hidden">Modelo</span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1 transition-transform",
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
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveBlock(block.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Remover bloco"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Model selector expanded - Mobile-optimized grid */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
                  <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-foreground">Escolher modelo:</p>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
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
          <CardContent className="p-4 sm:p-6 text-center">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              Limite de {limits.maxDynamicBlocks} blocos no plano {userPlan}
            </p>
            <Button variant="outline" size="sm" onClick={onUpgradeClick}>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="text-xs sm:text-sm">Fazer upgrade</span>
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
        <Card className="border-2 border-dashed border-primary/50 bg-primary/5 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">Adicionar: {definition.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{definition.description}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-foreground">
              Escolha um modelo <span className="text-muted-foreground font-normal">(clique para ver preview)</span>:
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {models.map((model) => {
                const isLocked = !isMaster && !canUseModel(model.plan, userPlan as PlanLevel);
                const isSelected = previewModel?.modelId === model.id && previewModel?.sectionKey === nextSectionToAdd;
                
                return (
                  <div 
                    key={model.id}
                    className="relative group"
                  >
                    <ModelThumbnail
                      modelId={model.id}
                      name={model.name}
                      plan={model.plan}
                      isLocked={isLocked}
                      isSelected={isSelected}
                      onClick={() => {
                        if (isLocked) {
                          onUpgradeClick();
                        } else {
                          handlePreviewModel(nextSectionToAdd, model.id);
                        }
                      }}
                    />
                    {/* Preview indicator */}
                    {!isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg pointer-events-none">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Preview and confirm - Mobile responsive buttons */}
            {previewModel && previewModel.sectionKey === nextSectionToAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>Modelo selecionado: <strong className="text-foreground">{models.find(m => m.id === previewModel.modelId)?.name}</strong></span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                    className="text-xs"
                  >
                    {showPreviewPanel ? 'Esconder' : 'Ver'} preview
                  </Button>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewModel(null);
                      setShowPreviewPanel(false);
                    }}
                    className="w-full sm:w-auto text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleSelectModel(nextSectionToAdd, previewModel.modelId)}
                    disabled={addingSection}
                    className="w-full sm:w-auto text-sm"
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
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

  // Preview Panel Component
  const renderPreviewPanel = () => {
    if (!previewModel || !showPreviewPanel) return null;

    const model = getSectionModel(previewModel.sectionKey, previewModel.modelId);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mt-4"
      >
        <Card className="border-2 border-primary/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-primary/10 border-b">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Preview: {model?.name || previewModel.modelId}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreviewPanel(false)}
              className="h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative bg-background">
            {/* Preview container with scale for better viewing */}
            <div className="overflow-hidden" style={{ maxHeight: '400px' }}>
              <ScrollArea className="h-[400px]">
                <div className="transform origin-top scale-[0.6] sm:scale-75 lg:scale-90" style={{ width: '166.67%', transformOrigin: 'top left' }}>
                  <SectionLoader
                    sectionKey={previewModel.sectionKey}
                    content={previewContent}
                    settings={settings}
                    lpId="preview"
                    editable={false}
                    userPlan={userPlan}
                  />
                </div>
              </ScrollArea>
            </div>
            {/* Gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Status - Mobile responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-3 sm:p-4 rounded-lg bg-muted/30 border">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm sm:text-base">Estrutura da página</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {blocks.length} seções • {dynamicBlockCount} blocos
          </p>
        </div>
        {!isMaster && (
          <Badge variant="outline" className="text-[10px] sm:text-xs self-start xs:self-auto flex-shrink-0">
            {dynamicBlockCount}/{limits.maxDynamicBlocks} blocos
          </Badge>
        )}
        {isMaster && (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] sm:text-xs self-start xs:self-auto flex-shrink-0">
            Master
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

      {/* Live Preview Panel */}
      <AnimatePresence>
        {renderPreviewPanel()}
      </AnimatePresence>

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
