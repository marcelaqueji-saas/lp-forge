import { supabase } from "@/integrations/supabase/client";

export type PlanType = "free" | "pro" | "premium" | "master";

export interface PlanLimits {
  plan: PlanType;
  max_sites: number;
  max_storage_mb: number;
  custom_domain_limit: number;
  max_blocks: number;
  ab_testing_enabled: boolean;
  export_leads_enabled: boolean;
  premium_sections_enabled: boolean;
  can_edit_background: boolean;
  can_edit_gradients: boolean;
  can_edit_typography: boolean;
  can_edit_section_colors: boolean;
  can_edit_glass_effects: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  invoice_url: string | null;
}

// Master plan limits - unlimited everything
const MASTER_PLAN_LIMITS: PlanLimits = {
  plan: "master",
  max_sites: 999,
  max_storage_mb: 10240, // 10GB
  custom_domain_limit: 999,
  max_blocks: 999,
  ab_testing_enabled: true,
  export_leads_enabled: true,
  premium_sections_enabled: true,
  can_edit_background: true,
  can_edit_gradients: true,
  can_edit_typography: true,
  can_edit_section_colors: true,
  can_edit_glass_effects: true,
};

// Check if current user is admin_master
async function checkIsAdminMaster(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return !error && data?.role === "admin_master";
}

// Get effective plan limits for current user
export async function getEffectivePlanLimits(): Promise<PlanLimits | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check if user is admin_master FIRST
  const isAdminMaster = await checkIsAdminMaster(user.id);
  if (isAdminMaster) {
    return MASTER_PLAN_LIMITS;
  }

  const { data, error } = await supabase.rpc("get_effective_plan_limits", {
    _user_id: user.id,
  });

  if (error || !data || data.length === 0) {
    // Return free plan defaults
    return {
      plan: "free",
      max_sites: 1,
      max_storage_mb: 50,
      custom_domain_limit: 0,
      max_blocks: 2,
      ab_testing_enabled: false,
      export_leads_enabled: false,
      premium_sections_enabled: false,
      can_edit_background: false,
      can_edit_gradients: false,
      can_edit_typography: false,
      can_edit_section_colors: false,
      can_edit_glass_effects: false,
    };
  }

  return data[0] as PlanLimits;
}

// Get current user's subscription
export async function getCurrentSubscription(): Promise<Subscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("plan_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data as Subscription;
}

// Check if user can use a specific feature
export async function canUseFeature(feature: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("can_use_feature", {
    _user_id: user.id,
    _feature: feature,
  });

  return !error && data === true;
}

// Initiate checkout for a plan
export async function initiateCheckout(plan: "pro" | "premium"): Promise<{ url: string } | { error: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: "Not authenticated" };
  }

  const response = await supabase.functions.invoke("create-checkout", {
    body: { plan },
  });

  if (response.error) {
    return { error: response.error.message };
  }

  return response.data;
}

// Open customer portal
export async function openCustomerPortal(): Promise<{ url: string } | { error: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: "Not authenticated" };
  }

  const response = await supabase.functions.invoke("customer-portal", {});

  if (response.error) {
    return { error: response.error.message };
  }

  return response.data;
}

// Plan display info
export const PLAN_INFO = {
  free: {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    features: [
      "1 landing page",
      "2 blocos personalizáveis",
      "Modelos básicos",
      "50MB de armazenamento",
    ],
    limits: {
      blocks: 2,
      sites: 1,
      storage: 50,
    },
  },
  pro: {
    name: "Pro",
    price: "R$ 47",
    period: "/mês",
    features: [
      "3 landing pages",
      "5 blocos personalizáveis",
      "Modelos avançados",
      "Domínio personalizado",
      "500MB de armazenamento",
      "Exportar leads",
    ],
    limits: {
      blocks: 5,
      sites: 3,
      storage: 500,
    },
  },
  premium: {
    name: "Premium",
    price: "R$ 97",
    period: "/mês",
    features: [
      "Landing pages ilimitadas",
      "Blocos ilimitados",
      "Todos os modelos Premium",
      "Domínios ilimitados",
      "2GB de armazenamento",
      "Testes A/B",
      "Exportar leads",
      "Suporte prioritário",
    ],
    limits: {
      blocks: Infinity,
      sites: Infinity,
      storage: 2048,
    },
  },
  master: {
    name: "Master",
    price: "Ilimitado",
    period: "",
    features: [
      "Acesso total ao sistema",
      "LPs ilimitadas",
      "Blocos ilimitados",
      "Todos os recursos",
      "10GB de armazenamento",
      "Painel administrativo",
    ],
    limits: {
      blocks: Infinity,
      sites: Infinity,
      storage: 10240,
    },
  },
} as const;
