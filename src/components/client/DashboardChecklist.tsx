/**
 * DashboardChecklist - Componente de checklist para o Dashboard
 * Sprint 4.2: Mostra progresso de publicação com validação QA
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Rocket,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAllContent, getSettings, LPContent, LPSettings } from '@/lib/lpContentApi';

interface ChecklistItemData {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
}

interface DashboardChecklistProps {
  lpId: string;
  onPublish?: () => void;
}

export const DashboardChecklist = ({
  lpId,
  onPublish,
}: DashboardChecklistProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ChecklistItemData[]>([]);

  useEffect(() => {
    if (lpId) {
      loadChecklistItems();
    }
  }, [lpId]);

  const loadChecklistItems = async () => {
    setLoading(true);
    try {
      const [content, settings] = await Promise.all([
        getAllContent(lpId),
        getSettings(lpId),
      ]);

      const heroContent = content.hero || {};
      
      const checklistItems: ChecklistItemData[] = [
        {
          id: 'hero_title',
          label: 'Título do Hero preenchido',
          completed: !!(heroContent as any)?.titulo && (heroContent as any)?.titulo !== 'Título Principal',
          action: () => navigate(`/meu-site/${lpId}`),
        },
        {
          id: 'hero_cta',
          label: 'Botão CTA configurado',
          completed: !!(heroContent as any)?.cta_primary_label && !!(heroContent as any)?.cta_primary_url,
          action: () => navigate(`/meu-site/${lpId}`),
        },
        {
          id: 'extra_block',
          label: 'Pelo menos 1 bloco adicional',
          completed: Object.keys(content).filter(k => 
            !['menu', 'hero', 'rodape', '_initialized'].includes(k)
          ).length > 0,
          action: () => navigate(`/meu-site/${lpId}`),
        },
        {
          id: 'seo',
          label: 'SEO básico configurado',
          completed: !!(settings as any)?.meta_title || !!(settings as any)?.meta_description,
          action: () => navigate(`/admin/lp/${lpId}/estilos`),
        },
        {
          id: 'contact',
          label: 'Formulário de contato',
          completed: !!content.lead_form || !!content.chamada_final,
          action: () => navigate(`/meu-site/${lpId}`),
        },
      ];

      setItems(checklistItems);
      
      // QA Log
      const completedCount = checklistItems.filter(i => i.completed).length;
      console.log('[S4.2 QA] Publish checklist:', { 
        total: checklistItems.length, 
        completed: completedCount,
        percentage: Math.round((completedCount / checklistItems.length) * 100)
      });
    } catch (error) {
      console.error('[DashboardChecklist] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
  const canPublish = progress >= 80;

  if (loading) {
    return (
      <div className="glass-card p-4 md:p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 md:p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="font-semibold">Progresso para publicação</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {completedCount}/{items.length} itens
        </span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg transition-colors",
              item.completed ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={cn(
                "text-sm",
                item.completed && "text-green-700 dark:text-green-400"
              )}>
                {item.label}
              </span>
            </div>

            {!item.completed && item.action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={item.action}
                className="h-7 text-xs"
              >
                Configurar
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {progress >= 80 && onPublish && (
        <Button
          onClick={onPublish}
          disabled={!canPublish}
          className="w-full mt-4 bg-green-600 hover:bg-green-700"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Publicar página
        </Button>
      )}
    </motion.div>
  );
};

/**
 * AnalyticsPreview - Preview de analytics para o Dashboard
 */

interface AnalyticsData {
  views: number;
  leads: number;
  conversionRate: number;
}

interface AnalyticsPreviewProps {
  data: AnalyticsData;
  period?: string;
}

export const AnalyticsPreview = ({
  data,
  period = 'últimos 7 dias',
}: AnalyticsPreviewProps) => {
  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold">Analytics</span>
        <span className="text-xs text-muted-foreground">{period}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{data.views}</div>
          <div className="text-xs text-muted-foreground">Visualizações</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{data.leads}</div>
          <div className="text-xs text-muted-foreground">Leads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{data.conversionRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Conversão</div>
        </div>
      </div>
    </div>
  );
};

/**
 * NextSteps - Próximos passos sugeridos
 */

interface NextStep {
  id: string;
  title: string;
  description: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
}

interface NextStepsProps {
  steps: NextStep[];
}

export const NextSteps = ({ steps }: NextStepsProps) => {
  if (steps.length === 0) return null;

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
  };

  return (
    <div className="glass-card p-4 md:p-6">
      <h3 className="font-semibold mb-4">Próximos passos sugeridos</h3>
      
      <div className="space-y-3">
        {steps.slice(0, 3).map((step) => (
          <motion.button
            key={step.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={step.action}
            className={cn(
              "w-full text-left p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors",
              "border-l-4",
              priorityColors[step.priority]
            )}
          >
            <h4 className="font-medium text-sm">{step.title}</h4>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
