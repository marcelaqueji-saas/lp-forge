import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

interface HeroSplitContent {
  destaque?: string;
  titulo?: string;
  subtitulo?: string;
  cta_label?: string;
  cta_url?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
  imagem_principal?: string;
}

interface HeroSplitBasicProps {
  lpId?: string;
  content?: HeroSplitContent;
  previewOverride?: HeroSplitContent;
  disableAnimations?: boolean;
}

const defaultContent: HeroSplitContent = {
  destaque: 'Novo',
  titulo: 'Acelere sua landing page',
  subtitulo: 'Layouts responsivos, rápidos e prontos para converter.',
  cta_label: 'Começar agora',
  cta_url: '#planos',
  secondary_cta_label: 'Ver demonstração',
  secondary_cta_url: '#demo',
};

const VARIANT_ID = 'HeroSplitBasic';

const HeroSplitBasic = ({
  lpId,
  content = {},
  previewOverride,
  disableAnimations = false,
}: HeroSplitBasicProps) => {
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
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-10 items-center bg-card/80 border border-border/60 backdrop-blur rounded-2xl p-8 lg:p-10 shadow-lg">
          <div className="space-y-4">
            {finalContent.destaque && (
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold"
              >
                {finalContent.destaque}
              </motion.span>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
            >
              {finalContent.titulo}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-base md:text-lg text-muted-foreground"
            >
              {finalContent.subtitulo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="flex flex-wrap gap-3 pt-2"
            >
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
            </motion.div>
          </div>

          <motion.div
            initial={disableAnimations ? false : { opacity: 0, x: 20 }}
            animate={disableAnimations ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            {finalContent.imagem_principal ? (
              <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-muted">
                <img
                  src={finalContent.imagem_principal}
                  alt="Hero visual"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-muted border border-dashed border-border/60 flex items-center justify-center text-muted-foreground text-sm">
                Adicione uma imagem
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplitBasic;
