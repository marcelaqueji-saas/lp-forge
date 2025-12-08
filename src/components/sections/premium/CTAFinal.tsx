import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

interface CTAFinalContent {
  titulo?: string;
  subtitulo?: string;
  texto_botao?: string;
  url_botao?: string;
}

interface CTAFinalProps {
  lpId?: string;
  content?: CTAFinalContent;
  previewOverride?: CTAFinalContent;
  disableAnimations?: boolean;
  buttonStyle?: string; // recebido do SectionLoader (mesmo que não usemos ainda)
  cardStyle?: string;   // idem
}

const defaultContent: CTAFinalContent = {
  titulo: 'Pronto para publicar ainda hoje?',
  subtitulo: 'Comece gratuitamente e veja resultados em minutos.',
  texto_botao: 'Criar minha página',
  url_botao: '#planos',
};

export const CTAFinal = ({
  lpId,
  content = {},
  previewOverride,
  disableAnimations = false,
}: CTAFinalProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const handleViewportEnter = () => {
    if (!hasTrackedView && lpId) {
      trackSectionView(lpId, 'chamada_final', 'cta_final_animated');
      setHasTrackedView(true);
    }
  };

  const handleClick = () => {
    if (lpId) {
      trackCTAClick(lpId, 'chamada_final', 'primary', 'cta_final_animated');
    }
  };

  if (disableAnimations) {
    return (
      <motion.section
        className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10"
        id="chamada_final"
        data-section-key="chamada_final"
        onViewportEnter={handleViewportEnter}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {finalContent.titulo}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">{finalContent.subtitulo}</p>
          <Button
            size="lg"
            asChild
            className="text-base h-14 px-8"
            onClick={handleClick}
          >
            <a href={finalContent.url_botao}>
              {finalContent.texto_botao}
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-20 relative overflow-hidden"
      id="chamada_final"
      data-section-key="chamada_final"
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-12 h-12 text-primary mx-auto" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
        >
          {finalContent.titulo}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground mb-8"
        >
          {finalContent.subtitulo}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            asChild
            className="text-base h-14 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            onClick={handleClick}
          >
            <motion.a
              href={finalContent.url_botao}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {finalContent.texto_botao}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.span>
            </motion.a>
          </Button>
        </motion.div>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default CTAFinal;
