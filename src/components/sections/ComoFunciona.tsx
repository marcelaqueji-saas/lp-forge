import { motion } from 'framer-motion';
import { Zap, MousePointer, Rocket } from 'lucide-react';

interface Passo {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface ComoFuncionaContent {
  titulo?: string;
  subtitulo?: string;
  passos_json?: string;
}

interface ComoFuncionaProps {
  content?: ComoFuncionaContent;
  previewOverride?: ComoFuncionaContent;
  variante?: 'modelo_a' | 'modelo_b';
}

const defaultContent: ComoFuncionaContent = {
  titulo: 'Como funciona',
  subtitulo: 'Três passos simples para criar sua landing page perfeita',
  passos_json: JSON.stringify([
    { titulo: 'Escolha um template', descricao: 'Selecione entre dezenas de templates profissionais prontos para usar.', icone: 'MousePointer' },
    { titulo: 'Personalize', descricao: 'Edite textos, cores e imagens com nosso editor visual intuitivo.', icone: 'Zap' },
    { titulo: 'Publique', descricao: 'Com um clique, sua página está no ar e pronta para converter.', icone: 'Rocket' },
  ]),
};

const iconMap: Record<string, typeof Zap> = {
  Zap,
  MousePointer,
  Rocket,
};

export const ComoFunciona = ({ content = {}, previewOverride, variante = 'modelo_a' }: ComoFuncionaProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let passos: Passo[] = [];
  try {
    passos = finalContent.passos_json ? JSON.parse(finalContent.passos_json) : [];
  } catch {
    passos = [];
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (variante === 'modelo_b') {
    return (
      <section id="como_funciona" data-section-key="como_funciona" className="section-padding bg-card/50">
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
            className="relative"
          >
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

            <div className="space-y-12 md:space-y-0">
              {passos.map((passo, index) => {
                const Icon = iconMap[passo.icone || 'Zap'] || Zap;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`md:flex items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} md:mb-12`}
                  >
                    <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`glass-card p-6 inline-block ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}>
                        <h3 className="text-xl font-semibold mb-2">{passo.titulo}</h3>
                        <p className="text-muted-foreground">{passo.descricao}</p>
                      </div>
                    </div>

                    <div className="relative z-10 my-4 md:my-0">
                      <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-primary-foreground shadow-glow mx-auto">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Cards horizontais
  return (
    <section id="como_funciona" data-section-key="como_funciona" className="section-padding">
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
          className="grid md:grid-cols-3 gap-8"
        >
          {passos.map((passo, index) => {
            const Icon = iconMap[passo.icone || 'Zap'] || Zap;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card-hover p-8 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-primary-foreground mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">Passo {index + 1}</div>
                <h3 className="text-xl font-semibold mb-3">{passo.titulo}</h3>
                <p className="text-muted-foreground">{passo.descricao}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
