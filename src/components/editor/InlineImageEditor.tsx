/**
 * InlineImageEditor - Edição inline de imagem
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PlanLevel } from '@/lib/sectionModels';
import { PLAN_LIMITS } from '@/lib/blockEditorTypes';

interface InlineImageEditorProps {
  value?: string;
  onChange: (url: string) => void;
  onSave?: () => void;
  lpId: string;
  userPlan: PlanLevel;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  className?: string;
  disabled?: boolean;
}

export const InlineImageEditor = ({
  value,
  onChange,
  onSave,
  lpId,
  userPlan,
  placeholder = 'Clique para adicionar imagem',
  aspectRatio = 'video',
  className,
  disabled = false,
}: InlineImageEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
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

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      toast({
        title: 'Arquivo muito grande',
        description: `Tamanho máximo: ${maxFileSizeMB}MB (seu plano: ${userPlan})`,
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo inválido',
        description: 'Apenas imagens são permitidas',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

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

      onChange(publicUrl);
      onSave?.();
      setIsOpen(false);
      toast({ title: 'Imagem enviada!' });
    } catch (error) {
      console.error('[InlineImageEditor] Upload error:', error);
      toast({
        title: 'Erro ao enviar imagem',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    onSave?.();
  };

  if (disabled) {
    return value ? (
      <img src={value} alt="" className={cn("object-cover rounded-xl", aspectClasses[aspectRatio], className)} />
    ) : (
      <div className={cn("bg-muted/50 rounded-xl flex items-center justify-center", aspectClasses[aspectRatio], className)}>
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-transparent",
          "hover:border-primary/30 transition-all group",
          aspectClasses[aspectRatio],
          className
        )}
      >
        {value ? (
          <>
            <img 
              src={value} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Trocar imagem
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-muted/30 flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </div>
        )}
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar imagem</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-24 border-2 border-dashed"
              variant="outline"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm">Fazer upload (máx {maxFileSizeMB}MB)</span>
                </div>
              )}
            </Button>

            {value && (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={value} alt="" className="w-full h-full object-cover" />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover imagem
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
