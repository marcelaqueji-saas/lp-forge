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

export interface LayoutOption {
  id: string;
  name: string;
  description?: string;
  category?: string;
  minPlan?: PlanTier;
  thumbnail?: string | null;
  componenteFront?: string | null;
}

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  sectionName: string;
  sectionKey: string;
  currentVariant: string;
  onSelect: (variantId: string) => void;
  userPlan?: PlanTier;
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
}: TemplatePickerProps) => {
  const isMobile = useIsMobile();
  const [dbTemplates, setDbTemplates] = useState<LayoutOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadDbTemplates();
  }, [open, sectionKey]);

  const loadDbTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("section_templates")
      .select("*")
      .eq("section", sectionKey)
      .eq("is_active", true)
      .order("min_plan_tier", { ascending: true })
      .order("created_at", { ascending: true });

    if (data) {
      const mapped = data.map((t) => ({
        id: t.variant_id,
        name: t.name,
        description: t.description,
        minPlan: (t.min_plan_tier as PlanTier) || "free",
        category: t.category,
        thumbnail: t.preview_thumbnail,
        componenteFront: t.componente_front,
      }));
      setDbTemplates(mapped);
    }

    setLoading(false);
  };

  const allVariants: LayoutOption[] = dbTemplates;

  const canUse = (variant: LayoutOption): boolean => {
    if (!variant.minPlan) return true;
    return PLAN_ORDER.indexOf(userPlan) >= PLAN_ORDER.indexOf(variant.minPlan);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[85vh] rounded-t-3xl bg-card/95" : "w-[420px]"}
      >
        <SheetHeader className="pb-4">
          <SheetTitle>Layout — {sectionName}</SheetTitle>
          <SheetDescription>Escolha um modelo diferente</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : allVariants.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-10">
            Nenhum template disponível para esta seção.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {allVariants.map((variant) => {
              const locked = !canUse(variant);
              const selected = currentVariant === variant.id;

              return (
                <div
                  key={variant.id}
                  className={cn(
                    "relative rounded-xl border cursor-pointer p-3",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                    locked && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => onSelect(variant.id)}
                >
                  {variant.thumbnail ? (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted mb-2">
                      <img
                        src={variant.thumbnail}
                        alt={variant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-muted rounded-md mb-2 text-xs text-muted-foreground">
                      {variant.name}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {variant.name}
                    </span>

                    {selected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    {variant.minPlan === "premium" && (
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {variant.description}
                  </p>

                  <div className="flex justify-between mt-2">
                    {variant.minPlan && variant.minPlan !== "free" && (
                      <Badge
                        variant={
                          variant.minPlan === "premium"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] px-1"
                      >
                        {variant.minPlan.toUpperCase()}
                      </Badge>
                    )}

                    {variant.category && (
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {variant.category}
                      </Badge>
                    )}

                    {locked && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TemplatePicker;
