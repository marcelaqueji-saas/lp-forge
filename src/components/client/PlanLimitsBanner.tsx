import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, HardDrive, Globe, LayoutGrid } from 'lucide-react';

export const PlanLimitsBanner = () => {
  const { profile, planLimits, siteCount } = useAuth();

  if (!profile || !planLimits) return null;

  const sitesUsedPercent = (siteCount / planLimits.max_sites) * 100;
  const storageUsedPercent = (profile.storage_used_mb / planLimits.max_storage_mb) * 100;

  const PLAN_LABELS = {
    free: 'Gratuito',
    pro: 'Pro',
    premium: 'Premium'
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-semibold">Plano {PLAN_LABELS[profile.plan]}</span>
        </div>
        {profile.plan !== 'premium' && (
          <Button size="sm" variant="outline" className="text-primary border-primary/30">
            <Zap className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sites limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4 text-muted-foreground" />
              <span>Sites</span>
            </div>
            <span className="text-muted-foreground">
              {siteCount} / {planLimits.max_sites === 999 ? '∞' : planLimits.max_sites}
            </span>
          </div>
          <Progress value={Math.min(sitesUsedPercent, 100)} className="h-2" />
        </div>

        {/* Storage limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span>Armazenamento</span>
            </div>
            <span className="text-muted-foreground">
              {profile.storage_used_mb} MB / {planLimits.max_storage_mb >= 1000 
                ? `${(planLimits.max_storage_mb / 1000).toFixed(1)} GB` 
                : `${planLimits.max_storage_mb} MB`}
            </span>
          </div>
          <Progress value={Math.min(storageUsedPercent, 100)} className="h-2" />
        </div>

        {/* Domains limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>Domínios</span>
            </div>
            <span className="text-muted-foreground">
              {planLimits.custom_domain_limit === 0 
                ? 'Não disponível' 
                : `Até ${planLimits.custom_domain_limit}`}
            </span>
          </div>
          {planLimits.custom_domain_limit > 0 && (
            <Progress value={0} className="h-2" />
          )}
        </div>
      </div>
    </div>
  );
};
