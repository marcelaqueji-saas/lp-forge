import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { trackCTAClick, trackSectionView } from '@/lib/tracking';

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
  /** ID da LP para tracking; se não vier, só renderiza visualmente */
  lpId?: string;
  content?: PlanosContent;
  previewOverride?: PlanosContent;
  variante?: PlanosVariant;
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
  cardStyle = '',
}: PlanosProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let planos: Plano[] = [];
  try {
    planos = finalContent.planos_json ? JSON.parse(finalContent.planos_json) : [];
  } catch {
    planos = [];
  }

  // Ref para rastrear visualização da seção
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (!lpId) return; // sem lpId = sem tracking (ex: preview)
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
      // usamos o nome do plano como "variantId" pra diferenciar nos eventos
      trackCTAClick(lpId, 'planos', 'primary', planName);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (variante === 'modelo_b') {
    return (
      <section
        id="planos"
        data-section-key="planos"
        className="section-padding"
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
            <h2 className="section-title mb-3 sm:mb-4">{finalContent.titulo}</h2>
            <p className="section-subtitle mx-auto">{finalContent.subtitulo}</p>
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
                    className={`h-full rounded-xl sm:rounded-2xl p-5 sm:p-8 ${
                      plano.destaque
                        ? 'gradient-bg text-primary-foreground shadow-glow-lg'
                        : cardStyle ||
                          'premium-card-soft border-2 border-transparent hover:border-primary/30 transition-colors'
                    }`}
                  >
                    {plano.destaque && (
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">
                          Mais popular
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 break-words">{plano.nome}</h3>
                    <p
                      className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                        plano.destaque ? 'opacity-80' : 'text-muted-foreground'
                      }`}
                    >
                      {plano.descricao}
                    </p>
                    <div className="mb-4 sm:mb-6">
                      <span className="text-3xl sm:text-4xl font-bold break-words">
                        {plano.preco}
                      </span>
                      <span
                        className={`text-sm ${
                          plano.destaque ? 'opacity-80' : 'text-muted-foreground'
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
                              plano.destaque ? '' : 'text-success'
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
                          ? 'bg-card text-foreground hover:bg-card/90'
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
      className="section-padding bg-card/50"
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
          <h2 className="section-title mb-3 sm:mb-4">{finalContent.titulo}</h2>
          <p className="section-subtitle mx-auto">{finalContent.subtitulo}</p>
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
                  plano.destaque ? 'gradient-border' : ''
                }`}
              >
                <div
                  className={`h-full rounded-xl sm:rounded-2xl p-5 sm:p-8 ${
                    plano.destaque
                      ? 'bg-card shadow-glow'
                      : cardStyle || 'premium-card-soft'
                  }`}
                >
                  {plano.destaque && (
                    <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 gradient-bg rounded-full text-primary-foreground text-xs sm:text-sm font-medium whitespace-nowrap">
                      Recomendado
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold mb-2 break-words">{plano.nome}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4">
                    {plano.descricao}
                  </p>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-bold break-words">
                      {plano.preco}
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {itens.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-success/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-success" />
                        </div>
                        <span className="text-xs sm:text-sm break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanClick(plano.nome)}
                    className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                      plano.destaque ? 'btn-primary' : 'btn-secondary'
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
