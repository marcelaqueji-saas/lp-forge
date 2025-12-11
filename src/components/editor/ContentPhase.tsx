/**
 * ContentPhase - Fase de conteúdo do editor
 * Sprint 5.0: Edição inline de textos, imagens e listas
 * + SectionStylePanel para edição de estilos por seção
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pencil, 
  Check,
  ChevronDown,
  Image,
  Type,
  List,
  Link2,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  SectionKey, 
  SECTION_MODELS_BY_SECTION, 
  PlanLevelWithMaster 
} from '@/lib/sectionModels';
import { 
  EditorBlock, 
  getBlockDefinition 
} from '@/lib/blockEditorTypes';
import { SECTION_NAMES, LPContent, saveSectionContent } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';
import { SectionStylePanel } from './SectionStylePanel';
import { 
  BackgroundMode,
  SectionContentStyle 
} from '@/lib/sectionStyleTypes';

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

interface ContentPhaseProps {
  blocks: EditorBlock[];
  lpId: string;
  userPlan: PlanLevelWithMaster;
  content: Record<string, LPContent>;
  settings: Record<string, any>;
  onContentUpdate: (sectionKey: SectionKey, newContent: LPContent) => void;
  onSettingsUpdate?: (newSettings: Record<string, any>) => void;
}

// Section content type indicators
const SECTION_CONTENT_TYPES: Record<SectionKey, { icon: React.ReactNode; label: string }[]> = {
  hero: [
    { icon: <Type className="w-3 h-3" />, label: 'Textos' },
    { icon: <Image className="w-3 h-3" />, label: 'Imagem' },
    { icon: <Link2 className="w-3 h-3" />, label: 'CTAs' },
  ],
  beneficios: [
    { icon: <Type className="w-3 h-3" />, label: 'Título' },
    { icon: <List className="w-3 h-3" />, label: 'Lista de benefícios' },
  ],
  como_funciona: [
    { icon: <Type className="w-3 h-3" />, label: 'Título' },
    { icon: <List className="w-3 h-3" />, label: 'Passos' },
  ],
  para_quem_e: [
    { icon: <Type className="w-3 h-3" />, label: 'Título' },
    { icon: <List className="w-3 h-3" />, label: 'Perfis' },
  ],
  provas_sociais: [
    { icon: <Type className="w-3 h-3" />, label: 'Título' },
    { icon: <List className="w-3 h-3" />, label: 'Depoimentos' },
  ],
  planos: [
    { icon: <Type className="w-3 h-3" />, label: 'Título' },
    { icon: <List className="w-3 h-3" />, label: 'Planos' },
  ],
  faq: [
    { icon: <Type className="w-3 h-3" />, label: 'Título' },
    { icon: <List className="w-3 h-3" />, label: 'Perguntas' },
  ],
  chamada_final: [
    { icon: <Type className="w-3 h-3" />, label: 'Textos' },
    { icon: <Link2 className="w-3 h-3" />, label: 'CTA' },
  ],
  menu: [
    { icon: <Image className="w-3 h-3" />, label: 'Logo' },
    { icon: <Link2 className="w-3 h-3" />, label: 'Links' },
  ],
  rodape: [
    { icon: <Type className="w-3 h-3" />, label: 'Copyright' },
    { icon: <Link2 className="w-3 h-3" />, label: 'Links' },
  ],
};

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

export const ContentPhase = ({
  blocks,
  lpId,
  userPlan,
  content,
  settings,
  onContentUpdate,
  onSettingsUpdate,
}: ContentPhaseProps) => {
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [stylingSection, setStylingSection] = useState<SectionKey | null>(null);

  const isMaster = userPlan === 'master';

  const handleToggleExpand = (blockId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  const handleStartEditing = (sectionKey: SectionKey, blockId: string) => {
    setEditingSection(sectionKey);
    // Auto-expand the card
    setExpandedCards(prev => new Set(prev).add(blockId));
    console.log('[S5.0 QA] ContentPhase: Started editing', { sectionKey });
  };

  const handleStopEditing = () => {
    setEditingSection(null);
    toast({ title: 'Alterações salvas!' });
    console.log('[S5.0 QA] ContentPhase: Stopped editing');
  };

  const handleSectionContentUpdate = useCallback(async (
    sectionKey: SectionKey, 
    key: string, 
    value: string
  ) => {
    const currentContent = content[sectionKey] || {};
    const newContent = { ...currentContent, [key]: value };
    
    // Save to database
    try {
      await saveSectionContent(lpId, sectionKey, newContent);
      onContentUpdate(sectionKey, newContent);
      console.log('[S5.0 QA] ContentPhase: Content saved', { sectionKey, key });
    } catch (error) {
      console.error('[ContentPhase] Save error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  }, [lpId, content, onContentUpdate]);

  const getContentStatus = (sectionKey: SectionKey): 'default' | 'edited' => {
    const sectionContent = content[sectionKey];
    if (!sectionContent) return 'default';
    
    // Check if any content besides __model_id exists
    const keys = Object.keys(sectionContent).filter(k => !k.startsWith('_'));
    return keys.length > 1 ? 'edited' : 'default';
  };

  // Get background mode from settings
  const backgroundMode = (settings?.background_mode as BackgroundMode) || 'global';

  // Handle section style changes
  const handleSectionStyleChange = useCallback(async (
    sectionKey: SectionKey,
    styleKey: keyof SectionContentStyle,
    value: string | undefined
  ) => {
    const currentContent = content[sectionKey] || {};
    const newContent = { ...currentContent, [styleKey]: value };
    
    try {
      await saveSectionContent(lpId, sectionKey, newContent);
      onContentUpdate(sectionKey, newContent);
      console.log('[S5.0 QA] ContentPhase: Style saved', { sectionKey, styleKey });
    } catch (error) {
      console.error('[ContentPhase] Style save error:', error);
      toast({ title: 'Erro ao salvar estilo', variant: 'destructive' });
    }
  }, [lpId, content, onContentUpdate]);

  const renderEditableComponent = (block: EditorBlock) => {
    const EditableComponent = EDITABLE_COMPONENTS[block.sectionKey];
    if (!EditableComponent) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Editor não disponível para esta seção
        </div>
      );
    }

    const sectionContent = content[block.sectionKey] || {};
    const isEditing = editingSection === block.sectionKey;
    
    // Get model info for stylePreset
    const models = SECTION_MODELS_BY_SECTION[block.sectionKey] || [];
    const currentModel = models.find(m => m.id === block.modelId);

    return (
      <EditableComponent
        lpId={lpId}
        content={sectionContent}
        userPlan={userPlan}
        editable={isEditing}
        variante={block.modelId}
        modelId={block.modelId}
        stylePreset={currentModel?.stylePreset || 'glass'}
        onContentUpdate={(key: string, value: string) => 
          handleSectionContentUpdate(block.sectionKey, key, value)
        }
      />
    );
  };

  const renderSectionCard = (block: EditorBlock) => {
    const definition = getBlockDefinition(block.sectionKey);
    if (!definition) return null;

    const models = SECTION_MODELS_BY_SECTION[block.sectionKey] || [];
    const currentModel = models.find(m => m.id === block.modelId);
    const isExpanded = expandedCards.has(block.id);
    const isEditing = editingSection === block.sectionKey;
    const contentStatus = getContentStatus(block.sectionKey);
    const contentTypes = SECTION_CONTENT_TYPES[block.sectionKey] || [];

    return (
      <motion.div
        key={block.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={cn(
          "border-2 transition-all duration-200 overflow-hidden",
          isEditing 
            ? "border-primary shadow-xl ring-2 sm:ring-4 ring-primary/20" 
            : "border-border hover:border-primary/50"
        )}>
          <CardContent className="p-0">
            {/* Header - Mobile-first responsive */}
            <div 
              className={cn(
                "flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-0 xs:justify-between p-3 sm:p-4 cursor-pointer transition-colors",
                isExpanded ? "bg-muted/30" : "hover:bg-muted/20"
              )}
              onClick={() => !isEditing && handleToggleExpand(block.id)}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  contentStatus === 'edited' ? "bg-green-500" : "bg-muted-foreground/30"
                )} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground text-sm sm:text-base">
                      {SECTION_NAMES[block.sectionKey] || definition.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] flex-shrink-0">
                      {currentModel?.name || 'Básico'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                    {contentTypes.slice(0, 3).map((type, i) => (
                      <span key={i} className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground">
                        {type.icon}
                        <span className="hidden xs:inline">{type.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end xs:self-auto">
                {isEditing ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopEditing();
                    }}
                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">Concluído</span>
                    <span className="xs:hidden">OK</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditing(block.sectionKey, block.id);
                      }}
                      className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden xs:inline">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStylingSection(stylingSection === block.sectionKey ? null : block.sectionKey);
                      }}
                      className={cn(
                        "h-7 sm:h-8 w-7 sm:w-8 p-0",
                        stylingSection === block.sectionKey && "bg-primary/10 text-primary"
                      )}
                      title="Estilos da seção"
                    >
                      <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(block.id);
                  }}
                  className="h-7 sm:h-8 w-7 sm:w-8 p-0"
                >
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </Button>
              </div>
            </div>

            {/* Style panel for this section */}
            <AnimatePresence>
              {stylingSection === block.sectionKey && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t p-3"
                >
                  <SectionStylePanel
                    sectionKey={block.sectionKey}
                    backgroundMode={backgroundMode}
                    currentBackground={{
                      type: (content[block.sectionKey] as any)?.background_type,
                      color: (content[block.sectionKey] as any)?.background_color,
                      gradient: (content[block.sectionKey] as any)?.background_gradient,
                      imageUrl: (content[block.sectionKey] as any)?.background_image_url,
                    }}
                    currentColors={{
                      primaryColor: (content[block.sectionKey] as any)?.primary_color,
                      secondaryColor: (content[block.sectionKey] as any)?.secondary_color,
                      accentColor: (content[block.sectionKey] as any)?.accent_color,
                    }}
                    currentButton={{
                      variant: (content[block.sectionKey] as any)?.button_variant,
                      radius: (content[block.sectionKey] as any)?.button_radius,
                      colorOverride: (content[block.sectionKey] as any)?.button_color_override,
                    }}
                    onBackgroundChange={(config) => {
                      if (config.type === 'solid') {
                        handleSectionStyleChange(block.sectionKey, 'background_type', 'solid');
                        handleSectionStyleChange(block.sectionKey, 'background_color', config.value);
                      } else if (config.type === 'gradient') {
                        handleSectionStyleChange(block.sectionKey, 'background_type', 'gradient');
                        handleSectionStyleChange(block.sectionKey, 'background_gradient', config.value);
                      } else if (config.type === 'image') {
                        handleSectionStyleChange(block.sectionKey, 'background_type', 'image');
                        handleSectionStyleChange(block.sectionKey, 'background_image_url', config.value);
                      }
                    }}
                    onColorChange={(key, value) => handleSectionStyleChange(block.sectionKey, key as any, value)}
                    onButtonChange={(key, value) => handleSectionStyleChange(block.sectionKey, key as any, value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded content - Full section preview with editing */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Editing instructions - Mobile friendly */}
                  {isEditing && (
                    <div className="px-3 sm:px-4 py-2 bg-primary/10 border-y border-primary/20">
                      <p className="text-xs sm:text-sm text-primary">
                        <strong>Edição:</strong> <span className="hidden xs:inline">Clique em qualquer texto ou imagem para editar</span><span className="xs:hidden">Toque para editar</span>
                      </p>
                    </div>
                  )}

                  {/* Section preview/editor - Mobile optimized container */}
                  <div className={cn(
                    "relative border-t bg-background overflow-x-hidden",
                    !isEditing && "max-h-[350px] sm:max-h-[500px] overflow-y-auto"
                  )}>
                    {renderEditableComponent(block)}

                    {/* Overlay when not editing */}
                    {!isEditing && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60 flex items-end justify-center pb-3 sm:pb-4 cursor-pointer"
                        onClick={() => handleStartEditing(block.sectionKey, block.id)}
                      >
                        <Button variant="secondary" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Status bar - Mobile responsive */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 p-3 sm:p-4 rounded-lg bg-muted/30 border">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm sm:text-base">Edição de conteúdo</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Toque em qualquer seção para editar
          </p>
        </div>
        {editingSection && (
          <Badge className="bg-primary text-[10px] sm:text-xs self-start xs:self-auto flex-shrink-0">
            Editando: {SECTION_NAMES[editingSection]}
          </Badge>
        )}
      </div>

      {/* Editing tip - Mobile friendly */}
      <div className="p-2.5 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
        <strong>Dica:</strong> <span className="hidden xs:inline">Na edição inline, clique diretamente no texto ou imagem que deseja alterar. As alterações são salvas automaticamente.</span>
        <span className="xs:hidden">Toque no texto/imagem para editar. Salva automaticamente.</span>
      </div>

      {/* Section cards */}
      <div className="space-y-3 sm:space-y-4">
        {blocks.map((block) => renderSectionCard(block))}
      </div>
    </div>
  );
};
