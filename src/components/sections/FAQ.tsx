import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

interface Pergunta {
  pergunta: string;
  resposta: string;
}

interface FAQContent {
  titulo?: string;
  perguntas_json?: string;
}

interface FAQProps {
  content?: FAQContent;
  previewOverride?: FAQContent;
  variante?: 'modelo_a' | 'modelo_b';
  cardStyle?: string;
}

const defaultContent: FAQContent = {
  titulo: 'Perguntas frequentes',
  perguntas_json: JSON.stringify([
    { pergunta: 'Preciso saber programar?', resposta: 'Não! Nossa plataforma foi criada para ser 100% visual. Você edita tudo arrastando e soltando elementos.' },
    { pergunta: 'Posso usar meu próprio domínio?', resposta: 'Sim! Você pode conectar qualquer domínio que possua. Também oferecemos subdomínios gratuitos.' },
    { pergunta: 'Vocês oferecem garantia?', resposta: 'Sim! Oferecemos 30 dias de garantia. Se não gostar, devolvemos 100% do seu dinheiro.' },
    { pergunta: 'Como funciona o suporte?', resposta: 'Nosso suporte funciona 24/7 via chat e email. Clientes Pro e Enterprise têm suporte prioritário.' },
    { pergunta: 'Posso cancelar a qualquer momento?', resposta: 'Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento sem taxas.' },
  ]),
};

export const FAQ = ({ content = {}, previewOverride, variante = 'modelo_a', cardStyle = '' }: FAQProps) => {
  const finalContent = { ...defaultContent, ...content, ...previewOverride };
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  let perguntas: Pergunta[] = [];
  try {
    perguntas = finalContent.perguntas_json ? JSON.parse(finalContent.perguntas_json) : [];
  } catch {
    perguntas = [];
  }

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (variante === 'modelo_b') {
    return (
      <section className="section-padding bg-gradient-to-b from-background to-card/50" id="faq" data-section-key="faq">
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
            className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
          >
            {perguntas.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`p-6 ${cardStyle || 'premium-card-soft'}`}
              >
                <h3 className="font-semibold mb-3 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-primary-foreground text-xs shrink-0">
                    {index + 1}
                  </span>
                  {item.pergunta}
                </h3>
                <p className="text-muted-foreground pl-9">{item.resposta}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  // Modelo A - Accordion
  return (
    <section className="section-padding" id="faq" data-section-key="faq">
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
          className="max-w-3xl mx-auto space-y-4"
        >
          {perguntas.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`overflow-hidden ${cardStyle || 'premium-card-soft'}`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold">{item.pergunta}</span>
                <div className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-muted-foreground">{item.resposta}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
