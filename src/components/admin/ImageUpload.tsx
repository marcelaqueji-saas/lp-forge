import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, Trash2, FolderOpen } from 'lucide-react';
import { uploadMedia, getMediaFiles, deleteMedia } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  lpId: string;
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const ImageUpload = ({ lpId, value, onChange, disabled, compact }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<{ name: string; url: string }[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const isMobile = useIsMobile();

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Apenas imagens são permitidas', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagem deve ter no máximo 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const url = await uploadMedia(lpId, file);
    setUploading(false);

    if (url) {
      onChange(url);
      toast({ title: 'Imagem enviada com sucesso!' });
    } else {
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
    }

    e.target.value = '';
  }, [lpId, onChange]);

  const loadLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    const files = await getMediaFiles(lpId);
    setLibraryImages(files);
    setLoadingLibrary(false);
  }, [lpId]);

  const handleOpenLibrary = () => {
    setShowLibrary(true);
    loadLibrary();
  };

  const handleSelectFromLibrary = (url: string) => {
    onChange(url);
    setShowLibrary(false);
  };

  const handleDeleteFromLibrary = async (fileName: string) => {
    const success = await deleteMedia(lpId, fileName);
    if (success) {
      setLibraryImages(prev => prev.filter(img => img.name !== fileName));
      toast({ title: 'Imagem excluída' });
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {value && (
          <div className="relative group w-20 h-20">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <label className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
            "border-2 border-dashed border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={disabled || uploading}
              className="sr-only"
            />
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Upload</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenLibrary}
            disabled={disabled}
            className="px-3"
          >
            <FolderOpen className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Library Sheet */}
        <Sheet open={showLibrary} onOpenChange={setShowLibrary}>
          <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[70vh]" : ""}>
            <SheetHeader>
              <SheetTitle>Biblioteca de Mídia</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto max-h-[60vh]">
              {loadingLibrary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : libraryImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma imagem na biblioteca
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {libraryImages.map((img) => (
                    <div key={img.name} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleSelectFromLibrary(img.url)}
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFromLibrary(img.name);
                        }}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 md:h-48 object-cover rounded-xl border border-border"
            loading="lazy"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload controls */}
      <div className="flex gap-2">
        <label className={cn(
          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-colors",
          "border-2 border-dashed border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={disabled || uploading}
            className="sr-only"
          />
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Fazer upload</span>
            </>
          )}
        </label>

        <Button
          type="button"
          variant="outline"
          onClick={handleOpenLibrary}
          disabled={disabled}
          className="px-4"
        >
          <ImageIcon className="w-5 h-5 md:mr-2" />
          <span className="hidden md:inline">Biblioteca</span>
        </Button>
      </div>

      {/* URL input */}
      <Input
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ou cole uma URL de imagem"
        disabled={disabled}
        className="text-sm"
      />

      {/* Library Sheet */}
      <Sheet open={showLibrary} onOpenChange={setShowLibrary}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={cn(
            isMobile ? "h-[80vh] rounded-t-2xl" : "w-full sm:max-w-lg"
          )}
        >
          <SheetHeader>
            <SheetTitle>Biblioteca de Mídia</SheetTitle>
          </SheetHeader>
          
          <div className="mt-4 overflow-y-auto" style={{ maxHeight: isMobile ? '65vh' : '80vh' }}>
            {loadingLibrary ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : libraryImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma imagem na biblioteca</p>
                <p className="text-sm mt-1">Faça upload de imagens para vê-las aqui</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {libraryImages.map((img) => (
                  <div key={img.name} className="relative group">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => handleSelectFromLibrary(img.url)}
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFromLibrary(img.name);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
