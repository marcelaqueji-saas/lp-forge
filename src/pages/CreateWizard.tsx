/**
 * CreateWizard - Assistente guiado de criação de LP
 * Sprint 4: Criação passo-a-passo com preview real
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Layout,
  Type,
  Plus,
  Check,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ModelThumbnail } from '@/components/editor/ModelThumbnail';
import { SECTION_MODELS_BY_SECTION, SectionKey, PlanLevel } from '@/lib/sectionModels';
import { BLOCK_DEFINITIONS, getDynamicBlocks, canUseModel, PLAN_LIMITS } from '@/lib/blockEditorTypes';
import { saveSectionContent, saveSettings } from '@/lib/lpContentApi';
import { useAuth } from '@/hooks/useAuth';
import { usePlanLimits } from '@/hooks/usePlanLimits';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'objective',
    title: 'Objetivo da página',
    description: 'O que você quer alcançar com esta página?',
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: 'hero',
    title: 'Escolha o Hero',
    description: 'Selecione o estilo da seção principal',
    icon: <Layout className="w-5 h-5" />,
  },
  {
    id: 'cta',
    title: 'Configure o CTA',
    description: 'Defina o texto e link do botão principal',
    icon: <Type className="w-5 h-5" />,
  },
  {
    id: 'block',
    title: 'Adicione um bloco',
    description: 'Escolha um bloco extra para sua página',
    icon: <Plus className="w-5 h-5" />,
  },
  {
    id: 'finish',
    title: 'Pronto para editar!',
    description: 'Sua página está pronta para personalização',
    icon: <Rocket className="w-5 h-5" />,
  },
];

const OBJECTIVES = [
  { id: 'leads', label: 'Capturar leads', description: 'Coletar emails e contatos' },
  { id: 'sales', label: 'Vender produto/serviço', description: 'Apresentar e converter' },
  { id: 'brand', label: 'Apresentar marca', description: 'Institucional e branding' },
  { id: 'event', label: 'Divulgar evento', description: 'Inscrições e informações' },
];

const CreateWizard = () => {
  const { lpId } = useParams();
  const navigate = useNavigate();
  const { profile, isAdminMaster } = useAuth();
  const { plan } = usePlanLimits();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [objective, setObjective] = useState('');
  const [selectedHero, setSelectedHero] = useState('hero-basic');
  const [ctaLabel, setCtaLabel] = useState('Quero saber mais');
  const [ctaUrl, setCtaUrl] = useState('#contato');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedBlockModel, setSelectedBlockModel] = useState<string | null>(null);

  const userPlan = isAdminMaster ? 'master' : (plan as PlanLevel);
  const heroModels = SECTION_MODELS_BY_SECTION['hero'] || [];
  const dynamicBlocks = getDynamicBlocks();
  
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const canProceed = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'objective':
        return objective !== '';
      case 'hero':
        return selectedHero !== '';
      case 'cta':
        return ctaLabel.trim() !== '' && ctaUrl.trim() !== '';
      case 'block':
        return true; // Optional step
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finalizar wizard
      await handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (!lpId) return;
    
    setSaving(true);
    try {
      // Salvar Hero
      await saveSectionContent(lpId, 'hero', {
        __model_id: selectedHero,
        titulo: heroTitle || 'Título Principal',
        subtitulo: heroSubtitle || 'Subtítulo da sua página',
        cta_primary_label: ctaLabel,
        cta_primary_url: ctaUrl,
      });

      // Salvar bloco adicional se selecionado
      if (selectedBlock && selectedBlockModel) {
        await saveSectionContent(lpId, selectedBlock as SectionKey, {
          __model_id: selectedBlockModel,
        });
      }

      // Salvar configurações
      await saveSettings(lpId, {
        hero_variante: selectedHero,
        wizard_completed: 'true',
        objective: objective,
      });

      toast({ title: 'Página criada com sucesso!' });
      navigate(`/meu-site/${lpId}`);
    } catch (error) {
      console.error('[CreateWizard] Error:', error);
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];

    switch (step.id) {
      case 'objective':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OBJECTIVES.map(obj => (
                <motion.button
                  key={obj.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setObjective(obj.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    objective === obj.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <h4 className="font-semibold">{obj.label}</h4>
                  <p className="text-sm text-muted-foreground">{obj.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {heroModels.map(model => {
                const isLocked = userPlan !== 'master' && !canUseModel(model.plan, userPlan);
                return (
                  <ModelThumbnail
                    key={model.id}
                    modelId={model.id}
                    name={model.name}
                    plan={model.plan}
                    isLocked={isLocked}
                    isSelected={selectedHero === model.id}
                    onClick={() => !isLocked && setSelectedHero(model.id)}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Título da página</label>
              <Input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Ex: Transforme seu negócio"
                className="h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subtítulo</label>
              <Textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Descreva brevemente sua proposta de valor"
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Texto do botão CTA</label>
              <Input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Ex: Começar agora"
                className="h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Link do botão</label>
              <Input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="Ex: #contato ou https://..."
                className="h-11"
              />
            </div>
          </div>
        );

      case 'block':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Opcional: adicione um bloco extra à sua página
            </p>
            
            {/* Block type selector */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {dynamicBlocks.map(block => (
                <Button
                  key={block.key}
                  variant={selectedBlock === block.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedBlock(block.key);
                    const models = SECTION_MODELS_BY_SECTION[block.key] || [];
                    setSelectedBlockModel(models[0]?.id || null);
                  }}
                >
                  {block.name}
                </Button>
              ))}
            </div>

            {/* Model selector for selected block */}
            {selectedBlock && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(SECTION_MODELS_BY_SECTION[selectedBlock as SectionKey] || []).map(model => {
                  const isLocked = userPlan !== 'master' && !canUseModel(model.plan, userPlan);
                  return (
                    <ModelThumbnail
                      key={model.id}
                      modelId={model.id}
                      name={model.name}
                      plan={model.plan}
                      isLocked={isLocked}
                      isSelected={selectedBlockModel === model.id}
                      onClick={() => !isLocked && setSelectedBlockModel(model.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'finish':
        return (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-bold">Tudo pronto!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Sua página está configurada. Clique em "Ir para o editor" para personalizar
              todos os detalhes.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/painel')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">Assistente de Criação</span>
          </div>

          <div className="w-20" /> {/* Spacer */}
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Steps indicator */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step.icon
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Step header */}
              <div className="text-center">
                <h2 className="text-2xl font-bold">{WIZARD_STEPS[currentStep].title}</h2>
                <p className="text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
              </div>

              {/* Step content */}
              <div className="glass-card p-6">
                {renderStepContent()}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
            >
              {saving ? (
                'Salvando...'
              ) : currentStep === WIZARD_STEPS.length - 1 ? (
                <>
                  Ir para o editor
                  <Rocket className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWizard;
