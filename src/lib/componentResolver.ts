// src/lib/componentResolver.ts
import { SECTION_MODELS_BY_SECTION } from './sectionModels';
import type { SectionKey, SectionModel } from './sectionModels';
import type { PlanTier } from './authApi';

export function resolveModel(
  section: SectionKey,
  variant?: string,
  userPlan: PlanTier = 'free'
): SectionModel | null {
  const list = SECTION_MODELS_BY_SECTION[section];
  if (!list?.length) return null;

  // 1) Tenta variante exata
  const match = variant ? list.find(v => v.id === variant) : null;
  if (match && canUsePlan(match.plan, userPlan)) return match;

  // 2) Primeiro modelo que usuário pode usar
  const allowed = list.find(v => canUsePlan(v.plan, userPlan));
  if (allowed) return allowed;

  return list[0];
}

export function canUsePlan(min: PlanTier, user: PlanTier): boolean {
  const order = ['free', 'pro', 'premium'];
  return order.indexOf(user) >= order.indexOf(min);
}
