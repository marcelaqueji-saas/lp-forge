import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import heroImage from '@/assets/hero-dashboard.png';

interface HeroContent {
  badge?: string;
  titulo?: string;
  destaque?: string;
  subtitulo?: string;
  texto_botao_primario?: string;
  url_botao_primario?: string;
  texto_botao_secundario?: string;
  url_botao_secundario?: string;
  imagem_principal?: string;
}

export type HeroVariantId = 'modelo_a' | 'modelo_b' | 'modelo_c';

interface HeroProps {
  content?: HeroContent;
  previewOverride?: HeroContent;
  variante?: HeroVariantId;
  onPrimaryCTAClick?: () => void;
  onSecondaryCTAClick?: () => void;
}

const defaultContent: HeroContent = {
  badge: 'Novo lançamento',
  titulo: 'Transforme sua ideia em',
  destaque: 'realidade digital',
  subtitulo: 'Crie landing pages de alta conversão em minutos, sem precisar de código ou design.',
  texto_botao_primario: 'Comece agora',
  url_botao_primario: '#planos',
  texto_botao_secundario: 'Ver demonstração',
  url_botao_secundario: '#como-funciona',
  imagem_principal: heroImage,
};

export const Hero = ({ 
  content = {}, 
  previewOverride, 
  variante = 'modelo_a',
  onPrimaryCTAClick,
  onSecondaryCTAClick 
}: HeroProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  const handlePrimaryClick = () => {
    trackEvent('click_cta_hero', { button: 'primary', url: finalContent.url_botao_primario });
    onPrimaryCTAClick?.();
  };

  const handleSecondaryClick = () => {
    trackEvent('click_cta_hero', { button: 'secondary', url: finalContent.url_botao_secundario });
    onSecondaryCTAClick?.();
  };

  // Modelo C - Minimal hero with full-width image background
  if (variante === 'modelo_c') {
    return (
      <section className="relative min-h-[80vh] flex items-center overflow-hidden" id="hero" data-section-key="hero">
        {/* Background Image */}
        {finalContent.imagem_principal && (
          <div className="absolute inset-0">
            <img
              src={finalContent.imagem_principal}
              alt="Hero background"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          </div>
        )}
        
        <div className="section-container relative z-10">
          <div className="max-w-xl">
            {finalContent.badge && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-block text-sm font-medium text-primary mb-4"
              >
                {finalContent.badge}
              </motion.span>
            )}

            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              {finalContent.titulo}{' '}
              <span className="gradient-text">{finalContent.destaque}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-md"
            >
              {finalContent.subtitulo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <a
                href={finalContent.url_botao_primario}
                onClick={handlePrimaryClick}
                className="btn-primary"
              >
                {finalContent.texto_botao_primario}
              </a>
              <a
                href={finalContent.url_botao_secundario}
                onClick={handleSecondaryClick}
                className="btn-secondary"
              >
                {finalContent.texto_botao_secundario}
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (variante === 'modelo_b') {
    return (
      <section className="section-padding relative overflow-hidden" id="hero" data-section-key="hero">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="section-container relative">
          <div className="text-center max-w-4xl mx-auto">
            {finalContent.badge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {finalContent.badge}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="section-title mb-6"
            >
              {finalContent.titulo}{' '}
              <span className="gradient-text">{finalContent.destaque}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-subtitle mx-auto mb-10"
            >
              {finalContent.subtitulo}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <a
                href={finalContent.url_botao_primario}
                onClick={handlePrimaryClick}
                className="btn-primary gap-2"
              >
                {finalContent.texto_botao_primario}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={finalContent.url_botao_secundario}
                onClick={handleSecondaryClick}
                className="btn-secondary gap-2"
              >
                <Play className="w-4 h-4" />
                {finalContent.texto_botao_secundario}
              </a>
            </motion.div>

            {finalContent.imagem_principal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <img
                  src={finalContent.imagem_principal}
                  alt="Hero"
                  className="w-full rounded-2xl shadow-soft-lg"
                  loading="lazy"
                />
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Modelo A - Imagem à direita
  return (
    <section className="section-padding relative overflow-hidden" id="hero" data-section-key="hero">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            {finalContent.badge && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {finalContent.badge}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="section-title mb-6"
            >
              {finalContent.titulo}{' '}
              <span className="gradient-text">{finalContent.destaque}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-subtitle mb-8"
            >
              {finalContent.subtitulo}
            </motion.p>

            <motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.3 }}
  className="flex flex-col sm:flex-row gap-4"
>
  <a
    href={finalContent.url_botao_primario}
    onClick={handlePrimaryClick}          // ← AQUI
    className="btn-primary gap-2"
  >
    {finalContent.texto_botao_primario}
    <ArrowRight className="w-4 h-4" />
  </a>
  <a
    href={finalContent.url_botao_secundario}
    onClick={handleSecondaryClick}        // ← E AQUI
    className="btn-secondary gap-2"
  >
    <Play className="w-4 h-4" />
    {finalContent.texto_botao_secundario}
  </a>
</motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            {finalContent.imagem_principal ? (
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                <img
                  src={finalContent.imagem_principal}
                  alt="Hero"
                  className="relative w-full rounded-2xl shadow-soft-lg"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                <div className="text-muted-foreground">Preview da imagem</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// -----------------------------
// Rastreamento dos modelos Hero
// -----------------------------

type PlanTier = 'free' | 'pro' | 'premium';

export interface HeroTemplateMeta {
  /** ID global desse template (pra tabela section_templates, loja, etc.) */
  id: string;
  /** Variant usada no conteúdo / componente */
  variantId: HeroVariantId;
  section: 'hero';
  component: 'Hero';
  name: string;
  description: string;
  category: 'básico' | 'avançado' | 'robusto' | 'animado';
  minPlan: PlanTier;
}

/**
 * Registro dos modelos de Hero base.
 * Isso pode ser usado para:
 * - popular/seed da tabela section_templates
 * - montar catálogos de modelos
 * - validar plano mínimo
 */
export const HERO_TEMPLATES: Record<HeroVariantId, HeroTemplateMeta> = {
  modelo_a: {
    id: 'hero_modelo_a',
    variantId: 'modelo_a',
    section: 'hero',
    component: 'Hero',
    name: 'Hero Split Imagem Lateral',
    description: 'Texto à esquerda, imagem à direita e fundo com gradiente suave.',
    category: 'básico',
    minPlan: 'free',
  },
  modelo_b: {
    id: 'hero_modelo_b',
    variantId: 'modelo_b',
    section: 'hero',
    component: 'Hero',
    name: 'Hero Central com Mockup',
    description: 'Texto centralizado, CTAs duplos e mockup grande em destaque.',
    category: 'avançado',
    minPlan: 'pro',
  },
  modelo_c: {
    id: 'hero_modelo_c',
    variantId: 'modelo_c',
    section: 'hero',
    component: 'Hero',
    name: 'Hero Full Background Cinematic',
    description: 'Imagem full de fundo, overlay em gradiente e texto à esquerda.',
    category: 'robusto',
    minPlan: 'premium',
  },
};
