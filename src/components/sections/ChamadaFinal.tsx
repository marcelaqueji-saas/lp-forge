import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface ChamadaFinalContent {
  titulo?: string;
  subtitulo?: string;
  texto_botao?: string;
  url_botao?: string;
}

interface ChamadaFinalProps {
  content?: ChamadaFinalContent;
  previewOverride?: ChamadaFinalContent;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  onPrimaryCTAClick?: () => void;
}

const defaultContent: ChamadaFinalContent = {
  titulo: 'Pronto para começar?',
  subtitulo: 'Junte-se a milhares de empresas que já transformaram suas conversões.',
  texto_botao: 'Criar minha landing page',
  url_botao: '#planos',
};

export const ChamadaFinal = ({ 
  content = {}, 
  previewOverride, 
  variante = 'modelo_a',
  onPrimaryCTAClick 
}: ChamadaFinalProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  const handleClick = () => {
    trackEvent('click_cta_chamada_final', { url: finalContent.url_botao });
    onPrimaryCTAClick?.();
  };

  // Modelo C - Minimal side-by-side
  if (variante === 'modelo_c') {
    return (
      <section className="section-padding">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl border border-border bg-card/50"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{finalContent.titulo}</h2>
              <p className="text-muted-foreground">{finalContent.subtitulo}</p>
            </div>
            <a
              href={finalContent.url_botao}
              onClick={handleClick}
              className="btn-primary gap-2 whitespace-nowrap"
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
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 md:p-16 text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Oferta especial
            </div>
            <h2 className="section-title mb-4">{finalContent.titulo}</h2>
            <p className="section-subtitle mx-auto mb-8">{finalContent.subtitulo}</p>
            <a
              href={finalContent.url_botao}
              onClick={handleClick}
              className="btn-primary gap-2 text-lg px-8 py-4"
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
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="section-container relative text-center text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title mb-4">{finalContent.titulo}</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            {finalContent.subtitulo}
          </p>
          <a
            href={finalContent.url_botao}
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-card text-foreground hover:bg-card/90 transition-all duration-300 shadow-soft-lg hover:shadow-glow"
          >
            {finalContent.texto_botao}
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};