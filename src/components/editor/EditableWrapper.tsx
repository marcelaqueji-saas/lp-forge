/**
 * EditableWrapper - Wrapper para edição inline no preview
 * Suporta texto e imagem com salvamento automático
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { saveSectionContent, LPContent } from '@/lib/lpContentApi';
import { SectionKey, PlanLevel } from '@/lib/sectionModels';
import { PLAN_LIMITS } from '@/lib/blockEditorTypes';

interface EditableTextProps {
  value: string;
  contentKey: string;
  sectionKey: SectionKey;
  lpId: string;
  content: LPContent;
  onUpdate: (key: string, value: string) => void;
  onSave?: () => void;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  editable?: boolean;
}

export const EditableText = ({
  value,
  contentKey,
  sectionKey,
  lpId,
  content,
  onUpdate,
  onSave,
  as: Tag = 'p',
  className,
  editable = true,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = useCallback(async () => {
    if (localValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const updatedContent = { ...content, [contentKey]: localValue };
      await saveSectionContent(lpId, sectionKey, updatedContent);
      onUpdate(contentKey, localValue);
      onSave?.();
    } catch (error) {
      console.error('[EditableText] Save error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
      setLocalValue(value); // Reverte
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  }, [localValue, value, content, contentKey, lpId, sectionKey, onUpdate, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && Tag !== 'p') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (!editable) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <div 
      className={cn(
        "relative group/editable",
        isEditing && "ring-2 ring-primary/30 rounded-lg"
      )}
      data-editable="text"
      data-section-key={sectionKey}
      data-content-key={contentKey}
    >
      {/* Tooltip de edição */}
      {!isEditing && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/editable:opacity-100 transition-opacity z-10 pointer-events-none">
          <div className="px-2 py-1 rounded-md bg-foreground/90 text-background text-xs flex items-center gap-1 whitespace-nowrap">
            <Pencil className="w-3 h-3" />
            Clique para editar
          </div>
        </div>
      )}

      {/* Elemento editável */}
      <Tag
        ref={ref as any}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onClick={() => !isEditing && setIsEditing(true)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onInput={(e) => setLocalValue((e.target as HTMLElement).textContent || '')}
        className={cn(
          className,
          "outline-none transition-all duration-200",
          !isEditing && "cursor-pointer hover:bg-primary/5 rounded-lg",
          isEditing && "bg-background/50 px-2 py-1 rounded-lg"
        )}
        style={{ minHeight: '1em' }}
      >
        {localValue || value}
      </Tag>

      {/* Indicador de salvando */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          >
            <Loader2 className="w-3 h-3 text-primary-foreground animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outline decorativo hover */}
      {!isEditing && (
        <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover/editable:border-primary/20 pointer-events-none transition-colors" />
      )}
    </div>
  );
};

// ============================================================
// EDITABLE IMAGE
// ============================================================

interface EditableImageProps {
  src?: string;
  contentKey: string;
  sectionKey: SectionKey;
  lpId: string;
  content: LPContent;
  userPlan: PlanLevel;
  onUpdate: (key: string, value: string) => void;
  onSave?: () => void;
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  editable?: boolean;
}

export const EditableImage = ({
  src,
  contentKey,
  sectionKey,
  lpId,
  content,
  userPlan,
  onUpdate,
  onSave,
  alt = '',
  className,
  aspectRatio = 'video',
  editable = true,
}: EditableImageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limits = PLAN_LIMITS[userPlan];
  const maxFileSizeMB = Math.min(10, limits.maxStorageMB);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      toast({
        title: 'Arquivo muito grande',
        description: `Máximo: ${maxFileSizeMB}MB`,
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Apenas imagens são permitidas', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${lpId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lp-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lp-media')
        .getPublicUrl(filePath);

      // Salvar no conteúdo
      const updatedContent = { ...content, [contentKey]: publicUrl };
      await saveSectionContent(lpId, sectionKey, updatedContent);
      
      onUpdate(contentKey, publicUrl);
      onSave?.();
      toast({ title: 'Imagem atualizada!' });
    } catch (error) {
      console.error('[EditableImage] Upload error:', error);
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setShowPicker(false);
    }
  };

  if (!editable) {
    return src ? (
      <img src={src} alt={alt} className={cn("object-cover", className)} />
    ) : (
      <div className={cn("bg-muted/30 flex items-center justify-center", aspectClasses[aspectRatio], className)}>
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      data-editable="image"
      data-section-key={sectionKey}
      data-content-key={contentKey}
      className={cn("relative group/editable-img cursor-pointer", className)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Imagem ou placeholder */}
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className={cn("object-cover w-full h-full rounded-xl transition-all", aspectClasses[aspectRatio])}
        />
      ) : (
        <div className={cn(
          "bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-2",
          aspectClasses[aspectRatio]
        )}>
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Clique para adicionar</span>
        </div>
      )}

      {/* Overlay de edição */}
      <div className={cn(
        "absolute inset-0 rounded-xl transition-all flex items-center justify-center",
        "bg-black/0 group-hover/editable-img:bg-black/40"
      )}>
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <div className="opacity-0 group-hover/editable-img:opacity-100 transition-opacity text-center text-white">
            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm font-medium">Trocar imagem</span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/editable-img:opacity-100 transition-opacity z-10 pointer-events-none">
        <div className="px-2 py-1 rounded-md bg-foreground/90 text-background text-xs flex items-center gap-1 whitespace-nowrap">
          <ImageIcon className="w-3 h-3" />
          Clique para trocar
        </div>
      </div>
    </div>
  );
};
