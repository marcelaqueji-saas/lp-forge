# 📋 DOSSIÊ TÉCNICO COMPLETO — noBRon v3.0
## SaaS Landing Page Builder Multi-Tenant

**Data:** Dezembro 2024  
**Versão do Sistema:** 3.0 (Sprint 5.0+)  
**Autor:** Documentação Técnica Automatizada

---

# 📑 SUMÁRIO EXECUTIVO

O **noBRon** é uma plataforma SaaS completa para construção de Landing Pages, desenvolvida com arquitetura multi-tenant, editor visual por blocos, sistema de modelos (templates), controle de planos (Free/Pro/Premium/Master), e governança administrativa em dois níveis.

### Principais Características:
- ✅ **32 modelos de seção** organizados em 10 categorias
- ✅ **Editor visual por blocos** com duas fases (Estrutura + Conteúdo)
- ✅ **Edição inline** de textos, imagens, links e listas
- ✅ **Sistema de planos** com feature gating granular
- ✅ **Painel Master** para governança SaaS
- ✅ **Painel Cliente** para gestão de LPs pessoais
- ✅ **Tracking completo** (GA4, Meta Pixel, UTM)
- ✅ **RLS (Row Level Security)** em todas as tabelas
- ✅ **Live Sync** via Supabase Realtime
- ✅ **Undo/Redo** com histórico persistido

---

# 1️⃣ VISÃO GERAL DO SISTEMA

## 1.1 Arquitetura Geral

