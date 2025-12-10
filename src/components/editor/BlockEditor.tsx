/**
 * BlockEditor - Editor principal por blocos
 * Componente central que gerencia a estrutura de blocos da LP
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  ArrowLeft, 
  Eye, 
  Save, 
  Loader2, 
  ExternalLink,
  Settings,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SectionKey, PlanLevel, SECTION_MODELS_BY_SECTION } from '@/lib/sectionModels';
import {
  EditorBlock,
  BLOCK_DEFINITIONS,
  getBlockDefinition,
  canAddMoreBlocks,
  generateBlockId,
  PLAN_LIMITS,
} from '@/lib/blockEditorTypes';
import { BlockCard } from './BlockCard';
import { BlockSeparator } from './BlockSeparator';
import { AddBlockModal } from './AddBlockModal';
import { ContentEditor } from './ContentEditor';
import { UpgradeModal } from '@/components/client/UpgradeModal';
import {
  saveSectionContent,
  saveSettings,
  getSectionOrder,
  updateSectionOrder,
  getAllContent,
  getSettings,
} from '@/lib/lpContentApi';
import { supabase } from '@/integrations/supabase/client';

interface BlockEditorProps {
  lpId: string;
  lpData: {
    nome: string;
    slug: string;
    publicado: boolean;
  };
  userPlan: PlanLevel;
  onPublish: () => void;
  onViewPublic: () => void;
}

export const BlockEditor = ({
  lpId,
  lpData,
  userPlan,
  onPublish,
  onViewPublic,
}: BlockEditorProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [content, setContent] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Modais
  const [addBlockModal, setAddBlockModal] = useState<{ open: boolean; position: number }>({
    open: false,
    position: 0,
  });
  const [contentEditorModal, setContentEditorModal] = useState<{
    open: boolean;
    sectionKey: SectionKey | null;
  }>({ open: false, sectionKey: null });
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' });

  const limits = PLAN_LIMITS[userPlan];

  // Carregar dados iniciais
  useEffect(() => {
    loadEditorData();
  }, [lpId]);

  const loadEditorData = async () => {
    setLoading(true);
    try {
      const [contentData, settingsData, orderData] = await Promise.all([
        getAllContent(lpId),
        getSettings(lpId),
        getSectionOrder(lpId),
      ]);

      setContent(contentData);
      setSettings(settingsData as Record<string, string>);

      // Construir lista de blocos a partir da ordem salva
      const existingBlocks: EditorBlock[] = [];
      
      // Blocos fixos: Menu sempre primeiro
      existingBlocks.push({
        id: generateBlockId(),
        sectionKey: 'menu',
        modelId: contentData.menu?.['__model_id'] || 'menu_horizontal',
        order: 0,
        content: contentData.menu || {},
      });

      // Hero sempre segundo
      existingBlocks.push({
        id: generateBlockId(),
        sectionKey: 'hero',
        modelId: contentData.hero?.['__model_id'] || 'hero_basic',
        order: 1,
        content: contentData.hero || {},
      });

      // Blocos dinâmicos (da ordem salva, excluindo menu, hero, rodape)
      const dynamicOrder = orderData.filter(
        k => !['menu', 'hero', 'rodape'].includes(k)
      );
      
      dynamicOrder.forEach((key, idx) => {
        if (contentData[key]) {
          existingBlocks.push({
            id: generateBlockId(),
            sectionKey: key as SectionKey,
            modelId: contentData[key]?.['__model_id'] || getDefaultModel(key as SectionKey),
            order: idx + 2,
            content: contentData[key] || {},
          });
        }
      });

      // Rodapé sempre por último
      existingBlocks.push({
        id: generateBlockId(),
        sectionKey: 'rodape',
        modelId: contentData.rodape?.['__model_id'] || 'footer_basic',
        order: 999,
        content: contentData.rodape || {},
      });

      setBlocks(existingBlocks);
    } catch (error) {
      console.error('[BlockEditor] Error loading data:', error);
      toast({ title: 'Erro ao carregar editor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultModel = (sectionKey: SectionKey): string => {
    const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
    return models[0]?.id || `${sectionKey}_basic`;
  };

  // Contar blocos dinâmicos (não fixos)
  const dynamicBlockCount = blocks.filter(b => {
    const def = getBlockDefinition(b.sectionKey);
    return def && !def.isFixed;
  }).length;

  // Handlers
  const handleAddBlock = useCallback(async (
    sectionKey: SectionKey, 
    modelId: string, 
    position: number
  ) => {
    if (!canAddMoreBlocks(dynamicBlockCount, userPlan)) {
      setUpgradeModal({ open: true, feature: 'adicionar mais blocos' });
      return;
    }

    const newBlock: EditorBlock = {
      id: generateBlockId(),
      sectionKey,
      modelId,
      order: position,
      content: { __model_id: modelId },
      isNew: true,
    };

    // Inserir na posição correta
    setBlocks(prev => {
      const updated = [...prev];
      // Encontrar onde inserir (entre blocos dinâmicos)
      let insertIndex = 2; // Após menu e hero
      for (let i = 2; i < updated.length; i++) {
        if (updated[i].sectionKey === 'rodape') break;
        if (i - 2 >= position) break;
        insertIndex = i + 1;
      }
      updated.splice(insertIndex, 0, newBlock);
      return updated.map((b, idx) => ({ ...b, order: idx }));
    });

    // Salvar no backend
    try {
      await saveSectionContent(lpId, sectionKey, { __model_id: modelId });
      await persistBlockOrder();
      toast({ title: 'Bloco adicionado!' });
    } catch (error) {
      console.error('[BlockEditor] Error adding block:', error);
      toast({ title: 'Erro ao adicionar bloco', variant: 'destructive' });
    }
  }, [lpId, dynamicBlockCount, userPlan]);

  const handleChangeModel = useCallback(async (blockId: string, modelId: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, modelId, content: { ...b.content, __model_id: modelId } } : b
    ));

    const block = blocks.find(b => b.id === blockId);
    if (block) {
      try {
        await saveSectionContent(lpId, block.sectionKey, { 
          ...block.content, 
          __model_id: modelId 
        });
        await saveSettings(lpId, { [`${block.sectionKey}_variante`]: modelId });
        toast({ title: 'Modelo atualizado!' });
      } catch (error) {
        console.error('[BlockEditor] Error changing model:', error);
      }
    }
  }, [lpId, blocks]);

  const handleDuplicateBlock = useCallback(async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const def = getBlockDefinition(block.sectionKey);
    if (!def || def.isFixed) return;

    if (!canAddMoreBlocks(dynamicBlockCount, userPlan)) {
      setUpgradeModal({ open: true, feature: 'duplicar blocos' });
      return;
    }

    const newBlock: EditorBlock = {
      ...block,
      id: generateBlockId(),
      isNew: true,
    };

    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      const updated = [...prev];
      updated.splice(idx + 1, 0, newBlock);
      return updated.map((b, i) => ({ ...b, order: i }));
    });

    try {
      await saveSectionContent(lpId, block.sectionKey, block.content);
      await persistBlockOrder();
      toast({ title: 'Bloco duplicado!' });
    } catch (error) {
      console.error('[BlockEditor] Error duplicating block:', error);
    }
  }, [lpId, blocks, dynamicBlockCount, userPlan]);

  const handleRemoveBlock = useCallback(async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setBlocks(prev => prev.filter(b => b.id !== blockId).map((b, i) => ({ ...b, order: i })));

    try {
      // Remover conteúdo do backend
      const { error } = await supabase
        .from('lp_content')
        .delete()
        .eq('lp_id', lpId)
        .eq('section', block.sectionKey);

      if (error) throw error;
      
      await persistBlockOrder();
      toast({ title: 'Bloco removido!' });
    } catch (error) {
      console.error('[BlockEditor] Error removing block:', error);
      toast({ title: 'Erro ao remover bloco', variant: 'destructive' });
    }
  }, [lpId, blocks]);

  const handleReorder = useCallback(async (newOrder: EditorBlock[]) => {
    // Garantir que menu, hero e rodapé não sejam reordenados
    const menu = newOrder.find(b => b.sectionKey === 'menu');
    const hero = newOrder.find(b => b.sectionKey === 'hero');
    const rodape = newOrder.find(b => b.sectionKey === 'rodape');
    const dynamic = newOrder.filter(b => 
      !['menu', 'hero', 'rodape'].includes(b.sectionKey)
    );

    const finalOrder = [
      menu!,
      hero!,
      ...dynamic,
      rodape!,
    ].map((b, i) => ({ ...b, order: i }));

    setBlocks(finalOrder);
  }, []);

  const persistBlockOrder = async () => {
    const order = blocks
      .filter(b => b.sectionKey !== 'rodape')
      .map(b => b.sectionKey);
    order.push('rodape');
    
    await updateSectionOrder(lpId, order);
    
    // Atualizar enabled_sections
    const enabledSections = blocks.map(b => b.sectionKey);
    await saveSettings(lpId, { 
      enabled_sections: JSON.stringify(enabledSections) 
    });
  };

  const handleEditContent = (sectionKey: SectionKey) => {
    setContentEditorModal({ open: true, sectionKey });
  };

  const handleContentSave = () => {
    loadEditorData();
  };

  // Separar blocos dinâmicos para reordenação
  const menuBlock = blocks.find(b => b.sectionKey === 'menu');
  const heroBlock = blocks.find(b => b.sectionKey === 'hero');
  const footerBlock = blocks.find(b => b.sectionKey === 'rodape');
  const dynamicBlocks = blocks.filter(b => 
    !['menu', 'hero', 'rodape'].includes(b.sectionKey)
  );

  const existingSectionKeys = blocks.map(b => b.sectionKey);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/painel')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Painel</span>
            </Button>
            
            <div className="hidden md:block">
              <h1 className="font-medium text-sm">{lpData.nome}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={lpData.publicado ? 'default' : 'secondary'} className="text-[10px]">
                  {lpData.publicado ? 'Publicado' : 'Rascunho'}
                </Badge>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {userPlan}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewPublic}>
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Visualizar</span>
            </Button>
            
            {!lpData.publicado && (
              <Button size="sm" onClick={onPublish} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Publicar</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Info do plano */}
        <div className="mb-6 p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {dynamicBlockCount}/{limits.maxDynamicBlocks} blocos utilizados
              </p>
              <p className="text-xs text-muted-foreground">
                Plano {userPlan} • {limits.maxDynamicBlocks - dynamicBlockCount} disponíveis
              </p>
            </div>
            {userPlan !== 'premium' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUpgradeModal({ open: true, feature: 'recursos premium' })}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* Lista de blocos */}
        <div className="space-y-0">
          {/* Menu (fixo) */}
          {menuBlock && (
            <BlockCard
              block={menuBlock}
              definition={getBlockDefinition('menu')!}
              userPlan={userPlan}
              onEdit={() => handleEditContent('menu')}
              onChangeModel={(modelId) => handleChangeModel(menuBlock.id, modelId)}
              onDuplicate={() => {}}
              onRemove={() => {}}
              onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'modelos premium' })}
            />
          )}

          {/* Hero (fixo) */}
          {heroBlock && (
            <>
              <BlockSeparator
                position={0}
                canAddBlock={false}
                isLimitReached={false}
                onAddBlock={() => {}}
                onUpgradeClick={() => {}}
              />
              <BlockCard
                block={heroBlock}
                definition={getBlockDefinition('hero')!}
                userPlan={userPlan}
                onEdit={() => handleEditContent('hero')}
                onChangeModel={(modelId) => handleChangeModel(heroBlock.id, modelId)}
                onDuplicate={() => {}}
                onRemove={() => {}}
                onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'modelos premium' })}
              />
            </>
          )}

          {/* Separador + botão de adicionar após Hero */}
          <BlockSeparator
            position={0}
            canAddBlock={canAddMoreBlocks(dynamicBlockCount, userPlan)}
            isLimitReached={!canAddMoreBlocks(dynamicBlockCount, userPlan)}
            onAddBlock={(pos) => setAddBlockModal({ open: true, position: pos })}
            onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'adicionar mais blocos' })}
          />

          {/* Blocos dinâmicos (reordenáveis) */}
          <Reorder.Group 
            axis="y" 
            values={dynamicBlocks}
            onReorder={(newOrder) => {
              const fullOrder = [menuBlock!, heroBlock!, ...newOrder, footerBlock!];
              handleReorder(fullOrder);
            }}
            className="space-y-0"
          >
            <AnimatePresence mode="popLayout">
              {dynamicBlocks.map((block, index) => {
                const definition = getBlockDefinition(block.sectionKey);
                if (!definition) return null;

                return (
                  <Reorder.Item 
                    key={block.id} 
                    value={block}
                    className="list-none"
                  >
                    <BlockCard
                      block={block}
                      definition={definition}
                      userPlan={userPlan}
                      onEdit={() => handleEditContent(block.sectionKey)}
                      onChangeModel={(modelId) => handleChangeModel(block.id, modelId)}
                      onDuplicate={() => handleDuplicateBlock(block.id)}
                      onRemove={() => handleRemoveBlock(block.id)}
                      onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'modelos premium' })}
                    />
                    
                    {/* Separador após cada bloco dinâmico */}
                    <BlockSeparator
                      position={index + 1}
                      canAddBlock={canAddMoreBlocks(dynamicBlockCount, userPlan)}
                      isLimitReached={!canAddMoreBlocks(dynamicBlockCount, userPlan)}
                      onAddBlock={(pos) => setAddBlockModal({ open: true, position: pos })}
                      onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'adicionar mais blocos' })}
                    />
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>

          {/* Footer (fixo) */}
          {footerBlock && (
            <BlockCard
              block={footerBlock}
              definition={getBlockDefinition('rodape')!}
              userPlan={userPlan}
              onEdit={() => handleEditContent('rodape')}
              onChangeModel={(modelId) => handleChangeModel(footerBlock.id, modelId)}
              onDuplicate={() => {}}
              onRemove={() => {}}
              onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'modelos premium' })}
            />
          )}
        </div>
      </main>

      {/* Modais */}
      <AddBlockModal
        open={addBlockModal.open}
        onClose={() => setAddBlockModal({ open: false, position: 0 })}
        position={addBlockModal.position}
        userPlan={userPlan}
        currentDynamicCount={dynamicBlockCount}
        existingBlocks={existingSectionKeys}
        onAddBlock={handleAddBlock}
        onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'adicionar mais blocos' })}
      />

      {contentEditorModal.sectionKey && (
        <ContentEditor
          open={contentEditorModal.open}
          onClose={() => setContentEditorModal({ open: false, sectionKey: null })}
          lpId={lpId}
          sectionKey={contentEditorModal.sectionKey}
          sectionName={getBlockDefinition(contentEditorModal.sectionKey)?.name || ''}
          onSave={handleContentSave}
        />
      )}

      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: '' })}
        feature={upgradeModal.feature}
        currentPlan={userPlan}
      />
    </div>
  );
};
