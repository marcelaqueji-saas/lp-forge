# 🔒 Auditoria do Painel Master - noBRon

**Data:** 2025-12-10  
**Escopo:** Correção do tratamento admin_master + fluxo de edição via Painel Master

---

## 📋 Resumo Executivo

O principal problema identificado era que usuários com role `admin_master` estavam sendo tratados como plano "free" ao editar LPs via Painel Master. Isso ocorria porque o componente `MeuSite.tsx` obtinha o plano diretamente de `profile.plan` (tabela `user_profiles`), ignorando a role do usuário.

### Problemas Corrigidos

1. ✅ **Plano Master não reconhecido**: Admin master via exibido como plano gratuito
2. ✅ **Limites aplicados incorretamente**: Blocos, modelos e recursos limitados para admin
3. ✅ **CTAs de upgrade aparecendo**: Botões de "Fazer upgrade" visíveis para admin master
4. ✅ **Tipos TypeScript inconsistentes**: `PlanLevel` não incluía 'master'

---

## 🔧 Alterações Realizadas

### 1. Sistema de Tipos (`src/lib/sectionModels.ts`)

**Antes:** `PlanLevel = 'free' | 'pro' | 'premium'`  
**Depois:** Adicionado `PlanLevelWithMaster = PlanLevel | 'master'`

Isso permite tipar corretamente variáveis que podem conter o plano master.

### 2. MeuSite.tsx (Editor Principal)

**Arquivo:** `src/pages/MeuSite.tsx`

**Mudanças:**
- Importa `isAdminMaster` do hook `useAuth`
- Verifica se usuário é admin_master via tabela `user_roles`
- Define `userPlan = 'master'` quando `isAdminMaster === true`
- Concede acesso de `owner` automaticamente para admin_master em qualquer LP

```typescript
// ANTES
const userPlan: PlanLevel = (profile?.plan as PlanLevel) || 'free';

// DEPOIS
const userPlan: PlanLevelWithMaster = isAdminMaster 
  ? 'master' 
  : ((profile?.plan as PlanLevel) || 'free');
```

### 3. BlockEditor.tsx

**Arquivo:** `src/components/editor/BlockEditor.tsx`

**Mudanças:**
- Tipo de `userPlan` alterado de `PlanLevel` para `PlanLevelWithMaster`
- Todos os componentes filhos agora recebem o tipo correto

### 4. BlockCard.tsx

**Arquivo:** `src/components/editor/BlockCard.tsx`

**Mudanças:**
- Tipo de `userPlan` alterado para `PlanLevelWithMaster`
- Verificação de modelos respeita plano master

### 5. PlanLimitIndicator.tsx

**Arquivo:** `src/components/editor/PlanLimitIndicator.tsx`

**Mudanças:**
- Adicionado suporte visual para plano "Master"
- Cores e labels para master: `bg-primary/10 text-primary`
- Não exibe botão de "Upgrade" para master
- Não exibe botão de "Desbloquear mais blocos" para master
- `isAtLimit` sempre `false` para master

### 6. AddBlockModal.tsx

**Arquivo:** `src/components/editor/AddBlockModal.tsx`

**Mudanças:**
- Já suportava `'master'` via união de tipos
- Exibe "Plano Master - Todos os modelos disponíveis" na descrição
- Nenhum modelo aparece bloqueado para master

### 7. UpgradeModal.tsx

**Arquivo:** `src/components/client/UpgradeModal.tsx`

**Mudanças:**
- Aceita `PlanLevelWithMaster` como `currentPlan`
- Retorna `null` imediatamente se `currentPlan === 'master'` (nunca exibe modal)
- Adicionado ícone Shield para plano master

### 8. SectionLoader.tsx

**Arquivo:** `src/components/sections/SectionLoader.tsx`

**Mudanças:**
- Tipo de `userPlan` alterado para `PlanLevelWithMaster`

### 9. blockEditorTypes.ts (Já estava correto)

**Arquivo:** `src/lib/blockEditorTypes.ts`

O arquivo já continha `PLAN_LIMITS` para `'master'` com:
- `maxLPs: 999`
- `maxDynamicBlocks: 999`
- `maxStorageMB: 10240`
- Todos os recursos habilitados

### 10. billingApi.ts (Já estava correto)

**Arquivo:** `src/lib/billingApi.ts`

A função `getEffectivePlanLimits()` já verificava `admin_master` primeiro e retornava `MASTER_PLAN_LIMITS`.

