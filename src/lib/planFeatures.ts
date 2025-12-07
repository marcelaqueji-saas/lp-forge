/**
 * Sistema de gestão de features por plano
 * Centraliza verificações de limites e features
 */

import { supabase } from '@/integrations/supabase/client';
import { PlanFeature, planHasFeature } from './config';

// Cache de verificações para evitar múltiplas queries
const featureCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minuto

/**
 * Verifica se o usuário atual tem acesso a uma feature
 * Usa o plano do perfil do usuário
 */
export const userHasFeature = async (feature: PlanFeature): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;
  
  const cacheKey = `${session.user.id}:${feature}`;
  const cached = featureCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  // Buscar plano do usuário
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', session.user.id)
    .maybeSingle();
  
  const plan = profile?.plan || 'free';
  const result = planHasFeature(plan, feature);
  
  featureCache.set(cacheKey, { result, timestamp: Date.now() });
  
  return result;
};

/**
 * Limpa o cache de features (chamar após mudança de plano)
 */
export const clearFeatureCache = (): void => {
  featureCache.clear();
};

/**
 * Verifica múltiplas features de uma vez
 */
export const userHasFeatures = async (features: PlanFeature[]): Promise<Record<PlanFeature, boolean>> => {
  const results: Record<string, boolean> = {};
  
  for (const feature of features) {
    results[feature] = await userHasFeature(feature);
  }
  
  return results as Record<PlanFeature, boolean>;
};

/**
 * Retorna todas as features disponíveis para o plano atual
 */
export const getUserAvailableFeatures = async (): Promise<PlanFeature[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', session.user.id)
    .maybeSingle();
  
  const plan = profile?.plan || 'free';
  
  const allFeatures: PlanFeature[] = [
    'export_leads',
    'ab_testing',
    'advanced_integrations',
    'premium_sections',
    'custom_domain',
    'remove_branding',
  ];
  
  return allFeatures.filter(f => planHasFeature(plan, f));
};

/**
 * Verifica se pode criar mais LPs
 */
export const canCreateMoreLPs = async (): Promise<{ allowed: boolean; current: number; max: number }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { allowed: false, current: 0, max: 0 };
  
  // Buscar contagem atual
  const { count: currentCount } = await supabase
    .from('landing_pages')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', session.user.id);
  
  // Buscar limite do plano
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan')
    .eq('user_id', session.user.id)
    .maybeSingle();
  
  const plan = profile?.plan || 'free';
  
  const { data: limits } = await supabase
    .from('plan_limits')
    .select('max_sites')
    .eq('plan', plan)
    .maybeSingle();
  
  const current = currentCount || 0;
  const max = limits?.max_sites || 1;
  
  return {
    allowed: current < max,
    current,
    max,
  };
};

/**
 * Interface para exibição de upgrade
 */
export interface UpgradePromptConfig {
  feature: PlanFeature;
  title: string;
  description: string;
  requiredPlan: 'pro' | 'premium';
}

export const FEATURE_UPGRADE_PROMPTS: Record<PlanFeature, UpgradePromptConfig> = {
  export_leads: {
    feature: 'export_leads',
    title: 'Exportar Leads',
    description: 'Exporte seus leads em formato CSV para uso em outras ferramentas.',
    requiredPlan: 'pro',
  },
  ab_testing: {
    feature: 'ab_testing',
    title: 'Testes A/B',
    description: 'Compare diferentes versões da sua página para descobrir qual converte melhor.',
    requiredPlan: 'pro',
  },
  advanced_integrations: {
    feature: 'advanced_integrations',
    title: 'Integrações Avançadas',
    description: 'Conecte webhooks, CRMs e ferramentas externas.',
    requiredPlan: 'pro',
  },
  premium_sections: {
    feature: 'premium_sections',
    title: 'Seções Premium',
    description: 'Acesse layouts exclusivos e animações avançadas.',
    requiredPlan: 'pro',
  },
  custom_domain: {
    feature: 'custom_domain',
    title: 'Domínio Personalizado',
    description: 'Use seu próprio domínio para sua landing page.',
    requiredPlan: 'pro',
  },
  remove_branding: {
    feature: 'remove_branding',
    title: 'Remover Marca',
    description: 'Remova o selo "Feito com SaaS LP" da sua página.',
    requiredPlan: 'premium',
  },
};

/**
 * Retorna configuração de prompt de upgrade para uma feature
 */
export const getUpgradePrompt = (feature: PlanFeature): UpgradePromptConfig => {
  return FEATURE_UPGRADE_PROMPTS[feature];
};
