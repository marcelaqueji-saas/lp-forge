import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';
import { getStyleClasses, getMotionVariants } from '@/lib/styleTokens';
import type { StylePreset, MotionPreset } from '@/lib/sectionModels';

interface ChamadaFinalContent {
  titulo?: string;
  subtitulo?: string;
  texto_botao?: string;
  url_botao?: string;
}

type ChamadaFinalVariant = 'modelo_a' | 'modelo_b' | 'modelo_c';

interface ChamadaFinalProps {
  lpId?: string;
  content?: ChamadaFinalContent;
  previewOverride?: ChamadaFinalContent;
  variante?: ChamadaFinalVariant;
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
  onPrimaryCTAClick?: () => void;
  cardStyle?: string;
}

const defaultContent: ChamadaFinalContent = {
  titulo: 'Pronto para começar?',
  subtitulo:
    'Junte-se a milhares de empresas que já transformaram suas conversões.',
  texto_botao: 'Criar minha landing page',
  url_botao: '#planos',
};

export const ChamadaFinal = ({
  lpId,
  content = {},
  previewOverride,
  variante = 'modelo_a',
  stylePreset = 'glass',
  motionPreset = 'fade-stagger',
  onPrimaryCTAClick,
  cardStyle = '',
}: ChamadaFinalProps) => {
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
          trackSectionView(lpId, 'chamada_final', variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lpId, variante]);

  const handleClick = () => {
    if (lpId) {
      trackCTAClick(lpId, 'chamada_final', 'primary', variante);
    }
    onPrimaryCTAClick?.();
  };

  // Check if using dark/neon preset for special styling
  const isDarkPreset = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeonPreset = stylePreset === 'neon';
  const isMinimalPreset = stylePreset === 'minimal';

  // Modelo C - Minimal side-by-side
  if (variante === 'modelo_c') {
    return (
      <section
        ref={sectionRef}
        className={`section-padding ${styles.container}`}
        id="chamada_final"
        data-section-key="chamada_final"
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl ${
              isNeonPreset 
                ? 'border border-primary/30 bg-zinc-900/80 shadow-[0_0_30px_hsl(var(--primary)/0.2)]'
                : isDarkPreset
                  ? 'border border-zinc-700 bg-zinc-800/90'
                  : 'border border-border bg-card/50'
            }`}
          >
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${styles.title}`}>
                {finalContent.titulo}
              </h2>
              <p className={styles.subtitle}>
                {finalContent.subtitulo}
              </p>
            </div>
            <a
              href={finalContent.url_botao}
              onClick={handleClick}
              className={`gap-2 whitespace-nowrap inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                isNeonPreset
                  ? 'bg-primary text-primary-foreground hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)]'
                  : isDarkPreset
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                    : isMinimalPreset
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                      : 'btn-primary'
              }`}
            >
              {finalContent.texto_botao}
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  if (variante === 'modelo_b') {
    return (
      <section
        ref={sectionRef}
        className={`section-padding relative overflow-hidden ${styles.container}`}
        id="chamada_final"
        data-section-key="chamada_final"
      >
        {!isDarkPreset && <div className="absolute inset-0 gradient-bg opacity-10" />}
        {isNeonPreset && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        )}
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`p-12 md:p-16 text-center max-w-4xl mx-auto rounded-3xl ${
              isNeonPreset
                ? 'bg-zinc-900/80 border border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.2)]'
                : isDarkPreset
                  ? 'bg-zinc-800/90 border border-zinc-700'
                  : cardStyle || 'premium-card-glass-medium'
            }`}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              isNeonPreset
                ? 'bg-primary/20 text-primary border border-primary/30'
                : isDarkPreset
                  ? 'bg-zinc-700 text-zinc-200'
                  : 'bg-primary/10 text-primary'
            }`}>
              <Sparkles className={`w-4 h-4 ${isNeonPreset ? 'animate-neon-pulse' : ''}`} />
              Oferta especial
            </div>
            <h2 className={`section-title mb-4 ${styles.title}`}>
              {finalContent.titulo}
            </h2>
            <p className={`section-subtitle mx-auto mb-8 ${styles.subtitle}`}>
              {finalContent.subtitulo}
            </p>
            <a
              href={finalContent.url_botao}
              onClick={handleClick}
              className={`gap-2 text-lg px-8 py-4 inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ${
                isNeonPreset
                  ? 'bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]'
                  : isDarkPreset
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                    : isMinimalPreset
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                      : 'btn-primary'
              }`}
            >
              {finalContent.texto_botao}
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Full width gradient
  return (
    <section
      ref={sectionRef}
      className={`section-padding relative overflow-hidden ${
        isNeonPreset 
          ? 'bg-zinc-950'
          : isDarkPreset
            ? 'bg-zinc-900'
            : isMinimalPreset
              ? 'bg-zinc-100'
              : ''
      }`}
      id="chamada_final"
      data-section-key="chamada_final"
    >
      {!isDarkPreset && !isMinimalPreset && (
        <>
          <div className="absolute inset-0 gradient-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        </>
      )}
      {isNeonPreset && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </>
      )}
      <div className={`section-container relative text-center ${
        isMinimalPreset ? 'text-zinc-900' : isDarkPreset ? 'text-zinc-100' : 'text-primary-foreground'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`section-title mb-4 ${
            isMinimalPreset ? 'text-zinc-900' : isDarkPreset ? 'text-zinc-100' : ''
          }`}>
            {finalContent.titulo}
          </h2>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-8 ${
            isMinimalPreset ? 'text-zinc-600' : isDarkPreset ? 'opacity-80' : 'opacity-90'
          }`}>
            {finalContent.subtitulo}
          </p>
          <a
            href={finalContent.url_botao}
            onClick={handleClick}
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
              isNeonPreset
                ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_35px_hsl(var(--primary)/0.6)]'
                : isDarkPreset
                  ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-lg'
                  : isMinimalPreset
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-card text-foreground hover:bg-card/90 shadow-soft-lg hover:shadow-glow'
            }`}
          >
            {finalContent.texto_botao}
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};