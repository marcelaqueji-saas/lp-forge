import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';
import { getStyleClasses, getMotionVariants } from '@/lib/styleTokens';
import type { StylePreset, MotionPreset } from '@/lib/sectionModels';

interface Plano {
  nome: string;
  preco: string;
  descricao: string;
  destaque?: boolean;
  itens_json?: string;
}

interface PlanosContent {
  titulo?: string;
  subtitulo?: string;
  planos_json?: string;
}

type PlanosVariant = 'modelo_a' | 'modelo_b';

interface PlanosProps {
  lpId?: string;
  content?: PlanosContent;
  previewOverride?: PlanosContent;
  variante?: PlanosVariant;
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
  cardStyle?: string;
}

const defaultContent: PlanosContent = {
  titulo: 'Planos e preços',
  subtitulo: 'Escolha o plano ideal para o seu negócio',
  planos_json: JSON.stringify([
    {
      nome: 'Starter',
      preco: 'R$ 49',
      descricao: 'Para quem está começando',
      destaque: false,
      itens_json: JSON.stringify([
        '1 landing page',
        'Domínio personalizado',
        'SSL grátis',
        'Analytics básico',
      ]),
    },
    {
      nome: 'Pro',
      preco: 'R$ 99',
      descricao: 'Para profissionais',
      destaque: true,
      itens_json: JSON.stringify([
        '5 landing pages',
        'Domínios ilimitados',
        'A/B Testing',
        'Analytics avançado',
        'Suporte prioritário',
      ]),
    },
    {
      nome: 'Enterprise',
      preco: 'R$ 299',
      descricao: 'Para grandes equipes',
      destaque: false,
      itens_json: JSON.stringify([
        'Landing pages ilimitadas',
        'White label',
        'API access',
        'Manager dedicado',
        'SLA garantido',
      ]),
    },
  ]),
};

