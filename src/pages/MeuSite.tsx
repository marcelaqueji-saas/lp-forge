import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { 
  getLPById, getAllContent, getSettings, getSectionOrder, 
  saveSettings, saveSectionContent, LPContent, LPSettings, getUserRoleForLP, DEFAULT_SECTION_ORDER,
  SECTION_NAMES
} from '@/lib/lpContentApi';
import { hasCompletedEditorTour, markOnboardingCompleted } from '@/lib/userApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, Loader2, ExternalLink, Edit3, ChevronDown } from 'lucide-react';
import { SectionOverlay } from '@/components/editor/SectionOverlay';
import { LayoutPicker, SECTION_VARIANTS } from '@/components/editor/LayoutPicker';
import { ContentEditor } from '@/components/editor/ContentEditor';
import { EditorTour } from '@/components/editor/EditorTour';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SectionLoader, resolveVariant } from '@/components/sections/SectionLoader';
import { SectionKey } from '@/lib/sectionModels';
import { applyThemeToLP, removeThemeFromLP } from '@/lib/themeUtils';

const MeuSite = () => {
  const { lpId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lpData, setLpData] = useState<any>(null);
  const [content, setContent] = useState<Record<string, LPContent>>({});
  const [settings, setSettings] = useState<LPSettings>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Editor state
  const [editMode, setEditMode] = useState(true);
  const [runTour, setRunTour] = useState(false);
  const [layoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Disable animations in editor for performance
  const disableAnimations = editMode;

  useEffect(() => {
    checkAuthAndLoad();
  }, [lpId]);

  // Apply theme when settings change
  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      applyThemeToLP(settings);
    }
    
    return () => {
      removeThemeFromLP();
    };
  }, [settings]);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth/login');
      return;
    }

    if (!lpId) {
      navigate('/painel');
      return;
    }

    // Check user role
    const role = await getUserRoleForLP(lpId);
    if (!role) {
      toast({ title: 'Acesso negado', variant: 'destructive' });
      navigate('/painel');
      return;
    }
    setUserRole(role);

    // Load LP data
    await loadLP();

    // Check if tour should run
    if (!hasCompletedEditorTour()) {
      setTimeout(() => setRunTour(true), 500);
    }
  };

  const loadLP = async () => {
    if (!lpId) return;

    setLoading(true);
    
    const [lp, contentData, settingsData, order] = await Promise.all([
      getLPById(lpId),
      getAllContent(lpId),
      getSettings(lpId),
      getSectionOrder(lpId),
    ]);

    if (!lp) {
      toast({ title: 'LP não encontrada', variant: 'destructive' });
      navigate('/painel');
      return;
    }

    setLpData(lp);
    setContent(contentData);
    setSettings(settingsData);
    setSectionOrder(order);
    setLoading(false);
  };

  const handleTourFinish = () => {
    setRunTour(false);
    markOnboardingCompleted();
  };

  const handleChangeLayout = (sectionKey: string) => {
    setActiveSection(sectionKey);
    setLayoutPickerOpen(true);
  };

  const handleEditContent = (sectionKey: string) => {
    setActiveSection(sectionKey);
    setContentEditorOpen(true);
  };

  const handleSelectVariant = async (variantId: string) => {
    if (!lpId || !activeSection) return;

    try {
      // Get current content for the section
      const currentContent = content[activeSection] || {};
      
      // Update content with new variant
      const updatedContent = {
        ...currentContent,
        variant: variantId,
      };

      // Save to database
      await saveSectionContent(lpId, activeSection, updatedContent);

      // Also update settings for backwards compatibility
      const settingKey = `${activeSection}_variante`;
      await saveSettings(lpId, { [settingKey]: variantId });

      // Update local state immediately for instant preview
      setContent(prev => ({
        ...prev,
        [activeSection]: updatedContent,
      }));
      
      setSettings(prev => ({
        ...prev,
        [settingKey]: variantId,
      }));

      toast({ title: 'Layout atualizado!' });
      setLayoutPickerOpen(false);
      
      console.log(`[MeuSite] Variant changed: ${activeSection} → ${variantId}`);
    } catch (error) {
      console.error('[MeuSite] Error saving variant:', error);
      toast({ title: 'Erro ao salvar layout', variant: 'destructive' });
    }
  };

  const handleStyleChange = async (sectionKey: string, styles: Record<string, string | undefined>) => {
    if (!lpId) return;

    try {
      const currentContent = content[sectionKey] || {};
      
      // Merge new styles with existing content
      const updatedContent = {
        ...currentContent,
        ...styles,
      };

      // Remove undefined values (reset to global)
      Object.keys(styles).forEach(key => {
        if (styles[key] === undefined) {
          delete updatedContent[key];
        }
      });

      // Save to database
      await saveSectionContent(lpId, sectionKey, updatedContent);

      // Update local state immediately for instant preview
      setContent(prev => ({
        ...prev,
        [sectionKey]: updatedContent,
      }));

      toast({ title: 'Estilo atualizado!' });
      console.log(`[MeuSite] Styles changed for ${sectionKey}:`, styles);
    } catch (error) {
      console.error('[MeuSite] Error saving styles:', error);
      toast({ title: 'Erro ao salvar estilo', variant: 'destructive' });
    }
  };

  const handleContentSave = () => {
    loadLP(); // Reload to get updated content
  };

  const handlePublish = async () => {
    if (!lpId) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('landing_pages')
      .update({ publicado: true })
      .eq('id', lpId);

    if (error) {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    } else {
      setLpData((prev: any) => ({ ...prev, publicado: true }));
      toast({ title: 'Página publicada!', description: 'Sua página está no ar.' });
    }
    
    setSaving(false);
  };

  const handleViewPublic = () => {
    if (lpData?.slug) {
      window.open(`/lp/${lpData.slug}`, '_blank');
    }
  };

  const getVariante = (section: string): string => {
    return resolveVariant(
      section as SectionKey, 
      content[section], 
      settings
    );
  };

  const getSectionName = (section: string): string => {
    return SECTION_NAMES[section] || section;
  };

  const scrollToSection = (sectionKey: string) => {
    const element = sectionRefs.current[sectionKey];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-padding">
          <div className="section-container">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-16 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const canEdit = userRole === 'owner' || userRole === 'editor';

  return (
    <div className="min-h-screen bg-background">
      {/* Editor Header */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b"
        data-tour-id="editor-top-actions"
      >
        <div className="container mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/painel')}
              className="shrink-0 h-8 md:h-9 px-2 md:px-3"
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Painel</span>
            </Button>
            
            <div className="hidden md:block min-w-0">
              <h1 className="font-medium text-sm truncate">{lpData?.nome}</h1>
              <p className="text-xs text-muted-foreground">
                {lpData?.publicado ? 'Publicado' : 'Rascunho'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewPublic}
              className="h-8 md:h-9 px-2 md:px-3"
            >
              <Eye className="w-4 h-4 md:mr-2" />
              <span className="hidden sm:inline">Ver como visitante</span>
            </Button>
            
            {canEdit && !lpData?.publicado && (
              <Button 
                size="sm"
                onClick={handlePublish}
                disabled={saving}
                className="h-8 md:h-9 px-3"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 md:mr-2" />
                    <span className="hidden sm:inline">Publicar</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile section navigator */}
        {isMobile && canEdit && (
          <div className="px-3 pb-2 border-t pt-2 bg-card/80">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between h-9 text-sm">
                  <span>Ir para seção...</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-24px)]" align="center">
                {sectionOrder.map((section) => (
                  <DropdownMenuItem 
                    key={section} 
                    onClick={() => scrollToSection(section)}
                    className="py-2.5"
                  >
                    {getSectionName(section)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main content with sections */}
      <div className={isMobile && canEdit ? "pt-28" : "pt-14 md:pt-16"}>
        <SEOHead settings={settings} />
        
        {sectionOrder.map((section, index) => {
          const hasVariants = !!(SECTION_VARIANTS[section]?.length);
          const sectionContent = content[section] || {};

          return (
            <div 
              key={section} 
              className="relative"
              ref={(el) => { sectionRefs.current[section] = el; }}
              data-section-key={section}
            >
              {editMode && canEdit && (
                <SectionOverlay
                  sectionKey={section}
                  sectionName={getSectionName(section)}
                  isFirst={index === 0}
                  canChangeLayout={hasVariants}
                  currentStyles={{
                    style_bg: sectionContent.style_bg as string,
                    style_text: sectionContent.style_text as string,
                    style_gradient: sectionContent.style_gradient as string,
                  }}
                  onChangeLayout={() => handleChangeLayout(section)}
                  onEditContent={() => handleEditContent(section)}
                  onStyleChange={(styles) => handleStyleChange(section, styles)}
                />
              )}
              
              {/* Dynamic section rendering via SectionLoader */}
              <SectionLoader
                sectionKey={section as SectionKey}
                content={sectionContent}
                settings={settings}
                disableAnimations={disableAnimations}
              />
            </div>
          );
        })}
      </div>

      {/* Mobile floating edit indicator */}
      {isMobile && canEdit && (
        <div className="fixed bottom-4 right-4 z-40">
          <Button
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg gradient-bg"
            onClick={() => {
              const firstSection = sectionOrder[0];
              if (firstSection) {
                scrollToSection(firstSection);
              }
            }}
          >
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Layout Picker */}
      {activeSection && (
        <LayoutPicker
          open={layoutPickerOpen}
          onClose={() => setLayoutPickerOpen(false)}
          sectionName={getSectionName(activeSection)}
          sectionKey={activeSection}
          currentVariant={getVariante(activeSection)}
          variants={SECTION_VARIANTS[activeSection] || []}
          onSelect={handleSelectVariant}
        />
      )}

      {/* Content Editor */}
      {activeSection && lpId && (
        <ContentEditor
          open={contentEditorOpen}
          onClose={() => setContentEditorOpen(false)}
          lpId={lpId}
          sectionKey={activeSection}
          sectionName={getSectionName(activeSection)}
          onSave={handleContentSave}
        />
      )}

      {/* Editor Tour */}
      <EditorTour run={runTour} onFinish={handleTourFinish} />
    </div>
  );
};

export default MeuSite;