---

## 🛡️ Segurança

### Verificações Realizadas

| Item | Status | Detalhes |
|------|--------|----------|
| Rotas /master/* protegidas | ✅ | `AdminMasterRoute` wrapper em todas as rotas |
| RLS em landing_pages | ✅ | admin_master pode ler todas, mas respeita owner_id para edição |
| RLS em user_roles | ✅ | Apenas admin_master pode modificar roles |
| RLS em plan_limits | ✅ | Apenas admin_master pode atualizar limites |
| RLS em audit_logs | ✅ | Apenas admin_master pode visualizar |
| Função is_admin_master() | ✅ | SQL function com SECURITY DEFINER |
| Validação de role no backend | ✅ | Verificação via supabase em MeuSite.tsx |

### Fluxo de Acesso Admin Master

```
Usuário acessa /master/lps
    ↓
AdminMasterRoute verifica isAdminMaster via useAuth
    ↓
Se não for admin → redireciona para /painel
    ↓
Se for admin → carrega MasterLPs
    ↓
Clica em "Editar" LP
    ↓
Navega para /meu-site/:lpId
    ↓
MeuSite.tsx verifica user_roles no Supabase
    ↓
Se admin_master → userPlan = 'master', userRole = 'owner'
    ↓
BlockEditor renderiza sem restrições
```

---

## 📊 Componentes do Painel Master

### Páginas Auditadas

| Rota | Componente | Status | Observações |
|------|------------|--------|-------------|
| /master | MasterDashboard | ✅ | Stats carregando corretamente |
| /master/lps | MasterLPs | ✅ | Listagem + CRUD funcionando |
| /master/users | MasterUsers | ✅ | Gestão de roles e planos |
| /master/plans | MasterPlans | ✅ | Edição de limites por plano |
| /master/templates | MasterTemplates | ✅ | Catálogo de modelos |
| /master/audit | MasterAudit | ✅ | Logs de auditoria |
| /master/homepage | MasterHomepage | ✅ | Seleção de LP como homepage |

### Funcionalidades Verificadas

- [x] Criar LP via Master
- [x] Editar LP via Master (com permissões totais)
- [x] Excluir LP via Master (com confirmação)
- [x] Alterar role de usuário
- [x] Alterar plano de usuário
- [x] Visualizar logs de auditoria
- [x] Definir homepage do SaaS

---

## ⚡ Recomendações Futuras

### Alta Prioridade

1. **Exclusão de LP no Painel Cliente**
   - Atualmente só funciona no Master
   - Implementar em `/painel` com recálculo automático de `siteCount`

2. **Página de Perfil do Usuário**
   - Criar `/painel/perfil` com visualização de plano, uso, e opções de conta

### Média Prioridade

3. **Thumbnails Reais para Modelos**
   - Gerar screenshots automáticos dos modelos
   - Armazenar em `lp-media/template-previews/`

4. **Filtro por Dono em /master/lps**
   - Adicionar dropdown de filtro por owner_id
   - Útil para suporte ao cliente

### Baixa Prioridade

5. **Logs de Auditoria Mais Detalhados**
   - Registrar qual admin fez cada alteração em LP
   - Diff de conteúdo antes/depois

6. **Export de Relatórios**
   - CSV de usuários
   - CSV de LPs por período

---

## 📁 Arquivos Alterados

```
src/pages/MeuSite.tsx                          # Detecção de admin_master
src/components/editor/BlockEditor.tsx          # Tipo PlanLevelWithMaster
src/components/editor/BlockCard.tsx            # Tipo PlanLevelWithMaster
src/components/editor/PlanLimitIndicator.tsx   # Suporte visual para master
src/components/editor/AddBlockModal.tsx        # Já suportava master
src/components/client/UpgradeModal.tsx         # Não exibe para master
src/components/sections/SectionLoader.tsx      # Tipo PlanLevelWithMaster
docs/SPRINT_MASTER_AUDIT.md                    # Este relatório
```

---

## ✅ Conclusão

O fluxo do Painel Master agora está consistente:

1. **Admin master é reconhecido** em todo o sistema como plano "Master"
2. **Nenhuma restrição de plano** é aplicada ao admin master
3. **Nenhum CTA de upgrade** aparece para admin master
4. **Edição via Master** funciona com permissões totais
5. **Segurança mantida** via RLS e verificações de role

O sistema está pronto para uso em produção com a governança admin_master funcionando corretamente.
