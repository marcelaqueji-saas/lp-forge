import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Lock, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/lib/authApi";
import {
  SECTION_MODELS_BY_SECTION,
  SectionKey,
  SectionModel,
} from "@/lib/sectionModels";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { setSectionModel } from "@/lib/lpContentApi";

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  sectionName: string;
  sectionKey: SectionKey;
  currentVariant: string;
  onSelect: (variantId: string) => void | Promise<void>;
  userPlan?: PlanTier;
  lpId: string;
  // novo: admin master enxerga tudo como no tier máximo,
  // mas ainda respeita se o modelo está habilitado ou não
  isAdminMaster?: boolean;
}

type SectionTemplateRow = Tables<"section_templates">;

interface ModelConfig {
  id: string;
  enabled: boolean;
  visible_for_free: boolean;
  visible_for_pro: boolean;
  visible_for_premium: boolean;
  is_featured: boolean;
  sort_order: number;
}

const DEFAULT_CONFIG: Omit<ModelConfig, "id"> = {
  enabled: true,
  visible_for_free: true,
  visible_for_pro: true,
  visible_for_premium: true,
  is_featured: false,
  sort_order: 0,
};

interface MergedVariant {
  model: SectionModel;
  config: ModelConfig;
  template?: Pick<
    SectionTemplateRow,
    "variant_id" | "category" | "preview_thumbnail" | "min_plan_tier"
  >;
}

const PLAN_ORDER: PlanTier[] = ["free", "pro", "premium"];

