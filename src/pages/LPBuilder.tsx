import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, ArrowRight, Check, GripVertical, Eye, EyeOff, Lock,
  Loader2, LayoutGrid, Palette, ListChecks, ChevronUp, ChevronDown,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  saveSectionContent, 
  saveSettings, 
  getSectionOrder, 
  updateSectionOrder,
} from '@/lib/lpContentApi';
import { UpgradeModal } from '@/components/client/UpgradeModal';
import { PlanTier } from '@/lib/authApi';
import { trackEvent } from '@/lib/tracking';

const usePremiumGate = (userPlan: PlanTier | undefined) => {
  const requirePro = (feature: string, lpId?: string, options?: { silent?: boolean }) => {
    if (userPlan && userPlan !== 'free') return true;

    try {
      trackEvent({
        event_type: 'premium_gate',
        ...(lpId ? { lp_id: lpId } : {}),
        metadata: {
          feature,
          plan: userPlan || 'free',
        },
      });
    } catch (err) {
      console.warn('[premium_gate] tracking failed', err);
    }

    if (!options?.silent) {
      toast({
        title: 'Quer sua página vendendo mais?',
        description: 'Desbloqueie ordenação livre para performar como um profissional.',
        variant: 'default',
        className: 'border-amber-500 bg-amber-100 text-amber-900 font-medium',
      });
    }

    return false;
  };

  return { requirePro };
};


const AVAILABLE_SECTIONS = [
  { key: 'menu', name: 'Menu', required: true, description: 'Navegação do site' },
  { key: 'hero', name: 'Hero', required: true, description: 'Seção principal de destaque' },
  { key: 'como_funciona', name: 'Como Funciona', required: false, description: 'Passos do seu processo' },
  { key: 'para_quem_e', name: 'Para Quem É', required: false, description: 'Perfis do público-alvo' },
  { key: 'beneficios', name: 'Benefícios', required: false, description: 'Vantagens do seu produto/serviço' },
  { key: 'provas_sociais', name: 'Provas Sociais', required: false, description: 'Depoimentos de clientes' },
  { key: 'planos', name: 'Planos e Preços', required: false, description: 'Tabela de preços' },
  { key: 'faq', name: 'FAQ', required: false, description: 'Perguntas frequentes' },
  { key: 'chamada_final', name: 'Chamada Final', required: false, description: 'CTA final da página' },
  { key: 'rodape', name: 'Rodapé', required: true, description: 'Informações de contato e links' },
];


// Available variants (fallback when no templates in DB)
const DEFAULT_VARIANTS: Record<string, Array<{ id: string; name: string; description: string }>> = {
  menu: [
    { id: 'modelo_a', name: 'Clássico', description: 'Logo à esquerda, links à direita' },
    { id: 'modelo_b', name: 'Centralizado', description: 'Logo no centro, links abaixo' },
  ],
  hero: [
    { id: 'modelo_a', name: 'Texto à Esquerda', description: 'Layout com imagem à direita' },
    { id: 'modelo_b', name: 'Centralizado', description: 'Texto centralizado, impactante' },
    { id: 'modelo_c', name: 'Com Vídeo', description: 'Destaque para conteúdo em vídeo' },
  ],
  como_funciona: [
    { id: 'modelo_a', name: 'Timeline', description: 'Passos em linha do tempo' },
    { id: 'modelo_b', name: 'Cards', description: 'Passos em cards lado a lado' },
  ],
  para_quem_e: [
    { id: 'modelo_a', name: 'Lista', description: 'Perfis em lista vertical' },
    { id: 'modelo_b', name: 'Grid', description: 'Perfis em grade' },
  ],
  beneficios: [
    { id: 'modelo_a', name: 'Grid 2x2', description: 'Benefícios em grade' },
    { id: 'modelo_b', name: 'Lista com Ícones', description: 'Lista vertical com ícones grandes' },
    { id: 'modelo_c', name: 'Cards Destacados', description: 'Cards com hover effect' },
  ],
  provas_sociais: [
    { id: 'modelo_a', name: 'Carrossel', description: 'Depoimentos em carrossel' },
    { id: 'modelo_b', name: 'Grid', description: 'Depoimentos em grade' },
    { id: 'modelo_c', name: 'Destaque Único', description: 'Um depoimento por vez, grande' },
  ],
  planos: [
    { id: 'modelo_a', name: '3 Colunas', description: 'Três planos lado a lado' },
    { id: 'modelo_b', name: 'Destaque Central', description: 'Plano do meio destacado' },
  ],
  faq: [
    { id: 'modelo_a', name: 'Acordeão', description: 'Perguntas expansíveis' },
    { id: 'modelo_b', name: '2 Colunas', description: 'FAQ em duas colunas' },
  ],
  chamada_final: [
    { id: 'modelo_a', name: 'Simples', description: 'Texto e botão centralizados' },
    { id: 'modelo_b', name: 'Com Background', description: 'Fundo colorido destacado' },
    { id: 'modelo_c', name: 'Com Formulário', description: 'CTA com campo de email' },
  ],
  rodape: [
    { id: 'modelo_a', name: 'Simples', description: 'Uma linha com copyright' },
    { id: 'modelo_b', name: 'Completo', description: 'Múltiplas colunas de links' },
  ],
};

