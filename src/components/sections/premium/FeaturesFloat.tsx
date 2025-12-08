import { motion } from 'framer-motion';
import { Globe, MousePointer, Palette, Gauge, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackSectionView } from '@/lib/tracking';

interface FeatureItem {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface FeaturesFloatContent {
  titulo?: string;
  subtitulo?: string;
  itens?: FeatureItem[];
}

interface FeaturesFloatProps {
  lpId?: string;
  content?: FeaturesFloatContent;
  previewOverride?: FeaturesFloatContent;
  disableAnimations?: boolean;
  cardStyle?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  globe: Globe,
  pointer: MousePointer,
  palette: Palette,
  gauge: Gauge,
  shield: Shield,
  zap: Zap,
};

const defaultItems: FeatureItem[] = [
  { titulo: 'Domínio próprio', descricao: 'Configure seu domínio em minutos', icone: 'globe' },
  { titulo: 'Editor visual', descricao: 'Drag & drop intuitivo', icone: 'pointer' },
  { titulo: 'Modelos animados', descricao: 'Templates premium com Motion', icone: 'palette' },
  { titulo: 'SEO otimizado', descricao: 'Performance máxima no Google', icone: 'gauge' },
];

const defaultContent: FeaturesFloatContent = {
  titulo: 'Poder máximo, zero complexidade',
  subtitulo: 'Tudo que você precisa para criar páginas de alta conversão',
  itens: defaultItems,
};

export const FeaturesFloat = ({
  lpId,
  content = {},
  previewOverride,
  disableAnimations = false,
  cardStyle,
}: FeaturesFloatProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const items = finalContent.itens || defaultItems;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleViewportEnter = () => {
    if (lpId) {
      // seção "beneficios" com variante premium
      trackSectionView(lpId, 'beneficios', 'beneficios-features_float');
    }
  };

  if (disableAnimations) {
    return (
      <motion.section
        className="py-20 bg-background"
        id="beneficios"
        data-section-key="beneficios"
        onViewportEnter={handleViewportEnter}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{finalContent.titulo}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{finalContent.subtitulo}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {items.map((item, index) => {
              const IconComponent = iconMap[item.icone || 'zap'] || Zap;
              return (
                <div
                  key={index}
                  className={cn(
                    'group relative p-6 rounded-2xl transition-all',
                    cardStyle || 'bg-card border hover:border-primary/50'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{item.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-20 bg-background overflow-hidden"
      id="beneficios"
      data-section-key="beneficios"
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{finalContent.titulo}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{finalContent.subtitulo}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icone || 'zap'] || Zap;
            const floatDelay = index * 0.5;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: floatDelay,
                  }}
                  className={cn(
                    'p-6 rounded-2xl hover:shadow-lg transition-all',
                    cardStyle || 'bg-card border hover:border-primary/50'
                  )}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                    whileHover={{
                      scale: 1.1,
                      background:
                        'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                    }}
                  >
                    <IconComponent className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{item.descricao}</p>

                  {/* Floating particles */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary/40 rounded-full"
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: floatDelay + 0.2,
                    }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturesFloat;
