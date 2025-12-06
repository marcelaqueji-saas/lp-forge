import { useState } from 'react';
import { ChevronDown, ChevronRight, Palette, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StyleColorPicker } from './StyleColorPicker';
import { ImageUpload } from './ImageUpload';
import { 
  SECTION_STYLE_TOKENS, 
  SECTION_STYLE_LABELS, 
  TOKEN_LABELS,
  SECTION_IMAGE_TOKENS,
  GLOBAL_STYLE_TOKENS 
} from '@/lib/styleTokens';
import { LPSettings } from '@/lib/lpContentApi';
import { cn } from '@/lib/utils';

interface SectionStyleEditorProps {
  sectionKey: string;
  settings: LPSettings;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
  lpId?: string;
}

export const SectionStyleEditor = ({
  sectionKey,
  settings,
  onChange,
  disabled,
  lpId,
}: SectionStyleEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sectionTokens = SECTION_STYLE_TOKENS[sectionKey] || {};
  const sectionImages = SECTION_IMAGE_TOKENS[sectionKey] || [];
  const sectionLabel = SECTION_STYLE_LABELS[sectionKey] || sectionKey;
  
  // Check if any token is customized
  const customizedCount = Object.keys(sectionTokens).filter(key => settings[key]).length +
    sectionImages.filter(img => settings[img.key]).length;

  // Get global value for fallback
  const getGlobalValue = (tokenKey: string): string | undefined => {
    const suffix = tokenKey.replace(`style_${sectionKey}_`, '');
    const globalMapping: Record<string, string> = {
      'bg': 'style_global_background',
      'card_bg': 'style_global_surface',
      'text': 'style_global_text_primary',
      'title': 'style_global_text_primary',
      'subtitle': 'style_global_text_secondary',
      'cta_bg': 'style_global_primary',
      'cta_primary_bg': 'style_global_primary',
      'cta_text': 'style_global_surface',
      'cta_primary_text': 'style_global_surface',
      'icon': 'style_global_primary',
      'link': 'style_global_primary',
      'price': 'style_global_primary',
      'border': 'style_global_text_secondary',
      'link_hover': 'style_global_primary',
      'highlight_bg': 'style_global_primary',
      'card_highlight_bg': 'style_global_primary',
      'question': 'style_global_text_primary',
      'answer': 'style_global_text_secondary',
      'badge_bg': 'style_global_primary',
      'badge_text': 'style_global_surface',
      'cta_secondary_border': 'style_global_primary',
      'cta_secondary_text': 'style_global_text_primary',
      'card_border': 'style_global_text_secondary',
    };
    
    const globalKey = globalMapping[suffix];
    if (globalKey) {
      return (settings[globalKey] as string) || GLOBAL_STYLE_TOKENS[globalKey as keyof typeof GLOBAL_STYLE_TOKENS];
    }
    return undefined;
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left transition-colors",
          "hover:bg-muted/50",
          isExpanded && "border-b"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Palette className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <span className="font-medium">{sectionLabel}</span>
            {customizedCount > 0 && (
              <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {customizedCount} personalizado{customizedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-6">
              {/* Color tokens */}
              {Object.keys(sectionTokens).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cores
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(sectionTokens).map(([key]) => (
                      <StyleColorPicker
                        key={key}
                        label={TOKEN_LABELS[key] || key}
                        value={(settings[key] as string) || ''}
                        globalValue={getGlobalValue(key)}
                        onChange={(value) => onChange(key, value)}
                        onReset={() => onChange(key, '')}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Image tokens */}
              {sectionImages.length > 0 && lpId && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Imagens
                  </h4>
                  <div className="space-y-4">
                    {sectionImages.map((img) => (
                      <div key={img.key}>
                        <label className="text-sm font-medium mb-2 block">{img.label}</label>
                        <ImageUpload
                          lpId={lpId}
                          value={(settings[img.key] as string) || ''}
                          onChange={(url) => onChange(img.key, url)}
                          disabled={disabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {Object.keys(sectionTokens).length === 0 && sectionImages.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma personalização disponível para esta seção.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
