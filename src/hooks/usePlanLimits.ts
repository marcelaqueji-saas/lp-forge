import { useState, useEffect } from "react";
import { getEffectivePlanLimits, type PlanLimits, type PlanType } from "@/lib/billingApi";

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

  const isMaster = limits?.plan === "master";

  const canAddBlock = (currentBlocks: number) => {
    if (!limits) return false;
    if (isMaster) return true; // Master has unlimited
    return currentBlocks < limits.max_blocks;
  };

  const canUseFeature = (feature: keyof PlanLimits) => {
    if (!limits) return false;
    if (isMaster) return true; // Master has all features
    return !!limits[feature];
  };

  const isPremiumSection = (sectionPlan: string) => {
    if (!limits) return true;
    if (isMaster) return false; // Master can use all sections
    const planOrder = { free: 0, pro: 1, premium: 2, master: 3 };
    return planOrder[sectionPlan as keyof typeof planOrder] > planOrder[limits.plan];
  };

  return {
    limits,
    loading,
    plan: (limits?.plan || "free") as PlanType,
    isMaster,
    canAddBlock,
    canUseFeature,
    isPremiumSection,
  };
}
