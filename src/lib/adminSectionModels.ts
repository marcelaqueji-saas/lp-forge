// src/lib/adminSectionModels.ts
export type AdminSectionKey =
  | 'master_overview'
  | 'team_kanban'
  | 'nobron_roadmap'
  | 'usage_analytics';

export interface AdminSectionModel {
  key: AdminSectionKey;
  component: string;
  group: 'operacao' | 'time' | 'produto';
  description: string;
}

export const ADMIN_SECTION_MODELS: Record<AdminSectionKey, AdminSectionModel> = {
  master_overview: {
    key: 'master_overview',
    component: 'MasterOverviewSection',
    group: 'operacao',
    description: 'Visão geral operacional do noBRon (LPs, leads, usuários).',
  },
  team_kanban: {
    key: 'team_kanban',
    component: 'TeamKanbanSection',
    group: 'time',
    description: 'Quadro de trabalho interno do time noBRon.',
  },
  nobron_roadmap: {
    key: 'nobron_roadmap',
    component: 'MasterOverviewSection', // provisório, até criar um específico
    group: 'produto',
    description: 'Roadmap macro do produto noBRon.',
  },
  usage_analytics: {
    key: 'usage_analytics',
    component: 'MasterOverviewSection', // provisório
    group: 'operacao',
    description: 'Métricas de uso interno do sistema.',
  },
};
