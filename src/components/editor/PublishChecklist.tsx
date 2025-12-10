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
  lpSlug: string;
  isPublished: boolean;
  onPublish: () => Promise<void>;
  items: ChecklistItem[];
}

export const PublishChecklist = ({
  open,
  onClose,
  lpSlug,
  isPublished,
  onPublish,
  items,
}: PublishChecklistProps) => {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = (completedCount / totalCount) * 100;
  const requiredIncomplete = items.filter(i => i.required && !i.completed);
  const canPublish = requiredIncomplete.length === 0;

  const publicUrl = `${window.location.origin}/lp/${lpSlug}`;

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    try {
      await onPublish();
      toast({ title: 'Página publicada com sucesso!' });
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

        <div className="space-y-5 py-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={isPublished ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isPublished && 'bg-green-500 hover:bg-green-600'
              )}
            >
              {isPublished ? 'Publicado' : 'Rascunho'}
            </Badge>
            {canPublish && !isPublished && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                Pronto para publicar
              </Badge>
            )}
          </div>

          {/* URL pública */}
          {isPublished && (
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <span className="text-xs text-muted-foreground">URL pública</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm truncate">{publicUrl}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(publicUrl, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Checklist items */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Checklist de lançamento</span>
            <div className="space-y-1.5">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-colors',
                      item.completed
                        ? 'bg-green-50 dark:bg-green-950/20'
                        : 'bg-muted/30'
                    )}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : item.required ? (
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            item.completed && 'text-green-700 dark:text-green-400'
                          )}
                        >
                          {item.label}
                        </span>
                        {item.required && !item.completed && (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {item.action && !item.completed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                        className="shrink-0 text-xs"
                      >
                        {item.actionLabel || 'Configurar'}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          {!isPublished && (
            <Button
              onClick={handlePublish}
              disabled={!canPublish || publishing}
              className={cn(
                'gap-2',
                canPublish && 'bg-green-600 hover:bg-green-700'
              )}
            >
              <Rocket className="w-4 h-4" />
              {publishing ? 'Publicando...' : 'Publicar agora'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook para gerar checklist items baseado no conteúdo da LP
export function usePublishChecklist(
  content: Record<string, any>,
  settings: Record<string, any>,
  onNavigate: (section: string) => void
): ChecklistItem[] {
  const heroContent = content?.hero || {};
  const menuContent = content?.menu || {};
  
  const hasHeroTitle = Boolean(heroContent?.titulo || heroContent?.title);
  const hasHeroCTA = Boolean(heroContent?.cta_primary_label || heroContent?.cta_label);
  const hasHeroImage = Boolean(heroContent?.imagem_url || heroContent?.image_url);
  
  const hasSEOTitle = Boolean(settings?.meta_title);
  const hasSEODescription = Boolean(settings?.meta_description);
  
  const dynamicSections = Object.keys(content).filter(
    k => !['menu', 'hero', 'rodape', '_initialized'].includes(k)
  );
  const hasExtraBlock = dynamicSections.length > 0;

  const hasContactMethod = Boolean(
    heroContent?.cta_primary_url ||
    content?.chamada_final?.cta_url ||
    content?.lead_form
  );

  return [
    {
      id: 'hero-title',
      label: 'Título principal definido',
      description: 'O Hero precisa de um título chamativo',
      completed: hasHeroTitle,
      required: true,
      action: () => onNavigate('hero'),
      actionLabel: 'Editar Hero',
    },
    {
      id: 'hero-cta',
      label: 'Botão de ação configurado',
      description: 'Configure o CTA principal do Hero',
      completed: hasHeroCTA,
      required: true,
      action: () => onNavigate('hero'),
      actionLabel: 'Adicionar CTA',
    },
    {
      id: 'extra-block',
      label: 'Pelo menos 1 bloco adicional',
      description: 'Adicione conteúdo além do Hero (benefícios, depoimentos, etc)',
      completed: hasExtraBlock,
      required: true,
      action: () => onNavigate('add-block'),
      actionLabel: 'Adicionar bloco',
    },
    {
      id: 'seo-title',
      label: 'Título SEO definido',
      description: 'Configure o título para mecanismos de busca',
      completed: hasSEOTitle,
      required: false,
      action: () => onNavigate('settings'),
      actionLabel: 'Configurar SEO',
    },
    {
      id: 'seo-description',
      label: 'Descrição SEO definida',
      description: 'Configure a descrição para mecanismos de busca',
      completed: hasSEODescription,
      required: false,
      action: () => onNavigate('settings'),
      actionLabel: 'Configurar SEO',
    },
    {
      id: 'contact',
      label: 'Forma de contato configurada',
      description: 'Links de CTA ou formulário de contato',
      completed: hasContactMethod,
      required: false,
      action: () => onNavigate('chamada_final'),
      actionLabel: 'Configurar',
    },
  ];
}
