/**
 * HeroEditable - Hero com edição inline completa
 * Sprint 4.3: EditableField/EditableImageField em todos os elementos
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { trackCTAClick, trackSectionView } from "@/lib/tracking";
import { EditableField, EditableImageField, EditableLink } from "@/components/editor/InlineEditableSection";
import { LPContent, saveSectionContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import heroImage from "@/assets/hero-dashboard.png";

interface HeroEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultContent = {
  badge: "Novo lançamento",
  titulo: "Transforme sua ideia em",
  destaque: "realidade digital",
  subtitulo: "Crie landing pages de alta conversão em minutos, sem precisar de código ou design.",
  texto_botao_primario: "Comece agora",
  url_botao_primario: "#planos",
  texto_botao_secundario: "Ver demonstração",
  url_botao_secundario: "#como-funciona",
  imagem_principal: heroImage,
};

export const HeroEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: HeroEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  // QA Log
  useEffect(() => {
    console.log('[S4.3 QA] HeroEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  // Sync content
  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  // Tracking
  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "hero", variante);
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
    console.log('[S4.3 QA] InlineText: OK -', key);
  }, [onContentUpdate]);

  const handlePrimaryClick = () => {
    if (lpId) trackCTAClick(lpId, "hero", "primary", variante);
  };

  const handleSecondaryClick = () => {
    if (lpId) trackCTAClick(lpId, "hero", "secondary", variante);
  };

  const fc = localContent;

  // MODELO A - Imagem do lado - Mobile-First
  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden overflow-x-hidden"
      id="hero"
      data-section-key="hero"
    >
      <div className="section-container relative w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
          {/* Text Content - Mobile first order */}
          <div className="order-2 lg:order-1 w-full max-w-full">
            {/* Badge */}
            {fc.badge && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6"
              >
                <EditableField
                  value={fc.badge || ''}
                  fieldKey="badge"
                  sectionKey="hero"
                  lpId={lpId}
                  content={localContent}
                  onUpdate={handleUpdate}
                  as="span"
                  editable={editable}
                  placeholder="Badge"
                />
              </motion.div>
            )}

            {/* Título - Mobile-optimized */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6"
            >
              <h1 className="section-title break-words whitespace-normal overflow-wrap-anywhere">
                <EditableField
                  value={fc.titulo || ''}
                  fieldKey="titulo"
                  sectionKey="hero"
                  lpId={lpId}
                  content={localContent}
                  onUpdate={handleUpdate}
                  as="span"
                  editable={editable}
                  placeholder="Título principal"
                  className="break-words"
                />{" "}
                <span className="gradient-text break-words">
                  <EditableField
                    value={fc.destaque || ''}
                    fieldKey="destaque"
                    sectionKey="hero"
                    lpId={lpId}
                    content={localContent}
                    onUpdate={handleUpdate}
                    as="span"
                    editable={editable}
                    placeholder="Destaque"
                    className="break-words"
                  />
                </span>
              </h1>
            </motion.div>

            {/* Subtítulo - Mobile-optimized */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-subtitle mb-6 sm:mb-8"
            >
              <EditableField
                value={fc.subtitulo || ''}
                fieldKey="subtitulo"
                sectionKey="hero"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                as="p"
                editable={editable}
                placeholder="Subtítulo descritivo"
                multiline
                className="break-words whitespace-normal"
              />
            </motion.div>

            {/* Botões - Mobile full-width, desktop inline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col xs:flex-row gap-3 sm:gap-4 w-full"
            >
              <EditableLink
                label={fc.texto_botao_primario || 'CTA Principal'}
                url={fc.url_botao_primario || '#'}
                labelKey="texto_botao_primario"
                urlKey="url_botao_primario"
                sectionKey="hero"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                editable={editable}
                className="w-full xs:w-auto"
              >
                <a
                  href={editable ? undefined : fc.url_botao_primario}
                  onClick={handlePrimaryClick}
                  className="btn-primary gap-2 w-full xs:w-auto justify-center text-sm sm:text-base py-3 sm:py-3"
                >
                  {fc.texto_botao_primario}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </EditableLink>

              <EditableLink
                label={fc.texto_botao_secundario || 'CTA Secundário'}
                url={fc.url_botao_secundario || '#'}
                labelKey="texto_botao_secundario"
                urlKey="url_botao_secundario"
                sectionKey="hero"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                editable={editable}
                className="w-full xs:w-auto"
              >
                <a
                  href={editable ? undefined : fc.url_botao_secundario}
                  onClick={handleSecondaryClick}
                  className="btn-secondary gap-2 w-full xs:w-auto justify-center text-sm sm:text-base py-3 sm:py-3"
                >
                  <Play className="w-4 h-4" />
                  {fc.texto_botao_secundario}
                </a>
              </EditableLink>
            </motion.div>
          </div>

          {/* Imagem - Mobile-optimized */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2 w-full max-w-full"
          >
            <EditableImageField
              src={fc.imagem_principal}
              fieldKey="imagem_principal"
              sectionKey="hero"
              lpId={lpId}
              content={localContent}
              userPlan={userPlan}
              onUpdate={handleUpdate}
              alt="Hero"
              className="w-full max-w-full rounded-xl sm:rounded-2xl shadow-soft-lg"
              aspectRatio="video"
              editable={editable}
              placeholder="Imagem do Hero"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroEditable;
