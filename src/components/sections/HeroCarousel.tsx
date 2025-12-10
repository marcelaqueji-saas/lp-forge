import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';
import { getStyleClasses, getMotionVariants } from '@/lib/styleTokens';
import type { StylePreset, MotionPreset } from '@/lib/sectionModels';

interface HeroCarouselContent {
  titulo?: string;
  destaque?: string;
  subtitulo?: string;
  texto_botao_primario?: string;
  url_botao_primario?: string;
  imagens_json?: string; // JSON array of image URLs
}

interface HeroCarouselProps {
  lpId?: string;
  content?: HeroCarouselContent;
  previewOverride?: HeroCarouselContent;
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
  autoplayInterval?: number;
}

const defaultContent: HeroCarouselContent = {
  titulo: 'Transforme sua presença',
  destaque: 'digital',
  subtitulo: 'Crie landing pages incríveis com nosso editor visual intuitivo.',
  texto_botao_primario: 'Começar agora',
  url_botao_primario: '#planos',
  imagens_json: JSON.stringify([
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=800&fit=crop',
  ]),
};

export const HeroCarousel = ({
  lpId,
  content = {},
  previewOverride,
  stylePreset = 'glass',
  motionPreset = 'fade-stagger',
  autoplayInterval = 5000,
}: HeroCarouselProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const styles = getStyleClasses(stylePreset);
  const motion_config = getMotionVariants(motionPreset);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  let images: string[] = [];
  try {
    images = finalContent.imagens_json ? JSON.parse(finalContent.imagens_json) : [];
  } catch {
    images = [];
  }

  // Autoplay
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, autoplayInterval]);

  // Tracking
  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'hero', 'carousel');
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleCTAClick = () => {
    if (lpId) trackCTAClick(lpId, 'hero', 'primary', 'carousel');
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      id="hero"
      data-section-key="hero"
    >
      {/* Background Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {images.length > 0 && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <img
                src={images[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
      </div>

      {/* Content */}
      <div className="section-container relative z-10 py-16">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight ${styles.title}`}
          >
            {finalContent.titulo}{' '}
            <span className="gradient-text">{finalContent.destaque}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-lg sm:text-xl mb-8 ${styles.subtitle}`}
          >
            {finalContent.subtitulo}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a
              href={finalContent.url_botao_primario}
              onClick={handleCTAClick}
              className="btn-primary gap-2 inline-flex"
            >
              {finalContent.texto_botao_primario}
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/50 hover:bg-muted-foreground'
                }`}
                aria-label={`Ir para slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
