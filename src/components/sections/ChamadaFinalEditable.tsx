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
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge opcional */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
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
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
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
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
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
                  "inline-flex items-center gap-2 px-8 py-4 rounded-xl",
                  "bg-primary text-primary-foreground font-semibold text-lg",
                  "hover:bg-primary/90 transition-all hover:scale-105",
                  "shadow-lg shadow-primary/25"
                )}
              >
                {fc.texto_botao}
                <ArrowRight className="w-5 h-5" />
              </a>
            </EditableLink>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Sem cartão de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Configure em minutos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Cancele quando quiser
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChamadaFinalEditable;
