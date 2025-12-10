/**
 * ParaQuemEEditable - Seção "Para Quem É" com edição inline
 * Sprint 4.4: 100% do conteúdo editável inline
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Lightbulb, 
  TrendingUp, 
  Users,
  Rocket,
  Target,
  Star,
  Heart,
} from "lucide-react";
import { trackSectionView } from "@/lib/tracking";
import { EditableField } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";

interface Perfil {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface ParaQuemEEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Briefcase,
  Lightbulb,
  TrendingUp,
  Users,
  Rocket,
  Target,
  Star,
  Heart,
};

const defaultContent = {
  titulo: "Para quem é ideal",
  subtitulo: "Desenvolvido para quem busca resultados reais",
  perfis_json: JSON.stringify([
    { titulo: "Empreendedores", descricao: "Que querem validar ideias rapidamente", icone: "Rocket" },
    { titulo: "Freelancers", descricao: "Que precisam de presença online profissional", icone: "Briefcase" },
    { titulo: "Startups", descricao: "Que buscam crescimento acelerado", icone: "TrendingUp" },
    { titulo: "Agências", descricao: "Que querem entregar mais em menos tempo", icone: "Users" },
  ]),
};

export const ParaQuemEEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: ParaQuemEEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S4.4 QA] ParaQuemEEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "para_quem_e", variante);
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

  const handlePerfilUpdate = async (index: number, field: keyof Perfil, value: string) => {
    try {
      const perfis: Perfil[] = JSON.parse(localContent.perfis_json || '[]');
      perfis[index] = { ...perfis[index], [field]: value };
      const newJson = JSON.stringify(perfis);
      
      const updated = { ...localContent, perfis_json: newJson };
      setLocalContent(updated);
      await saveSectionContent(lpId, 'para_quem_e', updated);
      onContentUpdate?.('perfis_json', newJson);
      console.log('[S4.4 QA] InlineText: OK - perfil', index, field);
    } catch (error) {
      console.error('[ParaQuemEEditable] Error updating perfil:', error);
    }
  };

  const fc = localContent;
  let perfis: Perfil[] = [];
  try {
    perfis = JSON.parse(fc.perfis_json || '[]');
  } catch {
    perfis = [];
  }

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-background"
      id="para-quem-e"
      data-section-key="para_quem_e"
    >
      <div className="section-container">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 px-1">
          <EditableField
            value={fc.titulo || ''}
            fieldKey="titulo"
            sectionKey="para_quem_e"
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
            sectionKey="para_quem_e"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="p"
            editable={editable}
            placeholder="Subtítulo"
            className="section-subtitle max-w-2xl mx-auto break-words"
          />
        </div>

        {/* Grid responsivo - mobile-first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {perfis.map((perfil, idx) => {
            const IconComp = iconMap[perfil.icone || 'Users'] || Users;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="glass-card p-4 sm:p-5 md:p-6 h-full text-center hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>

                  {editable ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handlePerfilUpdate(idx, 'titulo', e.currentTarget.textContent || '')}
                      className={cn(
                        "font-semibold text-base sm:text-lg mb-1.5 sm:mb-2 outline-none break-words",
                        "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text touch-manipulation",
                        "focus:ring-2 focus:ring-primary/20"
                      )}
                    >
                      {perfil.titulo}
                    </div>
                  ) : (
                    <h3 className="font-semibold text-base sm:text-lg mb-1.5 sm:mb-2 break-words">{perfil.titulo}</h3>
                  )}

                  {editable ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handlePerfilUpdate(idx, 'descricao', e.currentTarget.textContent || '')}
                      className={cn(
                        "text-muted-foreground text-xs sm:text-sm outline-none break-words",
                        "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text touch-manipulation",
                        "focus:ring-2 focus:ring-primary/20"
                      )}
                    >
                      {perfil.descricao}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs sm:text-sm break-words">{perfil.descricao}</p>
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

export default ParaQuemEEditable;
