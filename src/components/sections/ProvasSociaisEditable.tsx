/**
 * ProvasSociaisEditable - Seção de Depoimentos com edição inline
 * Sprint 4.4: 100% do conteúdo editável inline
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { trackSectionView } from "@/lib/tracking";
import { EditableField, EditableImageField } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Depoimento {
  nome: string;
  cargo: string;
  texto: string;
  avatar?: string;
}

interface ProvasSociaisEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultContent = {
  titulo: "O que nossos clientes dizem",
  depoimentos_json: JSON.stringify([
    { nome: "Maria Silva", cargo: "CEO, TechStart", texto: "Incrível! Consegui criar minha landing page em menos de uma hora." },
    { nome: "João Santos", cargo: "Fundador, StartupX", texto: "A melhor ferramenta que já usei para criar páginas de conversão." },
    { nome: "Ana Costa", cargo: "Marketing, AgênciaY", texto: "Facilitou muito nosso trabalho. Recomendo para todos!" },
  ]),
};

export const ProvasSociaisEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: ProvasSociaisEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S4.4 QA] ProvasSociaisEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "provas_sociais", variante);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, variante]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
    console.log('[S4.4 QA] InlineText: OK -', key);
  }, [onContentUpdate]);

  const handleDepoimentoUpdate = async (index: number, field: keyof Depoimento, value: string) => {
    try {
      const depoimentos: Depoimento[] = JSON.parse(localContent.depoimentos_json || '[]');
      depoimentos[index] = { ...depoimentos[index], [field]: value };
      const newJson = JSON.stringify(depoimentos);
      
      const updated = { ...localContent, depoimentos_json: newJson };
      setLocalContent(updated);
      await saveSectionContent(lpId, 'provas_sociais', updated);
      onContentUpdate?.('depoimentos_json', newJson);
      console.log('[S4.4 QA] InlineText: OK - depoimento', index, field);
    } catch (error) {
      console.error('[ProvasSociaisEditable] Error updating depoimento:', error);
    }
  };

  const fc = localContent;
  let depoimentos: Depoimento[] = [];
  try {
    depoimentos = JSON.parse(fc.depoimentos_json || '[]');
  } catch {
    depoimentos = [];
  }

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-muted/30"
      id="provas-sociais"
      data-section-key="provas_sociais"
    >
      <div className="section-container">
        <div className="text-center mb-12">
          <EditableField
            value={fc.titulo || ''}
            fieldKey="titulo"
            sectionKey="provas_sociais"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="h2"
            editable={editable}
            placeholder="Título da seção"
            className="section-title mb-4"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {depoimentos.map((dep, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="glass-card p-6 h-full">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/30 mb-4" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Texto do depoimento */}
                {editable ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleDepoimentoUpdate(idx, 'texto', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-foreground mb-6 outline-none min-h-[60px]",
                      "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    "{dep.texto}"
                  </div>
                ) : (
                  <p className="text-foreground mb-6">"{dep.texto}"</p>
                )}

                {/* Avatar e info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={dep.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {dep.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {editable ? (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleDepoimentoUpdate(idx, 'nome', e.currentTarget.textContent || '')}
                        className={cn(
                          "font-semibold outline-none",
                          "hover:bg-primary/5 px-1 -mx-1 rounded transition-colors cursor-text",
                          "focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        {dep.nome}
                      </div>
                    ) : (
                      <p className="font-semibold">{dep.nome}</p>
                    )}
                    {editable ? (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleDepoimentoUpdate(idx, 'cargo', e.currentTarget.textContent || '')}
                        className={cn(
                          "text-sm text-muted-foreground outline-none",
                          "hover:bg-primary/5 px-1 -mx-1 rounded transition-colors cursor-text",
                          "focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        {dep.cargo}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{dep.cargo}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProvasSociaisEditable;