interface SectionState {
  key: string;
  enabled: boolean;
  variant: string;
}

const LPBuilder = () => {
   const { lpId: lpIdParam } = useParams<{ lpId: string }>();
  const lpId = lpIdParam || '';
  const navigate = useNavigate();
  const { user, profile, planLimits, isAdminMaster } = useAuth();
  const isMobile = useIsMobile();
  const { requirePro } = usePremiumGate((profile?.plan as PlanTier) || 'free');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lpData, setLpData] = useState<any>(null);
  const [sections, setSections] = useState<SectionState[]>([]);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);
  const [gatedToggleIndex, setGatedToggleIndex] = useState<number | null>(null);
  
  // Upgrade modal
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

    useEffect(() => {
    // Se não tiver lpId na URL, volta para o onboarding
    if (!lpIdParam) {
      navigate('/onboarding');
      return;
    }

    // Carrega dados usando o lpId garantido da URL
    loadData(lpIdParam);
  }, [lpIdParam]);

  const loadData = async (lpId: string) => {
    // Load LP data
    const { data: lp, error: lpError } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', lpId)
      .single();

    if (lpError || !lp) {
      toast({ title: 'LP não encontrada', variant: 'destructive' });
      navigate('/onboarding');
      return;
    }

    // Check ownership
    if (lp.owner_id !== user?.id && !isAdminMaster) {
      toast({ title: 'Acesso negado', variant: 'destructive' });
      navigate('/painel');
      return;
    }

    setLpData(lp);

    // Load available templates from DB
    const { data: templates } = await supabase
      .from('section_templates')
      .select('*')
      .eq('is_active', true)
      .order('section', { ascending: true });

    setDbTemplates(templates || []);

    // Load section order from DB (já vem consolidado pelo backend)
    const dbSectionOrder = await getSectionOrder(lpId);

    // Garante que só usamos seções conhecidas e preenchendo as que faltarem
    const orderedKeys = [
      ...dbSectionOrder.filter((key) =>
        AVAILABLE_SECTIONS.some((s) => s.key === key)
      ),
      ...AVAILABLE_SECTIONS.map((s) => s.key).filter(
        (key) => !dbSectionOrder.includes(key)
      ),
    ];

    const initialSections: SectionState[] = orderedKeys.map((key) => {
      const config = AVAILABLE_SECTIONS.find((s) => s.key === key)!;
      return {
        key,
        enabled:
          config.required ||
          ['hero', 'beneficios', 'chamada_final', 'rodape'].includes(key),
        variant: 'modelo_a',
      };
    });

    setSections(initialSections);
    setLoading(false);
  };


  const getVariantsForSection = (sectionKey: string) => {
    // First check DB templates
    const dbVariants = dbTemplates
      .filter(t => t.section === sectionKey)
      .map(t => ({
        id: t.variant_id,
        name: t.name,
        description: t.description || '',
        minPlan: t.min_plan_tier as PlanTier,
        category: t.category,
        thumbnail: t.preview_thumbnail,
      }));

    if (dbVariants.length > 0) {
      return dbVariants;
    }

    // Fallback to default variants
    return (DEFAULT_VARIANTS[sectionKey] || []).map(v => ({
      ...v,
      minPlan: 'free' as PlanTier,
      category: 'básico',
      thumbnail: null,
    }));
  };

  const canUseVariant = (variant: { minPlan: PlanTier; category: string }) => {
    if (!planLimits) return true;
    
    const userPlan = profile?.plan as PlanTier || 'free';
    const planOrder: PlanTier[] = ['free', 'pro', 'premium'];
    
    // Check min plan tier
    if (planOrder.indexOf(variant.minPlan) > planOrder.indexOf(userPlan)) {
      return false;
    }

    // Check allowed categories
    if (planLimits.allowed_model_categories && 
        !planLimits.allowed_model_categories.includes(variant.category)) {
      return false;
    }

    return true;
  };

  const toggleSection = (key: string) => {
    const section = AVAILABLE_SECTIONS.find(s => s.key === key);
    if (!section) return;

    // Não permitir desligar obrigatórias
    if (section.required || key === 'hero') return;

    if (!sections.find(s => s.key === key)?.enabled) {
      const activeFree = sections.filter(
        s => s.enabled && s.key !== 'menu' && s.key !== 'rodape'
      ).length;

      if (activeFree >= 3) {
        setGatedToggleIndex(sections.findIndex(s => s.key === key));
        toast({
          title: 'Limite do plano Free',
          description: 'Ative até 3 seções. Desbloqueie mais no plano Pro.',
        });
        return;
      }
    }

    setSections(prev =>
      prev.map(s =>
        s.key === key ? { ...s, enabled: !s.enabled } : s
      )
    );
  };


  const moveSection = async (index: number, direction: 'up' | 'down') => {
    // Premium gate para ordenação livre (quando ativar botões de mover)
    if (!requirePro('section_reorder', lpId)) {
      return;
    }

    const section = sections[index];
    const config = AVAILABLE_SECTIONS.find(s => s.key === section.key);
    if (!config) return;

    // trava menu/rodapé em posições extremas
    if (config.required && (config.key === 'menu' || config.key === 'rodape')) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= sections.length) return;
    if (sections[targetIndex].key === 'menu' && direction === 'up') return;
    if (sections[targetIndex].key === 'rodape' && direction === 'down') return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);

    if (lpId) {
      const orderedKeys = newSections.map(s => s.key);
      await updateSectionOrder(lpId, orderedKeys);
    }
  };

  const selectVariant = (sectionKey: string, variantId: string, variant: any) => {
    if (!canUseVariant(variant)) {
      setUpgradeFeature(`o modelo "${variant.name}"`);
      setUpgradeOpen(true);
      return;
    }

    setSections(prev => prev.map(s => 
      s.key === sectionKey ? { ...s, variant: variantId } : s
    ));
  };

  const handleSaveAndFinish = async () => {
    if (!lpId) return;
    setSaving(true);

    try {
      // Get enabled sections in order
      const enabledSections = sections.filter(s => s.enabled);
      
      // Save minimal content for each section with order (apenas as ativas)
      for (let i = 0; i < enabledSections.length; i++) {
        const section = enabledSections[i];
        await saveSectionContent(lpId, section.key, {
          _initialized: 'true', // Mark as initialized by builder
        }, i + 1);
      }

      // Save variant settings
      const variantSettings: Record<string, string> = {};
      sections.forEach(s => {
        variantSettings[`${s.key}_variante`] = s.variant;
      });
      
      // Also save which sections are enabled
      variantSettings['enabled_sections'] = JSON.stringify(
        enabledSections.map(s => s.key)
      );

      await saveSettings(lpId, variantSettings);

      // Persistir a ordem completa das seções (ativas + inativas) no banco,
      // para a LP pública ler essa mesma ordem como referência.
      await updateSectionOrder(lpId, sections.map(s => s.key));

      toast({ title: 'Estrutura salva!', description: 'Redirecionando para o editor...' });
      navigate(`/meu-site/${lpId}?context=editor&plan=${profile?.plan || 'free'}`);

    } catch (error) {
      console.error('Error saving builder:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const resetBuilder = () => {
    const initialSections: SectionState[] = AVAILABLE_SECTIONS.map(s => ({
      key: s.key,
      enabled: s.required || ['hero', 'beneficios', 'chamada_final', 'rodape'].includes(s.key),
      variant: 'modelo_a',
    }));
    setSections(initialSections);
    setStep(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const enabledSections = sections.filter(s => s.enabled);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/onboarding')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-sm">Construtor de Página</h1>
                <p className="text-xs text-muted-foreground">Passo {step} de 3</p>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    s === step 
                      ? "bg-primary text-primary-foreground" 
                      : s < step 
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Section Structure */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Escolha as seções</h2>
                <p className="text-muted-foreground text-sm">
                  Ative as seções que você quer na sua página e organize a ordem.
                </p>
              </div>

              <div className="space-y-2">
                {sections.map((section, index) => {
                  const config = AVAILABLE_SECTIONS.find(s => s.key === section.key)!;
                  const isFirst = index === 0;
                  const isLast = index === sections.length - 1;

                  return (
                    <div
                      key={section.key}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border transition-all",
                        section.enabled 
                          ? "bg-card border-primary/20" 
                          : "bg-muted/30 border-transparent opacity-60"
                      )}
                    >
                      {/* Drag / ordem (UI pode ser ativada depois) */}
                      <div className="flex flex-col items-center gap-1 mr-1 text-muted-foreground/70">
                        <GripVertical className="w-4 h-4" />
                        {/* Botões de mover – opcionais para quando quiser liberar no layout */}
                        {/*
                        <button
                          type="button"
                          disabled={isFirst || section.key === 'menu'}
                          onClick={() => moveSection(index, 'up')}
                          className="disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast || section.key === 'rodape'}
                          onClick={() => moveSection(index, 'down')}
                          className="disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        */}
                      </div>

                      {/* Section info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{config.name}</span>
                          {config.required && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {config.description}
                        </p>
                      </div>

                      {/* Toggle */}
                      <motion.button
                        type="button"
                        className={cn(
                          "relative inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors shrink-0",
                          section.enabled ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-border text-foreground",
                          config.required && "opacity-70 cursor-not-allowed"
                        )}
                        disabled={config.required}
                        onClick={() => toggleSection(section.key)}
                        animate={
                          gatedToggleIndex === index
                            ? { x: [-6, 6, -4, 4, 0] }
                            : { x: 0 }
                        }
                        transition={{ duration: 0.2 }}
                        onAnimationComplete={() => setGatedToggleIndex(null)}
                      >
                        {section.enabled ? (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Ativa</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Inativa</span>
                          </>
                        )}
                        {gatedToggleIndex === index && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Lock className="w-3 h-3 text-primary" />
                          </motion.span>
                        )}
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => setStep(2)}>
                  Próximo: Escolher layouts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Choose Variants */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Escolha os layouts</h2>
                <p className="text-muted-foreground text-sm">
                  Selecione o modelo visual para cada seção ativa.
                </p>
              </div>

              <div className="space-y-6">
                {enabledSections.map(section => {
                  const config = AVAILABLE_SECTIONS.find(s => s.key === section.key)!;
                  const variants = getVariantsForSection(section.key);

                  return (
                    <div key={section.key} className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-3">{config.name}</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {variants.map(variant => {
                          const isSelected = section.variant === variant.id;
                          const canUse = canUseVariant(variant);

                          return (
                            <div
                              key={variant.id}
                              onClick={() => selectVariant(section.key, variant.id, variant)}
                              className={cn(
                                "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                                isSelected 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border hover:border-primary/50",
                                !canUse && "opacity-60"
                              )}
                            >
                              {!canUse && (
                                <div className="absolute top-2 right-2">
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              
                              {variant.thumbnail ? (
                                <div className="aspect-video bg-muted rounded mb-2 overflow-hidden">
                                  <img 
                                    src={variant.thumbnail} 
                                    alt={variant.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                                  <LayoutGrid className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{variant.name}</span>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {variant.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)}>
                  Próximo: Resumo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ListChecks className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Tudo pronto!</h2>
                <p className="text-muted-foreground text-sm">
                  Confira a estrutura da sua página antes de ir para o editor.
                </p>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <span className="text-sm font-medium">Seções ativas ({enabledSections.length})</span>
                </div>
                <div className="divide-y">
                  {enabledSections.map((section, index) => {
                    const config = AVAILABLE_SECTIONS.find(s => s.key === section.key)!;
                    const variants = getVariantsForSection(section.key);
                    const selectedVariant = variants.find(v => v.id === section.variant);

                    return (
                      <div key={section.key} className="flex items-center gap-4 px-4 py-3">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{config.name}</span>
                          {selectedVariant && (
                            <span className="text-xs text-muted-foreground ml-2">
                              • {selectedVariant.name}
                            </span>
                          )}
                        </div>
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button 
                  className="w-full h-12" 
                  onClick={handleSaveAndFinish}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Ir para o editor
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={resetBuilder}
                  >
                    Recomeçar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={upgradeFeature}
        currentPlan={profile?.plan as PlanTier || 'free'}
        requiredPlan="pro"
      />
    </div>
  );
};

export default LPBuilder;
