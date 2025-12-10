/**
 * InlineEditableSection - Wrapper para seções com edição inline completa
 * Sprint 4: VisionGlass styling e tooltips elegantes
 */

import { useState, useCallback, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, ImageIcon, Link2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { saveSectionContent, LPContent } from '@/lib/lpContentApi';
import { SectionKey, PlanLevel } from '@/lib/sectionModels';
import { toast } from '@/hooks/use-toast';

// ============================================================
// EDITABLE TEXT WITH VISION GLASS STYLING
// ============================================================

interface EditableFieldProps {
  value: string;
  fieldKey: string;
  sectionKey: SectionKey;
  lpId: string;
  content: LPContent;
  onUpdate: (key: string, value: string) => void;
  onSaveStart?: () => void;
  onSaveEnd?: (success: boolean) => void;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'button';
  className?: string;
  editable?: boolean;
  placeholder?: string;
  multiline?: boolean;
}

export const EditableField = ({
  value,
  fieldKey,
  sectionKey,
  lpId,
  content,
  onUpdate,
  onSaveStart,
  onSaveEnd,
  as: Tag = 'p',
  className,
  editable = true,
  placeholder = 'Clique para editar...',
  multiline = false,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const handleSave = useCallback(async () => {
    if (localValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    onSaveStart?.();

    try {
      const updatedContent = { ...content, [fieldKey]: localValue };
      await saveSectionContent(lpId, sectionKey, updatedContent);
      onUpdate(fieldKey, localValue);
      onSaveEnd?.(true);
      toast({ 
        title: 'Conteúdo salvo',
        description: 'Alteração aplicada com sucesso.',
      });
    } catch (error) {
      console.error('[EditableField] Save error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
      setLocalValue(value || '');
      onSaveEnd?.(false);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  }, [localValue, value, content, fieldKey, lpId, sectionKey, onUpdate, onSaveStart, onSaveEnd]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setLocalValue(value || '');
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (editable && !isEditing) {
      setIsEditing(true);
      setLocalValue(value || '');
      setTimeout(() => ref.current?.focus(), 10);
    }
  };

  if (!editable) {
    return <Tag className={className}>{value || placeholder}</Tag>;
  }

  return (
    <div
      className="relative group/edit inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-editable="text"
      data-section-key={sectionKey}
      data-field-key={fieldKey}
    >
      {/* VisionGlass Tooltip */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Pencil className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-foreground/80">Clique para editar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VisionGlass Outline */}
      <div
        className={cn(
          "absolute -inset-1 rounded-lg transition-all duration-200 pointer-events-none",
          isHovered && !isEditing && "ring-2 ring-primary/20 bg-primary/5",
          isEditing && "ring-2 ring-primary/40 bg-primary/10"
        )}
      />

      {/* Element */}
      <Tag
        ref={ref as any}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onClick={handleClick}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onInput={(e) => setLocalValue((e.target as HTMLElement).textContent || '')}
        className={cn(
          className,
          "relative outline-none transition-all duration-200",
          editable && !isEditing && "cursor-pointer",
          isEditing && "px-2 py-1",
          !value && !isEditing && "text-muted-foreground/50 italic"
        )}
        style={{ minHeight: '1em' }}
      >
        {isEditing ? localValue : (value || placeholder)}
      </Tag>

      {/* Saving indicator */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// EDITABLE IMAGE WITH VISION GLASS STYLING
// ============================================================

interface EditableImageFieldProps {
  src?: string;
  fieldKey: string;
  sectionKey: SectionKey;
  lpId: string;
  content: LPContent;
  userPlan: PlanLevel | 'master';
  onUpdate: (key: string, value: string) => void;
  onSaveStart?: () => void;
  onSaveEnd?: (success: boolean) => void;
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  editable?: boolean;
  placeholder?: string;
}

export const EditableImageField = ({
  src,
  fieldKey,
  sectionKey,
  lpId,
  content,
  userPlan,
  onUpdate,
  onSaveStart,
  onSaveEnd,
  alt = '',
  className,
  aspectRatio = 'video',
  editable = true,
  placeholder = 'Clique para adicionar imagem',
}: EditableImageFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClasses: Record<string, string> = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    auto: '',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    const fileSizeMB = file.size / (1024 * 1024);
    const maxSize = userPlan === 'master' ? 50 : userPlan === 'premium' ? 20 : 10;
    
    if (fileSizeMB > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: `Máximo: ${maxSize}MB`,
        variant: 'destructive',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Apenas imagens são permitidas', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    onSaveStart?.();

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
      const updatedContent = { ...content, [fieldKey]: publicUrl };
      await saveSectionContent(lpId, sectionKey, updatedContent);

      onUpdate(fieldKey, publicUrl);
      onSaveEnd?.(true);
      toast({ title: 'Imagem atualizada!' });
    } catch (error) {
      console.error('[EditableImageField] Upload error:', error);
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
      onSaveEnd?.(false);
    } finally {
      setIsUploading(false);
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
      data-field-key={fieldKey}
      className={cn("relative group/edit-img cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* VisionGlass Tooltip */}
      <AnimatePresence>
        {isHovered && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <ImageIcon className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-foreground/80">
                {src ? 'Clique para trocar' : placeholder}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image or placeholder */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "object-cover w-full h-full rounded-xl transition-all",
            aspectClasses[aspectRatio]
          )}
        />
      ) : (
        <div
          className={cn(
            "bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/20",
            aspectClasses[aspectRatio]
          )}
        >
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        </div>
      )}

      {/* VisionGlass Overlay */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl transition-all flex items-center justify-center",
          isHovered && !isUploading && "bg-black/30 backdrop-blur-[2px]",
          isUploading && "bg-black/50"
        )}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isHovered ? (
          <div className="text-center text-white">
            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
            <span className="text-sm font-medium">
              {src ? 'Trocar imagem' : 'Adicionar imagem'}
            </span>
          </div>
        ) : null}
      </div>

      {/* VisionGlass Ring */}
      <div
        className={cn(
          "absolute -inset-1 rounded-xl transition-all pointer-events-none",
          isHovered && "ring-2 ring-primary/30"
        )}
      />
    </div>
  );
};

// ============================================================
// EDITABLE LINK/BUTTON
// ============================================================

interface EditableLinkProps {
  label: string;
  url: string;
  labelKey: string;
  urlKey: string;
  sectionKey: SectionKey;
  lpId: string;
  content: LPContent;
  onUpdate: (key: string, value: string) => void;
  onSaveStart?: () => void;
  onSaveEnd?: (success: boolean) => void;
  className?: string;
  editable?: boolean;
  children?: ReactNode;
}

export const EditableLink = ({
  label,
  url,
  labelKey,
  urlKey,
  sectionKey,
  lpId,
  content,
  onUpdate,
  onSaveStart,
  onSaveEnd,
  className,
  editable = true,
  children,
}: EditableLinkProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const [editUrl, setEditUrl] = useState(url);

  const handleSave = async () => {
    if (editLabel === label && editUrl === url) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    onSaveStart?.();

    try {
      const updatedContent = { 
        ...content, 
        [labelKey]: editLabel,
        [urlKey]: editUrl,
      };
      await saveSectionContent(lpId, sectionKey, updatedContent);
      onUpdate(labelKey, editLabel);
      onUpdate(urlKey, editUrl);
      onSaveEnd?.(true);
      toast({ title: 'Link atualizado!' });
    } catch (error) {
      console.error('[EditableLink] Save error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
      setEditLabel(label);
      setEditUrl(url);
      onSaveEnd?.(false);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  if (!editable) {
    return children || <span className={className}>{label}</span>;
  }

  return (
    <div
      className="relative group/edit-link inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-editable="link"
      data-section-key={sectionKey}
    >
      {/* VisionGlass Tooltip */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Link2 className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-foreground/80">Clique para editar link</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit popup */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 p-3 rounded-xl bg-background/95 backdrop-blur-xl border border-border shadow-xl"
          >
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Texto do botão</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm rounded-md border bg-background"
                  placeholder="Ex: Saiba mais"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">URL de destino</label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-sm rounded-md border bg-background"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditLabel(label);
                    setEditUrl(url);
                    setIsEditing(false);
                  }}
                  className="px-2 py-1 text-xs rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickable element */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={cn(
          "cursor-pointer transition-all",
          isHovered && !isEditing && "ring-2 ring-primary/20 ring-offset-2 rounded-lg",
          className
        )}
      >
        {children || <span>{label}</span>}
      </div>
    </div>
  );
};
