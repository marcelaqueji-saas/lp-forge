/**
 * ComoFuncionaEditable - Seção "Como Funciona" com edição inline
 * Sprint 5.2: Suporte a stylePreset
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Settings, 
  CheckCircle2, 
  Zap,
  Target,
  Sparkles,
  MessageSquare,
  Users,
} from "lucide-react";
import { trackSectionView } from "@/lib/tracking";
import { EditableField } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel, StylePreset, getLayoutVariant } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";

interface Passo {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface ComoFuncionaEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  modelId?: string;
  stylePreset?: StylePreset;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

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

const iconMap: Record<string, React.ComponentType<any>> = {
  Rocket,
  Settings,
  CheckCircle2,
  Zap,
  Target,
  Sparkles,
  MessageSquare,
  Users,
};

const defaultContent = {
  titulo: "Como funciona",
  subtitulo: "Siga estes passos simples para começar",
  passos_json: JSON.stringify([
    { titulo: "Escolha seu template", descricao: "Selecione um modelo pronto ou comece do zero", icone: "Rocket" },
    { titulo: "Personalize tudo", descricao: "Edite textos, cores e imagens facilmente", icone: "Settings" },
    { titulo: "Publique em um clique", descricao: "Coloque sua página no ar instantaneamente", icone: "CheckCircle2" },
  ]),
};

export const ComoFuncionaEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  modelId,
  stylePreset = "glass",
  userPlan,
  editable = true,
  onContentUpdate,
}: ComoFuncionaEditableProps) => {
  // Use centralized layout mapping - prefer modelId over variante
  const normalizedVariant = getLayoutVariant(modelId || variante);
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  // QA Log
  useEffect(() => {
    console.log('[S5.3 QA] ComoFuncionaEditable: mounted', { lpId, editable, modelId, stylePreset, normalizedVariant });
  }, [lpId, editable, modelId, stylePreset, normalizedVariant]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  // Tracking
  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "como_funciona", variante);
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

  const handlePassoUpdate = async (index: number, field: keyof Passo, value: string) => {
    try {
      const passos: Passo[] = JSON.parse(localContent.passos_json || '[]');
      passos[index] = { ...passos[index], [field]: value };
      const newJson = JSON.stringify(passos);
      
      const updated = { ...localContent, passos_json: newJson };
      setLocalContent(updated);
      await saveSectionContent(lpId, 'como_funciona', updated);
      onContentUpdate?.('passos_json', newJson);
      console.log('[S4.4 QA] InlineText: OK - passo', index, field);
    } catch (error) {
      console.error('[ComoFuncionaEditable] Error updating passo:', error);
    }
  };

  const fc = localContent;
  let passos: Passo[] = [];
  try {
    passos = JSON.parse(fc.passos_json || '[]');
  } catch {
    passos = [];
  }

  return (
    <section
      ref={sectionRef}
      className={cn("section-padding", getSectionStyleModifiers(stylePreset) || "bg-muted/30")}
      id="como-funciona"
      data-section-key="como_funciona"
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <EditableField
            value={fc.titulo || ''}
            fieldKey="titulo"
            sectionKey="como_funciona"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="h2"
            editable={editable}
            placeholder="Título da seção"
            className="section-title mb-3 sm:mb-4 break-words"
          />
          <EditableField
            value={fc.subtitulo || ''}
            fieldKey="subtitulo"
            sectionKey="como_funciona"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="p"
            editable={editable}
            placeholder="Subtítulo"
            className="section-subtitle max-w-2xl mx-auto break-words"
          />
        </div>

        {/* Passos - mobile-first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {passos.map((passo, idx) => {
            const IconComp = iconMap[passo.icone || 'Rocket'] || Rocket;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-4 sm:p-5 md:p-6 h-full text-center">
                  {/* Número */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-base sm:text-lg font-bold text-primary">{idx + 1}</span>
                  </div>
                  
                  {/* Ícone */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>

                  {/* Título do passo */}
                  {editable ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handlePassoUpdate(idx, 'titulo', e.currentTarget.textContent || '')}
                      className={cn(
                        "font-semibold text-base sm:text-lg mb-1.5 sm:mb-2 outline-none break-words",
                        "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text touch-manipulation",
                        "focus:ring-2 focus:ring-primary/20"
                      )}
                    >
                      {passo.titulo}
                    </div>
                  ) : (
                    <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2 break-words">{passo.titulo}</h3>
                  )}

                  {/* Descrição */}
                  {editable ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handlePassoUpdate(idx, 'descricao', e.currentTarget.textContent || '')}
                      className={cn(
                        "text-muted-foreground text-xs sm:text-sm outline-none break-words",
                        "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text touch-manipulation",
                        "focus:ring-2 focus:ring-primary/20"
                      )}
                    >
                      {passo.descricao}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs sm:text-sm break-words">{passo.descricao}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ComoFuncionaEditable;
