import { useState, useEffect, Suspense, lazy } from 'react';
import { Check, Lock, Sparkles, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { UpgradeModal } from '@/components/client/UpgradeModal';
import { useAuth } from '@/hooks/useAuth';
import { PlanTier } from '@/lib/authApi';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { isPremiumVariant } from '@/lib/premiumTemplateLoader';
import { 
  SECTION_MODELS_BY_SECTION, 
  SectionKey, 
  SectionModel,
  PlanLevel 
} from '@/lib/sectionModels';

interface LayoutOption {
  id: string;
  name: string;
  description: string;
  preview: string;
  minPlan?: PlanTier;
  category?: string;
  thumbnail?: string | null;
  isPremium?: boolean;
}

interface ModelConfig {
  id: string;
  enabled: boolean;
  visible_for_free: boolean;
  visible_for_pro: boolean;
  visible_for_premium: boolean;
  is_featured: boolean;
  sort_order: number;
}

interface LayoutPickerProps {
  open: boolean;
  onClose: () => void;
  sectionName: string;
  sectionKey?: string;
  currentVariant: string;
  variants: LayoutOption[];
  onSelect: (variantId: string) => void;
}

export const LayoutPicker = ({
  open,
  onClose,
  sectionName,
  sectionKey,
  currentVariant,
  variants,
  onSelect,
}: LayoutPickerProps) => {
  const [selected, setSelected] = useState(currentVariant);
  const [dbTemplates, setDbTemplates] = useState<LayoutOption[]>([]);
  const [modelConfigs, setModelConfigs] = useState<Record<string, ModelConfig>>({});
  const [loading, setLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [blockedPlan, setBlockedPlan] = useState<PlanTier>('pro');
  const isMobile = useIsMobile();
  const { profile, planLimits } = useAuth();

  const userPlan = (profile?.plan as PlanTier) || 'free';

  // Sync selected state when currentVariant changes
  useEffect(() => {
    if (currentVariant) {
      setSelected(currentVariant);
      console.log(`[LayoutPicker] Current variant synced: ${currentVariant}`);
    }
  }, [currentVariant, open]);

  // Load templates from DB and model configs when section changes
  useEffect(() => {
    if (open && sectionKey) {
      loadDbTemplates();
      loadModelConfigs();
    }
  }, [open, sectionKey]);

  const loadDbTemplates = async () => {
    if (!sectionKey) return;
    setLoading(true);

    const { data } = await supabase
      .from('section_templates')
      .select('*')
      .eq('section', sectionKey)
      .eq('is_active', true)
      .order('min_plan_tier', { ascending: true });

    if (data) {
      const mapped: LayoutOption[] = data.map(t => ({
        id: t.variant_id,
        name: t.name,
        description: t.description || '',
        preview: t.name,
        minPlan: t.min_plan_tier as PlanTier,
        category: t.category,
        thumbnail: t.preview_thumbnail,
        isPremium: isPremiumVariant(t.variant_id),
      }));
      setDbTemplates(mapped);
    }
    setLoading(false);
  };

  const loadModelConfigs = async () => {
    if (!sectionKey) return;
    
    // Carregar configs dos modelos da seção atual
    const sectionModels = SECTION_MODELS_BY_SECTION[sectionKey as SectionKey] || [];
    const modelIds = sectionModels.map(m => m.id);
    
    if (modelIds.length === 0) return;

    const { data } = await supabase
      .from('section_model_configs')
      .select('*')
      .in('id', modelIds);

    if (data) {
      const configMap: Record<string, ModelConfig> = {};
      data.forEach((item: any) => {
        configMap[item.id] = item as ModelConfig;
      });
      setModelConfigs(configMap);
    }
  };

  // Construir lista de variantes a partir de sectionModels + DB + fallback variants
  const buildVariantsList = (): LayoutOption[] => {
    const result: LayoutOption[] = [];
    const addedIds = new Set<string>();

    // 1. Adicionar modelos do sectionModels.ts filtrados por config
    if (sectionKey) {
      const sectionModels = SECTION_MODELS_BY_SECTION[sectionKey as SectionKey] || [];
      
      sectionModels.forEach((model: SectionModel) => {
        const config = modelConfigs[model.id];
        
        // Se config existe e enabled=false, não incluir (exceto se já está em uso)
        if (config && !config.enabled && currentVariant !== model.id) {
          return;
        }

        // Verificar visibilidade por plano
        if (config) {
          if (userPlan === 'free' && !config.visible_for_free) return;
          if (userPlan === 'pro' && !config.visible_for_pro) return;
          if (userPlan === 'premium' && !config.visible_for_premium) return;
        }

        const option: LayoutOption = {
          id: model.id,
          name: model.name,
          description: model.description || '',
          preview: model.name,
          minPlan: model.plan as PlanTier,
          isPremium: isPremiumVariant(model.id),
        };

        result.push(option);
        addedIds.add(model.id);
      });
    }

    // 2. Adicionar templates do banco que não estão no sectionModels
    dbTemplates.forEach(dbT => {
      if (!addedIds.has(dbT.id)) {
        result.push(dbT);
        addedIds.add(dbT.id);
      }
    });

    // 3. Adicionar variantes default que não foram incluídas
    variants.forEach(v => {
      if (!addedIds.has(v.id)) {
        result.push(v);
        addedIds.add(v.id);
      }
    });

    // Ordenar: featured primeiro, depois por sort_order
    return result.sort((a, b) => {
      const configA = modelConfigs[a.id];
      const configB = modelConfigs[b.id];
      
      // Featured primeiro
      if (configA?.is_featured && !configB?.is_featured) return -1;
      if (!configA?.is_featured && configB?.is_featured) return 1;
      
      // Depois por sort_order
      const orderA = configA?.sort_order ?? 999;
      const orderB = configB?.sort_order ?? 999;
      return orderA - orderB;
    });
  };

  const allVariants = buildVariantsList();
  const safeVariants = allVariants ?? [];

  const canUseVariant = (variant: LayoutOption): boolean => {
    if (!variant.minPlan) return true;
    
    const planOrder: PlanTier[] = ['free', 'pro', 'premium'];
    if (planOrder.indexOf(variant.minPlan) > planOrder.indexOf(userPlan)) {
      return false;
    }

    if (variant.category && planLimits?.allowed_model_categories) {
      if (!planLimits.allowed_model_categories.includes(variant.category)) {
        return false;
      }
    }

    return true;
  };

  const handleSelect = (variant: LayoutOption) => {
    if (!canUseVariant(variant)) {
      setBlockedPlan(variant.minPlan || 'pro');
      setUpgradeOpen(true);
      return;
    }
    
    console.log(`[LayoutPicker] Selecting variant: ${variant.id} for section: ${sectionKey}`);
    setSelected(variant.id);
    onSelect(variant.id);
  };

  // Don't render if no variants
  if (safeVariants.length === 0 && !loading) {
    return null;
  }

  const getPlanBadge = (plan?: PlanTier) => {
    if (!plan || plan === 'free') return null;
    return (
      <Badge 
        variant={plan === 'premium' ? 'default' : 'secondary'}
        className="text-[10px] px-1.5 py-0"
      >
        {plan.toUpperCase()}
      </Badge>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={
            isMobile 
              ? "h-[85vh] rounded-t-2xl" 
              : "w-full sm:max-w-lg"
          }
        >
          <SheetHeader className={isMobile ? "px-1" : ""}>
            <SheetTitle className={isMobile ? "text-lg" : ""}>
              Trocar layout - {sectionName}
            </SheetTitle>
            <SheetDescription className={isMobile ? "text-sm" : ""}>
              Escolha um modelo diferente para esta seção
            </SheetDescription>
          </SheetHeader>
          
          <div className={`mt-4 space-y-3 overflow-y-auto ${isMobile ? 'pb-8 max-h-[calc(85vh-120px)]' : 'mt-6 space-y-4'}`}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safeVariants.map((variant) => {
                  const canUse = canUseVariant(variant);
                  const isSelected = selected === variant.id;

                  return (
                    <div
                      key={variant.id}
                      className={cn(
                        "relative p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50',
                        !canUse && 'opacity-60'
                      )}
                      onClick={() => handleSelect(variant)}
                    >
                      {!canUse && (
                        <div className="absolute top-2 right-2 z-10">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      {isSelected && canUse && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}

                      {/* Thumbnail or placeholder */}
                      {variant.thumbnail ? (
                        <div className="aspect-video bg-muted rounded-lg mb-2 overflow-hidden">
                          <img 
                            src={variant.thumbnail} 
                            alt={variant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={cn(
                          "aspect-video bg-muted rounded-lg mb-2 flex items-center justify-center",
                          "text-muted-foreground text-xs"
                        )}>
                          {variant.preview}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">{variant.name}</h4>
                        {variant.isPremium && (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {getPlanBadge(variant.minPlan)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {variant.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="este modelo de seção"
        currentPlan={userPlan}
        requiredPlan={blockedPlan}
      />
    </>
  );
};

// Default variants for each section
export const SECTION_VARIANTS: Record<string, LayoutOption[]> = {
  menu: [
    { id: 'modelo_a', name: 'Modelo A - Horizontal', description: 'Logo à esquerda, links à direita', preview: '🏠 ← Links →' },
    { id: 'modelo_b', name: 'Modelo B - Centralizado', description: 'Logo centralizado, links abaixo', preview: '🏠\nLinks' },
  ],
  hero: [
    { id: 'modelo_a', name: 'Clássico', description: 'Imagem à direita, texto à esquerda', preview: '📷 ← Texto' },
    { id: 'modelo_b', name: 'Centralizado', description: 'Texto centralizado com imagem abaixo', preview: 'Texto ↓ 📷' },
    { id: 'modelo_c', name: 'Impactante', description: 'Imagem de fundo com texto sobreposto', preview: '🖼️ + Texto' },
    { id: 'hero_parallax', name: 'Parallax Mount', description: 'Hero fullscreen com camadas em parallax', preview: '✨ Parallax', minPlan: 'pro', category: 'animado', isPremium: true },
    { id: 'hero_split', name: 'Split Navigation', description: 'Colunas verticais interativas', preview: '| | | |', minPlan: 'pro', category: 'animado', isPremium: true },
  ],
  como_funciona: [
    { id: 'modelo_a', name: 'Modelo A - Passos', description: 'Cards em linha horizontal', preview: '1 → 2 → 3' },
    { id: 'modelo_b', name: 'Modelo B - Timeline', description: 'Lista vertical com ícones', preview: '↓ Steps' },
  ],
  para_quem_e: [
    { id: 'modelo_a', name: 'Modelo A - Cards', description: 'Perfis em cards lado a lado', preview: '□ □ □' },
    { id: 'modelo_b', name: 'Modelo B - Lista', description: 'Lista com checks e descrições', preview: '✓ ✓ ✓' },
  ],
  beneficios: [
    { id: 'modelo_a', name: 'Grid', description: 'Benefícios em grid de cards', preview: '□□\n□□' },
    { id: 'modelo_b', name: 'Lista', description: 'Lista vertical com ícones', preview: '↓ Items' },
    { id: 'modelo_c', name: 'Alternado', description: 'Ícones grandes alternados', preview: '← →' },
    { id: 'showcase_3d', name: '3D Cards Slider', description: 'Cards em 3D com rotação', preview: '🎴 3D', minPlan: 'pro', category: 'animado', isPremium: true },
    { id: 'features_float', name: 'Float Minimal', description: 'Benefícios com flutuação leve', preview: '☁️ Float', minPlan: 'free', category: 'avançado', isPremium: true },
  ],
  provas_sociais: [
    { id: 'modelo_a', name: 'Carrossel', description: 'Depoimentos em carrossel', preview: '← 💬 →' },
    { id: 'modelo_b', name: 'Grid', description: 'Cards de depoimentos em grid', preview: '💬 💬\n💬 💬' },
    { id: 'modelo_c', name: 'Destaque', description: 'Um destaque grande + menores', preview: '💬\n💬💬' },
    { id: 'testimonial_cinematic', name: 'Cinematic', description: 'Depoimento central com fade/shadow', preview: '🎬 Cine', minPlan: 'pro', category: 'animado', isPremium: true },
  ],
  planos: [
    { id: 'modelo_a', name: 'Modelo A - Colunas', description: 'Planos em colunas com destaque', preview: '| | ★ |' },
    { id: 'modelo_b', name: 'Modelo B - Cards', description: 'Cards horizontais com detalhes', preview: '═══' },
  ],
  faq: [
    { id: 'modelo_a', name: 'Modelo A - Acordeão', description: 'Perguntas expansíveis', preview: '▼ ▼ ▼' },
    { id: 'modelo_b', name: 'Modelo B - Duas colunas', description: 'Perguntas em duas colunas', preview: '? | ?' },
  ],
  chamada_final: [
    { id: 'modelo_a', name: 'Centralizado', description: 'CTA centralizado com destaque', preview: '⭐ CTA ⭐' },
    { id: 'modelo_b', name: 'Com imagem', description: 'CTA com imagem de fundo', preview: '🖼️ + CTA' },
    { id: 'modelo_c', name: 'Minimalista', description: 'Design limpo e direto', preview: '→ CTA' },
    { id: 'cta_final_animated', name: 'CTA Animado', description: 'Partículas flutuantes e botão animado', preview: '✨ Animado', minPlan: 'free', category: 'animado', isPremium: true },
  ],
  rodape: [
    { id: 'modelo_a', name: 'Modelo A - Linha única', description: 'Copyright e links na mesma linha', preview: '© ── Links' },
    { id: 'modelo_b', name: 'Modelo B - Duas linhas', description: 'Links acima, copyright abaixo', preview: 'Links\n───\n©' },
  ],
};