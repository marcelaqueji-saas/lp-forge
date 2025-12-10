/**
 * Upgrade Page - Comparativo de planos com CTA
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowLeft, 
  Rocket,
  Palette,
  Layout,
  Image,
  BarChart3,
  Globe,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { PlanLevel } from '@/lib/sectionModels';
import { initiateCheckout, getEffectivePlanLimits, type PlanType } from '@/lib/billingApi';
import { toast } from 'sonner';

interface PlanFeature {
  name: string;
  icon?: React.ReactNode;
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
}

const PLAN_FEATURES: PlanFeature[] = [
  {
    name: 'Landing Pages',
    icon: <Layout className="w-4 h-4" />,
    free: '1',
    pro: '3',
    premium: '10',
  },
  {
    name: 'Blocos dinâmicos',
    icon: <Rocket className="w-4 h-4" />,
    free: '2',
    pro: '5',
    premium: 'Ilimitado',
  },
  {
    name: 'Edição de cores',
    icon: <Palette className="w-4 h-4" />,
    free: 'Parcial',
    pro: 'Total',
    premium: 'Total',
  },
  {
    name: 'Gradientes e Glass',
    icon: <Sparkles className="w-4 h-4" />,
    free: false,
    pro: true,
    premium: true,
  },
  {
    name: 'Tipografia customizada',
    icon: <BarChart3 className="w-4 h-4" />,
    free: false,
    pro: true,
    premium: true,
  },
  {
    name: 'Modelos Premium',
    icon: <Crown className="w-4 h-4" />,
    free: false,
    pro: false,
    premium: true,
  },
  {
    name: 'Armazenamento',
    icon: <Image className="w-4 h-4" />,
    free: '50MB',
    pro: '150MB',
    premium: '1GB',
  },
  {
    name: 'Domínio personalizado',
    icon: <Globe className="w-4 h-4" />,
    free: false,
    pro: true,
    premium: true,
  },
];

const PLAN_ICONS: Record<PlanLevel, React.ReactNode> = {
  free: <Zap className="w-6 h-6" />,
  pro: <Rocket className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
};

const PLAN_COLORS: Record<PlanLevel, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-500 text-white',
  premium: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
};

const PLAN_PRICES: Record<PlanLevel, { value: string; period: string }> = {
  free: { value: 'R$ 0', period: '/mês' },
  pro: { value: 'R$ 49', period: '/mês' },
  premium: { value: 'R$ 99', period: '/mês' },
};

const Upgrade = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanLevel>('pro');
  const [loading, setLoading] = useState<string | null>(null);
  const currentPlan = (profile?.plan as PlanLevel) || 'free';

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado. Você pode tentar novamente quando quiser.');
    }
  }, [searchParams]);

  const handleUpgrade = async (plan: PlanLevel) => {
    if (plan === currentPlan || plan === 'free') return;
    
    setLoading(plan);
    try {
      const result = await initiateCheckout(plan as 'pro' | 'premium');
      if ('error' in result) {
        toast.error(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error('Erro ao iniciar checkout. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground/50" />
      );
    }
    return <span className="font-medium">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">Escolha seu plano</h1>
          </div>
          <div className="w-20" /> {/* Spacer para centralizar */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Planos noBRon
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Desbloqueie todo o potencial
          </h2>
          <p className="text-lg text-muted-foreground">
            Crie landing pages profissionais sem limites. Escolha o plano ideal para você.
          </p>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {(['free', 'pro', 'premium'] as PlanLevel[]).map((plan, index) => {
            const isCurrentPlan = plan === currentPlan;
            const isSelected = plan === selectedPlan;
            const isPro = plan === 'pro';

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPlan(plan)}
                className={cn(
                  "relative rounded-3xl p-6 cursor-pointer transition-all duration-300",
                  "border-2 bg-card",
                  isSelected 
                    ? "border-primary shadow-xl scale-[1.02]" 
                    : "border-border hover:border-primary/50",
                  isPro && "md:-mt-4 md:mb-4" // Destaque pro
                )}
              >
                {/* Badge de recomendado */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4">
                      Recomendado
                    </Badge>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan && (
                  <Badge variant="outline" className="absolute top-4 right-4 text-xs">
                    Plano atual
                  </Badge>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                    PLAN_COLORS[plan]
                  )}>
                    {PLAN_ICONS[plan]}
                  </div>
                  <h3 className="text-xl font-bold capitalize mb-1">{plan}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{PLAN_PRICES[plan].value}</span>
                    <span className="text-muted-foreground text-sm">{PLAN_PRICES[plan].period}</span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-6">
                  {PLAN_FEATURES.slice(0, 5).map((feature) => {
                    const value = feature[plan];
                    const hasFeature = typeof value === 'boolean' ? value : true;
                    
                    return (
                      <li key={feature.name} className={cn(
                        "flex items-center gap-2 text-sm",
                        !hasFeature && "text-muted-foreground/50"
                      )}>
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                          )
                        ) : (
                          <Check className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                        <span>
                          {typeof value === 'string' ? `${value} ${feature.name.toLowerCase()}` : feature.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(plan);
                  }}
                  disabled={isCurrentPlan || plan === 'free' || loading !== null}
                  variant={isPro ? 'default' : 'outline'}
                  className={cn(
                    "w-full",
                    isPro && "bg-primary hover:bg-primary/90"
                  )}
                >
                  {loading === plan ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrentPlan ? (
                    'Plano atual'
                  ) : plan === 'free' ? (
                    'Gratuito'
                  ) : (
                    'Fazer upgrade'
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Comparativo completo
          </h3>

          <div className="rounded-2xl border bg-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 border-b">
              <div className="font-medium">Recurso</div>
              <div className="text-center font-medium">Free</div>
              <div className="text-center font-medium">Pro</div>
              <div className="text-center font-medium">Premium</div>
            </div>

            {/* Rows */}
            {PLAN_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={cn(
                  "grid grid-cols-4 gap-4 p-4 items-center",
                  index !== PLAN_FEATURES.length - 1 && "border-b"
                )}
              >
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <span className="text-sm font-medium">{feature.name}</span>
                </div>
                <div className="text-center">{renderFeatureValue(feature.free)}</div>
                <div className="text-center">{renderFeatureValue(feature.pro)}</div>
                <div className="text-center">{renderFeatureValue(feature.premium)}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ or Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Dúvidas sobre os planos?
          </p>
          <Button variant="outline" onClick={() => navigate('/interesse-nobron')}>
            Fale conosco
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Upgrade;
