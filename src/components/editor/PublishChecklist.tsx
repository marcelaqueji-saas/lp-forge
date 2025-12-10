/**
 * PublishChecklist - Checklist visual para publicação da LP
 * Sprint 4: Mostra progresso e itens pendentes antes de publicar
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  Rocket,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getAllContent, getSettings, LPContent, LPSettings } from '@/lib/lpContentApi';

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  required: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface PublishChecklistProps {
  open: boolean;
  onClose: () => void;
  lpId: string;
  slug: string;
  isPublished: boolean;
  onPublish: () => void;
}

export const PublishChecklist = ({
  open,
  onClose,
  lpId,
  slug,
  isPublished,
  onPublish,
}: PublishChecklistProps) => {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);

  const publicUrl = `${window.location.origin}/lp/${slug}`;

  // Load checklist items based on LP content
  useEffect(() => {
    if (open && lpId) {
      loadChecklistItems();
    }
  }, [open, lpId]);

  const loadChecklistItems = async () => {
    setLoading(true);
    try {
      const [content, settings] = await Promise.all([
        getAllContent(lpId),
        getSettings(lpId),
      ]);

      const checklistItems = generateChecklistItems(content, settings);
      setItems(checklistItems);
    } catch (error) {
      console.error('[PublishChecklist] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChecklistItems = (
    content: Record<string, LPContent>,
    settings: LPSettings
  ): ChecklistItem[] => {
    const heroContent = content.hero || {};
    const menuContent = content.menu || {};
    
    return [
      {
        id: 'hero_title',
        label: 'Título do Hero',
        description: 'Defina um título atrativo para sua página',
        completed: !!(heroContent as any)?.titulo && (heroContent as any)?.titulo !== 'Título Principal',
        required: true,
      },
      {
        id: 'hero_cta',
        label: 'Botão CTA configurado',
        description: 'Configure o texto e link do botão principal',
        completed: !!(heroContent as any)?.cta_primary_label && !!(heroContent as any)?.cta_primary_url,
        required: true,
      },
      {
        id: 'extra_block',
        label: 'Bloco adicional',
        description: 'Adicione pelo menos um bloco além do Hero',
        completed: Object.keys(content).filter(k => 
          !['menu', 'hero', 'rodape', '_initialized'].includes(k)
        ).length > 0,
        required: false,
      },
      {
        id: 'seo_title',
        label: 'SEO - Título',
        description: 'Configure o título para mecanismos de busca',
        completed: !!(settings as any)?.meta_title,
        required: false,
      },
      {
        id: 'seo_description',
        label: 'SEO - Descrição',
        description: 'Configure a descrição para mecanismos de busca',
        completed: !!(settings as any)?.meta_description,
        required: false,
      },
      {
        id: 'contact_form',
        label: 'Formulário de contato',
        description: 'Adicione um formulário para capturar leads',
        completed: !!content.lead_form || !!content.chamada_final,
        required: false,
      },
    ];
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const requiredIncomplete = items.filter(i => i.required && !i.completed);
  const canPublish = requiredIncomplete.length === 0;

  const handlePublish = async () => {
    if (!canPublish) {
      toast({ 
        title: 'Complete os itens obrigatórios', 
        description: 'Há itens pendentes que precisam ser completados antes de publicar.',
        variant: 'destructive' 
      });
      return;
    }
    
    setPublishing(true);
    try {
      await Promise.resolve(onPublish());
      toast({ title: 'Página publicada com sucesso!' });
      onClose();
    } catch (error) {
      toast({ title: 'Erro ao publicar', variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast({ title: 'URL copiada!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            {isPublished ? 'Página Publicada' : 'Publicar Página'}
          </DialogTitle>
          <DialogDescription>
            {isPublished
              ? 'Sua página está no ar e acessível publicamente.'
              : 'Revise os itens abaixo antes de publicar.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{completedCount}/{totalCount} itens</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <Badge variant={isPublished ? 'default' : 'secondary'}>
                {isPublished ? 'Publicado' : 'Rascunho'}
              </Badge>
              {canPublish && !isPublished && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  Pronto para publicar
                </Badge>
              )}
            </div>

            {/* Public URL */}
            {isPublished && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{publicUrl}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Checklist items */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                      item.completed
                        ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                        : item.required
                        ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"
                        : "bg-muted/50 border-border"
                    )}
                  >
                    <div className="mt-0.5">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : item.required ? (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.required && !item.completed && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Fechar
              </Button>
              
              {isPublished ? (
                <Button onClick={() => window.open(publicUrl, '_blank')} className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir página
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={!canPublish || publishing}
                  className="flex-1"
                >
                  {publishing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-2" />
                  )}
                  {publishing ? 'Publicando...' : 'Publicar agora'}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Hook para usar o checklist de forma standalone
export function usePublishChecklist(lpId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lpId) {
      loadItems();
    }
  }, [lpId]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const [content, settings] = await Promise.all([
        getAllContent(lpId),
        getSettings(lpId),
      ]);

      const heroContent = content.hero || {};
      
      const checklistItems: ChecklistItem[] = [
        {
          id: 'hero_title',
          label: 'Título do Hero',
          description: 'Defina um título atrativo',
          completed: !!(heroContent as any)?.titulo,
          required: true,
        },
        {
          id: 'hero_cta',
          label: 'Botão CTA',
          description: 'Configure o botão principal',
          completed: !!(heroContent as any)?.cta_primary_label,
          required: true,
        },
        {
          id: 'extra_block',
          label: 'Bloco adicional',
          description: 'Pelo menos um bloco extra',
          completed: Object.keys(content).filter(k => 
            !['menu', 'hero', 'rodape', '_initialized'].includes(k)
          ).length > 0,
          required: false,
        },
        {
          id: 'seo',
          label: 'SEO configurado',
          description: 'Título e descrição para busca',
          completed: !!(settings as any)?.meta_title,
          required: false,
        },
      ];

      setItems(checklistItems);
    } catch (error) {
      console.error('[usePublishChecklist] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const canPublish = items.filter(i => i.required && !i.completed).length === 0;

  return {
    items,
    loading,
    completedCount,
    totalCount,
    progress,
    canPublish,
    refresh: loadItems,
  };
}
