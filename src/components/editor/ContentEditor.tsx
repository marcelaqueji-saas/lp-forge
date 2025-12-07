import { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { getSectionContent, saveSectionContent, LPContent } from '@/lib/lpContentApi';
import { toast } from '@/hooks/use-toast';
import { BeneficiosEditor } from './BeneficiosEditor';
import { PlanosEditor } from './PlanosEditor';
import { PerfisEditor } from './PerfisEditor';
import { DepoimentosEditor } from './DepoimentosEditor';
import { FAQEditor } from './FAQEditor';
import { MenuEditor } from './MenuEditor';
import { RodapeEditor } from './RodapeEditor';
import { PassosEditor } from './PassosEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getSectionModel, SectionKey, FieldConfig, ImageConfig } from '@/lib/sectionModels';

interface ContentEditorProps {
  open: boolean;
  onClose: () => void;
  lpId: string;
  sectionKey: string;
  sectionName: string;
  onSave: () => void;
}

export const ContentEditor = ({
  open,
  onClose,
  lpId,
  sectionKey,
  sectionName,
  onSave,
}: ContentEditorProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<LPContent>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open && lpId && sectionKey) {
      loadContent();
    }
  }, [open, lpId, sectionKey]);

  const loadContent = async () => {
    setLoading(true);
    const data = await getSectionContent(lpId, sectionKey);
    setContent(data);
    setLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await saveSectionContent(lpId, sectionKey, content);
    
    if (success) {
      toast({ title: 'Salvo!', description: 'Conteúdo atualizado com sucesso.' });
      onSave();
      onClose();
    } else {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' });
    }
    
    setSaving(false);
  };

  // Usar o sistema centralizado de modelos
  const variant = (content?.variant as string) || undefined;
  const sectionModel = getSectionModel(sectionKey as SectionKey, variant);
  
  const fields: FieldConfig[] = sectionModel?.fields ?? [];
  const hasJsonEditor = sectionModel?.hasJsonEditor ?? false;
  const sectionImages: ImageConfig[] = sectionModel?.images ?? [];
  const hasImages = sectionImages.length > 0;

  const renderJsonEditor = () => {
    const editorProps = {
      content,
      onChange: handleChange,
    };

    switch (sectionKey) {
      case 'menu':
        return <MenuEditor {...editorProps} />;
      case 'como_funciona':
        return <PassosEditor {...editorProps} />;
      case 'beneficios':
        return <BeneficiosEditor {...editorProps} />;
      case 'planos':
        return <PlanosEditor {...editorProps} />;
      case 'para_quem_e':
        return <PerfisEditor {...editorProps} />;
      case 'provas_sociais':
        return <DepoimentosEditor {...editorProps} />;
      case 'faq':
        return <FAQEditor {...editorProps} />;
      case 'rodape':
        return <RodapeEditor {...editorProps} />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"} 
        className={
          isMobile 
            ? "h-[85vh] rounded-t-2xl flex flex-col p-0" 
            : "w-full sm:max-w-lg overflow-y-auto"
        }
      >
        {/* Header */}
        <div className={isMobile ? "px-4 pt-4 pb-2 border-b shrink-0" : ""}>
          <SheetHeader className={isMobile ? "space-y-1" : ""}>
            <SheetTitle className={isMobile ? "text-lg" : ""}>
              Editar - {sectionName}
            </SheetTitle>
            <SheetDescription className={isMobile ? "text-sm" : ""}>
              Altere os textos, imagens e conteúdo desta seção
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Content area */}
        <div className={
          isMobile 
            ? "flex-1 overflow-y-auto px-4 py-4" 
            : "mt-6 space-y-6"
        }>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={['texts', 'content']} className="space-y-2">
              {/* Text fields */}
              {fields.length > 0 && (
                <AccordionItem value="texts" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium py-3">
                    Textos e Links
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className={isMobile ? "space-y-3 pb-2" : "space-y-4 pb-3"}>
                      {fields.map((field) => (
                        <div key={field.key} className={isMobile ? "space-y-1.5" : "space-y-2"}>
                          <Label htmlFor={field.key} className={isMobile ? "text-sm" : ""}>
                            {field.label}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea
                              id={field.key}
                              value={content[field.key] || ''}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              rows={isMobile ? 2 : 3}
                              className={isMobile ? "text-base min-h-[60px]" : ""}
                            />
                          ) : (
                            <Input
                              id={field.key}
                              type={field.type === 'url' ? 'url' : 'text'}
                              value={content[field.key] || ''}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              placeholder={field.type === 'url' ? 'https://...' : ''}
                              className={isMobile ? "text-base h-11" : ""}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {/* Images */}
              {hasImages && sectionImages.length > 0 && (
                <AccordionItem value="images" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium py-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Imagens
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pb-3">
                      {sectionImages.map((img) => (
                        <div key={img.key} className="space-y-2">
                          <Label>{img.label}</Label>
                          <ImageUpload
                            lpId={lpId}
                            value={content[img.key] || ''}
                            onChange={(url) => handleChange(img.key, url)}
                            compact={isMobile}
                          />
                        </div>
                      ))}
                      {/* Also check for legacy image field */}
                      {sectionKey === 'hero' && (
                        <div className="space-y-2">
                          <Label>Imagem principal (legado)</Label>
                          <ImageUpload
                            lpId={lpId}
                            value={content['imagem_principal'] || ''}
                            onChange={(url) => handleChange('imagem_principal', url)}
                            compact={isMobile}
                          />
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {/* JSON list editors */}
              {hasJsonEditor && (
                <AccordionItem value="content" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium py-3">
                    Conteúdo Avançado
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pb-3">
                      {renderJsonEditor()}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {fields.length === 0 && !hasJsonEditor && !hasImages && (
                <p className="text-sm text-muted-foreground py-4">
                  Para editar conteúdos avançados desta seção, acesse o painel completo.
                </p>
              )}
            </Accordion>
          )}
        </div>
        
        {/* Footer - fixed on mobile */}
        <div className={
          isMobile 
            ? "shrink-0 px-4 py-3 border-t bg-card flex gap-2" 
            : "mt-6 flex gap-2 justify-end"
        }>
          <Button 
            variant="outline" 
            onClick={onClose}
            className={isMobile ? "flex-1 h-11" : ""}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
            className={isMobile ? "flex-1 h-11" : ""}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
