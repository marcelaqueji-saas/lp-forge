# noBRon v3 - Documentação Completa do Sistema

**Última atualização:** 2024-12-11
**Versão:** 3.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [O que Falta Implementar](#o-que-falta-implementar)
3. [Arquitetura de Arquivos](#arquitetura-de-arquivos)
4. [Sistema de Modelos de Seção](#sistema-de-modelos-de-seção)
5. [Como Adicionar/Remover Modelos](#como-adicionarremover-modelos)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Componentes Críticos](#componentes-críticos)

---

## 🎯 Visão Geral

noBRon é um **SaaS de criação de Landing Pages** com:
- Editor visual por blocos
- Sistema de planos (Free/Pro/Premium/Master)
- 46 modelos de seção editáveis
- Multi-tenant com isolamento por RLS
- Painel Master para administração global

### Arquitetura de Painéis

| Painel | Rota | Role | Responsabilidade |
|--------|------|------|------------------|
| **Master** | `/master/*` | `admin_master` | Usuários, planos, templates, homepage |
| **Cliente** | `/painel/*` | `client` | Gerenciar LPs próprias |
| **Editor** | `/meu-site/:id` | `client` | Editar LP específica |
| **Público** | `/`, `/lp/:slug` | - | Visualizar LPs publicadas |

---

## 🚧 O que Falta Implementar

### Alta Prioridade

| Feature | Status | Descrição |
|---------|--------|-----------|
| ⚠️ **Stripe Integration** | Preparado (comentado) | Configurar chaves STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_PREMIUM_PRICE_ID |
| ⚠️ **Thumbnails de Modelos** | Faltando | Gerar imagens em `/public/thumbnails/` para todos 46 modelos |
| ⚠️ **Dark/Neon/Minimal Variants** | Parcial | Componentes existem mas stylePreset não é aplicado em todos |

### Média Prioridade

| Feature | Status | Descrição |
|---------|--------|-----------|
| 🔄 **Preview em tempo real** | Implementado parcial | StructurePhase tem preview, ContentPhase precisa melhorar |
| 🔄 **Separators entre blocos** | Tabela existe | UI de seleção no editor não conectada |
| 🔄 **WhatsApp Floating Button** | Componente existe | Config panel no editor não testado |
| 🔄 **Analytics Dashboard** | Básico | Falta gráficos e métricas avançadas |

### Baixa Prioridade

| Feature | Status | Descrição |
|---------|--------|-----------|
| 📝 **Export Backup** | Edge function existe | UI para trigger não implementada |
| 📝 **Webhooks** | Tabelas existem | UI de configuração incompleta |
| 📝 **A/B Testing** | Estrutura existe | UI de criação/análise não implementada |
| 📝 **Sites Multi-page** | Tabelas existem | Fluxo completo não testado |

### Edge Functions Pendentes de Configuração

```
supabase/functions/
├── create-checkout/     # Precisa: STRIPE_SECRET_KEY
├── customer-portal/     # Precisa: STRIPE_SECRET_KEY  
├── stripe-webhook/      # Precisa: STRIPE_WEBHOOK_SECRET
```

---

## 📁 Arquitetura de Arquivos

### `/src/lib/` - Lógica de Negócio

| Arquivo | Propósito | Conexões |
|---------|-----------|----------|
| **`sectionModels.ts`** | 🔴 **CRÍTICO** - Catálogo central de 46 modelos | SectionLoader, StructurePhase, ContentEditor |
| `lpApi.ts` | CRUD de Landing Pages | Dashboard, Editor |
| `lpContentApi.ts` | CRUD de conteúdo (lp_content) | ContentEditor, SectionLoader |
| `authApi.ts` | Autenticação e roles | ProtectedRoute, hooks |
| `billingApi.ts` | Planos e assinaturas | UpgradeModal, Dashboard |
| `sectionStyleTypes.ts` | Tipos de estilo visual | SectionLoader, SectionStylePanel |
| `premiumPresets.ts` | Configurações visuais premium | SectionLoader |
| `componentResolver.ts` | Resolução de componentes | SectionLoader (legado) |

### `/src/components/sections/` - Componentes de Seção

| Arquivo | Propósito | Editable? |
|---------|-----------|-----------|
| **`SectionLoader.tsx`** | 🔴 **CRÍTICO** - Orquestra renderização | - |
| **`registry.ts`** | Mapeia modelId → Componente | - |
| `Hero.tsx` | Seção hero base | `HeroEditable.tsx` |
| `Beneficios.tsx` | Seção benefícios base | `BeneficiosEditable.tsx` |
| `FAQ.tsx` | Seção FAQ base | `FAQEditable.tsx` |
| `Planos.tsx` | Seção planos base | `PlanosEditable.tsx` |
| `ProvasSociais.tsx` | Seção depoimentos | `ProvasSociaisEditable.tsx` |
| `ComoFunciona.tsx` | Seção passos | `ComoFuncionaEditable.tsx` |
| `ParaQuemE.tsx` | Seção personas | `ParaQuemEEditable.tsx` |
| `ChamadaFinal.tsx` | CTA final | `ChamadaFinalEditable.tsx` |
| `MenuSection.tsx` | Header/navegação | `MenuEditable.tsx` |
| `Rodape.tsx` | Footer | `RodapeEditable.tsx` |
| `*Dark.tsx` | Variantes dark mode | Via stylePreset |
| `*Neon.tsx` | Variantes neon | Via stylePreset |
| `*Minimal.tsx` | Variantes minimalistas | Via stylePreset |

### `/src/components/editor/` - Sistema de Edição

| Arquivo | Propósito |
|---------|-----------|
| **`BlockEditor.tsx`** | 🔴 **CRÍTICO** - Orquestra editor completo |
| **`StructurePhase.tsx`** | Fase 1: Adicionar/reordenar blocos |
| **`ContentPhase.tsx`** | Fase 2: Editar conteúdo inline |
| `EditorHeader.tsx` | Header do editor |
| `EditorNavTabs.tsx` | Navegação entre fases |
| `EditorSettingsPanel.tsx` | Painel lateral de configurações |
| `ModelThumbnail.tsx` | Renderiza thumbnail abstrato de modelo |
| `TemplatePicker.tsx` | Modal de seleção de modelo |
| `ContentEditor.tsx` | Editor de campos (legado modal) |
| `*Editor.tsx` | Sub-editors para JSON (Beneficios, FAQ, etc) |

### `/src/pages/` - Rotas

| Pasta | Arquivos Principais | Acesso |
|-------|---------------------|--------|
| `/pages/master/` | MasterDashboard, MasterUsers, MasterPlans, MasterTemplates, MasterHomepage | admin_master |
| `/pages/client/` | Profile, AnalyticsDashboard, LeadsExport | client |
| `/pages/admin/` | AdminDashboard, AdminLPPreview (legado) | owner/editor |
| `/pages/auth/` | Login, Register, ResetPassword | público |
| `/pages/` | Index, Dashboard, MeuSite, LPBuilder | varia |

---

## 🧩 Sistema de Modelos de Seção

### Catálogo v3.0 - 46 Modelos

```
SEÇÃO          | FREE | PRO | PREMIUM | TOTAL
---------------|------|-----|---------|------
Menu           | 2    | 2   | 2       | 6
Hero           | 2    | 2   | 3       | 7
Como Funciona  | 1    | 1   | 1       | 3
Para Quem É    | 1    | 1   | 1       | 3
Benefícios     | 1    | 2   | 3       | 6
Provas Sociais | 1    | 2   | 4       | 7
Planos         | 1    | 2   | 3       | 6
FAQ            | 1    | 2   | 3       | 6
Chamada Final  | 1    | 2   | 3       | 6
Rodapé         | 1    | 2   | 3       | 6
---------------|------|-----|---------|------
TOTAL          | 12   | 18  | 26      | 46
```

### Estrutura de um Modelo (`SectionModel`)

```typescript
{
  id: 'hero_glass_aurora',           // ID único
  section: 'hero',                   // Seção pertencente
  name: 'Hero glass aurora',         // Nome de exibição
  description: 'Hero com efeito aurora', // Descrição
  plan: 'free',                      // Plano mínimo
  category: 'hero',                  // Categoria (filtro)
  component: 'Hero',                 // Componente React
  thumbnail: '/thumbnails/hero/...',  // Imagem preview
  stylePreset: 'aurora',             // Preset visual
  motionPreset: 'fade-stagger',      // Preset de animação
  fields: [...],                     // Campos editáveis
  images: [...],                     // Imagens editáveis
  hasJsonEditor: false,              // Tem editor JSON?
}
```

---

## 🔧 Como Adicionar/Remover Modelos

### Arquivos que PRECISAM ser Editados

```
┌─────────────────────────────────────────────────────────────┐
│  1. src/lib/sectionModels.ts                                │
│     └─ SECTION_MODELS[] → Adicionar/remover entrada         │
├─────────────────────────────────────────────────────────────┤
│  2. src/components/sections/registry.ts                     │
│     └─ SECTION_COMPONENT_REGISTRY → Mapear modelId          │
├─────────────────────────────────────────────────────────────┤
│  3. src/components/sections/SectionLoader.tsx               │
│     └─ SECTION_COMPONENT_REGISTRY interno → Mapear          │
│     └─ Importar novo componente se necessário               │
├─────────────────────────────────────────────────────────────┤
│  4. (Se novo componente) src/components/sections/           │
│     └─ Criar NovoComponente.tsx                             │
│     └─ Criar NovoComponenteEditable.tsx                     │
└─────────────────────────────────────────────────────────────┘
```

### Passo a Passo: Adicionar Novo Modelo

#### 1. Adicionar em `sectionModels.ts`

```typescript
// Em SECTION_MODELS[]
{
  id: 'hero_meu_novo_modelo',
  section: 'hero',
  name: 'Meu Novo Hero',
  description: 'Descrição do modelo',
  plan: 'pro',
  category: 'hero',
  component: 'Hero', // ou novo componente
  thumbnail: '/thumbnails/hero/hero_meu_novo_modelo.webp',
  stylePreset: 'glass',
  motionPreset: 'fade-stagger',
  fields: HERO_FIELDS,
  images: [{ key: 'imagem', label: 'Imagem principal' }],
},
```

#### 2. Mapear em `registry.ts`

```typescript
hero: {
  // ... existentes
  hero_meu_novo_modelo: Hero, // ou NovoComponente
},
```

#### 3. Mapear em `SectionLoader.tsx`

```typescript
const SECTION_COMPONENT_REGISTRY = {
  hero: {
    // ... existentes
    MeuNovoComponente, // se for novo componente
  },
}
```

#### 4. (Opcional) Criar Componente

```typescript
// src/components/sections/MeuNovoHero.tsx
export const MeuNovoHero = ({ content, stylePreset, ...props }) => {
  // Implementação
};

// src/components/sections/MeuNovoHeroEditable.tsx
export const MeuNovoHeroEditable = ({ content, onContentUpdate, ...props }) => {
  // Implementação com InlineTextEditor
};
```

### Passo a Passo: Remover Modelo

1. **Remover de `SECTION_MODELS[]`** em `sectionModels.ts`
2. **Manter mapeamento em `registry.ts`** como fallback (ou remover se não usado)
3. **NÃO remover componente** se outros modelos usam

---

## 🔄 Fluxo de Dados

### Renderização de Seção

```
┌─────────────────────────────────────────────────────────────┐
│  1. BlockEditor carrega conteúdo do Supabase                │
│     └─ lp_content (seções + conteúdo)                       │
│     └─ lp_settings (estilos globais)                        │
├─────────────────────────────────────────────────────────────┤
│  2. Para cada seção, chama SectionLoader                    │
│     └─ sectionKey: 'hero'                                   │
│     └─ content: { titulo, subtitulo, __model_id, ... }      │
├─────────────────────────────────────────────────────────────┤
│  3. SectionLoader resolve variante                          │
│     └─ resolveVariant() → lê __model_id do content          │
│     └─ getSectionModel() → busca modelo em SECTION_MODELS   │
├─────────────────────────────────────────────────────────────┤
│  4. SectionLoader resolve componente                        │
│     └─ SECTION_COMPONENT_REGISTRY[section][componentName]   │
│     └─ Se editable=true, usa *Editable.tsx                  │
├─────────────────────────────────────────────────────────────┤
│  5. Componente renderiza com props                          │
│     └─ content (dados)                                      │
│     └─ stylePreset (dark/neon/minimal/glass)                │
│     └─ onContentUpdate (se editable)                        │
└─────────────────────────────────────────────────────────────┘
```

### Salvamento de Conteúdo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuário edita campo (InlineTextEditor)                  │
├─────────────────────────────────────────────────────────────┤
│  2. onBlur dispara → onContentUpdate(sectionKey, newContent)│
├─────────────────────────────────────────────────────────────┤
│  3. BlockEditor atualiza estado local                       │
├─────────────────────────────────────────────────────────────┤
│  4. Auto-save chama saveSectionContent()                    │
│     └─ Upsert em lp_content                                 │
├─────────────────────────────────────────────────────────────┤
│  5. SaveIndicator mostra "Salvo ✓"                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Componentes Críticos

### `SectionLoader.tsx`

**Responsabilidade:** Renderizar qualquer seção com o modelo correto

**Funções principais:**
- `resolveVariant()` - Determina qual modelo usar
- `getComponentForSection()` - Resolve componente React
- `buildSectionStyles()` - Aplica estilos visuais

**Props importantes:**
```typescript
interface SectionLoaderProps {
  sectionKey: SectionKey;      // 'hero', 'beneficios', etc
  content?: LPContent;          // Dados da seção
  settings?: Record<string>;    // Estilos globais
  editable?: boolean;           // Modo edição?
  onContentUpdate?: Function;   // Callback de salvamento
  userPlan?: PlanLevel;         // Plano do usuário
}
```

### `BlockEditor.tsx`

**Responsabilidade:** Orquestrar todo o editor visual

**Estados principais:**
- `blocks[]` - Lista de blocos da LP
- `activePhase` - 'structure' | 'content' | 'preview'
- `hasUnsavedChanges` - Controle de salvamento

**Fases:**
1. **StructurePhase** - Adicionar/remover/reordenar blocos
2. **ContentPhase** - Editar conteúdo inline
3. **Preview** - Visualizar como público

### `sectionModels.ts`

**Responsabilidade:** Fonte única de verdade para modelos

**Exports principais:**
```typescript
export const SECTION_MODELS: SectionModel[];
export const SECTION_MODELS_BY_SECTION: Record<SectionKey, SectionModel[]>;
export function getSectionModel(section: SectionKey, modelId: string): SectionModel | undefined;
```

---

## 📊 Tabelas do Banco de Dados

### Principais

| Tabela | Propósito | RLS |
|--------|-----------|-----|
| `landing_pages` | LP principal | owner_id |
| `lp_content` | Conteúdo das seções | via lp_id |
| `lp_settings` | Estilos e configurações | via lp_id |
| `lp_leads` | Leads capturados | via lp_id |
| `lp_events` | Eventos de tracking | via lp_id |

### Governança

| Tabela | Propósito | RLS |
|--------|-----------|-----|
| `user_profiles` | Perfil + plano do usuário | user_id |
| `user_roles` | Role do usuário (admin_master/client) | user_id |
| `plan_limits` | Limites por plano | public read |
| `audit_logs` | Log de ações admin | admin_master |

### Templates

| Tabela | Propósito | RLS |
|--------|-----------|-----|
| `section_templates` | Templates de seção (DB) | public read |
| `section_model_configs` | Config de visibilidade | admin_master |
| `section_separators` | Separadores visuais | public read |

---

## 🔐 Sistema de Segurança

### Funções de Segurança (SQL)

```sql
-- Verificar role de usuário
has_app_role(_user_id, 'admin_master') → boolean

-- Verificar se é admin master
is_admin_master(_user_id) → boolean

-- Verificar acesso a LP
can_edit_lp(_user_id, _lp_id) → boolean
can_manage_lp(_user_id, _lp_id) → boolean

-- Verificar plano
get_user_plan(_user_id) → 'free' | 'pro' | 'premium'
can_create_site(_user_id) → boolean
```

### ProtectedRoute Components

```typescript
// Só admin_master
<AdminMasterRoute><MasterDashboard /></AdminMasterRoute>

// Só client autenticado
<ClientRoute><Dashboard /></ClientRoute>

// Qualquer autenticado
<ProtectedRoute><MeuSite /></ProtectedRoute>
```

---

## 📝 Checklist de QA

### Antes de Deploy

- [ ] Todos 46 modelos renderizam em `/qa/sections`
- [ ] Modo mobile (375px) sem overflow
- [ ] Todos stylePresets aplicam corretamente (dark/neon/minimal)
- [ ] SectionStylePanel salva estilos
- [ ] WhatsApp button aparece quando habilitado
- [ ] Separators entre blocos funcionam
- [ ] Auto-save funciona sem perda de dados
- [ ] Limites de plano bloqueiam features corretas

### Stripe (quando configurar)

- [ ] create-checkout redireciona para Stripe
- [ ] stripe-webhook atualiza plan_subscriptions
- [ ] customer-portal abre billing portal
- [ ] UpgradeModal tem CTAs funcionais

---

## 🔗 Links Úteis

- **Supabase Dashboard:** [Lovable Cloud]
- **Documentação Técnica:** `/docs/DOSSIE_TECNICO_NOBRON_V3.md`
- **Guia de Thumbnails:** `/docs/THUMBNAILS_GUIDE.md`
- **Catálogo de Templates:** `/docs/TEMPLATE_CATALOG.md`
