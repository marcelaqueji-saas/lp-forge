/**
 * RodapeEditable - Footer com edição inline
 * Sprint 4.4: 100% do conteúdo editável inline
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { trackSectionView } from "@/lib/tracking";
import { EditableField } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";

interface Link {
  label: string;
  url: string;
}

interface RodapeEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultContent = {
  copyright: `© ${new Date().getFullYear()} noBRon. Todos os direitos reservados.`,
  links_json: JSON.stringify([
    { label: "Termos de uso", url: "/termos" },
    { label: "Privacidade", url: "/privacidade" },
    { label: "Contato", url: "/contato" },
  ]),
};

export const RodapeEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: RodapeEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S4.4 QA] RodapeEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "rodape", variante);
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
      await saveSectionContent(lpId, 'rodape', updated);
      onContentUpdate?.('links_json', newJson);
      console.log('[S4.4 QA] InlineText: OK - footer link', index, field);
    } catch (error) {
      console.error('[RodapeEditable] Error updating link:', error);
    }
  };

  const fc = localContent;
  let links: Link[] = [];
  try {
    links = JSON.parse(fc.links_json || '[]');
  } catch {
    links = [];
  }

  return (
    <footer
      ref={sectionRef}
      className="border-t bg-muted/30"
      id="rodape"
      data-section-key="rodape"
    >
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Copyright */}
          <EditableField
            value={fc.copyright || ''}
            fieldKey="copyright"
            sectionKey="rodape"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="p"
            editable={editable}
            placeholder="Texto de copyright"
            className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left break-words order-2 sm:order-1"
          />

          {/* Links - mobile-first */}
          <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 order-1 sm:order-2">
            {links.map((link, idx) => (
              <div key={idx}>
                {editable ? (
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleLinkUpdate(idx, 'label', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors outline-none cursor-text touch-manipulation",
                      "hover:bg-primary/5 px-2 -mx-2 py-1 rounded",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    {link.label}
                  </span>
                ) : (
                  <a
                    href={link.url}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </motion.div>
      </div>
    </footer>
  );
};

export default RodapeEditable;
