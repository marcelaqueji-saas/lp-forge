import { Palette, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { QuickStyleEditor } from './QuickStyleEditor';

interface SectionOverlayProps {
  sectionKey: string;
  sectionName: string;
  isFirst?: boolean;
  canChangeLayout?: boolean;
  currentStyles?: {
    style_bg?: string;
    style_text?: string;
    style_gradient?: string;
  };
  supportsGradient?: boolean;
  onChangeLayout: () => void;
  onEditContent: () => void;
  onStyleChange?: (styles: Record<string, string | undefined>) => void;
}

// Sections that support gradient backgrounds
const GRADIENT_SECTIONS = ['hero', 'chamada_final', 'beneficios'];

export const SectionOverlay = ({ 
  sectionKey,
  sectionName, 
  isFirst = false,
  canChangeLayout = true,
  currentStyles = {},
  supportsGradient,
  onChangeLayout, 
  onEditContent,
  onStyleChange,
}: SectionOverlayProps) => {
  const isMobile = useIsMobile();
  const hasStyleEditor = !!onStyleChange;
  const showGradient = supportsGradient ?? GRADIENT_SECTIONS.includes(sectionKey);

  // Mobile layout - compact bottom bar
  if (isMobile) {
    return (
      <div className="absolute inset-0 z-40 pointer-events-none">
        {/* Bottom bar for mobile */}
        <div 
          className="absolute bottom-2 left-2 right-2 pointer-events-auto"
          data-tour-id={isFirst ? 'section-hero-header' : undefined}
        >
          <div className="bg-primary/95 backdrop-blur-sm text-primary-foreground px-3 py-2 rounded-xl shadow-lg flex items-center justify-between gap-2">
            <span className="font-medium text-xs truncate flex-1">{sectionName}</span>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {hasStyleEditor && (
                <QuickStyleEditor
                  sectionKey={sectionKey}
                  currentStyles={currentStyles}
                  supportsGradient={showGradient}
                  onStyleChange={onStyleChange!}
                />
              )}
              {canChangeLayout && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={onChangeLayout}
                  data-tour-id={isFirst ? 'section-hero-layout' : undefined}
                >
                  <Palette className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs gap-1.5 px-3"
                onClick={onEditContent}
                data-tour-id={isFirst ? 'section-hero-edit' : undefined}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Border highlight */}
        <div className="absolute inset-0 border-2 border-primary/20 border-dashed pointer-events-none rounded-lg" />
      </div>
    );
  }

  // Desktop layout - top bar
  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Top bar with section name and actions */}
      <div 
        className="absolute top-0 left-0 right-0 pointer-events-auto"
        data-tour-id={isFirst ? 'section-hero-header' : undefined}
      >
        <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-2 flex items-center justify-between">
          <span className="font-medium text-sm">{sectionName}</span>
          
          <div className="flex items-center gap-2">
            {hasStyleEditor && (
              <QuickStyleEditor
                sectionKey={sectionKey}
                currentStyles={currentStyles}
                supportsGradient={showGradient}
                onStyleChange={onStyleChange!}
              />
            )}
            {canChangeLayout && (
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs gap-1"
                onClick={onChangeLayout}
                data-tour-id={isFirst ? 'section-hero-layout' : undefined}
              >
                <Palette className="w-3 h-3" />
                Trocar layout
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs gap-1"
              onClick={onEditContent}
              data-tour-id={isFirst ? 'section-hero-edit' : undefined}
            >
              <Edit3 className="w-3 h-3" />
              Editar conteúdo
            </Button>
          </div>
        </div>
      </div>
      
      {/* Border highlight */}
      <div className="absolute inset-0 border-2 border-primary/30 border-dashed pointer-events-none" />
    </div>
  );
};