export const TemplatePicker = ({
  open,
  onClose,
  sectionName,
  sectionKey,
  currentVariant,
  onSelect,
  userPlan = "free",
  lpId,
  isAdminMaster = false,
}: TemplatePickerProps) => {
  const isMobile = useIsMobile();
  const [variants, setVariants] = useState<MergedVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadVariants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sectionKey]);

  const loadVariants = async () => {
    setLoading(true);

    const typedSectionKey = sectionKey as SectionKey;
    const baseModels = SECTION_MODELS_BY_SECTION[typedSectionKey] || [];

    if (baseModels.length === 0) {
      setVariants([]);
      setLoading(false);
      return;
    }

    const ids = baseModels.map((m) => m.id);

    const [configsRes, templatesRes] = await Promise.all([
      supabase.from("section_model_configs").select("*").in("id", ids),
      supabase
        .from("section_templates")
        .select(
          "variant_id, category, preview_thumbnail, min_plan_tier, section, is_active"
        )
        .eq("section", sectionKey)
        .eq("is_active", true),
    ]);

    const configMap: Record<string, ModelConfig> = {};
    if (configsRes.data) {
      configsRes.data.forEach((row: any) => {
        configMap[row.id] = {
          id: row.id,
          enabled: row.enabled ?? true,
          visible_for_free: row.visible_for_free ?? true,
          visible_for_pro: row.visible_for_pro ?? true,
          visible_for_premium: row.visible_for_premium ?? true,
          is_featured: row.is_featured ?? false,
          sort_order: row.sort_order ?? 0,
        };
      });
    }

    const templateMap: Record<string, MergedVariant["template"]> = {};
    if (templatesRes.data) {
      templatesRes.data.forEach((row: any) => {
        templateMap[row.variant_id] = {
          variant_id: row.variant_id,
          category: row.category,
          preview_thumbnail: row.preview_thumbnail,
          min_plan_tier: row.min_plan_tier,
        };
      });
    }

    const merged: MergedVariant[] = baseModels.map((model: SectionModel) => ({
      model,
      config: {
        id: model.id,
        ...(configMap[model.id] ?? DEFAULT_CONFIG),
      },
      template: templateMap[model.id],
    }));

    // Ordenação: destaque → plano → sort_order → nome
    merged.sort((a, b) => {
      if (a.config.is_featured !== b.config.is_featured) {
        return a.config.is_featured ? -1 : 1;
      }

      const planIndexA = PLAN_ORDER.indexOf(a.model.plan as PlanTier);
      const planIndexB = PLAN_ORDER.indexOf(b.model.plan as PlanTier);
      if (planIndexA !== planIndexB) {
        return planIndexA - planIndexB;
      }

      const orderA = a.config.sort_order ?? 0;
      const orderB = b.config.sort_order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.model.name.localeCompare(b.model.name);
    });

    setVariants(merged);
    setLoading(false);
  };

  const isVisibleForUserPlan = (variant: MergedVariant): boolean => {
    const cfg = variant.config;
    if (!cfg.enabled) return false;

    // admin master ainda respeita enabled/visible,
    // mas não sofre bloqueio de plano
    const effectivePlan: PlanTier = isAdminMaster ? "premium" : userPlan;

    const key: keyof ModelConfig =
      effectivePlan === "free"
        ? "visible_for_free"
        : effectivePlan === "pro"
        ? "visible_for_pro"
        : "visible_for_premium";

    return cfg[key] !== false;
  };

  const isLockedForUserPlan = (variant: MergedVariant): boolean => {
    // admin master nunca vê cadeado / trava
    if (isAdminMaster) return false;

    const minPlan = variant.model.plan as PlanTier;
    return PLAN_ORDER.indexOf(userPlan) < PLAN_ORDER.indexOf(minPlan);
  };

  const visibleVariants = variants.filter(isVisibleForUserPlan);

  const handleSelect = async (variantId: string) => {
    try {
      if (!lpId) {
        console.error("[TemplatePicker] lpId vazio/undefined ao trocar modelo", {
          variantId,
          sectionKey,
          sectionName,
        });
        toast({
          title: "Erro ao atualizar layout",
          description: "Não foi possível identificar a página desta seção.",
          variant: "destructive",
        });
        return;
      }

      setSavingId(variantId);

      const ok = await setSectionModel(lpId, sectionKey, variantId);
      if (!ok) {
        toast({
          title: "Erro ao atualizar layout",
          description: "Não foi possível salvar o modelo. Tente novamente.",
          variant: "destructive",
        });
        setSavingId(null);
        return;
      }

      await onSelect(variantId);

      toast({
        title: "Layout atualizado",
        description: "O modelo da seção foi alterado com sucesso.",
      });
      onClose();
    } catch (err) {
      console.error("Error selecting template", err);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um problema ao atualizar o layout.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          isMobile 
            ? "h-[90vh] rounded-t-3xl bg-card/95 px-4" 
            : "w-[420px] sm:w-[480px]"
        )}
      >
        <SheetHeader className="pb-3 sm:pb-4">
          <SheetTitle className="text-base sm:text-lg">Layout — {sectionName}</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">Escolha um modelo diferente</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-8 sm:py-10">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary" />
          </div>
        ) : visibleVariants.length === 0 ? (
          <div className="text-center text-xs sm:text-sm text-muted-foreground py-8 sm:py-10">
            Nenhum modelo disponível para esta seção.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto pr-0.5 sm:pr-1 -mr-1">
            {visibleVariants.map((variant) => {
              const { model, template, config } = variant;
              const locked = isLockedForUserPlan(variant);
              const selected = currentVariant === model.id;
              const isSaving = savingId === model.id;

              return (
                <button
                  type="button"
                  key={model.id}
                  className={cn(
                    "relative rounded-lg sm:rounded-xl border text-left p-2.5 sm:p-3 transition-colors w-full touch-manipulation",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 active:border-primary/70",
                    locked && "opacity-60 pointer-events-none",
                    isSaving && "opacity-70"
                  )}
                  onClick={() => handleSelect(model.id)}
                  disabled={isSaving}
                >
                  {template?.preview_thumbnail ? (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted mb-2">
                      <img
                        src={template.preview_thumbnail}
                        alt={model.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-muted rounded-md mb-2 text-[10px] sm:text-xs text-muted-foreground px-2 text-center">
                      {model.name}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-2">
                    <span className="text-xs sm:text-sm font-medium line-clamp-1 break-words">
                      {model.name}
                    </span>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {config.is_featured && (
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      )}
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-muted-foreground" />
                      ) : selected ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {model.description && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 break-words">
                      {model.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1.5 sm:mt-2 gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {model.plan && model.plan !== "free" && (
                        <Badge
                          variant={
                            model.plan === "premium" ? "default" : "secondary"
                          }
                          className="text-[8px] sm:text-[10px] px-1 py-0"
                        >
                          {model.plan.toUpperCase()}
                        </Badge>
                      )}

                      {template?.category && (
                        <Badge
                          variant="outline"
                          className="text-[8px] sm:text-[10px] capitalize px-1 py-0"
                        >
                          {template.category}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {locked && (
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TemplatePicker;
