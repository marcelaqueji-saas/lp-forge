import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Zap, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Card3DItem {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface Cards3DShowcaseContent {
  titulo?: string;
  subtitulo?: string;
  cards?: Card3DItem[];
}

interface Cards3DShowcaseProps {
  content?: Cards3DShowcaseContent;
  previewOverride?: Cards3DShowcaseContent;
  disableAnimations?: boolean;
}

const defaultCards: Card3DItem[] = [
  { titulo: 'Animações Reais', descricao: 'Templates com Motion e GSAP para impressionar seus visitantes', icone: 'sparkles' },
  { titulo: 'Alta Conversão', descricao: 'Designs otimizados com base em dados de milhares de páginas', icone: 'zap' },
  { titulo: '100% Editável', descricao: 'Personalize cores, textos e imagens sem tocar em código', icone: 'edit' },
];

const defaultContent: Cards3DShowcaseContent = {
  titulo: 'Templates premium, sem limites',
  subtitulo: 'Escolha entre dezenas de modelos profissionais',
  cards: defaultCards,
};

const iconMap: Record<string, React.ComponentType<any>> = {
  sparkles: Sparkles,
  zap: Zap,
  edit: Edit3,
};

export const Cards3DShowcase = ({
  content = {},
  previewOverride,
  disableAnimations = false,
}: Cards3DShowcaseProps) => {
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const cards = finalContent.cards || defaultCards;

  const rotateY = useMotionValue(0);
  const smoothRotateY = useSpring(rotateY, { stiffness: 100, damping: 20 });

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  if (disableAnimations) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{finalContent.titulo}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{finalContent.subtitulo}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {cards.map((card, index) => {
              const IconComponent = iconMap[card.icone || 'sparkles'] || Sparkles;
              return (
                <div key={index} className="bg-card rounded-2xl p-8 border shadow-sm">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{card.titulo}</h3>
                  <p className="text-muted-foreground">{card.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{finalContent.titulo}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{finalContent.subtitulo}</p>
        </motion.div>

        <div ref={containerRef} className="relative h-[400px] perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center">
            {cards.map((card, index) => {
              const IconComponent = iconMap[card.icone || 'sparkles'] || Sparkles;
              const offset = index - activeIndex;
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={index}
                  className={cn(
                    'absolute w-80 bg-card rounded-2xl p-8 border shadow-lg cursor-pointer',
                    isActive && 'z-20',
                    !isActive && 'z-10'
                  )}
                  initial={false}
                  animate={{
                    x: offset * 120,
                    z: isActive ? 100 : -100,
                    rotateY: offset * 15,
                    scale: isActive ? 1.1 : 0.85,
                    opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.6,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  onClick={() => setActiveIndex(index)}
                  whileHover={isActive ? { scale: 1.15 } : {}}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6"
                    animate={{
                      background: isActive
                        ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)'
                        : 'hsl(var(--primary) / 0.1)',
                    }}
                  >
                    <IconComponent
                      className={cn('w-7 h-7', isActive ? 'text-white' : 'text-primary')}
                    />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{card.titulo}</h3>
                  <p className="text-muted-foreground text-sm">{card.descricao}</p>

                  {/* Glow effect for active card */}
                  {isActive && (
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === activeIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cards3DShowcase;
