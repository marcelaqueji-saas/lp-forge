/**
 * Block Editor Types - Sistema de Editor por Blocos
 * Centraliza tipos e constantes para o novo sistema de edição
 */

import { SectionKey, PlanLevel } from './sectionModels';

// ============================================================
// TIPOS DE BLOCOS
// ============================================================

export type BlockCategory = 
  | 'navigation'  // menu
  | 'hero'        // seções de destaque
  | 'content'     // conteúdo geral
  | 'social'      // provas sociais
  | 'pricing'     // planos
  | 'faq'         // perguntas frequentes
  | 'cta'         // chamadas para ação
  | 'footer';     // rodapé

export interface BlockDefinition {
  key: SectionKey;
  name: string;
  description: string;
  category: BlockCategory;
  isFixed: boolean;       // Menu, Hero, Footer são fixos
  canRemove: boolean;     // Pode ser removido
  canReorder: boolean;    // Pode ser reordenado
  defaultOrder: number;   // Ordem padrão
}

export interface EditorBlock {
  id: string;             // UUID único do bloco
  sectionKey: SectionKey;
  modelId: string;        // ID do modelo selecionado
  order: number;          // Posição na lista
  content: Record<string, any>;
  isNew?: boolean;        // Acabou de ser adicionado (para animação)
}

// ============================================================
// DEFINIÇÕES DE BLOCOS DISPONÍVEIS
// ============================================================

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    key: 'menu',
    name: 'Menu',
    description: 'Navegação do site',
    category: 'navigation',
    isFixed: true,
    canRemove: false,
    canReorder: false,
    defaultOrder: 0,
  },
  {
    key: 'hero',
    name: 'Hero',
    description: 'Seção principal de destaque',
    category: 'hero',
    isFixed: true,
    canRemove: false,
    canReorder: false,
    defaultOrder: 1,
  },
  {
    key: 'como_funciona',
    name: 'Como Funciona',
    description: 'Passos do seu processo',
    category: 'content',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 2,
  },
  {
    key: 'para_quem_e',
    name: 'Para Quem É',
    description: 'Perfis do público-alvo',
    category: 'content',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 3,
  },
  {
    key: 'beneficios',
    name: 'Benefícios',
    description: 'Vantagens do seu produto/serviço',
    category: 'content',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 4,
  },
  {
    key: 'provas_sociais',
    name: 'Provas Sociais',
    description: 'Depoimentos de clientes',
    category: 'social',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 5,
  },
  {
    key: 'planos',
    name: 'Planos e Preços',
    description: 'Tabela de preços',
    category: 'pricing',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 6,
  },
  {
    key: 'faq',
    name: 'FAQ',
    description: 'Perguntas frequentes',
    category: 'faq',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 7,
  },
  {
    key: 'chamada_final',
    name: 'Chamada Final',
    description: 'CTA final da página',
    category: 'cta',
    isFixed: false,
    canRemove: true,
    canReorder: true,
    defaultOrder: 8,
  },
  {
    key: 'rodape',
    name: 'Rodapé',
    description: 'Informações de contato e links',
    category: 'footer',
    isFixed: true,
    canRemove: false,
    canReorder: false,
    defaultOrder: 999, // Sempre no final
  },
];

// ============================================================
// LIMITES POR PLANO
// ============================================================

export interface PlanLimits {
  maxLPs: number;
  maxDynamicBlocks: number;
  maxStorageMB: number;
  canEditBackground: boolean;
  canEditGradients: boolean;
  canEditSectionColors: boolean;
  canEditTypography: boolean;
  canEditGlassEffects: boolean;
  canRequestCustomModel: boolean;
  allowedModelTiers: PlanLevel[];
}

export const PLAN_LIMITS: Record<PlanLevel | 'master', PlanLimits> = {
  free: {
    maxLPs: 1,
    maxDynamicBlocks: 2,
    maxStorageMB: 50,
    canEditBackground: false,
    canEditGradients: false,
    canEditSectionColors: false,
    canEditTypography: false,
    canEditGlassEffects: false,
    canRequestCustomModel: false,
    allowedModelTiers: ['free'],
  },
  pro: {
    maxLPs: 3,
    maxDynamicBlocks: 5,
    maxStorageMB: 150,
    canEditBackground: true,
    canEditGradients: true,
    canEditSectionColors: true,
    canEditTypography: true,
    canEditGlassEffects: true,
    canRequestCustomModel: false,
    allowedModelTiers: ['free', 'pro'],
  },
  premium: {
    maxLPs: 10,
    maxDynamicBlocks: 999,
    maxStorageMB: 1024,
    canEditBackground: true,
    canEditGradients: true,
    canEditSectionColors: true,
    canEditTypography: true,
    canEditGlassEffects: true,
    canRequestCustomModel: true,
    allowedModelTiers: ['free', 'pro', 'premium'],
  },
  master: {
    maxLPs: 999,
    maxDynamicBlocks: 999,
    maxStorageMB: 10240,
    canEditBackground: true,
    canEditGradients: true,
    canEditSectionColors: true,
    canEditTypography: true,
    canEditGlassEffects: true,
    canRequestCustomModel: true,
    allowedModelTiers: ['free', 'pro', 'premium'],
  },
};

// ============================================================
// UTILITÁRIOS
// ============================================================

export function getBlockDefinition(sectionKey: SectionKey): BlockDefinition | undefined {
  return BLOCK_DEFINITIONS.find(b => b.key === sectionKey);
}

export function getFixedBlocks(): BlockDefinition[] {
  return BLOCK_DEFINITIONS.filter(b => b.isFixed);
}

export function getDynamicBlocks(): BlockDefinition[] {
  return BLOCK_DEFINITIONS.filter(b => !b.isFixed);
}

export function canAddMoreBlocks(currentDynamicCount: number, plan: PlanLevel | 'master'): boolean {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  return currentDynamicCount < limits.maxDynamicBlocks;
}

export function canUseModel(modelPlan: PlanLevel, userPlan: PlanLevel | 'master'): boolean {
  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  return limits.allowedModelTiers.includes(modelPlan);
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
