/**
 * MenuEditable - Menu/Header com edição inline
 * Sprint 4.4: 100% do conteúdo editável inline
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { trackSectionView, trackCTAClick } from "@/lib/tracking";
import { EditableField, EditableImageField, EditableLink } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Link {
  label: string;
  url: string;
}

interface MenuEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultContent = {
  brand_name: "noBRon",
  logo_url: "",
  links_json: JSON.stringify([
    { label: "Como funciona", url: "#como-funciona" },
    { label: "Benefícios", url: "#beneficios" },
    { label: "Planos", url: "#planos" },
    { label: "FAQ", url: "#faq" },
  ]),
  cta_label: "Começar agora",
  cta_url: "#planos",
};

export const MenuEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: MenuEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S4.4 QA] MenuEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "menu", variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, variante]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
    console.log('[S4.4 QA] InlineText: OK -', key);
  }, [onContentUpdate]);

  const handleLinkUpdate = async (index: number, field: keyof Link, value: string) => {
    try {
      const links: Link[] = JSON.parse(localContent.links_json || '[]');
      links[index] = { ...links[index], [field]: value };
      const newJson = JSON.stringify(links);
      
      const updated = { ...localContent, links_json: newJson };
      setLocalContent(updated);
      await saveSectionContent(lpId, 'menu', updated);
      onContentUpdate?.('links_json', newJson);
      console.log('[S4.4 QA] InlineText: OK - menu link', index, field);
    } catch (error) {
      console.error('[MenuEditable] Error updating link:', error);
    }
  };

  const handleCTAClick = () => {
    if (lpId) trackCTAClick(lpId, 'menu', 'primary', variante);
  };

  const fc = localContent;
  let links: Link[] = [];
  try {
    links = JSON.parse(fc.links_json || '[]');
  } catch {
    links = [];
  }

  return (
    <header
      ref={sectionRef}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b overflow-x-hidden"
      id="menu"
      data-section-key="menu"
    >
      <div className="container mx-auto px-3 sm:px-4 max-w-full">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo / Brand - Mobile optimized */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
            {fc.logo_url ? (
              <EditableImageField
                src={fc.logo_url}
                fieldKey="logo_url"
                sectionKey="menu"
                lpId={lpId}
                content={localContent}
                userPlan={userPlan}
                onUpdate={handleUpdate}
                alt="Logo"
                className="h-7 sm:h-8 w-auto max-w-[120px] sm:max-w-none"
                aspectRatio="auto"
                editable={editable}
                placeholder="Logo"
              />
            ) : (
              <EditableField
                value={fc.brand_name || ''}
                fieldKey="brand_name"
                sectionKey="menu"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                as="span"
                editable={editable}
                placeholder="Nome da marca"
                className="text-lg sm:text-xl font-bold truncate max-w-[150px] sm:max-w-none"
              />
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {links.map((link, idx) => (
              <div key={idx} className="relative group">
                {editable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleLinkUpdate(idx, 'label', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-text",
                      "hover:bg-primary/5 px-2 -mx-2 py-1 rounded",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    {link.label}
                  </span>
                ) : (
                  <a
                    href={link.url}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:block">
            <EditableLink
              label={fc.cta_label || 'CTA'}
              url={fc.cta_url || '#'}
              labelKey="cta_label"
              urlKey="cta_url"
              sectionKey="menu"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              editable={editable}
            >
              <Button
                size="sm"
                onClick={handleCTAClick}
                asChild={!editable}
              >
                {editable ? (
                  <span>{fc.cta_label}</span>
                ) : (
                  <a href={fc.cta_url}>{fc.cta_label}</a>
                )}
              </Button>
            </EditableLink>
          </div>

          {/* Mobile menu button - Touch optimized */}
          <button
            className="md:hidden p-2 -mr-2 rounded-lg active:bg-muted touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Full-width, touch-friendly */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-3 sm:py-4 border-t overflow-x-hidden"
          >
            <nav className="flex flex-col gap-1 sm:gap-2">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 sm:px-4 py-3 rounded-lg",
                    "hover:bg-muted active:bg-muted/80 transition-colors",
                    "touch-manipulation min-h-[48px]"
                  )}
                >
                  <span className="font-medium text-sm sm:text-base">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
              <div className="pt-3 sm:pt-4 px-3 sm:px-4 pb-safe">
                <Button 
                  className="w-full min-h-[48px] text-sm sm:text-base" 
                  onClick={handleCTAClick} 
                  asChild={!editable}
                >
                  {editable ? (
                    <span>{fc.cta_label}</span>
                  ) : (
                    <a href={fc.cta_url}>{fc.cta_label}</a>
                  )}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default MenuEditable;
