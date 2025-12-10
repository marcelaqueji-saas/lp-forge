import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { trackCTAClick, trackSectionView } from "@/lib/tracking";
import { getStyleClasses, getMotionVariants } from "@/lib/styleTokens";
import heroImage from "@/assets/hero-dashboard.png";
import type { StylePreset, MotionPreset } from "@/lib/sectionModels";

interface HeroContent {
  badge?: string;
  titulo?: string;
  destaque?: string;
  subtitulo?: string;
  texto_botao_primario?: string;
  url_botao_primario?: string;
  texto_botao_secundario?: string;
  url_botao_secundario?: string;
  imagem_principal?: string;
}

export type HeroVariantId =
  | "modelo_a"
  | "modelo_b"
  | "modelo_c"
  | "hero_center"
  | "hero_benefits_intro"
  | "hero_split_basic"
  | "hero_headline_rotator"
  | "hero_parallax_vision"
  | "hero_cinematic_video"
  | "hero_social_proof"
  | "hero_gallery_slider"
  | "hero_metrics_highlights";

function normalizeHeroVariant(
  variant?: HeroVariantId | string
): HeroVariantId {
  switch (variant) {
    case "hero_center":
    case "hero_benefits_intro":
    case "hero_minimal_centered":
      return "modelo_a";
    case "hero_split_basic":
    case "hero_social_proof":
    case "hero_gallery_slider":
    case "hero_metrics_highlights":
    case "hero_split_visionos":
      return "modelo_b";
    case "hero_headline_rotator":
    case "hero_parallax_vision":
    case "hero_cinematic_video":
    case "hero_ticket_launch":
      return "modelo_c";
    default:
      if (
        variant === "modelo_a" ||
        variant === "modelo_b" ||
        variant === "modelo_c"
      ) {
        return variant;
      }
      return "modelo_a";
  }
}

interface HeroProps {
  lpId?: string;
  content?: HeroContent;
  previewOverride?: HeroContent;
  variante?: HeroVariantId;
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
  onPrimaryCTAClick?: () => void;
  onSecondaryCTAClick?: () => void;
}

const defaultContent: HeroContent = {
  badge: "Novo lançamento",
  titulo: "Transforme sua ideia em",
  destaque: "realidade digital",
  subtitulo:
    "Crie landing pages de alta conversão em minutos, sem precisar de código ou design.",
  texto_botao_primario: "Comece agora",
  url_botao_primario: "#planos",
  texto_botao_secundario: "Ver demonstração",
  url_botao_secundario: "#como-funciona",
  imagem_principal: heroImage,
};

export const Hero = ({
  lpId,
  content = {},
  previewOverride,
  variante = "modelo_a",
  stylePreset = "glass",
  motionPreset = "fade-stagger",
  onPrimaryCTAClick,
  onSecondaryCTAClick,
}: HeroProps) => {
  const rawVariant =
    (content as any)?.variant ??
    variante ??
    "modelo_a";
  const normalizedVariant = normalizeHeroVariant(rawVariant);

  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const styles = getStyleClasses(stylePreset);

  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return;
    if (hasTrackedViewRef.current) return;

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

  const handlePrimaryClick = () => {
    if (lpId) trackCTAClick(lpId, "hero", "primary", normalizedVariant);
    onPrimaryCTAClick?.();
  };

  const handleSecondaryClick = () => {
    if (lpId) trackCTAClick(lpId, "hero", "secondary", normalizedVariant);
    onSecondaryCTAClick?.();
  };

  // ======================
  // MODELO C — FULL IMAGE
  // ======================
  if (normalizedVariant === "modelo_c") {
    return (
      <section
        ref={sectionRef}
        className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center overflow-hidden"
        id="hero"
        data-section-key="hero"
      >
        {finalContent.imagem_principal && (
          <div className="absolute inset-0">
            <img
              src={finalContent.imagem_principal}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          </div>
        )}

        <div className="section-container relative z-10 py-8 sm:py-0">
          <div className="max-w-xl">
            {finalContent.badge && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4"
              >
                {finalContent.badge}
              </motion.span>
            )}

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight break-words"
            >
              {finalContent.titulo}{" "}
              <span className="gradient-text break-words">{finalContent.destaque}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-md break-words"
            >
              {finalContent.subtitulo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col xs:flex-row gap-3"
            >
              <a
                href={finalContent.url_botao_primario}
                onClick={handlePrimaryClick}
                className="btn-primary text-center text-sm sm:text-base"
              >
                {finalContent.texto_botao_primario}
              </a>
              <a
                href={finalContent.url_botao_secundario}
                onClick={handleSecondaryClick}
                className="btn-secondary text-center text-sm sm:text-base"
              >
                {finalContent.texto_botao_secundario}
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // ======================
  // MODELO B — CENTRALIZADO
  // ======================
  if (normalizedVariant === "modelo_b") {
    return (
      <section
        ref={sectionRef}
        className="section-padding relative overflow-hidden"
        id="hero"
        data-section-key="hero"
      >
        <div className="section-container relative text-center max-w-4xl mx-auto">
          {finalContent.badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-6 sm:mb-8"
            >
              {finalContent.badge}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title mb-4 sm:mb-6"
          >
            {finalContent.titulo}{" "}
            <span className="gradient-text break-words">{finalContent.destaque}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-subtitle mx-auto mb-8 sm:mb-10"
          >
            {finalContent.subtitulo}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16"
          >
            <a
              href={finalContent.url_botao_primario}
              onClick={handlePrimaryClick}
              className="btn-primary gap-2 text-sm sm:text-base justify-center"
            >
              {finalContent.texto_botao_primario}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            <a
              href={finalContent.url_botao_secundario}
              onClick={handleSecondaryClick}
              className="btn-secondary gap-2 text-sm sm:text-base justify-center"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {finalContent.texto_botao_secundario}
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  // ======================
  // MODELO A — IMAGEM DO LADO
  // ======================
  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      id="hero"
      data-section-key="hero"
    >
      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            {finalContent.badge && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6"
              >
                {finalContent.badge}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-title mb-4 sm:mb-6"
            >
              {finalContent.titulo}{" "}
              <span className="gradient-text break-words">{finalContent.destaque}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="section-subtitle mb-6 sm:mb-8"
            >
              {finalContent.subtitulo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col xs:flex-row gap-3 sm:gap-4"
            >
              <a
                href={finalContent.url_botao_primario}
                onClick={handlePrimaryClick}
                className="btn-primary gap-2 text-sm sm:text-base justify-center xs:justify-start"
              >
                {finalContent.texto_botao_primario}
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a
                href={finalContent.url_botao_secundario}
                onClick={handleSecondaryClick}
                className="btn-secondary gap-2 text-sm sm:text-base justify-center xs:justify-start"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {finalContent.texto_botao_secundario}
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-1 lg:order-2"
          >
            {finalContent.imagem_principal ? (
              <div className="relative">
                <img
                  src={finalContent.imagem_principal}
                  alt="Hero"
                  className="relative w-full rounded-xl sm:rounded-2xl shadow-soft-lg"
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-muted rounded-xl sm:rounded-2xl flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Preview imagem</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
