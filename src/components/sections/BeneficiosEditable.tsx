/**
 * BeneficiosEditable - Benefícios com edição inline
 * Sprint 5.2: Suporte a stylePreset
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Shield, Zap, Globe, BarChart3, Clock, Star, Heart, Award, TrendingUp, Users, Plus, Trash2 } from 'lucide-react';
import { trackSectionView } from '@/lib/tracking';
import { EditableField } from '@/components/editor/InlineEditableSection';
import { LPContent, saveSectionContent } from '@/lib/lpContentApi';
import { PlanLevel, StylePreset, getLayoutVariant } from '@/lib/sectionModels';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Beneficio {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface BeneficiosEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
  modelId?: string;
  stylePreset?: StylePreset;
  userPlan: PlanLevel | 'master';
  editable?: boolean;
  onContentUpdate?: (key: string, value: string) => void;
}

const iconMap: Record<string, typeof Check> = {
  Check, Sparkles, Shield, Zap, Globe, BarChart3, Clock, Star, Heart, Award, TrendingUp, Users,
};

const defaultBeneficios: Beneficio[] = [
  { titulo: 'Alta conversão', descricao: 'Templates otimizados para maximizar suas conversões.', icone: 'Sparkles' },
  { titulo: 'Seguro e confiável', descricao: 'Seus dados protegidos com criptografia de ponta.', icone: 'Shield' },
  { titulo: 'Super rápido', descricao: 'Páginas carregam em menos de 2 segundos.', icone: 'Zap' },
];

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

export const BeneficiosEditable = ({
  lpId,
  content,
  variante = 'modelo_a',
  modelId,
  stylePreset = 'glass',
  userPlan,
  editable = true,
  onContentUpdate,
}: BeneficiosEditableProps) => {
  // Use centralized layout mapping - prefer modelId over variante
  const normalizedVariant = getLayoutVariant(modelId || variante);
  const [localContent, setLocalContent] = useState<LPContent>(content);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    console.log('[S5.2 QA] BeneficiosEditable: mounted', { lpId, editable, variante, modelId, stylePreset, normalizedVariant });
  }, [lpId, editable, variante, modelId, stylePreset, normalizedVariant]);

  useEffect(() => {
    setLocalContent(content);
    try {
      const parsed = content.beneficios_json ? JSON.parse(content.beneficios_json) : defaultBeneficios;
      setBeneficios(Array.isArray(parsed) ? parsed : defaultBeneficios);
    } catch {
      setBeneficios(defaultBeneficios);
    }
  }, [content]);

  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'beneficios', normalizedVariant);
          hasTrackedViewRef.current = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [lpId, normalizedVariant]);

  const handleUpdate = useCallback((key: string, value: string) => {
    setLocalContent(prev => ({ ...prev, [key]: value }));
    onContentUpdate?.(key, value);
  }, [onContentUpdate]);

  const handleBeneficioChange = useCallback(async (index: number, field: keyof Beneficio, value: string) => {
    const updated = [...beneficios];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficios(updated);

    try {
      const newJson = JSON.stringify(updated);
      await saveSectionContent(lpId, 'beneficios', { ...localContent, beneficios_json: newJson });
      onContentUpdate?.('beneficios_json', newJson);
      toast({ title: 'Benefício atualizado!' });
    } catch (err) {
      console.error('[BeneficiosEditable] Save error:', err);
    }
  }, [beneficios, lpId, localContent, onContentUpdate]);

  const addBeneficio = useCallback(async () => {
    const updated = [...beneficios, { titulo: 'Novo benefício', descricao: 'Descrição do benefício', icone: 'Star' }];
    setBeneficios(updated);
    const newJson = JSON.stringify(updated);
    await saveSectionContent(lpId, 'beneficios', { ...localContent, beneficios_json: newJson });
    onContentUpdate?.('beneficios_json', newJson);
    toast({ title: 'Benefício adicionado!' });
  }, [beneficios, lpId, localContent, onContentUpdate]);

  const removeBeneficio = useCallback(async (index: number) => {
    const updated = beneficios.filter((_, i) => i !== index);
    setBeneficios(updated);
    const newJson = JSON.stringify(updated);
    await saveSectionContent(lpId, 'beneficios', { ...localContent, beneficios_json: newJson });
    onContentUpdate?.('beneficios_json', newJson);
    toast({ title: 'Benefício removido!' });
  }, [beneficios, lpId, localContent, onContentUpdate]);

  const fc = localContent;

  const renderBeneficioCard = (beneficio: Beneficio, index: number, compact = false) => {
    const Icon = iconMap[beneficio.icone || 'Check'] || Check;
    return (
      <motion.div
        key={index}
        variants={{
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        }}
        className={`${compact ? 'p-4 text-center' : 'p-4 sm:p-5 md:p-6'} premium-card-soft relative group`}
      >
        {editable && (
          <button
            onClick={() => removeBeneficio(index)}
            className="absolute top-2 right-2 p-2 sm:p-1.5 rounded-full bg-destructive/10 text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
          >
            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          </button>
        )}

        <div className={`${compact ? 'w-12 h-12 mx-auto' : 'w-10 h-10 sm:w-12 sm:h-12'} rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4`}>
          <Icon className={`${compact ? 'w-6 h-6' : 'w-5 h-5 sm:w-6 sm:h-6'} text-primary`} />
        </div>
        
        <h3 className={`${compact ? 'text-sm' : 'text-base sm:text-lg'} font-semibold mb-1.5 sm:mb-2 break-words`}>
          {editable ? (
            <input
              type="text"
              value={beneficio.titulo}
              onChange={(e) => handleBeneficioChange(index, 'titulo', e.target.value)}
              className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1"
            />
          ) : beneficio.titulo}
        </h3>
        
        {!compact && (
          <p className="text-sm sm:text-base text-muted-foreground break-words">
            {editable ? (
              <textarea
                value={beneficio.descricao}
                onChange={(e) => handleBeneficioChange(index, 'descricao', e.target.value)}
                className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 resize-none"
                rows={2}
              />
            ) : beneficio.descricao}
          </p>
        )}
      </motion.div>
    );
  };

  const renderAddButton = (compact = false) => (
    editable && (
      <motion.button
        onClick={addBeneficio}
        className={`${compact ? 'p-4' : 'p-4 sm:p-5 md:p-6'} border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[120px]`}
      >
        <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
        <span className="text-xs sm:text-sm text-muted-foreground">Adicionar</span>
      </motion.button>
    )
  );

  // MODELO C - Two columns with large icons
  if (normalizedVariant === 'modelo_c') {
    return (
      <section
        ref={sectionRef}
        className={cn("section-padding", getSectionStyleModifiers(stylePreset))}
        id="beneficios"
        data-section-key="beneficios"
      >
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title mb-4 break-words">
                <EditableField
                  value={fc.titulo || 'Por que escolher nossa plataforma?'}
                  fieldKey="titulo"
                  sectionKey="beneficios"
                  lpId={lpId}
                  content={localContent}
                  onUpdate={handleUpdate}
                  as="span"
                  editable={editable}
                  placeholder="Título"
                />
              </h2>
              <p className="section-subtitle break-words">
                <EditableField
                  value={fc.subtitulo || 'Tudo que você precisa para criar páginas de alta conversão'}
                  fieldKey="subtitulo"
                  sectionKey="beneficios"
                  lpId={lpId}
                  content={localContent}
                  onUpdate={handleUpdate}
                  as="span"
                  editable={editable}
                  placeholder="Subtítulo"
                />
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 gap-4"
            >
              {beneficios.slice(0, 4).map((b, i) => renderBeneficioCard(b, i, true))}
              {renderAddButton(true)}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // MODELO B - List style
  if (normalizedVariant === 'modelo_b') {
    return (
      <section
        ref={sectionRef}
        className={cn("section-padding", getSectionStyleModifiers(stylePreset))}
        id="beneficios"
        data-section-key="beneficios"
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 className="section-title mb-3 sm:mb-4 break-words">
              <EditableField
                value={fc.titulo || 'Por que escolher nossa plataforma?'}
                fieldKey="titulo"
                sectionKey="beneficios"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                as="span"
                editable={editable}
                placeholder="Título"
              />
            </h2>
            <p className="section-subtitle mx-auto break-words">
              <EditableField
                value={fc.subtitulo || 'Tudo que você precisa para criar páginas de alta conversão'}
                fieldKey="subtitulo"
                sectionKey="beneficios"
                lpId={lpId}
                content={localContent}
                onUpdate={handleUpdate}
                as="span"
                editable={editable}
                placeholder="Subtítulo"
              />
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {beneficios.map((beneficio, index) => {
              const Icon = iconMap[beneficio.icone || 'Check'] || Check;
              return (
                <motion.div
                  key={index}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="flex items-start gap-4 p-4 relative group"
                >
                  {editable && (
                    <button
                      onClick={() => removeBeneficio(index)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {editable ? (
                        <input
                          type="text"
                          value={beneficio.titulo}
                          onChange={(e) => handleBeneficioChange(index, 'titulo', e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded"
                        />
                      ) : beneficio.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {editable ? (
                        <textarea
                          value={beneficio.descricao}
                          onChange={(e) => handleBeneficioChange(index, 'descricao', e.target.value)}
                          className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded resize-none"
                          rows={2}
                        />
                      ) : beneficio.descricao}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {editable && (
              <button
                onClick={addBeneficio}
                className="flex items-center gap-4 p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Adicionar benefício</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>
    );
  }

  // MODELO A - Grid de cards (default)
  return (
    <section
      ref={sectionRef}
      className={cn("section-padding", getSectionStyleModifiers(stylePreset) || "bg-card/50")}
      id="beneficios"
      data-section-key="beneficios"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 className="section-title mb-3 sm:mb-4 break-words">
            <EditableField
              value={fc.titulo || 'Por que escolher nossa plataforma?'}
              fieldKey="titulo"
              sectionKey="beneficios"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="span"
              editable={editable}
              placeholder="Título"
            />
          </h2>
          <p className="section-subtitle mx-auto break-words">
            <EditableField
              value={fc.subtitulo || 'Tudo que você precisa para criar páginas de alta conversão'}
              fieldKey="subtitulo"
              sectionKey="beneficios"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="span"
              editable={editable}
              placeholder="Subtítulo"
            />
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
        >
          {beneficios.map((b, i) => renderBeneficioCard(b, i))}
          {renderAddButton()}
        </motion.div>
      </div>
    </section>
  );
};

export default BeneficiosEditable;
