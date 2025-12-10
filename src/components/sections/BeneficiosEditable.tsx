/**
 * BeneficiosEditable - Benefícios com edição inline
 * Sprint 4.3: EditableField em título, subtítulo e itens
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Shield, Zap, Globe, BarChart3, Clock, Star, Heart, Award, TrendingUp, Users, Plus, Trash2 } from 'lucide-react';
import { trackSectionView } from '@/lib/tracking';
import { EditableField } from '@/components/editor/InlineEditableSection';
import { LPContent, saveSectionContent } from '@/lib/lpContentApi';
import { PlanLevel } from '@/lib/sectionModels';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Beneficio {
  titulo: string;
  descricao: string;
  icone?: string;
}

interface BeneficiosEditableProps {
  lpId: string;
  content: LPContent;
  variante?: string;
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

export const BeneficiosEditable = ({
  lpId,
  content,
  variante = 'modelo_a',
  userPlan,
  editable = true,
  onContentUpdate,
}: BeneficiosEditableProps) => {
  const [localContent, setLocalContent] = useState<LPContent>(content);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedViewRef = useRef(false);

  // QA Log
  useEffect(() => {
    console.log('[S4.3 QA] BeneficiosEditable: mounted', { lpId, editable });
  }, [lpId, editable]);

  // Parse benefícios JSON
  useEffect(() => {
    setLocalContent(content);
    try {
      const parsed = content.beneficios_json ? JSON.parse(content.beneficios_json) : defaultBeneficios;
      setBeneficios(Array.isArray(parsed) ? parsed : defaultBeneficios);
    } catch {
      setBeneficios(defaultBeneficios);
    }
  }, [content]);

  // Tracking
  useEffect(() => {
    if (!lpId || hasTrackedViewRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTrackedViewRef.current) {
          trackSectionView(lpId, 'beneficios', variante);
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

  const handleBeneficioChange = useCallback(async (index: number, field: keyof Beneficio, value: string) => {
    const updated = [...beneficios];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficios(updated);

    // Save to DB
    try {
      const newJson = JSON.stringify(updated);
      await saveSectionContent(lpId, 'beneficios', { ...localContent, beneficios_json: newJson });
      onContentUpdate?.('beneficios_json', newJson);
      toast({ title: 'Benefício atualizado!' });
      console.log('[S4.3 QA] InlineText: OK - beneficio', index, field);
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

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-card/50"
      id="beneficios"
      data-section-key="beneficios"
    >
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            <EditableField
              value={fc.titulo || 'Por que escolher nossa plataforma?'}
              fieldKey="titulo"
              sectionKey="beneficios"
              lpId={lpId}
              content={localContent}
              onUpdate={handleUpdate}
              as="span"
              editable={editable}
              placeholder="Título da seção"
            />
          </h2>
          <p className="section-subtitle mx-auto">
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

        {/* Grid de benefícios */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {beneficios.map((beneficio, index) => {
            const Icon = iconMap[beneficio.icone || 'Check'] || Check;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
                className="p-6 premium-card-soft relative group"
              >
                {/* Remove button */}
                {editable && (
                  <button
                    onClick={() => removeBeneficio(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {editable ? (
                    <input
                      type="text"
                      value={beneficio.titulo}
                      onChange={(e) => handleBeneficioChange(index, 'titulo', e.target.value)}
                      onBlur={() => handleBeneficioChange(index, 'titulo', beneficio.titulo)}
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1"
                    />
                  ) : (
                    beneficio.titulo
                  )}
                </h3>
                
                <p className="text-muted-foreground">
                  {editable ? (
                    <textarea
                      value={beneficio.descricao}
                      onChange={(e) => handleBeneficioChange(index, 'descricao', e.target.value)}
                      onBlur={() => handleBeneficioChange(index, 'descricao', beneficio.descricao)}
                      className="w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1 resize-none"
                      rows={2}
                    />
                  ) : (
                    beneficio.descricao
                  )}
                </p>
              </motion.div>
            );
          })}

          {/* Add button */}
          {editable && (
            <motion.button
              onClick={addBeneficio}
              className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Adicionar benefício</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default BeneficiosEditable;
