import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroParallaxContent {
  badge?: string;
  titulo?: string;
  destaque?: string;
  subtitulo?: string;
  texto_botao_primario?: string;
  url_botao_primario?: string;
  texto_botao_secundario?: string;
  url_botao_secundario?: string;
  imagem_fundo?: string;
  imagem_camada_1?: string;
  imagem_camada_2?: string;
}

interface HeroParallaxProps {
  content?: HeroParallaxContent;
  previewOverride?: HeroParallaxContent;
  disableAnimations?: boolean;
}

const defaultContent: HeroParallaxContent = {
  badge: 'Novo lançamento',
  titulo: 'Crie Landing Pages',
  destaque: 'profissionais',
  subtitulo: 'Editor visual, templates animados e alto poder de conversão.',
  texto_botao_primario: 'Começar agora grátis',
  url_botao_primario: '#planos',
  texto_botao_secundario: 'Ver demonstração',
  url_botao_secundario: '#demo',
};

export const HeroParallax = ({
  content = {},
  previewOverride,
  disableAnimations = false,
}: HeroParallaxProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { scrollYProgress } = useScroll({
  offset: ['start start', 'end start'],
});

  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), { stiffness: 100, damping: 30 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -200]), { stiffness: 100, damping: 30 });
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Magnetic button effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableAnimations) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.15);
    mouseY.set(y * 0.15);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (!isClient || disableAnimations) {
    // Static fallback for SSR or when animations disabled
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {finalContent.badge && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              {finalContent.badge}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {finalContent.titulo}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {finalContent.destaque}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {finalContent.subtitulo}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base h-14 px-8">
              <a href={finalContent.url_botao_primario}>
                {finalContent.texto_botao_primario}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base h-14 px-8">
              <a href={finalContent.url_botao_secundario}>{finalContent.texto_botao_secundario}</a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Parallax layers */}
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"
      />
      
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute inset-0"
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        style={{ y: y3 }}
        className="absolute inset-0"
      >
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-accent rounded-full"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary/50 rounded-full"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ scale, opacity }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        {finalContent.badge && (
          <motion.span
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {finalContent.badge}
          </motion.span>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          {finalContent.titulo}{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {finalContent.destaque}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          {finalContent.subtitulo}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div
            style={{ x: mouseX, y: mouseY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              size="lg"
              asChild
              className="text-base h-14 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
            >
              <a href={finalContent.url_botao_primario}>
                {finalContent.texto_botao_primario}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </motion.div>
          <Button size="lg" variant="outline" asChild className="text-base h-14 px-8">
            <a href={finalContent.url_botao_secundario}>{finalContent.texto_botao_secundario}</a>
          </Button>
        </motion.div>

        {/* Trust badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          ✓ Sem cartão de crédito • Comece em segundos
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroParallax;
