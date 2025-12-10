/**
 * PlanosEditable - Seção de Planos/Pricing com edição inline
 * Sprint 4.4: 100% do conteúdo editável inline
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { trackSectionView, trackCTAClick } from "@/lib/tracking";
import { EditableField, EditableLink } from "@/components/editor/InlineEditableSection";
import { saveSectionContent, LPContent } from "@/lib/lpContentApi";
import { PlanLevel } from "@/lib/sectionModels";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Plano {
  nome: string;
  preco: string;
  descricao: string;
  destaque?: boolean;
  itens: string[];
}

interface PlanosEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const defaultContent = {
  titulo: "Escolha seu plano",
  subtitulo: "Comece gratuitamente e evolua conforme cresce",
  planos_json: JSON.stringify([
    {
      nome: "Gratuito",
      preco: "R$ 0",
      descricao: "Para começar",
      destaque: false,
      itens: ["1 landing page", "Templates básicos", "Suporte por email"],
    },
    {
      nome: "Pro",
      preco: "R$ 49/mês",
      descricao: "Para profissionais",
      destaque: true,
      itens: ["3 landing pages", "Todos os templates", "Domínio próprio", "Analytics avançado"],
    },
    {
      nome: "Premium",
      preco: "R$ 99/mês",
      descricao: "Para empresas",
      destaque: false,
      itens: ["10 landing pages", "Recursos premium", "Suporte prioritário", "API de integração"],
    },
  ]),
};

export const PlanosEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: PlanosEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S4.4 QA] PlanosEditable: mounted', { lpId, editable, variante });
  }, [lpId, editable, variante]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "planos", variante);
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

  const handlePlanoUpdate = async (index: number, field: keyof Plano, value: any) => {
    try {
      const planos: Plano[] = JSON.parse(localContent.planos_json || '[]');
      planos[index] = { ...planos[index], [field]: value };
      const newJson = JSON.stringify(planos);
      
      const updated = { ...localContent, planos_json: newJson };
      setLocalContent(updated);
      await saveSectionContent(lpId, 'planos', updated);
      onContentUpdate?.('planos_json', newJson);
      console.log('[S4.4 QA] InlineText: OK - plano', index, field);
    } catch (error) {
      console.error('[PlanosEditable] Error updating plano:', error);
    }
  };

  const handlePlanClick = (planName: string) => {
    if (lpId) trackCTAClick(lpId, 'planos', 'primary', variante);
  };

  const fc = localContent;
  let planos: Plano[] = [];
  try {
    planos = JSON.parse(fc.planos_json || '[]');
  } catch {
    planos = [];
  }

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-background"
      id="planos"
      data-section-key="planos"
    >
      <div className="section-container">
        <div className="text-center mb-12">
          <EditableField
            value={fc.titulo || ''}
            fieldKey="titulo"
            sectionKey="planos"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="h2"
            editable={editable}
            placeholder="Título da seção"
            className="section-title mb-4"
          />
          <EditableField
            value={fc.subtitulo || ''}
            fieldKey="subtitulo"
            sectionKey="planos"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="p"
            editable={editable}
            placeholder="Subtítulo"
            className="section-subtitle max-w-2xl mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {planos.map((plano, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative",
                plano.destaque && "md:-mt-4 md:mb-4"
              )}
            >
              <div
                className={cn(
                  "glass-card p-6 h-full flex flex-col",
                  plano.destaque && "ring-2 ring-primary shadow-xl"
                )}
              >
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}

                {/* Nome do plano */}
                {editable ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handlePlanoUpdate(idx, 'nome', e.currentTarget.textContent || '')}
                    className={cn(
                      "font-semibold text-lg mb-2 outline-none",
                      "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    {plano.nome}
                  </div>
                ) : (
                  <h3 className="font-semibold text-lg mb-2">{plano.nome}</h3>
                )}

                {/* Preço */}
                {editable ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handlePlanoUpdate(idx, 'preco', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-3xl font-bold mb-2 outline-none",
                      "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    {plano.preco}
                  </div>
                ) : (
                  <p className="text-3xl font-bold mb-2">{plano.preco}</p>
                )}

                {/* Descrição */}
                {editable ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handlePlanoUpdate(idx, 'descricao', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-muted-foreground mb-6 outline-none",
                      "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
                      "focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    {plano.descricao}
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-6">{plano.descricao}</p>
                )}

                {/* Itens */}
                <ul className="space-y-3 mb-6 flex-1">
                  {plano.itens?.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      {editable ? (
                        <span
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newItens = [...plano.itens];
                            newItens[itemIdx] = e.currentTarget.textContent || '';
                            handlePlanoUpdate(idx, 'itens', newItens);
                          }}
                          className={cn(
                            "text-sm outline-none flex-1",
                            "hover:bg-primary/5 px-1 -mx-1 rounded transition-colors cursor-text",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        >
                          {item}
                        </span>
                      ) : (
                        <span className="text-sm">{item}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plano.destaque ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handlePlanClick(plano.nome)}
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlanosEditable;
