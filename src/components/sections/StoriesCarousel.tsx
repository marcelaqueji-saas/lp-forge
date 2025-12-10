import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { trackSectionView } from '@/lib/tracking';
import { getStyleClasses } from '@/lib/styleTokens';
import type { StylePreset, MotionPreset } from '@/lib/sectionModels';

interface Story {
  titulo: string;
  imagem: string;
  descricao?: string;
}

interface StoriesCarouselContent {
  titulo?: string;
  subtitulo?: string;
  stories_json?: string;
}

interface StoriesCarouselProps {
  lpId?: string;
  content?: StoriesCarouselContent;
  previewOverride?: StoriesCarouselContent;
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
}

const defaultContent: StoriesCarouselContent = {
  titulo: 'Histórias de Sucesso',
  subtitulo: 'Veja como nossos clientes transformaram seus negócios',
  stories_json: JSON.stringify([
    {
      titulo: 'Startup Tech',
      imagem: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=700&fit=crop',
      descricao: 'Crescimento de 300% em 6 meses',
    },
    {
      titulo: 'E-commerce',
      imagem: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=700&fit=crop',
      descricao: 'Vendas triplicaram com novas LPs',
    },
    {
      titulo: 'Agência Digital',
      imagem: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=700&fit=crop',
      descricao: '50 clientes atendidos por mês',
    },
    {
      titulo: 'SaaS B2B',
      imagem: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=700&fit=crop',
      descricao: 'Conversão aumentou 150%',
    },
    {
      titulo: 'Consultoria',
      imagem: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=700&fit=crop',
      descricao: 'ROI positivo em 30 dias',
    },
  ]),
};

export const StoriesCarousel = ({
  lpId,
  content = {},
  previewOverride,
  stylePreset = 'glass',
}: StoriesCarouselProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const styles = getStyleClasses(stylePreset);

  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  let stories: Story[] = [];
  try {
    stories = finalContent.stories_json ? JSON.parse(finalContent.stories_json) : [];
  } catch {
    stories = [];
  }

  // Tracking
  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'provas_sociais', 'stories');
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId]);

  // Story autoplay
  useEffect(() => {
    if (activeStory === null) return;
    setProgress(0);
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        if (activeStory < stories.length - 1) {
          setActiveStory(activeStory + 1);
        } else {
          setActiveStory(null);
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeStory, stories.length]);

  const openStory = (index: number) => setActiveStory(index);
  const closeStory = () => setActiveStory(null);
  const prevStory = () => setActiveStory((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  const nextStory = () => setActiveStory((prev) => (prev !== null && prev < stories.length - 1 ? prev + 1 : null));

  return (
    <section
      ref={sectionRef}
      className={`section-padding ${styles.container}`}
      id="stories"
      data-section-key="provas_sociais"
    >
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`section-title mb-4 ${styles.title}`}>
            {finalContent.titulo}
          </h2>
          <p className={`section-subtitle mx-auto ${styles.subtitle}`}>
            {finalContent.subtitulo}
          </p>
        </motion.div>

        {/* Stories Grid */}
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4 snap-x snap-mandatory scrollbar-hide">
          {stories.map((story, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => openStory(index)}
              className="flex-shrink-0 snap-center group"
            >
              {/* Story Ring */}
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
                <div className="p-0.5 rounded-full bg-background">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                    <img
                      src={story.imagem}
                      alt={story.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm mt-2 text-center max-w-[80px] sm:max-w-[96px] truncate">
                {story.titulo}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {activeStory !== null && stories[activeStory] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={closeStory}
          >
            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-100"
                    style={{
                      width: idx < activeStory ? '100%' : idx === activeStory ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeStory();
              }}
              className="absolute top-12 right-4 z-10 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Story content */}
            <motion.div
              key={activeStory}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={stories[activeStory].imagem}
                alt={stories[activeStory].titulo}
                className="w-full h-full object-cover rounded-2xl"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl" />
              
              {/* Story info */}
              <div className="absolute bottom-8 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{stories[activeStory].titulo}</h3>
                {stories[activeStory].descricao && (
                  <p className="text-white/80">{stories[activeStory].descricao}</p>
                )}
              </div>

              {/* Navigation areas */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevStory();
                }}
                className="absolute left-0 top-0 w-1/3 h-full"
                aria-label="Anterior"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextStory();
                }}
                className="absolute right-0 top-0 w-2/3 h-full"
                aria-label="Próximo"
              />
            </motion.div>

            {/* Desktop navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevStory();
              }}
              className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextStory();
              }}
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              aria-label="Próximo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default StoriesCarousel;
