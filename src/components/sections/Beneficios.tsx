import { motion } from 'framer-motion';
import { Check, Sparkles, Shield, Zap, Globe, BarChart3, Clock, Star, Heart, Award, TrendingUp, Users } from 'lucide-react';

interface Beneficio {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface BeneficiosContent {
  titulo?: string;
  subtitulo?: string;
  beneficios_json?: string;
}

interface BeneficiosProps {
  content?: BeneficiosContent;
  previewOverride?: BeneficiosContent;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  disableAnimations?: boolean;
  cardStyle?: string;
}

const defaultContent: BeneficiosContent = {
  titulo: 'Por que escolher nossa plataforma?',
  subtitulo: 'Tudo que você precisa para criar páginas de alta conversão',
  beneficios_json: JSON.stringify([
    { titulo: 'Alta conversão', descricao: 'Templates otimizados para maximizar suas conversões.', icone: 'Sparkles' },
    { titulo: 'Seguro e confiável', descricao: 'Seus dados protegidos com criptografia de ponta.', icone: 'Shield' },
    { titulo: 'Super rápido', descricao: 'Páginas carregam em menos de 2 segundos.', icone: 'Zap' },
    { titulo: 'SEO otimizado', descricao: 'Melhor posicionamento nos buscadores.', icone: 'Globe' },
    { titulo: 'Analytics integrado', descricao: 'Acompanhe métricas em tempo real.', icone: 'BarChart3' },
    { titulo: 'Suporte 24/7', descricao: 'Estamos sempre prontos para ajudar.', icone: 'Clock' },
  ]),
};

const iconMap: Record<string, typeof Check> = {
  Check,
  Sparkles,
  Shield,
  Zap,
  Globe,
  BarChart3,
  Clock,
  Star,
  Heart,
  Award,
  TrendingUp,
  Users,
};

export const Beneficios = ({ content = {}, previewOverride, variante = 'modelo_a', cardStyle = '' }: BeneficiosProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let beneficios: Beneficio[] = [];
  try {
    beneficios = finalContent.beneficios_json ? JSON.parse(finalContent.beneficios_json) : [];
  } catch {
    beneficios = [];
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  // Modelo C - Two columns with large icons
  if (variante === 'modelo_c') {
    return (
      <section className="section-padding" id="beneficios" data-section-key="beneficios">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title mb-4">{finalContent.titulo}</h2>
              <p className="section-subtitle">{finalContent.subtitulo}</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {beneficios.slice(0, 4).map((beneficio, index) => {
                const Icon = iconMap[beneficio.icone || 'Check'] || Check;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`p-5 text-center ${cardStyle || 'premium-card-soft'}`}
                  >
                    <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm">{beneficio.titulo}</h3>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (variante === 'modelo_b') {
    return (
      <section className="section-padding relative overflow-hidden" id="beneficios" data-section-key="beneficios">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="section-container relative">
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
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {beneficios.map((beneficio, index) => {
              const Icon = iconMap[beneficio.icone || 'Check'] || Check;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-4"
                >
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{beneficio.titulo}</h3>
                    <p className="text-muted-foreground text-sm">{beneficio.descricao}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Grid de cards
  return (
    <section className="section-padding bg-card/50" id="beneficios" data-section-key="beneficios">
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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {beneficios.map((beneficio, index) => {
            const Icon = iconMap[beneficio.icone || 'Check'] || Check;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`p-6 ${cardStyle || 'premium-card-soft'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{beneficio.titulo}</h3>
                <p className="text-muted-foreground">{beneficio.descricao}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