O noBRon segue uma arquitetura de **três camadas**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAMADA DE APRESENTAÇÃO                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Painel    │  │   Painel    │  │   Editor    │  │     LP      │ │
│  │   Master    │  │   Cliente   │  │   Visual    │  │   Pública   │ │
│  │  /master/*  │  │  /painel/*  │  │/meu-site/:id│  │  /lp/:slug  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE LÓGICA                            │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │  React + TypeScript + Vite + Tailwind + Framer Motion           ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │ useAuth  │ │ lpContent│ │ section  │ │ block    │           ││
│  │  │ Hook     │ │ Api      │ │ Models   │ │ Editor   │           ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           ││
│  └─────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE DADOS                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Supabase (PostgreSQL + Auth)                 ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │ landing_ │ │ lp_      │ │ lp_      │ │ user_    │           ││
│  │  │ pages    │ │ content  │ │ settings │ │ profiles │           ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │ lp_leads │ │ lp_events│ │ plan_    │ │ audit_   │           ││
│  │  │          │ │          │ │ limits   │ │ logs     │           ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## 1.2 Separação de Painéis

### 🔷 Painel Master (`/master/*`)
**Role:** `admin_master`  
**Responsabilidades:**
- Gestão de usuários e roles
- Configuração de limites por plano
- Catálogo de templates/modelos
- Catálogo de separadores
- Seleção da homepage SaaS
- Auditoria de ações administrativas
- Gestão de todas as LPs do sistema

**Rotas Principais:**
| Rota | Componente | Função |
|------|------------|--------|
| `/master` | MasterDashboard | Dashboard principal |
| `/master/users` | MasterUsers | Gestão de usuários |
| `/master/plans` | MasterPlans | Limites por plano |
| `/master/templates` | MasterTemplates | Catálogo de modelos |
| `/master/lps` | MasterLPs | Todas as LPs |
| `/master/audit` | MasterAudit | Logs de auditoria |
| `/master/homepage` | MasterHomepage | Homepage SaaS |

### 🔶 Painel Cliente (`/painel/*`)
**Role:** `client`  
**Responsabilidades:**
- Dashboard pessoal
- Edição das próprias LPs
- Visualização de analytics
- Exportação de leads
- Configuração de perfil

**Rotas Principais:**
| Rota | Componente | Função |
|------|------------|--------|
| `/painel` | Dashboard | Lista de LPs do usuário |
| `/painel/perfil` | Profile | Configurações de conta |
| `/painel/analytics/:lpId` | AnalyticsDashboard | Métricas da LP |
| `/painel/leads/:lpId` | LeadsExport | Exportação de leads |

### 🟢 Editor Visual (`/meu-site/:lpId`)
**Acesso:** Usuários autenticados com permissão na LP  
**Componente:** `MeuSite.tsx` → `BlockEditor.tsx`

### 🌐 Landing Page Pública (`/lp/:slug`)
**Acesso:** Público  
**Componente:** `LandingPageBySlug.tsx`

## 1.3 Fluxo Completo de uma LP

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   CRIAÇÃO     │ ──▶ │   EDIÇÃO      │ ──▶ │  PUBLICAÇÃO   │
└───────────────┘     └───────────────┘     └───────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
  1. Onboarding        1. StructurePhase      1. updateLPStatus()
  2. applyDefault      2. ContentPhase        2. publicado = true
     Template()        3. InlineEditing       3. LP acessível em
  3. INSERT landing_   4. saveSectionContent     /lp/:slug
     pages                ()
  4. INSERT lp_content 5. saveSettings()
     (seções iniciais)
```

### Detalhamento:

**1. Criação:**
```typescript
// src/pages/Onboarding.tsx
const createLP = async () => {
  const { data } = await supabase
    .from('landing_pages')
    .insert({ nome, slug, owner_id, publicado: false });
  
  await applyDefaultTemplate(data.id);
};
```

**2. Edição:**
```typescript
// src/lib/lpContentApi.ts
export const saveSectionContent = async (lpId, section, content) => {
  await supabase
    .from('lp_content')
    .upsert({ lp_id: lpId, section, key, value });
};
```

**3. Pré-visualização:**
- O editor possui aba "Preview" que renderiza todas as seções
- `SectionLoader` carrega o componente correto baseado no `modelId`

**4. Publicação:**
```typescript
await supabase
  .from('landing_pages')
  .update({ publicado: true })
  .eq('id', lpId);
```

---

# 2️⃣ MAPEAMENTO COMPLETO DE ARQUIVOS

## 2.1 `src/lib/` — Lógica de Negócio

### 📄 `sectionModels.ts` (757 linhas)
**Função:** Registro central de todos os modelos de seção.

**Estrutura Principal:**
```typescript
export interface SectionModel {
  id: string;              // Ex: 'hero_glass_aurora'
  section: SectionKey;     // Ex: 'hero'
  name: string;            // Ex: 'Hero glass aurora'
  description?: string;
  plan: PlanLevel;         // 'free' | 'pro' | 'premium'
  category: ModelCategory;
  thumbnail: string;       // Path do thumbnail
  stylePreset?: StylePreset;
  motionPreset?: MotionPreset;
  fields?: FieldConfig[];
  images?: ImageConfig[];
  hasJsonEditor?: boolean;
  component: string;       // Nome do componente React
}

export const SECTION_MODELS: SectionModel[] = [
  // 32 modelos registrados
];
```

**Como cadastrar um modelo novo:**
1. Adicione ao array `SECTION_MODELS`
2. Registre o componente em `registry.ts`
3. Crie o thumbnail em `ModelThumbnail.tsx`

**Funções Utilitárias:**
| Função | Descrição |
|--------|-----------|
| `getSectionModel(section, variant)` | Retorna modelo por seção e variante |
| `resolveModelId(section, variant)` | Resolve ID considerando fallbacks legados |
| `SECTION_MODELS_BY_SECTION` | Mapa de seção → modelos disponíveis |
| `getDefaultModel(section)` | Retorna modelo free padrão |

### 📄 `lpContentApi.ts` (1432 linhas)
**Função:** API completa para CRUD de Landing Pages.

**Principais Exports:**
```typescript
// LP CRUD
getDefaultLP()
getLPById(id)
getLPBySlug(slug)
getAllLPs()
updateLPStatus(lpId, publicado)
deleteLP(lpId)

// Content
getSectionContent(lpId, section)
getAllContent(lpId)
saveSectionContent(lpId, section, content)

// Settings
getSettings(lpId)
saveSettings(lpId, settings)

// Section Order
getSectionOrder(lpId)
updateSectionOrder(lpId, sections)

// Leads
saveLead(lpId, lead, utm)
getLeads(lpId)
exportLeadsToCSV(leads)

// Tracking
trackLPEvent(lpId, eventType, metadata)
```

**Fluxo de Carregamento no Editor:**
```typescript
// BlockEditor.tsx
const loadEditorData = async () => {
  const [contentData, settingsData, orderData] = await Promise.all([
    getAllContent(lpId),
    getSettings(lpId),
    getSectionOrder(lpId),
  ]);
  // Monta os blocks a partir dos dados
};
```

### 📄 `blockEditorTypes.ts` (245 linhas)
**Função:** Tipos e constantes do sistema de blocos.

```typescript
export interface EditorBlock {
  id: string;
  sectionKey: SectionKey;
  modelId: string;
  order: number;
  content: Record<string, any>;
  isNew?: boolean;
}

export const PLAN_LIMITS = {
  free: { maxDynamicBlocks: 2, maxLPs: 1 },
  pro: { maxDynamicBlocks: 5, maxLPs: 3 },
  premium: { maxDynamicBlocks: 999, maxLPs: 10 },
  master: { maxDynamicBlocks: 999, maxLPs: 999 },
};
```

### 📄 `authApi.ts` (300 linhas)
**Função:** API de autenticação e autorização.

```typescript
getUserRole()           // Retorna 'admin_master' | 'client'
getUserProfile()        // Dados do perfil do usuário
getUserPlanLimits()     // Limites do plano atual
getUserSiteCount()      // Quantidade de LPs do usuário
canCreateSite()         // Verifica se pode criar mais LPs

// Admin Master Only
getAllUsers()
updateUserRole(userId, role)
updateUserPlan(userId, plan)
getAuditLogs()
```

### 📄 `tracking.ts`
**Função:** Sistema de tracking de eventos.

```typescript
trackEvent({
  event_type: 'view' | 'cta_click' | 'lead_submit',
  lp_id: string,
  section?: string,
  metadata?: object,
});
```

---

## 2.2 `src/components/editor/` — Componentes do Editor

### 📄 `BlockEditor.tsx` (700 linhas)
**Função:** Componente principal do editor por blocos.

**Props:**
```typescript
interface BlockEditorProps {
  lpId: string;
  lpData: { nome, slug, publicado };
  userPlan: PlanLevelWithMaster;
  onPublish: () => void;
  onViewPublic: () => void;
}
```

**Estado Principal:**
```typescript
const [blocks, setBlocks] = useState<EditorBlock[]>([]);
const [content, setContent] = useState<Record<string, LPContent>>({});
const [settings, setSettings] = useState<LPSettings>({});
const [phase, setPhase] = useState<'structure' | 'content' | 'preview'>('structure');
```

**Handlers Principais:**
| Handler | Função |
|---------|--------|
| `handleAddSection` | Adiciona nova seção/bloco |
| `handleChangeModel` | Troca modelo de uma seção |
| `handleDuplicateBlock` | Duplica bloco (respeitando limites) |
| `handleRemoveBlock` | Remove bloco |
| `handleReorder` | Reordena blocos via drag-drop |
| `handleContentUpdate` | Atualiza conteúdo de seção |

### 📄 `StructurePhase.tsx`
**Função:** Fase 1 do editor — seleção de blocos e modelos.

**Features:**
- Grid de seções disponíveis
- `ModelThumbnail` para visualização
- Filtro por plano do usuário
- Drag-and-drop para reordenar

### 📄 `ContentPhase.tsx`
**Função:** Fase 2 do editor — edição de conteúdo inline.

**Features:**
- Renderiza `SectionLoader` em modo editável
- Autosave no blur
- Feedback visual "Salvo"

### 📄 `SectionLoader.tsx` (754 linhas)
**Função:** Carrega e renderiza componente de seção dinamicamente.

**Fluxo de Resolução:**
```
1. Recebe sectionKey + content
2. resolveVariant() → obtém modelId
3. Busca componente em SECTION_COMPONENT_REGISTRY
4. Se editable=true → usa EDITABLE_COMPONENT_REGISTRY
5. Renderiza com props apropriadas
```

```typescript
// Registros principais
const SECTION_COMPONENT_REGISTRY = {
  hero: { default: Hero, hero_glass_aurora: Hero, ... },
  beneficios: { default: Beneficios, ... },
  // ...
};

const EDITABLE_COMPONENT_REGISTRY = {
  hero: HeroEditable,
  beneficios: BeneficiosEditable,
  // ...
};
```

### 📄 `ModelThumbnail.tsx` (565 linhas)
**Função:** Renderiza thumbnails abstratos para cada modelo.

**Estrutura:**
```typescript
const MODEL_THUMBNAIL_COMPONENTS: Record<string, React.FC> = {
  menu_glass_minimal: MenuGlassMinimalThumb,
  hero_glass_aurora: HeroGlassAuroraThumb,
  // ... 32 thumbnails
};
```

### 📄 `InlineEditableSection.tsx`
**Função:** Wrappers para edição inline.

**Componentes Exportados:**
```typescript
<EditableField>     // Texto editável
<EditableImageField> // Imagem editável
<EditableLink>       // Link editável (popup de URL)
```

### 📄 `TemplatePicker.tsx`
**Função:** Modal para seleção de modelo de seção.

### 📄 Outros Componentes:
| Arquivo | Função |
|---------|--------|
| `EditorTour.tsx` | Tour guiado (react-joyride) |
| `SaveIndicator.tsx` | Indicador de salvamento |
| `PublishChecklist.tsx` | Checklist pré-publicação |
| `AddBlockModal.tsx` | Modal para adicionar bloco |
| `QuickStyleEditor.tsx` | Editor rápido de estilos |

---

## 2.3 `src/components/sections/` — Componentes de Seção

### Padrão de Nomenclatura:
- `{Section}.tsx` — Componente de leitura (público)
- `{Section}Editable.tsx` — Componente editável (editor)

### Mapeamento Completo:

| Seção | Componente | Editável | Modelos |
|-------|------------|----------|---------|
| Menu | `MenuSection.tsx` | `MenuEditable.tsx` | 3 |
| Hero | `Hero.tsx` | `HeroEditable.tsx` | 4 |
| Como Funciona | `ComoFunciona.tsx` | `ComoFuncionaEditable.tsx` | 3 |
| Para Quem É | `ParaQuemE.tsx` | `ParaQuemEEditable.tsx` | 3 |
| Benefícios | `Beneficios.tsx` | `BeneficiosEditable.tsx` | 3 |
| Provas Sociais | `ProvasSociais.tsx` | `ProvasSociaisEditable.tsx` | 4 |
| Planos | `Planos.tsx` | `PlanosEditable.tsx` | 3 |
| FAQ | `FAQ.tsx` | `FAQEditable.tsx` | 3 |
| Chamada Final | `ChamadaFinal.tsx` | `ChamadaFinalEditable.tsx` | 3 |
| Rodapé | `Rodape.tsx` | `RodapeEditable.tsx` | 3 |

### Relação com SECTION_MODELS:

Cada componente editável recebe:
```typescript
interface EditableProps {
  lpId: string;
  content: LPContent;
  previewOverride?: LPContent;
  settings?: LPSettings;
  onContentUpdate: (key, newContent) => void;
  userPlan?: PlanLevelWithMaster;
}
```

O `modelId` é lido de `content.__model_id` e determina qual layout renderizar internamente.

### 📁 `src/components/sections/premium/`
Componentes premium com animações avançadas:
- `HeroParallax.tsx` — Hero com parallax
- `HeroSplit.tsx` — Hero com colunas expansíveis
- `Cards3DShowcase.tsx` — Cards 3D
- `FeaturesFloat.tsx` — Features flutuantes
- `TestimonialCinematic.tsx` — Depoimentos cinematográficos
- `CTAFinal.tsx` — CTA animado

---

## 2.4 `src/pages/` — Páginas da Aplicação

### Estrutura de Diretórios:
```
src/pages/
├── admin/           # Páginas admin legadas
│   ├── sites/       # Gestão de sites multi-página
│   └── ...
├── auth/            # Autenticação
│   ├── AuthLogin.tsx
│   ├── AuthRegister.tsx
│   └── ...
├── client/          # Páginas do cliente
│   ├── AnalyticsDashboard.tsx
│   ├── LeadsExport.tsx
│   └── Profile.tsx
├── master/          # Painel Master
│   ├── MasterDashboard.tsx
│   ├── MasterUsers.tsx
│   ├── MasterPlans.tsx
│   └── ...
├── marketing/       # Páginas de marketing
│   └── InteresseNoBron.tsx
├── qa/              # QA interno
│   └── SectionsQA.tsx
├── Index.tsx        # Homepage dinâmica
├── MeuSite.tsx      # Editor visual
├── Dashboard.tsx    # Painel cliente
└── ...
```

### Páginas Principais:

| Página | Rota | Função |
|--------|------|--------|
| Index | `/` | Homepage SaaS (dinâmica via saas_settings) |
| MeuSite | `/meu-site/:lpId` | Editor visual |
| Dashboard | `/painel` | Lista de LPs do usuário |
| LPBuilder | `/meu-site/:lpId/construtor` | Wizard de criação |
| SectionsQA | `/qa/sections` | Validação de 32 modelos |
| Upgrade | `/upgrade` | Página de upgrade de plano |

---

## 2.5 `src/hooks/` — Hooks Customizados

| Hook | Função |
|------|--------|
| `useAuth.tsx` | Contexto de autenticação |
| `useEditHistory.ts` | Undo/Redo com persistência |
| `useLiveSync.ts` | Sincronização via Realtime |
| `usePlanLimits.ts` | Limites do plano atual |
| `useScrollTracking.ts` | Tracking de scroll |
| `useABTest.ts` | Sistema de testes A/B |

---

# 3️⃣ SISTEMA DE MODELOS (SECTION_MODELS)

## 3.1 Conceitos Fundamentais

### O que é uma "Seção"?
Uma **seção** é um bloco funcional da LP (ex: hero, benefícios, FAQ).

```typescript
export type SectionKey =
  | 'menu'
  | 'hero'
  | 'como_funciona'
  | 'para_quem_e'
  | 'beneficios'
  | 'provas_sociais'
  | 'planos'
  | 'faq'
  | 'chamada_final'
  | 'rodape';
```

### O que é um "Modelo"?
Um **modelo** é uma variação visual de uma seção.

Exemplo para Hero:
- `hero_glass_aurora` (Free)
- `hero_cinematic_video_spotlight` (Pro)
- `hero_parallax_layers` (Premium)
- `hero_ticket_launch` (Premium)

### O que é uma "Variant"?
**Variant** é o termo legado para `modelId`. Ambos se referem à mesma coisa.

## 3.2 Arquivos do Sistema de Modelos

```
src/lib/sectionModels.ts     → Registro de modelos (SECTION_MODELS)
src/components/sections/     → Componentes React
  └── registry.ts            → SECTION_COMPONENT_REGISTRY
src/components/editor/
  └── ModelThumbnail.tsx     → MODEL_THUMBNAIL_COMPONENTS
```

## 3.3 Relação modelId → thumbnail → componente

```
┌─────────────────────┐
│   SECTION_MODELS    │
│  (sectionModels.ts) │
│                     │
│  id: 'hero_glass_   │
│       aurora'       │
│  component: 'Hero'  │
└─────────────────────┘
         │
         │ Lookup por id
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│  MODEL_THUMBNAIL_   │     │ SECTION_COMPONENT_  │
│  COMPONENTS         │     │ REGISTRY            │
│ (ModelThumbnail.tsx)│     │ (registry.ts)       │
│                     │     │                     │
│  hero_glass_aurora: │     │  hero: {            │
│   HeroGlassAurora   │     │    hero_glass_      │
│   Thumb             │     │    aurora: Hero     │
└─────────────────────┘     │  }                  │
                            └─────────────────────┘
```

## 3.4 Como Adicionar um Modelo Novo

### Passo 1: Registrar em `sectionModels.ts`
```typescript
// Adicione ao array SECTION_MODELS
{
  id: 'hero_novo_modelo',
  section: 'hero',
  name: 'Hero Novo Modelo',
  description: 'Descrição do novo modelo',
  plan: 'pro',
  category: 'hero',
  component: 'Hero',  // ou novo componente
  thumbnail: '/thumbnails/hero/hero_novo_modelo.webp',
  stylePreset: 'glass',
  motionPreset: 'fade-stagger',
  fields: HERO_FIELDS,
  images: [{ key: 'imagem', label: 'Imagem principal' }],
}
```

### Passo 2: Registrar em `registry.ts`
```typescript
hero: {
  default: Hero,
  // ... existentes
  hero_novo_modelo: HeroNovoModelo, // ou Hero se usar mesmo componente
},
```

### Passo 3: Criar Thumbnail em `ModelThumbnail.tsx`
```typescript
const HeroNovoModeloThumb = () => (
  <div className="w-full h-full flex flex-col p-2 gap-1">
    <div className="h-2 w-12 bg-current/20 rounded" />
    <div className="flex-1 bg-current/10 rounded" />
    <div className="h-2 w-16 bg-current/30 rounded" />
  </div>
);

// Adicionar ao MODEL_THUMBNAIL_COMPONENTS
const MODEL_THUMBNAIL_COMPONENTS = {
  // ... existentes
  hero_novo_modelo: HeroNovoModeloThumb,
};
```

### Passo 4: (Opcional) Criar Componente Específico
Se o modelo requer layout único:
```typescript
// src/components/sections/HeroNovoModelo.tsx
export const HeroNovoModelo = ({ content, settings }) => {
  // Implementação
};
```

---

# 4️⃣ SISTEMA DE RENDERIZAÇÃO E PREVIEW

## 4.1 Fluxo de Renderização Completo

```
┌───────────────┐
│  BlockEditor  │
│   (phase)     │
└───────┬───────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                   PREVIEW MODE                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  blocks.map(block => (                          │  │
│  │    <SectionLoader                               │  │
│  │      sectionKey={block.sectionKey}              │  │
│  │      content={content[block.sectionKey]}        │  │
│  │      settings={settings}                        │  │
│  │      userPlan={userPlan}                        │  │
│  │      editable={phase === 'content'}             │  │
│  │      onContentUpdate={handleContentUpdate}      │  │
│  │    />                                           │  │
│  │  ))                                             │  │
│  └─────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

## 4.2 SectionLoader — Decisão de Componente

```typescript
export const SectionLoader = ({
  sectionKey,
  content,
  editable,
  onContentUpdate,
}) => {
  // 1. Resolver variant/modelId
  const variant = resolveVariant(sectionKey, content, settings);
  
  // 2. Escolher componente
  let Component;
  if (editable) {
    Component = EDITABLE_COMPONENT_REGISTRY[sectionKey];
  } else {
    const registry = SECTION_COMPONENT_REGISTRY[sectionKey];
    Component = registry[variant] || registry.default;
  }
  
  // 3. Renderizar
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Component
          content={content}
          settings={settings}
          onContentUpdate={onContentUpdate}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
```

## 4.3 Sincronização Editor ↔ Preview

O sistema usa três mecanismos:

1. **Estado React:** `content` e `settings` no BlockEditor
2. **Autosave:** `saveSectionContent()` no blur de campos editáveis
3. **Live Sync:** `useLiveSync()` via Supabase Realtime

```typescript
// useLiveSync.ts
const channel = supabase
  .channel(`lp_${lpId}`)
  .on('postgres_changes', { table: 'lp_content' }, (payload) => {
    if (!isLocalUpdate) {
      onContentUpdate(payload.section, payload.new);
    }
  })
  .subscribe();
```

## 4.4 Prevenção de Flickers

- **Suspense:** Lazy loading com fallback
- **ErrorBoundary:** Captura erros sem quebrar UI
- **Memoization:** `memo()` nos componentes de seção
- **Key estável:** `block.id` como key no map

---

# 5️⃣ SISTEMA DE EDIÇÃO INLINE

## 5.1 Arquitetura de Edição

```
┌─────────────────────────────────────────────────────────┐
│              COMPONENTE EDITÁVEL                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  <EditableField                                   │  │
│  │    value={content.titulo}                         │  │
│  │    onSave={(val) => onContentUpdate('titulo', val)│  │
│  │  />                                               │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │  onContentUpdate(key, value)                       │  │
│  │    └─▶ setContent({ ...content, [key]: value })   │  │
│  │    └─▶ saveSectionContent(lpId, section, content) │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 5.2 Tipos de Campos Editáveis

| Componente | Uso | Exemplo |
|------------|-----|---------|
| `EditableField` | Texto simples | Títulos, subtítulos |
| `EditableImageField` | Imagens | Hero image, avatares |
| `EditableLink` | Links com URL | CTAs, botões |
| Sub-Editors JSON | Listas complexas | Benefícios, FAQ, Planos |

## 5.3 Pipeline de Edição

```
1. Usuário clica no campo
     │
     ▼
2. Campo torna-se contentEditable
     │
     ▼
3. Usuário digita/edita
     │
     ▼
4. onBlur dispara
     │
     ▼
5. onSave(newValue) chamado
     │
     ▼
6. onContentUpdate(key, newValue)
     │
     ▼
7. setContent atualiza estado local
     │
     ▼
8. saveSectionContent() persiste no Supabase
     │
     ▼
9. Indicador "Salvo" aparece
```

## 5.4 Edição de Listas JSON

Para campos como `beneficios_json`, `faq_json`, `planos_json`:

```typescript
// BeneficiosEditable.tsx
const items = JSON.parse(content.beneficios_json || '[]');

const handleItemUpdate = (index, field, value) => {
  const updated = [...items];
  updated[index][field] = value;
  onContentUpdate('beneficios_json', JSON.stringify(updated));
};
```

---

# 6️⃣ BACKEND/SUPABASE — MAPEAMENTO COMPLETO

## 6.1 Tabelas Principais

### 📊 `landing_pages`
```sql
id              UUID PRIMARY KEY
nome            TEXT NOT NULL
slug            TEXT NOT NULL
dominio         TEXT
dominio_verificado BOOLEAN DEFAULT false
publicado       BOOLEAN DEFAULT false
owner_id        UUID REFERENCES auth.users
is_official     BOOLEAN DEFAULT false
is_site         BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
```

### 📊 `lp_content`
```sql
id              UUID PRIMARY KEY
lp_id           UUID REFERENCES landing_pages
section         TEXT NOT NULL       -- 'hero', 'beneficios', etc.
key             TEXT NOT NULL       -- 'titulo', '__model_id', etc.
value           TEXT
section_order   INTEGER
updated_at      TIMESTAMPTZ
UNIQUE(lp_id, section, key)
```

### 📊 `lp_settings`
```sql
id              UUID PRIMARY KEY
lp_id           UUID REFERENCES landing_pages
key             TEXT NOT NULL       -- 'cor_primaria', 'hero_variante'
value           TEXT
updated_at      TIMESTAMPTZ
UNIQUE(lp_id, key)
```

### 📊 `lp_leads`
```sql
id              UUID PRIMARY KEY
lp_id           UUID REFERENCES landing_pages
nome            TEXT
email           TEXT
telefone        TEXT
utm             JSONB               -- UTM parameters
session_id      TEXT
device_type     TEXT
referrer        TEXT
variant_id      TEXT
created_at      TIMESTAMPTZ
```

### 📊 `lp_events`
```sql
id              UUID PRIMARY KEY
lp_id           UUID REFERENCES landing_pages
event_type      TEXT NOT NULL       -- 'view', 'cta_click', 'lead_submit'
section         TEXT
metadata        JSONB
session_id      TEXT
utm_source, utm_medium, utm_campaign, utm_term, utm_content TEXT
device_type     TEXT
created_at      TIMESTAMPTZ
```

### 📊 `user_profiles`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
display_name    TEXT
plan            TEXT DEFAULT 'free' -- 'free', 'pro', 'premium'
storage_used_mb INTEGER DEFAULT 0
last_login_at   TIMESTAMPTZ
created_at, updated_at TIMESTAMPTZ
```

### 📊 `user_roles`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
role            app_role DEFAULT 'client' -- 'admin_master', 'client'
created_at, updated_at TIMESTAMPTZ
```

### 📊 `plan_limits`
```sql
id              UUID PRIMARY KEY
plan            TEXT UNIQUE         -- 'free', 'pro', 'premium'
max_sites       INTEGER
max_storage_mb  INTEGER
custom_domain_limit INTEGER
allowed_model_categories TEXT[]
allowed_separator_categories TEXT[]
export_leads_enabled BOOLEAN
ab_testing_enabled BOOLEAN
premium_sections_enabled BOOLEAN
```

### 📊 `audit_logs`
```sql
id              UUID PRIMARY KEY
user_id         UUID
action          TEXT NOT NULL
target_type     TEXT NOT NULL
target_id       TEXT
details         JSONB
diff            JSONB
created_at      TIMESTAMPTZ
```

## 6.2 Row Level Security (RLS)

### Políticas Principais:

**landing_pages:**
```sql
-- Usuários veem suas próprias LPs
USING (owner_id = auth.uid() OR has_lp_role(...))

-- Público vê LPs publicadas
USING (publicado = true)
```

**lp_content / lp_settings:**
```sql
-- Editores podem gerenciar
USING (can_edit_lp(auth.uid(), lp_id))

-- Público pode ver de LPs publicadas
USING (EXISTS (SELECT 1 FROM landing_pages WHERE publicado = true))
```

**user_profiles / user_roles:**
```sql
-- Usuários veem próprio perfil
USING (user_id = auth.uid())

-- Admin Master vê todos
USING (is_admin_master(auth.uid()))
```

## 6.3 Funções SQL Críticas

| Função | Descrição |
|--------|-----------|
| `is_admin_master(user_id)` | Verifica se é admin_master |
| `can_edit_lp(user_id, lp_id)` | Verifica permissão de edição |
| `can_manage_lp(user_id, lp_id)` | Verifica permissão de gestão |
| `has_lp_role(user_id, lp_id, roles[])` | Verifica role específica |
| `get_user_plan(user_id)` | Retorna plano do usuário |
| `get_effective_plan_limits(user_id)` | Retorna limites efetivos |

---

# 7️⃣ DIAGNÓSTICO DO ESTADO ATUAL

## 7.1 ✅ Pontos Fortes

1. **Arquitetura Multi-Tenant Sólida**
   - RLS em todas as tabelas
   - Separação clara de roles
   - Isolamento de dados por owner_id

2. **Sistema de Modelos Flexível**
   - 32 modelos bem organizados
   - Fallback para modelos legados
   - Thumbnails abstratos (sem dependência de imagens)

3. **Editor Visual Moderno**
   - Duas fases (Estrutura + Conteúdo)
   - Edição inline funcional
   - Undo/Redo implementado

4. **Tracking Completo**
   - GA4 e Meta Pixel
   - UTM parameters
   - Eventos detalhados

5. **Governança Administrativa**
   - Painel Master completo
   - Audit logs
   - Controle de planos

## 7.2 ⚠️ Pontos Frágeis

1. **Performance de Carregamento**
   - Múltiplas queries sequenciais no editor
   - Sem cache client-side otimizado
   - Lazy loading pode causar flash

2. **Mobile First Incompleto**
   - Algumas seções não responsivas
   - Overflow horizontal em alguns modelos
   - Touch targets pequenos

3. **Consistência de Modelos**
   - Componentes não implementam todos os modelIds
   - Fallback sempre vai para mesmo layout
   - Falta variação visual real entre modelos

4. **TypeScript Parcial**
   - Alguns `any` types em props
   - Falta strict mode completo

## 7.3 🔴 Pendências Técnicas

1. **Stripe Billing Comentado**
   - Edge functions criadas mas comentadas
   - Falta configurar secrets (STRIPE_SECRET_KEY, etc.)
   - Webhook não ativo

2. **Testes Automatizados**
   - Zero coverage de testes
   - Nenhum test unitário/integração

3. **SEO Dinâmico**
   - Meta tags implementadas
   - Falta sitemap dinâmico funcional
   - Falta robots.txt dinâmico

4. **PWA/Offline**
   - Não implementado
   - Sem service worker

## 7.4 🟡 Melhorias de Usabilidade

1. **Onboarding**
   - Tour guiado existe mas é básico
   - Falta onboarding contextual

2. **Feedback Visual**
   - Indicadores de salvamento básicos
   - Falta progress indicators em operações longas

3. **Help/Documentação**
   - Nenhuma documentação in-app
   - Falta tooltips explicativos

---

# 8️⃣ RECOMENDAÇÕES PARA NÍVEL PROFISSIONAL

## 8.1 Melhorias Arquiteturais

### Curto Prazo (1-2 sprints)

1. **Query Optimization**
```typescript
// Atual: múltiplas queries
const content = await getAllContent(lpId);
const settings = await getSettings(lpId);
const order = await getSectionOrder(lpId);

// Proposta: single RPC
const { content, settings, order } = await supabase
  .rpc('get_lp_full_data', { lp_id: lpId });
```

2. **React Query Cache**
```typescript
const { data: lpData } = useQuery({
  queryKey: ['lp', lpId],
  queryFn: () => getLPFullData(lpId),
  staleTime: 5 * 60 * 1000,
});
```

3. **Error Boundaries Granulares**
```typescript
<SectionErrorBoundary section="hero">
  <HeroSection />
</SectionErrorBoundary>
```

### Médio Prazo (3-4 sprints)

1. **Implementar Variação Real entre Modelos**
   - Cada modelId deve ter layout visualmente distinto
   - Usar props condicionais no componente base

2. **Ativar Stripe Billing**
   - Configurar secrets
   - Descomentar edge functions
   - Testar fluxo completo

3. **Testes Automatizados**
   - Vitest para unit tests
   - Playwright para E2E

## 8.2 Guidelines de Criação de Seções

### Padrão de Componente Editável:
```typescript
// src/components/sections/NovaSecaoEditable.tsx
interface NovaSecaoEditableProps {
  lpId: string;
  content: LPContent;
  onContentUpdate: (key: string, value: any) => void;
  settings?: LPSettings;
  userPlan?: PlanLevelWithMaster;
}

export const NovaSecaoEditable: React.FC<NovaSecaoEditableProps> = ({
  lpId,
  content,
  onContentUpdate,
}) => {
  const modelId = content.__model_id || 'nova_secao_default';
  
  // Lógica de renderização baseada no modelId
  return (
    <section className="section-padding">
      <EditableField
        value={content.titulo}
        onSave={(val) => onContentUpdate('titulo', val)}
        className="section-title"
      />
      {/* ... */}
    </section>
  );
};
```

## 8.3 Diretrizes UX Mobile

1. **Touch Targets:** Mínimo 44x44px
2. **Espaçamento:** Usar classes `section-padding`, `card-padding`
3. **Tipografia:** `text-responsive-*` classes
4. **Inputs:** `min-h-[44px]` em todos os campos
5. **Modais:** Usar Sheet no mobile (bottom sheet)

## 8.4 Preparação para Marketplace de Templates

1. **Estrutura de Template:**
```typescript
interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  price: number;
  author: string;
  sections: {
    sectionKey: SectionKey;
    modelId: string;
    defaultContent: LPContent;
  }[];
  styles: LPSettings;
}
```

2. **Tabela `marketplace_templates`** no Supabase
3. **Sistema de compra/aplicação** de templates

## 8.5 Preparação para Escala Multi-Tenant

1. **Connection Pooling:** Configurar Supabase pooler
2. **Read Replicas:** Para queries pesadas (analytics)
3. **CDN:** Cloudflare para assets estáticos
4. **Rate Limiting:** Em edge functions

## 8.6 Evolução para Editor Tipo Figma/Framer

1. **Canvas Livre:** Drag-drop de seções
2. **Camadas:** Sistema de z-index visual
3. **Spacing Visual:** Guides e snapping
4. **Real-time Collaboration:** Cursores de outros editores
5. **Version History:** Timeline visual de alterações

---

# 📋 RESUMO EXECUTIVO

## Arquivos Mais Críticos

| Arquivo | Criticidade | Função |
|---------|-------------|--------|
| `sectionModels.ts` | 🔴 ALTA | Registro central de modelos |
| `lpContentApi.ts` | 🔴 ALTA | CRUD de LPs |
| `SectionLoader.tsx` | 🔴 ALTA | Renderização de seções |
| `BlockEditor.tsx` | 🔴 ALTA | Editor principal |
| `registry.ts` | 🟡 MÉDIA | Mapeamento modelo→componente |
| `ModelThumbnail.tsx` | 🟡 MÉDIA | Thumbnails de modelos |
| `useAuth.tsx` | 🟡 MÉDIA | Contexto de autenticação |

## Fluxograma do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                          noBRon FLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REGISTRO          ONBOARDING         EDITOR           PUBLICAÇÃO   │
│  ─────────         ──────────         ──────           ──────────   │
│  /auth/register    /onboarding        /meu-site/:id    /lp/:slug    │
│       │                │                   │               │        │
│       ▼                ▼                   ▼               ▼        │
│  ┌─────────┐      ┌─────────┐        ┌─────────┐     ┌─────────┐   │
│  │ Criar   │ ──▶  │ Criar   │  ──▶   │ Editar  │ ──▶ │ Visitar │   │
│  │ User    │      │ LP      │        │ LP      │     │ LP      │   │
│  └─────────┘      └─────────┘        └─────────┘     └─────────┘   │
│       │                │                   │               │        │
│       ▼                ▼                   ▼               ▼        │
│  user_profiles    landing_pages       lp_content      lp_events    │
│  user_roles       lp_content          lp_settings     lp_leads     │
│                   (template)                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## O Que Falta para Beta

| Item | Prioridade | Esforço |
|------|------------|---------|
| Responsividade mobile completa | 🔴 Alta | 2 sprints |
| Variação visual real entre modelos | 🔴 Alta | 2 sprints |
| Ativar Stripe billing | 🟡 Média | 1 sprint |
| Testes automatizados | 🟡 Média | 2 sprints |
| Documentação in-app | 🟢 Baixa | 1 sprint |

---

**Documento gerado automaticamente**  
**noBRon v3.0 — Landing Page Builder Multi-Tenant**
