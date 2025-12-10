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
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b"
      id="menu"
      data-section-key="menu"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
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
                className="h-8 w-auto"
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
                className="text-xl font-bold"
              />
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
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

          {/* CTA Button */}
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

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t"
          >
            <nav className="flex flex-col gap-2">
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="font-medium">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
              <div className="pt-4 px-4">
                <Button className="w-full" onClick={handleCTAClick} asChild={!editable}>
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
