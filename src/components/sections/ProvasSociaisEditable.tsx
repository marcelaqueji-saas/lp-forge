/**
 * ProvasSociaisEditable - Seção de Depoimentos com edição inline
 * Sprint 5.2: Suporte a stylePreset
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { trackSectionView } from "@/lib/tracking";
import { EditableField, EditableImageField } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel, StylePreset } from "@/lib/sectionModels";
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
  modelId?: string;
  stylePreset?: StylePreset;
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

// Get section style modifiers based on stylePreset
const getSectionStyleModifiers = (stylePreset: StylePreset = 'glass') => {
  switch (stylePreset) {
    case 'dark': return "bg-zinc-900 text-white";
    case 'neon': return "bg-black text-white";
    case 'aurora': return "bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20";
    case 'visionos': return "bg-white/80";
    case 'minimal': return "bg-gray-50";
    case 'frosted': return "bg-white/30 backdrop-blur-xl";
    default: return "";
  }
};

export const ProvasSociaisEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  modelId,
  stylePreset = "glass",
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
      className={cn("section-padding", getSectionStyleModifiers(stylePreset) || "bg-muted/30")}
      id="provas-sociais"
      data-section-key="provas_sociais"
    >
      <div className="section-container">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
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
            className="section-title mb-3 sm:mb-4 break-words"
          />
        </div>

        {/* Grid de depoimentos - mobile-first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {depoimentos.map((dep, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="glass-card p-4 sm:p-5 md:p-6 h-full">
                {/* Quote icon */}
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-primary/30 mb-3 sm:mb-4" />

                {/* Stars */}
                <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Texto do depoimento */}
                {editable ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleDepoimentoUpdate(idx, 'texto', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-sm sm:text-base text-foreground mb-4 sm:mb-6 outline-none min-h-[50px] sm:min-h-[60px] break-words",
                      "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text touch-manipulation",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    "{dep.texto}"
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-foreground mb-4 sm:mb-6 break-words">"{dep.texto}"</p>
                )}

                {/* Avatar e info */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <AvatarImage src={dep.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm sm:text-base">
                      {dep.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    {editable ? (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleDepoimentoUpdate(idx, 'nome', e.currentTarget.textContent || '')}
                        className={cn(
                          "font-semibold text-sm sm:text-base outline-none break-words",
                          "hover:bg-primary/5 px-1 -mx-1 rounded transition-colors cursor-text touch-manipulation",
                          "focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        {dep.nome}
                      </div>
                    ) : (
                      <p className="font-semibold text-sm sm:text-base break-words">{dep.nome}</p>
                    )}
                    {editable ? (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleDepoimentoUpdate(idx, 'cargo', e.currentTarget.textContent || '')}
                        className={cn(
                          "text-xs sm:text-sm text-muted-foreground outline-none break-words",
                          "hover:bg-primary/5 px-1 -mx-1 rounded transition-colors cursor-text touch-manipulation",
                          "focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        {dep.cargo}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{dep.cargo}</p>
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
