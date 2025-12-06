import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

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

interface PlanosProps {
  content?: PlanosContent;
  previewOverride?: PlanosContent;
  variante?: 'modelo_a' | 'modelo_b';
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
      itens_json: JSON.stringify(['1 landing page', 'Domínio personalizado', 'SSL grátis', 'Analytics básico']),
    },
    {
      nome: 'Pro',
      preco: 'R$ 99',
      descricao: 'Para profissionais',
      destaque: true,
      itens_json: JSON.stringify(['5 landing pages', 'Domínios ilimitados', 'A/B Testing', 'Analytics avançado', 'Suporte prioritário']),
    },
    {
      nome: 'Enterprise',
      preco: 'R$ 299',
      descricao: 'Para grandes equipes',
      destaque: false,
      itens_json: JSON.stringify(['Landing pages ilimitadas', 'White label', 'API access', 'Manager dedicado', 'SLA garantido']),
    },
  ]),
};

export const Planos = ({ content = {}, previewOverride, variante = 'modelo_a' }: PlanosProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let planos: Plano[] = [];
  try {
    planos = finalContent.planos_json ? JSON.parse(finalContent.planos_json) : [];
  } catch {
    planos = [];
  }

  const handlePlanClick = (planName: string) => {
    trackEvent('click_plan', { plan: planName });
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
      <section id="planos" className="section-padding">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">{finalContent.titulo}</h2>
            <p className="section-subtitle mx-auto">{finalContent.subtitulo}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row gap-6 items-stretch justify-center"
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
                  className={`flex-1 max-w-sm ${plano.destaque ? 'lg:-mt-4 lg:mb-4' : ''}`}
                >
                  <div
                    className={`h-full rounded-2xl p-8 ${
                      plano.destaque
                        ? 'gradient-bg text-primary-foreground shadow-glow-lg'
                        : 'glass-card border-2 border-transparent hover:border-primary/30 transition-colors'
                    }`}
                  >
                    {plano.destaque && (
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Mais popular</span>
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                    <p className={`text-sm mb-4 ${plano.destaque ? 'opacity-80' : 'text-muted-foreground'}`}>
                      {plano.descricao}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plano.preco}</span>
                      <span className={`${plano.destaque ? 'opacity-80' : 'text-muted-foreground'}`}>/mês</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {itens.map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check className={`w-5 h-5 ${plano.destaque ? '' : 'text-success'}`} />
                          <span className={plano.destaque ? 'opacity-90' : ''}>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanClick(plano.nome)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
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
    <section id="planos" className="section-padding bg-card/50">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">{finalContent.titulo}</h2>
          <p className="section-subtitle mx-auto">{finalContent.subtitulo}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
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
                className={`relative rounded-2xl ${
                  plano.destaque ? 'gradient-border' : ''
                }`}
              >
                <div
                  className={`h-full rounded-2xl p-8 ${
                    plano.destaque
                      ? 'bg-card shadow-glow'
                      : 'glass-card'
                  }`}
                >
                  {plano.destaque && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-bg rounded-full text-primary-foreground text-sm font-medium">
                      Recomendado
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plano.nome}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plano.descricao}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plano.preco}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {itens.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanClick(plano.nome)}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
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
