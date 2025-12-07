import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface Depoimento {
  nome: string;
  cargo: string;
  texto: string;
  avatar?: string;
}

interface ProvasSociaisContent {
  titulo?: string;
  depoimentos_json?: string;
}

interface ProvasSociaisProps {
  content?: ProvasSociaisContent;
  previewOverride?: ProvasSociaisContent;
  variante?: 'modelo_a' | 'modelo_b' | 'modelo_c';
  cardStyle?: string;
}

const defaultContent: ProvasSociaisContent = {
  titulo: 'O que nossos clientes dizem',
  depoimentos_json: JSON.stringify([
    { nome: 'Maria Silva', cargo: 'CEO, TechStart', texto: 'Aumentamos nossas conversões em 340% depois de migrar para esta plataforma. Simplesmente incrível!' },
    { nome: 'João Santos', cargo: 'Marketing Manager', texto: 'A facilidade de uso é impressionante. Criamos campanhas em minutos, não em dias.' },
    { nome: 'Ana Costa', cargo: 'Founder, Digital Agency', texto: 'Nossos clientes amam os resultados. A plataforma paga seu custo em uma única campanha.' },
  ]),
};

export const ProvasSociais = ({ content = {}, previewOverride, variante = 'modelo_a', cardStyle = '' }: ProvasSociaisProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };

  let depoimentos: Depoimento[] = [];
  try {
    depoimentos = finalContent.depoimentos_json ? JSON.parse(finalContent.depoimentos_json) : [];
  } catch {
    depoimentos = [];
  }

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

  // Modelo C - Single featured testimonial
  if (variante === 'modelo_c') {
    const featured = depoimentos[0];
    if (!featured) return null;
    
    return (
      <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5" id="provas_sociais" data-section-key="provas_sociais">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-warning text-warning" />
              ))}
            </div>
            
            <Quote className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            
            <p className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
              "{featured.texto}"
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-bold text-xl">
                {featured.nome.charAt(0)}
              </div>
              <div className="text-left">
                <div className="font-semibold">{featured.nome}</div>
                <div className="text-sm text-muted-foreground">{featured.cargo}</div>
              </div>
            </div>

            {depoimentos.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {depoimentos.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} 
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  if (variante === 'modelo_b') {
    return (
      <section className="section-padding bg-gradient-to-b from-card/50 to-background" id="provas_sociais" data-section-key="provas_sociais">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title mb-4">{finalContent.titulo}</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {depoimentos.map((depoimento, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`flex items-start gap-6 mb-12 ${index % 2 === 1 ? 'flex-row-reverse text-right' : ''}`}
              >
                <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shrink-0 text-primary-foreground font-bold text-xl">
                  {depoimento.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-lg mb-4 italic">"{depoimento.texto}"</p>
                  <div>
                    <div className="font-semibold">{depoimento.nome}</div>
                    <div className="text-sm text-muted-foreground">{depoimento.cargo}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Grid de cards
  return (
    <section className="section-padding" id="provas_sociais" data-section-key="provas_sociais">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">{finalContent.titulo}</h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {depoimentos.map((depoimento, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`p-6 relative ${cardStyle || 'premium-card-soft'}`}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">"{depoimento.texto}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-semibold">
                  {depoimento.nome.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{depoimento.nome}</div>
                  <div className="text-xs text-muted-foreground">{depoimento.cargo}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
