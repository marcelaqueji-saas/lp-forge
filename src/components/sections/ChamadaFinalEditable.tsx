/**
 * ChamadaFinalEditable - Seção CTA Final com edição inline
 * Sprint 4.4: 100% do conteúdo editável inline
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackSectionView, trackCTAClick } from "@/lib/tracking";
import { EditableField, EditableLink } from "@/components/editor/InlineEditableSection";
import { LPContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";

interface ChamadaFinalEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultContent = {
  titulo: "Pronto para começar?",
  subtitulo: "Crie sua landing page em minutos e comece a converter mais visitantes em clientes.",
  texto_botao: "Começar agora — é grátis",
  url_botao: "#planos",
};

export const ChamadaFinalEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: ChamadaFinalEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S4.4 QA] ChamadaFinalEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "chamada_final", variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, variante]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
    console.log('[S4.4 QA] InlineText: OK -', key);
  }, [onContentUpdate]);

  const handleCTAClick = () => {
    if (lpId) trackCTAClick(lpId, 'chamada_final', 'primary', variante);
  };

  const fc = localContent;

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-gradient-to-br from-primary/10 via-primary/5 to-background"
      id="cta-final"
      data-section-key="chamada_final"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center px-1"
        >
          {/* Badge opcional */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Comece grátis
          </div>

          {/* Título */}
          <EditableField
            value={fc.titulo || ''}
            fieldKey="titulo"
            sectionKey="chamada_final"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="h2"
            editable={editable}
            placeholder="Título do CTA"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 break-words"
          />

          {/* Subtítulo */}
          <EditableField
            value={fc.subtitulo || ''}
            fieldKey="subtitulo"
            sectionKey="chamada_final"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="p"
            editable={editable}
            placeholder="Descrição do CTA"
            className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto break-words"
            multiline
          />

          {/* Botão CTA */}
          <div className="flex justify-center">
            <EditableLink
              label={fc.texto_botao || 'CTA'}
              url={fc.url_botao || '#'}
              labelKey="texto_botao"
              urlKey="url_botao"
              sectionKey="chamada_final"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              editable={editable}
            >
              <a
                href={editable ? undefined : fc.url_botao}
                onClick={handleCTAClick}
                className={cn(
                  "inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl",
                  "bg-primary text-primary-foreground font-semibold text-sm sm:text-base md:text-lg",
                  "hover:bg-primary/90 transition-all hover:scale-105",
                  "shadow-lg shadow-primary/25 touch-manipulation",
                  "w-full sm:w-auto justify-center"
                )}
              >
                <span className="break-words">{fc.texto_botao}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </a>
            </EditableLink>
          </div>

          {/* Trust badges - mobile-first */}
          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="whitespace-nowrap">Sem cartão de crédito</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="whitespace-nowrap">Configure em minutos</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="whitespace-nowrap">Cancele quando quiser</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChamadaFinalEditable;
