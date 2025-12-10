/**
 * FAQEditable - FAQ com edição inline
 * Sprint 4.3: EditableField em título e perguntas/respostas JSON
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { trackSectionView } from '@/lib/tracking';
import { EditableField } from '@/components/editor/InlineEditableSection';
import { LPContent, saveSectionContent } from '@/lib/lpContentApi';
import { PlanLevel } from '@/lib/sectionModels';
import { toast } from '@/hooks/use-toast';

interface Pergunta {
  pergunta: string;
  resposta: string;
}

interface FAQEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultPerguntas: Pergunta[] = [
  { pergunta: 'Preciso saber programar?', resposta: 'Não! Nossa plataforma foi criada para ser 100% visual.' },
  { pergunta: 'Posso usar meu próprio domínio?', resposta: 'Sim! Você pode conectar qualquer domínio que possua.' },
  { pergunta: 'Vocês oferecem garantia?', resposta: 'Sim! Oferecemos 30 dias de garantia.' },
];

export const FAQEditable = ({
  lpId,
  content,
  variante = 'modelo_a',
  userPlan,
  editable = true,
  onContentUpdate,
}: FAQEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>(content);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  // QA Log
  useEffect(() => {
    console.log('[S4.3 QA] FAQEditable: mounted', { lpId, editable });
  }, [lpId, editable]);

  // Parse perguntas JSON
  useEffect(() => {
    setLocalContent(content);
    try {
      const parsed = content.perguntas_json ? JSON.parse(content.perguntas_json) : defaultPerguntas;
      setPerguntas(Array.isArray(parsed) ? parsed : defaultPerguntas);
    } catch {
      setPerguntas(defaultPerguntas);
    }
  }, [content]);

  // Tracking
  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'faq', variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, variante]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
    console.log('[S4.3 QA] InlineText: OK -', key);
  }, [onContentUpdate]);

  const handlePerguntaChange = useCallback(async (index: number, field: keyof Pergunta, value: string) => {
    const updated = [...perguntas];
    updated[index] = { ...updated[index], [field]: value };
    setPerguntas(updated);

    try {
      const newJson = JSON.stringify(updated);
      await saveSectionContent(lpId, 'faq', { ...localContent, perguntas_json: newJson });
      onContentUpdate?.('perguntas_json', newJson);
      toast({ title: 'FAQ atualizado!' });
      console.log('[S4.3 QA] InlineText: OK - faq', index, field);
    } catch (err) {
      console.error('[FAQEditable] Save error:', err);
    }
  }, [perguntas, lpId, localContent, onContentUpdate]);

  const addPergunta = useCallback(async () => {
    const updated = [...perguntas, { pergunta: 'Nova pergunta?', resposta: 'Resposta aqui...' }];
    setPerguntas(updated);
    const newJson = JSON.stringify(updated);
    await saveSectionContent(lpId, 'faq', { ...localContent, perguntas_json: newJson });
    onContentUpdate?.('perguntas_json', newJson);
    toast({ title: 'Pergunta adicionada!' });
  }, [perguntas, lpId, localContent, onContentUpdate]);

  const removePergunta = useCallback(async (index: number) => {
    const updated = perguntas.filter((_, i) => i !== index);
    setPerguntas(updated);
    const newJson = JSON.stringify(updated);
    await saveSectionContent(lpId, 'faq', { ...localContent, perguntas_json: newJson });
    onContentUpdate?.('perguntas_json', newJson);
    toast({ title: 'Pergunta removida!' });
  }, [perguntas, lpId, localContent, onContentUpdate]);

  const fc = localContent;

  return (
    <section
      className="section-padding"
      id="faq"
      data-section-key="faq"
      ref={sectionRef}
    >
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="section-title mb-3 sm:mb-4 break-words">
            <EditableField
              value={fc.titulo || 'Perguntas frequentes'}
              fieldKey="titulo"
              sectionKey="faq"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="span"
              editable={editable}
              placeholder="Título da seção"
            />
          </h2>
        </motion.div>

        {/* Accordion - mobile-first */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="max-w-3xl mx-auto space-y-3 sm:space-y-4"
        >
          {perguntas.map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="overflow-hidden premium-card-soft relative group"
            >
              {/* Remove button - touch-friendly */}
              {editable && (
                <button
                  onClick={() => removePergunta(index)}
                  className="absolute top-3 sm:top-4 right-10 sm:right-12 p-2 sm:p-1.5 rounded-full bg-destructive/10 text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 z-10 touch-manipulation"
                >
                  <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              )}

              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 sm:p-5 md:p-6 text-left flex items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-muted/50 transition-colors touch-manipulation"
              >
                <span className="font-medium sm:font-semibold text-sm sm:text-base flex-1 break-words pr-2">
                  {editable ? (
                    <input
                      type="text"
                      value={item.pergunta}
                      onChange={(e) => {
                        const updated = [...perguntas];
                        updated[index] = { ...updated[index], pergunta: e.target.value };
                        setPerguntas(updated);
                      }}
                      onBlur={() => handlePerguntaChange(index, 'pergunta', item.pergunta)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 text-sm sm:text-base touch-manipulation"
                    />
                  ) : (
                    item.pergunta
                  )}
                </span>
                <div className={`transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
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
                <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-muted-foreground text-sm sm:text-base">
                  {editable ? (
                    <textarea
                      value={item.resposta}
                      onChange={(e) => {
                        const updated = [...perguntas];
                        updated[index] = { ...updated[index], resposta: e.target.value };
                        setPerguntas(updated);
                      }}
                      onBlur={() => handlePerguntaChange(index, 'resposta', item.resposta)}
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 resize-none min-h-[60px] text-sm sm:text-base touch-manipulation break-words"
                      rows={3}
                    />
                  ) : (
                    <span className="break-words">{item.resposta}</span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}

          {/* Add button - touch-friendly */}
          {editable && (
            <motion.button
              onClick={addPergunta}
              className="w-full p-3 sm:p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all touch-manipulation"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <span className="text-xs sm:text-sm text-muted-foreground">Adicionar pergunta</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQEditable;
