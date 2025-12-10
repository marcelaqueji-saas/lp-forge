import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown, Sparkles, Loader2, Check, Shield } from 'lucide-react';
import { PlanTier } from '@/lib/authApi';
import type { PlanLevelWithMaster } from '@/lib/sectionModels';
import { initiateCheckout, PLAN_INFO } from '@/lib/billingApi';
import { toast } from 'sonner';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan?: PlanTier;
  currentPlan?: PlanLevelWithMaster;
}

const PLAN_NAMES: Record<PlanLevelWithMaster, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  premium: 'Premium',
  master: 'Master',
};

const PLAN_ICONS: Record<PlanLevelWithMaster, React.ReactNode> = {
  free: <Sparkles className="w-5 h-5" />,
  pro: <Zap className="w-5 h-5" />,
  premium: <Crown className="w-5 h-5" />,
  master: <Shield className="w-5 h-5" />,
};

export const UpgradeModal = ({ 
  open, 
  onClose, 
  feature, 
  requiredPlan = 'pro',
  currentPlan = 'free' 
}: UpgradeModalProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Master plan users should never see upgrade modal
  if (currentPlan === 'master') {
    return null;
  }

  const handleUpgrade = async () => {
    if (requiredPlan === 'free') return;
    
    setLoading(true);
    try {
      const result = await initiateCheckout(requiredPlan as 'pro' | 'premium');
      if ('error' in result) {
        // If Stripe not configured, redirect to upgrade page
        if (result.error.includes('not configured')) {
          toast.info('Sistema de pagamento em configuração. Redirecionando...');
          navigate('/upgrade');
        } else {
          toast.error(result.error);
        }
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error('Erro ao iniciar checkout. Tente novamente.');
      navigate('/upgrade');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const planInfo = PLAN_INFO[requiredPlan as keyof typeof PLAN_INFO];
  const displayCurrentPlan = currentPlan as PlanTier;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Recurso Premium</DialogTitle>
          <DialogDescription className="text-center">
            Para usar <strong>{feature}</strong>, você precisa do plano{' '}
            <span className="text-primary font-semibold">{PLAN_NAMES[requiredPlan]}</span> ou superior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {PLAN_ICONS[currentPlan]}
                <span className="text-sm text-muted-foreground">Seu plano atual:</span>
              </div>
              <span className="font-medium">{PLAN_NAMES[currentPlan]}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {PLAN_ICONS[requiredPlan]}
                <span className="font-semibold text-primary">{PLAN_NAMES[requiredPlan]}</span>
              </div>
              <span className="font-bold">{planInfo?.price}{planInfo?.period}</span>
            </div>
            {planInfo && (
              <ul className="space-y-1.5">
                {planInfo.features.slice(0, 3).map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary" />
                    {feat}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Agora não
            </Button>
            <Button onClick={handleUpgrade} disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Processando...' : 'Fazer upgrade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
