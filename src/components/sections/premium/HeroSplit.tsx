import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

interface SplitItem {
  titulo: string;
  descricao: string;
  cor: string;
  imagem?: string;
}

interface HeroSplitContent {
  itens?: SplitItem[];
  texto_botao?: string;
  url_botao?: string;
}

interface HeroSplitProps {
  lpId?: string;
  content?: HeroSplitContent;
  previewOverride?: HeroSplitContent;
  disableAnimations?: boolean;
}

const defaultItems: SplitItem[] = [
  { titulo: 'Crie', descricao: 'Landing pages profissionais em minutos', cor: 'hsl(var(--primary))' },
  { titulo: 'Edite', descricao: 'Visual editor intuitivo e poderoso', cor: 'hsl(var(--accent))' },
  { titulo: 'Publique', descricao: 'Deploy instantâneo com domínio próprio', cor: 'hsl(262, 83%, 58%)' },
  { titulo: 'Converta', descricao: 'Otimizado para alta conversão', cor: 'hsl(173, 58%, 39%)' },
];

const defaultContent: HeroSplitContent = {
  itens: defaultItems,
  texto_botao: 'Começar agora',
  url_botao: '#planos',
};

const VARIANT_ID = 'hero-split';

export const HeroSplit = ({
  lpId,
  content = {},
  previewOverride,
  disableAnimations = false,
}: HeroSplitProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const items = finalContent.itens || defaultItems;

  const handleSectionView = () => {
    if (!lpId) return;
    trackSectionView(lpId, 'hero', VARIANT_ID);
  };

  const handlePrimaryClick = () => {
    if (!lpId) return;
    trackCTAClick(lpId, 'hero', 'primary', VARIANT_ID);
  };

  if (disableAnimations) {
    return (
      <motion.section
        className="min-h-screen flex items-center justify-center bg-background"
        id="hero"
        data-section-key="hero"
        onViewportEnter={handleSectionView}
        viewport={{ once: true, amount: 0.4 }}
      >
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border bg-card"
                style={{ borderColor: item.cor }}
              >
                <h2 className="text-3xl font-bold mb-2" style={{ color: item.cor }}>
                  {item.titulo}
                </h2>
                <p className="text-muted-foreground">{item.descricao}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild onClick={handlePrimaryClick}>
              <a href={finalContent.url_botao}>
                {finalContent.texto_botao}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="min-h-screen flex flex-col overflow-hidden bg-background"
      id="hero"
      data-section-key="hero"
      onViewportEnter={handleSectionView}
      viewport={{ once: true, amount: 0.4 }}
    >
      <div className="flex-1 flex flex-col md:flex-row">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className={cn(
              'relative flex-1 flex items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden',
              'min-h-[25vh] md:min-h-0'
            )}
            initial={false}
            animate={{
              flex: activeIndex === index ? 2.5 : 1,
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{
              background: `linear-gradient(135deg, ${item.cor}15 0%, transparent 100%)`,
            }}
          >
            {/* Background gradient overlay */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: activeIndex === index ? 1 : 0,
              }}
              style={{
                background: `linear-gradient(135deg, ${item.cor}25 0%, ${item.cor}05 100%)`,
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 text-center md:text-left">
              <motion.h2
                className="font-bold mb-2 md:mb-4"
                initial={false}
                animate={{
                  fontSize: activeIndex === index ? '3rem' : '2rem',
                  writingMode:
                    activeIndex === index || activeIndex === null
                      ? 'horizontal-tb'
                      : 'vertical-rl',
                }}
                transition={{ duration: 0.3 }}
                style={{ color: item.cor }}
              >
                {item.titulo}
              </motion.h2>

              <AnimatePresence>
                {(activeIndex === index || activeIndex === null) && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="text-muted-foreground max-w-xs"
                  >
                    {item.descricao}
                  </motion.p>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6"
                  >
                    <Button
                      asChild
                      style={{ backgroundColor: item.cor }}
                      className="text-white hover:opacity-90"
                      onClick={handlePrimaryClick}
                    >
                      <a href={finalContent.url_botao}>
                        {finalContent.texto_botao}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Decorative line */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1"
              initial={false}
              animate={{
                scaleX: activeIndex === index ? 1 : 0,
              }}
              style={{ backgroundColor: item.cor, transformOrigin: 'left' }}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default HeroSplit;
