import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { trackSectionView } from '@/lib/tracking';
import { getStyleClasses } from '@/lib/styleTokens';
import type { StylePreset } from '@/lib/sectionModels';

interface Logo {
  nome: string;
  url?: string;
}

interface LogosInfiniteScrollContent {
  titulo?: string;
  subtitulo?: string;
  logos_json?: string;
}

interface LogosInfiniteScrollProps {
  lpId?: string;
  content?: LogosInfiniteScrollContent;
  previewOverride?: LogosInfiniteScrollContent;
  stylePreset?: StylePreset;
}

const defaultContent: LogosInfiniteScrollContent = {
  titulo: 'Empresas que confiam em nós',
  subtitulo: 'Mais de 500 empresas já transformaram seus negócios',
  logos_json: JSON.stringify([
    { nome: 'TechCorp' },
    { nome: 'InnovateBR' },
    { nome: 'StartupX' },
    { nome: 'DigitalOne' },
    { nome: 'CloudMax' },
    { nome: 'DataFlow' },
    { nome: 'SmartSolutions' },
    { nome: 'FutureTech' },
  ]),
};

export const LogosInfiniteScroll = ({
  lpId,
  content = {},
  previewOverride,
  stylePreset = 'glass',
}: LogosInfiniteScrollProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const styles = getStyleClasses(stylePreset);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  let logos: Logo[] = [];
  try {
    logos = finalContent.logos_json ? JSON.parse(finalContent.logos_json) : [];
  } catch {
    logos = [];
  }

  // Duplicate logos for infinite scroll effect
  const displayLogos = [...logos, ...logos];

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'provas_sociais', 'logos_scroll');
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId]);

  return (
    <section
      ref={sectionRef}
      className={`py-12 sm:py-16 overflow-hidden ${styles.container}`}
      id="logos"
      data-section-key="provas_sociais"
    >
      <div className="section-container mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className={`text-lg sm:text-xl font-medium mb-2 ${styles.title}`}>
            {finalContent.titulo}
          </h2>
          <p className={`text-sm ${styles.subtitle}`}>
            {finalContent.subtitulo}
          </p>
        </motion.div>
      </div>

      {/* Infinite scroll container */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling logos */}
        <div className="flex animate-scroll-x">
          {displayLogos.map((logo, index) => (
            <div
              key={index}
              className={`flex-shrink-0 mx-8 px-8 py-4 rounded-xl ${styles.card}`}
            >
              {logo.url ? (
                <img
                  src={logo.url}
                  alt={logo.nome}
                  className="h-8 sm:h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100"
                />
              ) : (
                <div className="h-8 sm:h-10 flex items-center justify-center px-4">
                  <span className="text-lg sm:text-xl font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    {logo.nome}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosInfiniteScroll;
