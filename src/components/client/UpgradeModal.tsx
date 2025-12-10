import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown, Sparkles } from 'lucide-react';
import { PlanTier } from '@/lib/authApi';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  requiredPlan?: PlanTier;
  currentPlan?: PlanTier;
}

const PLAN_NAMES: Record<PlanTier, string> = {
  free: 'Gratuito',
  pro: 'Pro',
  premium: 'Premium'
};

const PLAN_ICONS: Record<PlanTier, React.ReactNode> = {
  free: <Sparkles className="w-5 h-5" />,
  pro: <Zap className="w-5 h-5" />,
  premium: <Crown className="w-5 h-5" />
};

export const UpgradeModal = ({ 
  open, 
  onClose, 
  feature, 
  requiredPlan = 'pro',
  currentPlan = 'free' 
}: UpgradeModalProps) => {
  const handleUpgrade = () => {
    // Navega para a página de upgrade
    window.location.href = '/upgrade';
    onClose();
  };

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {PLAN_ICONS[requiredPlan]}
                <span className="text-sm">Plano necessário:</span>
              </div>
              <span className="font-semibold text-primary">{PLAN_NAMES[requiredPlan]}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Agora não
            </Button>
            <Button onClick={handleUpgrade} className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              Fazer upgrade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