export const Planos = ({
  lpId,
  content = {},
  previewOverride,
  variante = 'modelo_a',
  stylePreset = 'glass',
  motionPreset = 'fade-stagger',
  cardStyle = '',
}: PlanosProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const styles = getStyleClasses(stylePreset);
  const motionConfig = getMotionVariants(motionPreset);

  let planos: Plano[] = [];
  try {
    planos = finalContent.planos_json ? JSON.parse(finalContent.planos_json) : [];
  } catch {
    planos = [];
  }

  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return;
    if (hasTrackedViewRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'planos', variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lpId, variante]);

  const handlePlanClick = (planName: string) => {
    if (lpId) {
      trackCTAClick(lpId, 'planos', 'primary', planName);
    }
  };

  const containerVariants = motionConfig.container as any;
  const itemVariants = motionConfig.item as any;

  // Check if using dark/neon preset for special styling
  const isDarkPreset = stylePreset === 'dark' || stylePreset === 'neon';
  const isNeonPreset = stylePreset === 'neon';

  if (variante === 'modelo_b') {
    return (
      <section
        id="planos"
        data-section-key="planos"
        className={`section-padding ${styles.container}`}
        ref={sectionRef}
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className={`section-title mb-3 sm:mb-4 ${styles.title}`}>{finalContent.titulo}</h2>
            <p className={`section-subtitle mx-auto ${styles.subtitle}`}>{finalContent.subtitulo}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch justify-center"
          >
            {planos.map((plano, index) => {
              let itens: string[] = [];
              try {
                itens = plano.itens_json ? JSON.parse(plano.itens_json) : [];
              } catch {
                itens = [];
              }

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex-1 max-w-sm mx-auto lg:mx-0 w-full ${
                    plano.destaque ? 'lg:-mt-4 lg:mb-4' : ''
                  }`}
                >
                  <div
                    className={`h-full rounded-xl sm:rounded-2xl p-5 sm:p-8 transition-all duration-300 ${
                      plano.destaque
                        ? isNeonPreset 
                          ? 'bg-primary/20 border-2 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.4)] text-white'
                          : isDarkPreset
                            ? 'bg-zinc-700 border border-zinc-600 text-zinc-100'
                            : 'gradient-bg text-primary-foreground shadow-glow-lg'
                        : cardStyle || styles.card
                    }`}
                  >
                    {plano.destaque && (
                      <div className={`flex items-center gap-2 mb-3 sm:mb-4 ${isNeonPreset ? 'animate-neon-pulse' : ''}`}>
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">
                          Mais popular
                        </span>
                      </div>
                    )}
                    <h3 className={`text-xl sm:text-2xl font-bold mb-2 break-words ${plano.destaque ? '' : styles.title}`}>{plano.nome}</h3>
                    <p
                      className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                        plano.destaque ? 'opacity-80' : styles.subtitle
                      }`}
                    >
                      {plano.descricao}
                    </p>
                    <div className="mb-4 sm:mb-6">
                      <span className={`text-3xl sm:text-4xl font-bold break-words ${isNeonPreset && !plano.destaque ? 'text-primary' : ''}`}>
                        {plano.preco}
                      </span>
                      <span
                        className={`text-sm ${
                          plano.destaque ? 'opacity-80' : styles.subtitle
                        }`}
                      >
                        /mês
                      </span>
                    </div>
                    <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {itens.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 sm:gap-3">
                          <Check
                            className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 ${
                              plano.destaque 
                                ? '' 
                                : isNeonPreset 
                                  ? 'text-primary' 
                                  : 'text-success'
                            }`}
                          />
                          <span
                            className={`text-sm sm:text-base break-words ${plano.destaque ? 'opacity-90' : ''}`}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanClick(plano.nome)}
                      className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                        plano.destaque
                          ? isDarkPreset
                            ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                            : 'bg-card text-foreground hover:bg-card/90'
                          : isNeonPreset
                            ? 'bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                            : 'btn-primary'
                      }`}
                    >
                      Começar agora
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Grid horizontal
  return (
    <section
      id="planos"
      className={`section-padding ${styles.container}`}
      data-section-key="planos"
      ref={sectionRef}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className={`section-title mb-3 sm:mb-4 ${styles.title}`}>{finalContent.titulo}</h2>
          <p className={`section-subtitle mx-auto ${styles.subtitle}`}>{finalContent.subtitulo}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {planos.map((plano, index) => {
            let itens: string[] = [];
            try {
              itens = plano.itens_json ? JSON.parse(plano.itens_json) : [];
            } catch {
              itens = [];
            }

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative rounded-xl sm:rounded-2xl ${
                  plano.destaque 
                    ? isNeonPreset 
                      ? 'shadow-[0_0_25px_hsl(var(--primary)/0.3)]' 
                      : 'gradient-border' 
                    : ''
                }`}
              >
                <div
                  className={`h-full rounded-xl sm:rounded-2xl p-5 sm:p-8 ${
                    plano.destaque
                      ? isNeonPreset
                        ? 'bg-zinc-900 border-2 border-primary shadow-glow'
                        : isDarkPreset
                          ? 'bg-zinc-800 border border-zinc-600'
                          : 'bg-card shadow-glow'
                      : cardStyle || styles.card
                  }`}
                >
                  {plano.destaque && (
                    <div className={`absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                      isNeonPreset 
                        ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.5)]'
                        : 'gradient-bg text-primary-foreground'
                    }`}>
                      Recomendado
                    </div>
                  )}
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 break-words ${styles.title}`}>{plano.nome}</h3>
                  <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${styles.subtitle}`}>
                    {plano.descricao}
                  </p>
                  <div className="mb-4 sm:mb-6">
                    <span className={`text-3xl sm:text-4xl font-bold break-words ${isNeonPreset ? 'text-primary' : styles.title}`}>
                      {plano.preco}
                    </span>
                    <span className={`text-sm ${styles.subtitle}`}>/mês</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {itens.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          isNeonPreset ? 'bg-primary/20' : 'bg-success/10'
                        }`}>
                          <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isNeonPreset ? 'text-primary' : 'text-success'}`} />
                        </div>
                        <span className={`text-xs sm:text-sm break-words ${styles.subtitle}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanClick(plano.nome)}
                    className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                      plano.destaque 
                        ? isNeonPreset
                          ? 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]'
                          : 'btn-primary' 
                        : isNeonPreset
                          ? 'border border-zinc-700 text-zinc-300 hover:border-primary hover:text-primary'
                          : 'btn-secondary'
                    }`}
                  >
                    Escolher plano
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};