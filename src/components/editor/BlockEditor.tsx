/**
 * BlockEditor - Editor principal por blocos (Sprint 5.0)
 * Layout limpo e minimalista
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SectionKey, PlanLevelWithMaster, SECTION_MODELS_BY_SECTION, StylePreset } from '@/lib/sectionModels';
import {
  EditorBlock,
  getBlockDefinition,
  canAddMoreBlocks,
  generateBlockId,
  PLAN_LIMITS,
} from '@/lib/blockEditorTypes';
import { useSaveStatus } from './SaveIndicator';
import { PublishChecklist } from './PublishChecklist';
import { UpgradeModal } from '@/components/client/UpgradeModal';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { SectionSeparator } from '@/components/sections/SectionSeparator';
import { SEOHead } from '@/components/SEOHead';
import { StructurePhase } from './StructurePhase';
import { ContentPhase } from './ContentPhase';
import { WizardPhase } from './WizardPhase';
import { WhatsAppFloatingButton, WhatsAppConfig } from '@/components/WhatsAppFloatingButton';
import { EditorHeader } from './EditorHeader';
import { EditorNavTabs, EditorNavTabsMobile, EditorPhase } from './EditorNavTabs';
import { EditorSettingsPanel } from './EditorSettingsPanel';
import {
  saveSectionContent,
  saveSettings,
  getSectionOrder,
  updateSectionOrder,
  getAllContent,
  getSettings,
  LPContent,
  LPSettings,
  SECTION_NAMES,
} from '@/lib/lpContentApi';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/tracking';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useEditHistory } from '@/hooks/useEditHistory';
import { useLiveSync } from '@/hooks/useLiveSync';

interface BlockEditorProps {
  lpId: string;
  lpData: {
    nome: string;
    slug: string;
    publicado: boolean;
  };
  userPlan: PlanLevelWithMaster;
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
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  
  // Phase control
  const [phase, setPhase] = useState<EditorPhase>('wizard');

  // Panels
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' });
  const [publishChecklistOpen, setPublishChecklistOpen] = useState(false);

  // Save status
  const { status: saveStatus, setSaving: setSaveStatusSaving, setSaved: setSaveStatusSaved, setError: setSaveStatusError } = useSaveStatus();

  const limits = PLAN_LIMITS[userPlan];
  const isMaster = userPlan === 'master';
  const canEditTheme = userPlan === 'pro' || userPlan === 'premium' || isMaster;

  // Scroll tracking
  useScrollTracking({ lpId, enabled: phase === 'preview' && lpData.publicado });

  // Edit history
  const { markLocalUpdate } = useLiveSync({
    lpId,
    enabled: true,
    onContentUpdate: (sectionKey, newContent) => {
      setContent(prev => ({ ...prev, [sectionKey]: newContent }));
    },
    onSettingsUpdate: (key, value) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    },
  });

  // Load data
  useEffect(() => {
    loadEditorData();
  }, [lpId]);

  // Auto-select phase
  useEffect(() => {
    if (!loading && blocks.length > 0) {
      const hasContent = Object.keys(content).some(k => {
        const sectionContent = content[k];
        const keys = Object.keys(sectionContent || {}).filter(key => !key.startsWith('_'));
        return keys.length > 1;
      });
      
      if (blocks.length <= 2 && !hasContent) {
        setPhase('structure');
      }
    }
  }, [loading, blocks, content]);

  // Track preview
  useEffect(() => {
    if (phase === 'preview' && lpData.publicado) {
      trackEvent({ event_type: 'view', lp_id: lpId, metadata: { context: 'editor_preview' } });
    }
  }, [phase, lpId, lpData.publicado]);

  const loadEditorData = async () => {
    setLoading(true);
    try {
      const [contentData, settingsData, orderData] = await Promise.all([
        getAllContent(lpId),
        getSettings(lpId),
        getSectionOrder(lpId),
      ]);

      setContent(contentData);
      setSettings(settingsData);

      const existingBlocks: EditorBlock[] = [];
      
      // Menu
      if (contentData.menu || orderData.includes('menu')) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'menu',
          modelId: (contentData.menu as any)?.['__model_id'] || 'menu_glass_minimal',
          order: 0,
          content: contentData.menu || {},
        });
      }

      // Hero
      if (contentData.hero || orderData.includes('hero')) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'hero',
          modelId: (contentData.hero as any)?.['__model_id'] || 'hero_glass_aurora',
          order: 1,
          content: contentData.hero || {},
        });
      }

      // Dynamic blocks
      const dynamicOrder = orderData.filter(k => !['menu', 'hero', 'rodape'].includes(k));
      dynamicOrder.forEach((key, idx) => {
        if (contentData[key]) {
          existingBlocks.push({
            id: generateBlockId(),
            sectionKey: key as SectionKey,
            modelId: (contentData[key] as any)?.['__model_id'] || getDefaultModel(key as SectionKey),
            order: idx + 2,
            content: contentData[key] || {},
          });
        }
      });

      // Rodape
      if (contentData.rodape || orderData.includes('rodape')) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'rodape',
          modelId: (contentData.rodape as any)?.['__model_id'] || 'rodape_minimal_soft',
          order: 999,
          content: contentData.rodape || {},
        });
      }

      // New LP
      if (existingBlocks.length === 0) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'menu',
          modelId: 'menu_glass_minimal',
          order: 0,
          content: { __model_id: 'menu_glass_minimal' } as unknown as LPContent,
          isNew: true,
        });
        await saveSectionContent(lpId, 'menu', { __model_id: 'menu_glass_minimal' } as unknown as LPContent);
      }

      setBlocks(existingBlocks);
    } catch (error) {
      console.error('[BlockEditor] Error loading:', error);
      toast({ title: 'Erro ao carregar editor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultModel = (sectionKey: SectionKey): string => {
    const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
    if (models.length > 0) return models[0].id;
    
    const defaults: Record<SectionKey, string> = {
      menu: 'menu_glass_minimal',
      hero: 'hero_glass_aurora',
      como_funciona: 'como_funciona_timeline_glass',
      para_quem_e: 'para_quem_e_chips_personas',
      beneficios: 'beneficios_icon_grid_glass',
      provas_sociais: 'provas_sociais_depoimentos_glass',
      planos: 'planos_glass_three_tiers',
      faq: 'faq_accordion_glass',
      chamada_final: 'chamada_final_simple_glass',
      rodape: 'rodape_minimal_soft',
    };
    return defaults[sectionKey] || `${sectionKey}_default`;
  };

  const dynamicBlockCount = blocks.filter(b => {
    const def = getBlockDefinition(b.sectionKey);
    return def && !def.isFixed;
  }).length;

  const persistBlockOrderWithBlocks = useCallback(async (blocksToSave: EditorBlock[]) => {
    const order = blocksToSave.filter(b => b.sectionKey !== 'rodape').map(b => b.sectionKey);
    if (blocksToSave.some(b => b.sectionKey === 'rodape')) order.push('rodape');
    await updateSectionOrder(lpId, order);
    await saveSettings(lpId, { enabled_sections: JSON.stringify(blocksToSave.map(b => b.sectionKey)) });
  }, [lpId]);

  // Handlers
  const handleAddSection = useCallback(async (sectionKey: SectionKey, modelId: string) => {
    if (!isMaster && !canAddMoreBlocks(dynamicBlockCount, userPlan)) {
      setUpgradeModal({ open: true, feature: 'adicionar mais blocos' });
      return;
    }

    setSaveStatusSaving();
    const newBlock: EditorBlock = {
      id: generateBlockId(),
      sectionKey,
      modelId,
      order: blocks.length,
      content: { __model_id: modelId } as unknown as LPContent,
      isNew: true,
    };

    const rodapeIndex = blocks.findIndex(b => b.sectionKey === 'rodape');
    let updatedBlocks: EditorBlock[];
    
    setBlocks(prev => {
      const updated = [...prev];
      if (rodapeIndex >= 0) {
        updated.splice(rodapeIndex, 0, newBlock);
      } else {
        updated.push(newBlock);
      }
      updatedBlocks = updated.map((b, idx) => ({ ...b, order: idx }));
      return updatedBlocks;
    });

    setContent(prev => ({ ...prev, [sectionKey]: { __model_id: modelId } as LPContent }));

    try {
      await saveSectionContent(lpId, sectionKey, { __model_id: modelId } as unknown as LPContent);
      const finalBlocks = [...blocks];
      if (rodapeIndex >= 0) {
        finalBlocks.splice(rodapeIndex, 0, newBlock);
      } else {
        finalBlocks.push(newBlock);
      }
      await persistBlockOrderWithBlocks(finalBlocks.map((b, i) => ({ ...b, order: i })));
      setSaveStatusSaved();
      toast({ title: `Seção "${SECTION_NAMES[sectionKey]}" adicionada!` });
    } catch (error) {
      console.error('[BlockEditor] Error adding section:', error);
      setSaveStatusError();
      toast({ title: 'Erro ao adicionar seção', variant: 'destructive' });
    }
  }, [lpId, blocks, dynamicBlockCount, userPlan, isMaster, persistBlockOrderWithBlocks]);

  const handleChangeModel = useCallback(async (blockId: string, modelId: string) => {
    setSaveStatusSaving();
    setBlocks(prev => prev.map(b => 
      b.id === blockId ? { ...b, modelId, content: { ...b.content, __model_id: modelId } as LPContent } : b
    ));

    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setContent(prev => ({ ...prev, [block.sectionKey]: { ...prev[block.sectionKey], __model_id: modelId } as LPContent }));
      try {
        await saveSectionContent(lpId, block.sectionKey, { ...block.content, __model_id: modelId } as LPContent);
        await saveSettings(lpId, { [`${block.sectionKey}_variante`]: modelId });
        setSaveStatusSaved();
        toast({ title: 'Modelo atualizado!' });
      } catch (error) {
        console.error('[BlockEditor] Error changing model:', error);
        setSaveStatusError();
      }
    }
  }, [lpId, blocks]);

  const handleDuplicateBlock = useCallback(async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const def = getBlockDefinition(block.sectionKey);
    if (!def || def.isFixed) return;

    if (!isMaster && !canAddMoreBlocks(dynamicBlockCount, userPlan)) {
      setUpgradeModal({ open: true, feature: 'duplicar blocos' });
      return;
    }

    const newBlock: EditorBlock = { ...block, id: generateBlockId(), isNew: true };
    const idx = blocks.findIndex(b => b.id === blockId);
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(idx + 1, 0, newBlock);
    const finalBlocks = updatedBlocks.map((b, i) => ({ ...b, order: i }));

    setBlocks(finalBlocks);

    try {
      await saveSectionContent(lpId, block.sectionKey, block.content);
      await persistBlockOrderWithBlocks(finalBlocks);
      toast({ title: 'Bloco duplicado!' });
    } catch (error) {
      console.error('[BlockEditor] Error duplicating block:', error);
    }
  }, [lpId, blocks, dynamicBlockCount, userPlan, isMaster, persistBlockOrderWithBlocks]);

  const handleRemoveBlock = useCallback(async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const updatedBlocks = blocks.filter(b => b.id !== blockId).map((b, i) => ({ ...b, order: i }));
    setBlocks(updatedBlocks);
    setContent(prev => {
      const updated = { ...prev };
      delete updated[block.sectionKey];
      return updated;
    });

    try {
      await supabase.from('lp_content').delete().eq('lp_id', lpId).eq('section', block.sectionKey);
      await persistBlockOrderWithBlocks(updatedBlocks);
      toast({ title: 'Bloco removido!' });
    } catch (error) {
      console.error('[BlockEditor] Error removing block:', error);
      toast({ title: 'Erro ao remover bloco', variant: 'destructive' });
    }
  }, [lpId, blocks, persistBlockOrderWithBlocks]);

  const handleReorder = useCallback(async (newOrder: EditorBlock[]) => {
    const menu = newOrder.find(b => b.sectionKey === 'menu');
    const hero = newOrder.find(b => b.sectionKey === 'hero');
    const rodape = newOrder.find(b => b.sectionKey === 'rodape');
    const dynamic = newOrder.filter(b => !['menu', 'hero', 'rodape'].includes(b.sectionKey));

    const finalOrder = [menu, hero, ...dynamic, rodape].filter(Boolean).map((b, i) => ({ ...b!, order: i }));
    setBlocks(finalOrder);
    await persistBlockOrderWithBlocks(finalOrder);
  }, [persistBlockOrderWithBlocks]);

  const handleContentUpdate = useCallback((sectionKey: SectionKey, newContent: LPContent) => {
    setContent(prev => ({ ...prev, [sectionKey]: newContent }));
    markLocalUpdate();
  }, [markLocalUpdate]);

  const handleThemeChange = async (theme: StylePreset) => {
    setSettings(prev => ({ ...prev, global_theme: theme }));
    setSaveStatusSaving();
    try {
      await saveSettings(lpId, { global_theme: theme });
      setSaveStatusSaved();
    } catch (error) {
      console.error('[BlockEditor] Error saving theme:', error);
      setSaveStatusError();
    }
  };

  const handleWhatsAppChange = async (key: keyof WhatsAppConfig, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveStatusSaving();
    try {
      await saveSettings(lpId, { [key]: value });
      setSaveStatusSaved();
    } catch (error) {
      console.error('[BlockEditor] Error saving WhatsApp:', error);
      setSaveStatusError();
    }
  };

  const handleSeparatorChange = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    await saveSettings(lpId, { [key]: value });
    setSaveStatusSaved();
  };

  const whatsAppConfig: WhatsAppConfig = {
    whatsapp_enabled: settings.whatsapp_enabled,
    whatsapp_phone: settings.whatsapp_phone,
    whatsapp_default_message: settings.whatsapp_default_message,
    whatsapp_position: settings.whatsapp_position as 'bottom_right' | 'bottom_left',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <EditorHeader
        lpName={lpData.nome}
        isPublished={lpData.publicado}
        isMaster={isMaster}
        saveStatus={saveStatus}
        onBack={() => navigate('/painel')}
        onViewPublic={onViewPublic}
        onPublish={() => setPublishChecklistOpen(true)}
        onOpenSettings={() => setSettingsPanelOpen(true)}
        saving={saving}
      />

      {/* Navigation - Desktop */}
      <div className="hidden sm:block border-b bg-background/50">
        <EditorNavTabs 
          phase={phase} 
          onPhaseChange={setPhase}
          className="py-2"
        />
      </div>

      {/* Navigation - Mobile */}
      <div className="sm:hidden">
        <EditorNavTabsMobile phase={phase} onPhaseChange={setPhase} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {phase === 'wizard' && (
          <motion.main
            key="wizard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="container mx-auto px-4 py-6 max-w-2xl"
          >
            <WizardPhase
              blocks={blocks}
              lpId={lpId}
              userPlan={userPlan}
              content={content}
              settings={settings}
              onAddSection={handleAddSection}
              onChangeModel={handleChangeModel}
              onContentUpdate={handleContentUpdate}
              onComplete={() => setPhase('preview')}
              onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'recursos premium' })}
            />
          </motion.main>
        )}

        {phase === 'structure' && (
          <motion.main
            key="structure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="container mx-auto px-4 py-6 max-w-2xl"
          >
            <StructurePhase
              blocks={blocks}
              lpId={lpId}
              userPlan={userPlan}
              content={content}
              settings={settings}
              onAddSection={handleAddSection}
              onChangeModel={handleChangeModel}
              onRemoveBlock={handleRemoveBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onReorder={handleReorder}
              onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'recursos premium' })}
            />
          </motion.main>
        )}

        {phase === 'content' && (
          <motion.main
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="container mx-auto px-4 py-6 max-w-3xl"
          >
            <ContentPhase
              blocks={blocks}
              lpId={lpId}
              userPlan={userPlan}
              content={content}
              settings={settings}
              onContentUpdate={handleContentUpdate}
            />
          </motion.main>
        )}

        {phase === 'preview' && (
          <motion.div
            key="preview"
            ref={previewRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="min-h-screen bg-background"
          >
            <SEOHead settings={settings} />
            
            {blocks.map((block, index) => {
              const showSeparator = 
                settings.separators_enabled === 'true' && 
                settings.separator_type && 
                settings.separator_type !== 'none' &&
                index > 0 && 
                block.sectionKey !== 'rodape' &&
                blocks[index - 1]?.sectionKey !== 'menu';
              
              return (
                <section 
                  key={block.id}
                  data-section-key={block.sectionKey}
                  className="relative"
                >
                  {showSeparator && (
                    <SectionSeparator
                      type={settings.separator_type as any}
                      position="top"
                      color={settings.separator_color}
                    />
                  )}
                  <SectionLoader
                    sectionKey={block.sectionKey}
                    lpId={lpId}
                    content={content[block.sectionKey]}
                    settings={settings}
                    userPlan={userPlan}
                    context="editor"
                    editable={false}
                    disableAnimations={false}
                  />
                </section>
              );
            })}

            <WhatsAppFloatingButton settings={whatsAppConfig} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <EditorSettingsPanel
        open={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
        currentTheme={(settings.global_theme as StylePreset) || 'glass'}
        onThemeChange={handleThemeChange}
        canEditTheme={canEditTheme}
        whatsAppConfig={whatsAppConfig}
        onWhatsAppChange={handleWhatsAppChange}
        separatorConfig={{
          separators_enabled: settings.separators_enabled,
          separator_type: settings.separator_type,
          separator_color: settings.separator_color,
        }}
        onSeparatorChange={handleSeparatorChange}
        userPlan={userPlan}
        onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'separadores premium' })}
      />

      {/* Modals */}
      <UpgradeModal
        open={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, feature: '' })}
        feature={upgradeModal.feature}
        currentPlan={userPlan}
        requiredPlan={userPlan === 'free' ? 'pro' : 'premium'}
      />

      <PublishChecklist
        open={publishChecklistOpen}
        onClose={() => setPublishChecklistOpen(false)}
        lpId={lpId}
        isPublished={lpData.publicado}
        slug={lpData.slug}
        onPublish={onPublish}
      />
    </div>
  );
};
