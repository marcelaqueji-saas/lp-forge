import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

interface HeroParallaxContent {
  destaque?: string;
  titulo?: string;
  subtitulo?: string;
  cta_label?: string;
  cta_url?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
  background_image_url?: string;
  overlay_intensity?: number;
  background_blur?: number;
  imagem_fundo?: string; // fallback legado
}

interface HeroParallaxProps {
  lpId?: string;
  content?: HeroParallaxContent;
  previewOverride?: HeroParallaxContent;
  disableAnimations?: boolean;
}

const defaultContent: HeroParallaxContent = {
  destaque: 'Premium',
  titulo: 'Experiência cinematográfica',
  subtitulo: 'Hero fullscreen com profundidade e animação suave.',
  cta_label: 'Começar agora',
  cta_url: '#planos',
  secondary_cta_label: 'Ver demonstração',
  secondary_cta_url: '#demo',
  overlay_intensity: 0.65,
  background_blur: 0,
};

const VARIANT_ID = 'HeroParallax';

const HeroParallax = ({
  lpId,
  content = {},
  previewOverride,
  disableAnimations = false,
}: HeroParallaxProps) => {
  const finalContent = {
    ...defaultContent,
    ...content,
    ...previewOverride,
  };

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackedRef = useRef(false);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lpId) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackSectionView(lpId, 'hero', VARIANT_ID);
          trackedRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId]);

  const handlePrimary = () => {
    if (lpId) trackCTAClick(lpId, 'hero', 'primary', VARIANT_ID);
  };

  const handleSecondary = () => {
    if (lpId) trackCTAClick(lpId, 'hero', 'secondary', VARIANT_ID);
  };

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const backgroundImage =
    finalContent.background_image_url || finalContent.imagem_fundo || '';
  const overlay = Math.min(Math.max(finalContent.overlay_intensity ?? 0.65, 0), 1);
  const blur = Math.max(finalContent.background_blur ?? 0, 0);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-background"
      id="hero"
      data-section-key="hero"
    >
      <div ref={targetRef} className="absolute inset-0">
        {backgroundImage ? (
          <motion.div
            style={{ y }}
            className="absolute inset-0 will-change-transform"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: blur ? `blur(${blur}px)` : undefined,
              }}
            />
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        )}
      </div>

      <div className="relative z-10 flex items-center min-h-screen">
        <div className="section-container w-full">
          <motion.div
            initial={disableAnimations ? false : { opacity: 0, y: 24 }}
            animate={disableAnimations ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl bg-card/80 border border-white/15 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/25"
          >
            {finalContent.destaque && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
                {finalContent.destaque}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow mb-4">
              {finalContent.titulo}
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-3xl mb-8">
              {finalContent.subtitulo}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={finalContent.cta_url}
                onClick={handlePrimary}
                className="btn-primary gap-2"
              >
                {finalContent.cta_label}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={finalContent.secondary_cta_url}
                onClick={handleSecondary}
                className="btn-secondary gap-2 text-white border-white/40 hover:border-white"
              >
                <Play className="w-5 h-5" />
                {finalContent.secondary_cta_label}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroParallax;
