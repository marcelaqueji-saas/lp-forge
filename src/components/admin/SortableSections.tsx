import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { GripVertical, Edit3, LayoutTemplate, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SECTION_NAMES, SECTIONS_WITH_VARIANTS, LPSettings, saveSettings, updateSectionOrder, getSectionOrder } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';

interface SortableSectionsProps {
  lpId: string;
  settings: LPSettings;
  onSettingsChange: (settings: LPSettings) => void;
  canEdit: boolean;
}

export const SortableSections = ({ lpId, settings, onSettingsChange, canEdit }: SortableSectionsProps) => {
  const [sections, setSections] = useState<string[]>(Object.keys(SECTION_NAMES));
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      const order = await getSectionOrder(lpId);
      setSections(order);
    };
    loadOrder();
  }, [lpId]);

  const handleReorder = async (newOrder: string[]) => {
    setSections(newOrder);
  };

  const handleDragEnd = async () => {
    setIsDragging(false);
    const success = await updateSectionOrder(lpId, sections);
    if (success) {
      toast({ title: 'Ordem das seções atualizada!' });
    }
  };

  const handleVariantChange = async (section: string, variante: string) => {
    const key = `${section}_variante`;
    const newSettings = { ...settings, [key]: variante };
    onSettingsChange(newSettings);
    
    const success = await saveSettings(lpId, { [key]: variante });
    if (success) {
      toast({ title: 'Variante atualizada!' });
    }
  };

  return (
    <Reorder.Group
      axis="y"
      values={sections}
      onReorder={handleReorder}
      className="space-y-3"
    >
      {sections.map((key, index) => {
        const name = SECTION_NAMES[key];
        if (!name) return null;
        
        const hasVariants = SECTIONS_WITH_VARIANTS.includes(key);
        const currentVariant = settings[`${key}_variante`] || 'modelo_a';

        return (
          <Reorder.Item
            key={key}
            value={key}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="glass-card p-4"
            whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {canEdit && (
                  <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground">Posição: {index + 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {hasVariants && canEdit && (
                  <select
                    value={currentVariant}
                    onChange={(e) => handleVariantChange(key, e.target.value)}
                    className="px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="modelo_a">Modelo A</option>
                    <option value="modelo_b">Modelo B</option>
                  </select>
                )}
                {canEdit ? (
                  <Link
                    to={`/admin/lp/${lpId}/sections/${key}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    onClick={(e) => isDragging && e.preventDefault()}
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Somente visualização</span>
                )}
              </div>
            </div>
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};