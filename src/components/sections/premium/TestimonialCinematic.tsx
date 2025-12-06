import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TestimonialItem {
  texto: string;
  nome: string;
  cargo: string;
  foto?: string;
}

interface TestimonialCinematicContent {
  titulo?: string;
  depoimentos?: TestimonialItem[];
  autoplay?: boolean;
}

interface TestimonialCinematicProps {
  content?: TestimonialCinematicContent;
  previewOverride?: TestimonialCinematicContent;
  disableAnimations?: boolean;
}

const defaultTestimonials: TestimonialItem[] = [
  {
    texto: 'O SaaS-LP transformou completamente como criamos landing pages. O que levava dias agora fazemos em horas, com resultados muito melhores.',
    nome: 'Maria Silva',
    cargo: 'CEO, TechStartup',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  },
  {
    texto: 'Os templates premium com animações fizeram toda a diferença nas nossas taxas de conversão. Recomendo para qualquer empresa.',
    nome: 'João Santos',
    cargo: 'Marketing Director, Growth Co',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
  },
];

const defaultContent: TestimonialCinematicContent = {
  titulo: 'O que nossos clientes dizem',
  depoimentos: defaultTestimonials,
  autoplay: true,
};

export const TestimonialCinematic = ({
  content = {},
  previewOverride,
  disableAnimations = false,
}: TestimonialCinematicProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const testimonials = finalContent.depoimentos || defaultTestimonials;

  useEffect(() => {
    if (!finalContent.autoplay || disableAnimations) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length, finalContent.autoplay, disableAnimations]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (disableAnimations) {
    const current = testimonials[activeIndex];
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          {finalContent.titulo && (
            <h2 className="text-3xl font-bold text-center mb-12">{finalContent.titulo}</h2>
          )}
          <div className="relative">
            <Quote className="w-16 h-16 text-primary/20 mb-6" />
            <blockquote className="text-2xl md:text-3xl font-light mb-8 leading-relaxed">
              "{current.texto}"
            </blockquote>
            <div className="flex items-center gap-4">
              {current.foto && (
                <img
                  src={current.foto}
                  alt={current.nome}
                  className="w-14 h-14 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{current.nome}</p>
                <p className="text-muted-foreground text-sm">{current.cargo}</p>
              </div>
            </div>
          </div>
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        {finalContent.titulo && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            {finalContent.titulo}
          </motion.h2>
        )}

        <div className="relative min-h-[350px]">
          <AnimatePresence mode="wait">
            {testimonials.map((testimonial, index) =>
              index === activeIndex ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute inset-0"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.2 }}
                    className="absolute -top-4 -left-4"
                  >
                    <Quote className="w-20 h-20 text-primary" />
                  </motion.div>

                  <blockquote className="relative z-10">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl md:text-3xl lg:text-4xl font-light mb-8 leading-relaxed"
                    >
                      "{testimonial.texto}"
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-4"
                    >
                      {testimonial.foto && (
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur-sm opacity-50" />
                          <img
                            src={testimonial.foto}
                            alt={testimonial.nome}
                            className="relative w-14 h-14 rounded-full object-cover border-2 border-background"
                          />
                        </motion.div>
                      )}
                      <div>
                        <p className="font-semibold text-lg">{testimonial.nome}</p>
                        <p className="text-muted-foreground">{testimonial.cargo}</p>
                      </div>
                    </motion.div>
                  </blockquote>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {testimonials.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === activeIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TestimonialCinematic;
