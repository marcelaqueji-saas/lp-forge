/**
 * PlanosEditable - Seção de Planos/Pricing com edição inline
 * Sprint 5.1: Suporte a múltiplas variantes (modelo_a, modelo_b)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { trackSectionView, trackCTAClick } from "@/lib/tracking";
import { EditableField } from "@/components/editor/InlineEditableSection";
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

function normalizeVariant(variant?: string): 'modelo_a' | 'modelo_b' {
  if (variant === 'modelo_a' || variant === 'modelo_b') {
    return variant;
  }
  return 'modelo_a';
}

export const PlanosEditable = ({
  lpId,
  content,
  variante = "modelo_a",
  userPlan,
  editable = true,
  onContentUpdate,
}: PlanosEditableProps) => {
  const normalizedVariant = normalizeVariant(variante);
  const [localContent, setLocalContent] = useState<LPContent>({ ...defaultContent, ...content });
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S5.1 QA] PlanosEditable: mounted', { lpId, editable, variante, normalizedVariant });
  }, [lpId, editable, variante, normalizedVariant]);

  useEffect(() => {
    setLocalContent({ ...defaultContent, ...content });
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, "planos", normalizedVariant);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, normalizedVariant]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
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
    } catch (error) {
      console.error('[PlanosEditable] Error updating plano:', error);
    }
  };

  const handlePlanClick = (planName: string) => {
    if (lpId) trackCTAClick(lpId, 'planos', 'primary', normalizedVariant);
  };

  const fc = localContent;
  let planos: Plano[] = [];
  try {
    planos = JSON.parse(fc.planos_json || '[]');
  } catch {
    planos = [];
  }

  const renderPlanoCard = (plano: Plano, idx: number, isModeloB = false) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className={cn(
        "relative",
        isModeloB 
          ? `flex-1 max-w-sm mx-auto lg:mx-0 w-full ${plano.destaque ? 'lg:-mt-4 lg:mb-4' : ''}`
          : plano.destaque && "md:-mt-4 md:mb-4"
      )}
    >
      <div
        className={cn(
          "h-full flex flex-col",
          isModeloB 
            ? `rounded-xl sm:rounded-2xl p-5 sm:p-8 transition-all duration-300 ${
                plano.destaque 
                  ? 'gradient-bg text-primary-foreground shadow-glow-lg' 
                  : 'glass-card'
              }`
            : `glass-card p-4 sm:p-5 md:p-6 ${plano.destaque && "ring-2 ring-primary shadow-xl"}`
        )}
      >
        {plano.destaque && (
          isModeloB ? (
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Mais popular</span>
            </div>
          ) : (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                Mais popular
              </span>
            </div>
          )
        )}

        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handlePlanoUpdate(idx, 'nome', e.currentTarget.textContent || '')}
            className={cn(
              "font-semibold mb-1.5 sm:mb-2 outline-none break-words",
              "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
              "focus:ring-2 focus:ring-primary/20",
              isModeloB ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
            )}
          >
            {plano.nome}
          </div>
        ) : (
          <h3 className={cn("font-semibold mb-1.5 sm:mb-2 break-words", isModeloB ? "text-xl sm:text-2xl" : "text-base sm:text-lg")}>
            {plano.nome}
          </h3>
        )}

        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handlePlanoUpdate(idx, 'descricao', e.currentTarget.textContent || '')}
            className={cn(
              "text-xs sm:text-sm mb-3 sm:mb-4 outline-none break-words",
              "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
              "focus:ring-2 focus:ring-primary/20",
              plano.destaque && isModeloB ? 'opacity-80' : 'text-muted-foreground'
            )}
          >
            {plano.descricao}
          </div>
        ) : (
          <p className={cn("text-xs sm:text-sm mb-3 sm:mb-4 break-words", plano.destaque && isModeloB ? 'opacity-80' : 'text-muted-foreground')}>
            {plano.descricao}
          </p>
        )}

        <div className="mb-4 sm:mb-6">
          {editable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handlePlanoUpdate(idx, 'preco', e.currentTarget.textContent || '')}
              className={cn(
                "text-2xl sm:text-3xl font-bold outline-none break-words inline-block",
                "hover:bg-primary/5 px-2 -mx-2 rounded transition-colors cursor-text",
                "focus:ring-2 focus:ring-primary/20"
              )}
            >
              {plano.preco}
            </span>
          ) : (
            <span className="text-2xl sm:text-3xl font-bold break-words">{plano.preco}</span>
          )}
          {isModeloB && <span className={cn("text-sm", plano.destaque ? 'opacity-80' : 'text-muted-foreground')}>/mês</span>}
        </div>

        <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
          {plano.itens?.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2">
              <Check className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5", plano.destaque && isModeloB ? '' : 'text-green-500')} />
              {editable ? (
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newItens = [...plano.itens];
                    newItens[itemIdx] = e.currentTarget.textContent || '';
                    handlePlanoUpdate(idx, 'itens', newItens);
                  }}
                  className="text-xs sm:text-sm outline-none flex-1 break-words hover:bg-primary/5 px-1 -mx-1 rounded cursor-text focus:ring-2 focus:ring-primary/20"
                >
                  {item}
                </span>
              ) : (
                <span className="text-xs sm:text-sm break-words">{item}</span>
              )}
            </li>
          ))}
        </ul>

        <Button
          variant={plano.destaque ? (isModeloB ? "secondary" : "default") : "outline"}
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
          onClick={() => handlePlanClick(plano.nome)}
        >
          Começar agora
          <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
        </Button>
      </div>
    </motion.div>
  );

  // MODELO B - Flex layout with featured card larger
  if (normalizedVariant === 'modelo_b') {
    return (
      <section
        ref={sectionRef}
        className="section-padding bg-background"
        id="planos"
        data-section-key="planos"
      >
        <div className="section-container">
          <div className="text-center mb-10 sm:mb-16 px-1">
            <EditableField
              value={fc.titulo || ''}
              fieldKey="titulo"
              sectionKey="planos"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="h2"
              editable={editable}
              placeholder="Título"
              className="section-title mb-3 sm:mb-4 break-words"
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
              className="section-subtitle max-w-2xl mx-auto break-words"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch justify-center">
            {planos.map((plano, idx) => renderPlanoCard(plano, idx, true))}
          </div>
        </div>
      </section>
    );
  }

  // MODELO A - Grid horizontal (default)
  return (
    <section
      ref={sectionRef}
      className="section-padding bg-background"
      id="planos"
      data-section-key="planos"
    >
      <div className="section-container">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 px-1">
          <EditableField
            value={fc.titulo || ''}
            fieldKey="titulo"
            sectionKey="planos"
            lpId={lpId}
            content={localContent}
            onUpdate={handleUpdate}
            as="h2"
            editable={editable}
            placeholder="Título"
            className="section-title mb-3 sm:mb-4 break-words"
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
            className="section-subtitle max-w-2xl mx-auto break-words"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
          {planos.map((plano, idx) => renderPlanoCard(plano, idx, false))}
        </div>
      </div>
    </section>
  );
};

export default PlanosEditable;
