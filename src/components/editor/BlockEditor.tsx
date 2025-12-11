/**
 * BlockEditor - Editor principal por blocos (Sprint 5.0)
 * Fluxo em duas fases: Estrutura + Conteúdo
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Eye, 
  Loader2, 
  ExternalLink,
  LayoutGrid,
  FileText,
  Undo2,
  Redo2,
  Settings2,
  Wand2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SectionKey, PlanLevelWithMaster, SECTION_MODELS_BY_SECTION, StylePreset } from '@/lib/sectionModels';
import {
  EditorBlock,
  getBlockDefinition,
  canAddMoreBlocks,
  generateBlockId,
  PLAN_LIMITS,
} from '@/lib/blockEditorTypes';
import { SaveIndicator, useSaveStatus } from './SaveIndicator';
import { PublishChecklist } from './PublishChecklist';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UpgradeModal } from '@/components/client/UpgradeModal';
import { SectionLoader } from '@/components/sections/SectionLoader';
import { SectionSeparator } from '@/components/sections/SectionSeparator';
import { SEOHead } from '@/components/SEOHead';
import { StructurePhase } from './StructurePhase';
import { ContentPhase } from './ContentPhase';
import { WizardPhase } from './WizardPhase';
import { WhatsAppConfigPanel } from './WhatsAppConfigPanel';
import { SeparatorConfigPanel } from './SeparatorConfigPanel';
import { WhatsAppFloatingButton, WhatsAppConfig } from '@/components/WhatsAppFloatingButton';
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
  DEFAULT_SECTION_ORDER,
} from '@/lib/lpContentApi';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/tracking';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useEditHistory } from '@/hooks/useEditHistory';
import { useLiveSync } from '@/hooks/useLiveSync';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

type EditorPhase = 'wizard' | 'structure' | 'content' | 'preview';

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
  
  // Phase control - default to wizard for new LPs
  const [phase, setPhase] = useState<EditorPhase>('wizard');

  // Modals
  const [upgradeModal, setUpgradeModal] = useState({ open: false, feature: '' });
  const [publishChecklistOpen, setPublishChecklistOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);

  // Save status indicator
  const { status: saveStatus, setSaving: setSaveStatusSaving, setSaved: setSaveStatusSaved, setError: setSaveStatusError } = useSaveStatus();

  const limits = PLAN_LIMITS[userPlan];
  const isMaster = userPlan === 'master';

  // Scroll tracking in preview mode
  useScrollTracking({ lpId, enabled: phase === 'preview' && lpData.publicado });

  // Edit history (Undo/Redo)
  const { pushHistory, undo, redo, canUndo, canRedo, isSaving: isHistorySaving } = useEditHistory({
    lpId,
    maxHistorySize: 50,
    backupInterval: 5,
  });

  // Live sync via Supabase Realtime
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

  // Load initial data
  useEffect(() => {
    loadEditorData();
    console.log('[S5.0 QA] BlockEditor initialized:', { lpId, userPlan, isMaster });
  }, [lpId]);

  // Auto-select phase based on LP state
  useEffect(() => {
    if (!loading && blocks.length > 0) {
      // If LP has content already, default to content phase
      const hasContent = Object.keys(content).some(k => {
        const sectionContent = content[k];
        const keys = Object.keys(sectionContent || {}).filter(key => !key.startsWith('_'));
        return keys.length > 1;
      });
      
      // For new LPs (only menu), stay in structure phase
      if (blocks.length <= 2 && !hasContent) {
        setPhase('structure');
      }
    }
  }, [loading, blocks, content]);

  // Track page view in preview mode (only if LP is published to avoid RLS error)
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

      // Build blocks from saved order
      const existingBlocks: EditorBlock[] = [];
      
      // Menu always first
      if (contentData.menu || orderData.includes('menu')) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'menu',
          modelId: (contentData.menu as any)?.['__model_id'] || 'menu_glass_minimal',
          order: 0,
          content: contentData.menu || {},
        });
      }

      // Hero always second  
      if (contentData.hero || orderData.includes('hero')) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'hero',
          modelId: (contentData.hero as any)?.['__model_id'] || 'hero_glass_aurora',
          order: 1,
          content: contentData.hero || {},
        });
      }

      // Dynamic blocks (from saved order, excluding menu, hero, rodape)
      const dynamicOrder = orderData.filter(
        k => !['menu', 'hero', 'rodape'].includes(k)
      );
      
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

      // Rodape always last
      if (contentData.rodape || orderData.includes('rodape')) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'rodape',
          modelId: (contentData.rodape as any)?.['__model_id'] || 'rodape_minimal_soft',
          order: 999,
          content: contentData.rodape || {},
        });
      }

      // If no blocks exist, start with just menu
      if (existingBlocks.length === 0) {
        existingBlocks.push({
          id: generateBlockId(),
          sectionKey: 'menu',
          modelId: 'menu_glass_minimal',
          order: 0,
          content: { __model_id: 'menu_glass_minimal' } as unknown as LPContent,
          isNew: true,
        });
        
        // Save initial menu
        await saveSectionContent(lpId, 'menu', { __model_id: 'menu_glass_minimal' } as unknown as LPContent);
      }

      setBlocks(existingBlocks);
      console.log('[S5.0 QA] Editor data loaded:', { blocksCount: existingBlocks.length });
    } catch (error) {
      console.error('[BlockEditor] Error loading data:', error);
      toast({ title: 'Erro ao carregar editor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultModel = (sectionKey: SectionKey): string => {
    const models = SECTION_MODELS_BY_SECTION[sectionKey] || [];
    if (models.length > 0) return models[0].id;
    
    // Fallback to default IDs from simplified catalog
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

  // Count dynamic blocks (not fixed)
  const dynamicBlockCount = blocks.filter(b => {
    const def = getBlockDefinition(b.sectionKey);
    return def && !def.isFixed;
  }).length;

  // Persist block order using the provided blocks list (declared early for use in handlers)
  const persistBlockOrderWithBlocks = useCallback(async (blocksToSave: EditorBlock[]) => {
    const order = blocksToSave
      .filter(b => b.sectionKey !== 'rodape')
      .map(b => b.sectionKey);
    
    if (blocksToSave.some(b => b.sectionKey === 'rodape')) {
      order.push('rodape');
    }
    
    await updateSectionOrder(lpId, order);
    
    const enabledSections = blocksToSave.map(b => b.sectionKey);
    await saveSettings(lpId, {
      enabled_sections: JSON.stringify(enabledSections) 
    });
  }, [lpId]);

  // Legacy persistBlockOrder using current state
  const persistBlockOrder = useCallback(async () => {
    await persistBlockOrderWithBlocks(blocks);
  }, [blocks, persistBlockOrderWithBlocks]);

  // Handlers
  const handleAddSection = useCallback(async (
    sectionKey: SectionKey, 
    modelId: string
  ) => {
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

    // Find insert position (before rodape if exists)
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

    // Update content state
    setContent(prev => ({
      ...prev,
      [sectionKey]: { __model_id: modelId } as LPContent,
    }));

    // Save to backend
    try {
      await saveSectionContent(lpId, sectionKey, { __model_id: modelId } as unknown as LPContent);
      
      // Persist using the calculated updated blocks
      const finalBlocks = [...blocks];
      if (rodapeIndex >= 0) {
        finalBlocks.splice(rodapeIndex, 0, newBlock);
      } else {
        finalBlocks.push(newBlock);
      }
      await persistBlockOrderWithBlocks(finalBlocks.map((b, i) => ({ ...b, order: i })));
      
      setSaveStatusSaved();
      toast({ title: `Seção "${SECTION_NAMES[sectionKey]}" adicionada!` });
      console.log('[S5.0 QA] Section added:', { sectionKey, modelId });
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
      // Update content state
      setContent(prev => ({
        ...prev,
        [block.sectionKey]: { ...prev[block.sectionKey], __model_id: modelId } as LPContent,
      }));

      try {
        await saveSectionContent(lpId, block.sectionKey, { 
          ...block.content, 
          __model_id: modelId 
        } as LPContent);
        await saveSettings(lpId, { [`${block.sectionKey}_variante`]: modelId });
        setSaveStatusSaved();
        toast({ title: 'Modelo atualizado!' });
        console.log('[S5.0 QA] Model changed:', { blockId, modelId });
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

    const newBlock: EditorBlock = {
      ...block,
      id: generateBlockId(),
      isNew: true,
    };

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

    // Remove from content state
    setContent(prev => {
      const updated = { ...prev };
      delete updated[block.sectionKey];
      return updated;
    });

    try {
      const { error } = await supabase
        .from('lp_content')
        .delete()
        .eq('lp_id', lpId)
        .eq('section', block.sectionKey);

      if (error) throw error;
      
      await persistBlockOrderWithBlocks(updatedBlocks);
      toast({ title: 'Bloco removido!' });
      console.log('[S5.0 QA] Block removed:', { sectionKey: block.sectionKey });
    } catch (error) {
      console.error('[BlockEditor] Error removing block:', error);
      toast({ title: 'Erro ao remover bloco', variant: 'destructive' });
    }
  }, [lpId, blocks, persistBlockOrderWithBlocks]);

  const handleReorder = useCallback(async (newOrder: EditorBlock[]) => {
    const menu = newOrder.find(b => b.sectionKey === 'menu');
    const hero = newOrder.find(b => b.sectionKey === 'hero');
    const rodape = newOrder.find(b => b.sectionKey === 'rodape');
    const dynamic = newOrder.filter(b => 
      !['menu', 'hero', 'rodape'].includes(b.sectionKey)
    );

    const finalOrder = [
      menu,
      hero,
      ...dynamic,
      rodape,
    ].filter(Boolean).map((b, i) => ({ ...b!, order: i }));

    setBlocks(finalOrder);
    
    // Persist with the new order
    await persistBlockOrderWithBlocks(finalOrder);
    console.log('[S5.0 QA] Blocks reordered');
  }, [lpId]);

  const handleContentUpdate = useCallback((sectionKey: SectionKey, newContent: LPContent) => {
    setContent(prev => ({ ...prev, [sectionKey]: newContent }));
    markLocalUpdate();
    console.log('[S5.0 QA] Content updated:', { sectionKey });
  }, [markLocalUpdate]);

  // WhatsApp settings handler - receives (key, value) per field
  const handleWhatsAppSettingsChange = useCallback(async (key: keyof WhatsAppConfig, value: string) => {
    // Update local state immediately
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    
    setSaveStatusSaving();
    
    try {
      await saveSettings(lpId, { [key]: value });
      setSaveStatusSaved();
    } catch (error) {
      console.error('[BlockEditor] Error saving WhatsApp settings:', error);
      setSaveStatusError();
      toast({ title: 'Erro ao salvar configurações', variant: 'destructive' });
    }
  }, [lpId]);

  // Build WhatsApp config from settings
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/painel')}
              className="h-9"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Painel</span>
            </Button>
            
            <div className="hidden md:block">
              <h1 className="font-semibold text-sm">{lpData.nome}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={lpData.publicado ? 'default' : 'secondary'} className="text-[10px]">
                  {lpData.publicado ? 'Publicado' : 'Rascunho'}
                </Badge>
                {isMaster && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px]">
                    Master
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Phase Tabs */}
          <Tabs value={phase} onValueChange={(v) => setPhase(v as EditorPhase)} className="hidden sm:block">
            <TabsList className="h-9">
              <TabsTrigger value="wizard" className="gap-2 text-xs">
                <Wand2 className="w-3.5 h-3.5" />
                Assistente
              </TabsTrigger>
              <TabsTrigger value="structure" className="gap-2 text-xs">
                <LayoutGrid className="w-3.5 h-3.5" />
                Estrutura
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2 text-xs">
                <FileText className="w-3.5 h-3.5" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 text-xs">
                <Eye className="w-3.5 h-3.5" />
                Visualizar
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {/* Theme Switcher - Pro/Premium only */}
            {(userPlan === 'pro' || userPlan === 'premium' || isMaster) && (
              <ThemeSwitcher
                currentTheme={(settings.global_theme as StylePreset) || 'glass'}
                onThemeChange={async (theme) => {
                  setSettings(prev => ({ ...prev, global_theme: theme }));
                  setSaveStatusSaving();
                  try {
                    await saveSettings(lpId, { global_theme: theme });
                    setSaveStatusSaved();
                  } catch (error) {
                    console.error('[BlockEditor] Error saving theme:', error);
                    setSaveStatusError();
                  }
                }}
                className="hidden sm:flex"
              />
            )}

            {/* Undo/Redo buttons */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo || isHistorySaving}
                className="h-8 w-8 p-0"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo || isHistorySaving}
                className="h-8 w-8 p-0"
                title="Refazer (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Settings Sheet */}
            <Sheet open={settingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Settings2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Config</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Configurações da Página</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* WhatsApp Config */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">WhatsApp</h3>
                    <WhatsAppConfigPanel
                      config={whatsAppConfig}
                      onChange={handleWhatsAppSettingsChange}
                    />
                  </div>
                  
                  {/* Separator Config */}
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold mb-3">Separadores de Seção</h3>
                    <SeparatorConfigPanel
                      config={{
                        separators_enabled: settings.separators_enabled,
                        separator_type: settings.separator_type,
                        separator_color: settings.separator_color,
                      }}
                      userPlan={userPlan}
                      onChange={(key, value) => {
                        setSettings(prev => ({ ...prev, [key]: value }));
                        saveSettings(lpId, { [key]: value });
                        setSaveStatusSaved();
                      }}
                      onUpgradeClick={() => setUpgradeModal({ open: true, feature: 'separadores premium' })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm" onClick={onViewPublic} className="h-9">
              <ExternalLink className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Abrir página</span>
            </Button>
            
            {/* Save status indicator */}
            <SaveIndicator status={saveStatus} className="hidden sm:flex" />

            <Button 
              size="sm" 
              onClick={() => setPublishChecklistOpen(true)} 
              disabled={saving} 
              className="h-9"
              variant={lpData.publicado ? 'outline' : 'default'}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{lpData.publicado ? 'Atualizar' : 'Publicar'}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile phase selector */}
        <div className="sm:hidden px-4 pb-3">
          <Tabs value={phase} onValueChange={(v) => setPhase(v as EditorPhase)} className="w-full">
            <TabsList className="w-full h-9 grid grid-cols-4">
              <TabsTrigger value="wizard" className="text-xs px-1">
                <Wand2 className="w-3.5 h-3.5" />
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs px-1">
                <LayoutGrid className="w-3.5 h-3.5" />
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs px-1">
                <FileText className="w-3.5 h-3.5" />
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs px-1">
                <Eye className="w-3.5 h-3.5" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        {phase === 'wizard' && (
          <motion.main
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 py-6 max-w-3xl"
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 py-6 max-w-3xl"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="container mx-auto px-4 py-6 max-w-4xl"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen"
          >
            <SEOHead settings={settings} />
            
            {/* Render sections in preview mode (read-only) */}
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

            {/* WhatsApp Floating Button in Preview */}
            <WhatsAppFloatingButton settings={whatsAppConfig} />
          </motion.div>
        )}
      </AnimatePresence>

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
