/**
 * HeroEditable - Hero com edição inline completa
 * Sprint 5.1: Suporte a múltiplas variantes (modelo_a, modelo_b, modelo_c)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { trackCTAClick, trackSectionView } from "@/lib/tracking";
import { EditableField, EditableImageField, EditableLink } from "@/components/editor/InlineEditableSection";
import { LPContent, saveSectionContent } from "@/lib/lpContentApi";
import { PlanLevel, StylePreset } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-dashboard.png";

interface HeroEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  modelId?: string;
  stylePreset?: StylePreset;
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

// Normaliza variantes para os layouts base
function normalizeVariant(variant?: string): 'modelo_a' | 'modelo_b' | 'modelo_c' {
  switch (variant) {
    case 'hero_center':
    case 'hero_benefits_intro':
    case 'hero_minimal_centered':
      return 'modelo_b';
    case 'hero_split_basic':
    case 'hero_social_proof':
    case 'hero_gallery_slider':
    case 'hero_metrics_highlights':
    case 'hero_split_visionos':
      return 'modelo_a';
    case 'hero_headline_rotator':
    case 'hero_parallax_vision':
    case 'hero_cinematic_video':
    case 'hero_ticket_launch':
      return 'modelo_c';
    case 'modelo_a':
    case 'modelo_b':
    case 'modelo_c':
      return variant;
    default:
      return 'modelo_a';
  }
}

// Get hero style classes based on stylePreset (only visual styles, not layout)
const getHeroStyleModifiers = (stylePreset: StylePreset = 'glass') => {
  switch (stylePreset) {
    case 'dark':
      return "bg-zinc-900 text-white";
    case 'neon':
      return "bg-black text-white";
    case 'aurora':
      return "bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20";
    case 'visionos':
      return "bg-white/80";
    case 'minimal':
      return "bg-gray-50";
    case 'frosted':
      return "bg-white/30 backdrop-blur-xl";
    case 'glass':
    default:
      return "";
  }
};

export const HeroEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  modelId,
  stylePreset = "glass",
  userPlan,
  editable = true,
  onContentUpdate,
}: HeroEditableProps) => {
  const normalizedVariant = normalizeVariant(variante);
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S5.2 QA] HeroEditable: mounted', { lpId, editable, variante, modelId, stylePreset, normalizedVariant });
  }, [lpId, editable, variante, modelId, stylePreset, normalizedVariant]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "hero", normalizedVariant);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, normalizedVariant]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
    console.log('[S5.1 QA] InlineText: OK -', key);
  }, [onContentUpdate]);

  const handlePrimaryClick = () => {
    if (lpId) trackCTAClick(lpId, "hero", "primary", normalizedVariant);
  };

  const handleSecondaryClick = () => {
    if (lpId) trackCTAClick(lpId, "hero", "secondary", normalizedVariant);
  };

  const fc = localContent;

  // MODELO C - Full Image Background
  if (normalizedVariant === 'modelo_c') {
    return (
      <section
        ref={sectionRef}
        className={cn("relative min-h-[70vh] sm:min-h-[80vh] flex items-center overflow-hidden", getHeroStyleModifiers(stylePreset))}
        id="hero"
        data-section-key="hero"
      >
        <div className="absolute inset-0">
          <EditableImageField
            src={fc.imagem_principal}
            fieldKey="imagem_principal"
            sectionKey="hero"
            lpId={lpId}
            content={localContent}
            userPlan={userPlan}
            onUpdate={handleUpdate}
            alt="Hero Background"
            className="w-full h-full object-cover"
            editable={editable}
            placeholder="Imagem de fundo"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>

        <div className="section-container relative z-10 py-8 sm:py-0">
          <div className="max-w-xl">
            {fc.badge && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block text-xs sm:text-sm font-medium mb-3 sm:mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary"
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
              </motion.span>
            )}

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight"
            >
              <EditableField
                value={fc.titulo || ''}
                fieldKey="titulo"
                sectionKey="hero"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                as="span"
                editable={editable}
                placeholder="Título"
              />{" "}
              <span className="gradient-text">
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
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-base sm:text-lg mb-6 sm:mb-8 max-w-md text-muted-foreground"
            >
              <EditableField
                value={fc.subtitulo || ''}
                fieldKey="subtitulo"
                sectionKey="hero"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                as="span"
                editable={editable}
                placeholder="Subtítulo"
                multiline
              />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col xs:flex-row gap-3"
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
              >
                <a
                  href={editable ? undefined : fc.url_botao_primario}
                  onClick={handlePrimaryClick}
                  className="btn-primary text-center text-sm sm:text-base"
                >
                  {fc.texto_botao_primario}
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
              >
                <a
                  href={editable ? undefined : fc.url_botao_secundario}
                  onClick={handleSecondaryClick}
                  className="btn-secondary text-center text-sm sm:text-base"
                >
                  {fc.texto_botao_secundario}
                </a>
              </EditableLink>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // MODELO B - Centralizado
  if (normalizedVariant === 'modelo_b') {
    return (
      <section
        ref={sectionRef}
        className={cn("section-padding relative overflow-hidden", getHeroStyleModifiers(stylePreset))}
        id="hero"
        data-section-key="hero"
      >
        <div className="section-container relative text-center max-w-4xl mx-auto">
          {fc.badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8"
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

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title mb-4 sm:mb-6"
          >
            <EditableField
              value={fc.titulo || ''}
              fieldKey="titulo"
              sectionKey="hero"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="span"
              editable={editable}
              placeholder="Título"
            />{" "}
            <span className="gradient-text">
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
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-subtitle mx-auto mb-8 sm:mb-10"
          >
            <EditableField
              value={fc.subtitulo || ''}
              fieldKey="subtitulo"
              sectionKey="hero"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="span"
              editable={editable}
              placeholder="Subtítulo"
              multiline
            />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16"
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
            >
              <a
                href={editable ? undefined : fc.url_botao_primario}
                onClick={handlePrimaryClick}
                className="btn-primary gap-2 text-sm sm:text-base justify-center"
              >
                {fc.texto_botao_primario}
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
            >
              <a
                href={editable ? undefined : fc.url_botao_secundario}
                onClick={handleSecondaryClick}
                className="btn-secondary gap-2 text-sm sm:text-base justify-center"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {fc.texto_botao_secundario}
              </a>
            </EditableLink>
          </motion.div>

          {fc.imagem_principal && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
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
                className="w-full max-w-3xl mx-auto rounded-xl sm:rounded-2xl shadow-soft-lg"
                aspectRatio="video"
                editable={editable}
                placeholder="Imagem do Hero"
              />
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // MODELO A - Imagem do lado (default)
  return (
    <section
      ref={sectionRef}
      className={cn("section-padding relative overflow-hidden overflow-x-hidden", getHeroStyleModifiers(stylePreset))}
      id="hero"
      data-section-key="hero"
    >
      <div className="section-container relative w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 w-full max-w-full">
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
