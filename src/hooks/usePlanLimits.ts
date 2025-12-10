import { useState, useEffect } from "react";
import { getEffectivePlanLimits, type PlanLimits } from "@/lib/billingApi";

export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchLimits() {
      try {
        const data = await getEffectivePlanLimits();
        if (mounted) {
          setLimits(data);
        }
      } catch (error) {
        console.error("Error fetching plan limits:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLimits();

    return () => {
      mounted = false;
    };
  }, []);

  const canAddBlock = (currentBlocks: number) => {
    if (!limits) return false;
    return currentBlocks < limits.max_blocks;
  };

  const canUseFeature = (feature: keyof PlanLimits) => {
    if (!limits) return false;
    return !!limits[feature];
  };

  const isPremiumSection = (sectionPlan: string) => {
    if (!limits) return true;
    const planOrder = { free: 0, pro: 1, premium: 2 };
    return planOrder[sectionPlan as keyof typeof planOrder] > planOrder[limits.plan];
  };

  return {
    limits,
    loading,
    plan: limits?.plan || "free",
    canAddBlock,
    canUseFeature,
    isPremiumSection,
  };
}
