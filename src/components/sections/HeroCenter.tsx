import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

interface HeroCenterContent {
  destaque?: string;
  titulo?: string;
  subtitulo?: string;
  cta_label?: string;
  cta_url?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
}

interface HeroCenterProps {
  lpId?: string;
  content?: HeroCenterContent;
  previewOverride?: HeroCenterContent;
  disableAnimations?: boolean;
}

const defaultContent: HeroCenterContent = {
  destaque: 'Lançamento',
  titulo: 'Construa páginas incríveis',
  subtitulo: 'Combine velocidade, design e conversão em um só lugar.',
  cta_label: 'Começar grátis',
  cta_url: '#planos',
  secondary_cta_label: 'Ver demonstração',
  secondary_cta_url: '#demo',
};

const VARIANT_ID = 'HeroCenter';

const HeroCenter = ({
  lpId,
  content = {},
  previewOverride,
  disableAnimations = false,
}: HeroCenterProps) => {
  const finalContent = {
    ...defaultContent,
    ...content,
    ...previewOverride,
  };

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackedRef = useRef(false);

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

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-background"
      id="hero"
      data-section-key="hero"
    >
      <div className="section-container flex justify-center">
        <motion.div
          initial={disableAnimations ? false : { opacity: 0, y: 16 }}
          animate={disableAnimations ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl text-center bg-card/80 border border-border/60 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5"
        >
          {finalContent.destaque && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              {finalContent.destaque}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {finalContent.titulo}
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-8">
            {finalContent.subtitulo}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={finalContent.cta_url}
              onClick={handlePrimary}
              className="btn-primary gap-2"
            >
              {finalContent.cta_label}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={finalContent.secondary_cta_url}
              onClick={handleSecondary}
              className="btn-secondary gap-2"
            >
              <Play className="w-4 h-4" />
              {finalContent.secondary_cta_label}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroCenter;
