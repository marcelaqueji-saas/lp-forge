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
      className="relative group/edit inline-block w-full max-w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 1000)}
      data-editable="text"
      data-section-key={sectionKey}
      data-field-key={fieldKey}
    >
      {/* VisionGlass Tooltip - Hidden on mobile, shown on hover for desktop */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden sm:block"
          >
            <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Pencil className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-foreground/80">Clique para editar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VisionGlass Outline - Mobile-optimized */}
      <div
        className={cn(
          "absolute -inset-1 rounded-lg transition-all duration-200 pointer-events-none",
          isHovered && !isEditing && "ring-2 ring-primary/20 bg-primary/5",
          isEditing && "ring-2 ring-primary/40 bg-primary/10"
        )}
      />

      {/* Element - Mobile-first responsive */}
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
          "relative outline-none transition-all duration-200 w-full max-w-full",
          "break-words whitespace-normal overflow-wrap-anywhere",
          "touch-manipulation", // Better touch handling
          editable && !isEditing && "cursor-pointer active:bg-primary/5",
          isEditing && "px-2 py-2 sm:py-1 text-base sm:text-inherit min-h-[44px] sm:min-h-[1em]", // Mobile touch target
          !value && !isEditing && "text-muted-foreground/50 italic"
        )}
        style={{ 
          minHeight: isEditing ? '44px' : '1em',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {isEditing ? localValue : (value || placeholder)}
      </Tag>

      {/* Saving indicator - Mobile-optimized position */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-0 sm:-right-3 top-0 sm:-top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground animate-spin" />
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
      className={cn(
        "relative group/edit-img cursor-pointer w-full max-w-full touch-manipulation",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 1500)}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* VisionGlass Tooltip - Desktop only */}
      <AnimatePresence>
        {isHovered && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden sm:block"
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

      {/* Image or placeholder - Mobile responsive */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "object-cover w-full h-auto max-w-full rounded-xl transition-all",
            aspectClasses[aspectRatio]
          )}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            "bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/20",
            "min-h-[120px] sm:min-h-[150px]",
            aspectClasses[aspectRatio]
          )}
        >
          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground text-center px-2">{placeholder}</span>
        </div>
      )}

      {/* VisionGlass Overlay - Always visible on mobile when hovered */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl transition-all flex items-center justify-center",
          isHovered && !isUploading && "bg-black/30 backdrop-blur-[2px]",
          isUploading && "bg-black/50"
        )}
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
        ) : isHovered ? (
          <div className="text-center text-white p-2">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1" />
            <span className="text-xs sm:text-sm font-medium">
              {src ? 'Trocar' : 'Adicionar'}
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
      {/* VisionGlass Tooltip - Desktop only */}
      <AnimatePresence>
        {isHovered && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden sm:block"
          >
            <div className="px-3 py-1.5 rounded-lg bg-background/95 backdrop-blur-xl border border-border/50 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
              <Link2 className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-foreground/80">Clique para editar link</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit popup - Mobile-optimized: fixed bottom on mobile, absolute on desktop */}
      <AnimatePresence>
        {isEditing && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditLabel(label);
                setEditUrl(url);
                setIsEditing(false);
              }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "z-50 p-4 sm:p-3 rounded-t-2xl sm:rounded-xl bg-background/98 backdrop-blur-xl border border-border shadow-2xl sm:shadow-xl",
                // Mobile: fixed at bottom, full-width
                "fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto",
                // Desktop: absolute positioned below element
                "sm:absolute sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:mt-2 sm:w-72"
              )}
            >
              <div className="space-y-4 sm:space-y-3">
                {/* Mobile handle */}
                <div className="sm:hidden flex justify-center pb-2">
                  <div className="w-12 h-1 bg-muted rounded-full" />
                </div>
                <div>
                  <label className="text-sm sm:text-xs text-muted-foreground">Texto do botão</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full mt-1.5 sm:mt-1 px-3 sm:px-2 py-2.5 sm:py-1.5 text-base sm:text-sm rounded-lg sm:rounded-md border bg-background touch-manipulation"
                    placeholder="Ex: Saiba mais"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm sm:text-xs text-muted-foreground">URL de destino</label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full mt-1.5 sm:mt-1 px-3 sm:px-2 py-2.5 sm:py-1.5 text-base sm:text-sm rounded-lg sm:rounded-md border bg-background touch-manipulation"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 sm:pt-0 pb-safe">
                  <button
                    onClick={() => {
                      setEditLabel(label);
                      setEditUrl(url);
                      setIsEditing(false);
                    }}
                    className="px-4 sm:px-2 py-2.5 sm:py-1 text-sm sm:text-xs rounded-lg sm:rounded-md hover:bg-muted touch-manipulation min-h-[44px] sm:min-h-0"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 sm:px-2 py-2.5 sm:py-1 text-sm sm:text-xs rounded-lg sm:rounded-md bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation min-h-[44px] sm:min-h-0"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clickable element - Touch optimized */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setTimeout(() => setIsHovered(false), 800)}
        className={cn(
          "cursor-pointer transition-all touch-manipulation",
          isHovered && !isEditing && "ring-2 ring-primary/20 ring-offset-2 rounded-lg",
          className
        )}
      >
        {children || <span>{label}</span>}
      </div>
    </div>
  );
};
