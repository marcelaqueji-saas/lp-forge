import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, HardDrive, Globe, LayoutGrid } from 'lucide-react';

export const PlanLimitsBanner = () => {
  const { profile, planLimits, siteCount } = useAuth();

  if (!profile || !planLimits) return null;

  // 🔹 Acessos extras do profile via any para não quebrar o tipo UserProfile
  const profileAny = profile as any;

  const isMaster =
    profileAny?.role === 'admin_master' ||
    profileAny?.role === 'master' ||
    profileAny?.is_admin_master === true ||
    profileAny?.is_master === true;

  const PLAN_LABELS: Record<string, string> = {
    free: 'Gratuito',
    pro: 'Pro',
    premium: 'Premium',
    master: 'Master',
  };

  const planKey = (isMaster ? 'master' : profile.plan) ?? 'free';
  const planLabel = PLAN_LABELS[planKey] ?? planKey;

  // 🔹 Sites
  const rawSiteCount = siteCount ?? 0;
  const rawMaxSites = planLimits.max_sites ?? 0;

  const maxSitesForDisplay =
    isMaster || rawMaxSites === 999 ? '∞' : rawMaxSites;

  const effectiveSiteCount =
    !isMaster && rawMaxSites && rawMaxSites !== 999
      ? Math.min(rawSiteCount, rawMaxSites)
      : rawSiteCount;

  const sitesUsedPercent =
    !isMaster && rawMaxSites && rawMaxSites > 0 && rawMaxSites !== 999
      ? (effectiveSiteCount / rawMaxSites) * 100
      : 0;

  // 🔹 Armazenamento
  const storageUsedMb = profile.storage_used_mb ?? 0;
  const maxStorageMb = planLimits.max_storage_mb ?? 0;
  const storageUsedPercent =
    maxStorageMb > 0
      ? Math.min((storageUsedMb / maxStorageMb) * 100, 100)
      : 0;

  const maxStorageLabel =
    isMaster || maxStorageMb >= 999_999
      ? '∞'
      : maxStorageMb >= 1000
      ? `${(maxStorageMb / 1000).toFixed(1)} GB`
      : `${maxStorageMb} MB`;

  // 🔹 Domínios
  const customDomainLimit = planLimits.custom_domain_limit ?? 0;
  const domainLabel = isMaster
    ? 'Ilimitado'
    : customDomainLimit === 0
    ? 'Não disponível'
    : `Até ${customDomainLimit}`;

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-semibold">Plano {planLabel}</span>
        </div>

        {!isMaster && planKey !== 'premium' && (
          <Button
            size="sm"
            variant="outline"
            className="text-primary border-primary/30"
            onClick={() => window.location.href = '/upgrade'}
          >
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
              {effectiveSiteCount} / {maxSitesForDisplay}
            </span>
          </div>
          {!isMaster && rawMaxSites > 0 && rawMaxSites !== 999 ? (
            <Progress value={Math.min(sitesUsedPercent, 100)} className="h-2" />
          ) : (
            <div className="h-2 w-full rounded-full bg-muted/40" />
          )}
        </div>

        {/* Storage limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span>Armazenamento</span>
            </div>
            <span className="text-muted-foreground">
              {isMaster ? '∞' : `${storageUsedMb} MB`} / {maxStorageLabel}
            </span>
          </div>
          {isMaster || maxStorageMb === 0 ? (
            <div className="h-2 w-full rounded-full bg-muted/40" />
          ) : (
            <Progress
              value={Math.min(storageUsedPercent, 100)}
              className="h-2"
            />
          )}
        </div>

        {/* Domains limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>Domínios</span>
            </div>
            <span className="text-muted-foreground">{domainLabel}</span>
          </div>
          {(!isMaster && customDomainLimit > 0) || isMaster ? (
            <div className="h-2 w-full rounded-full bg-muted/40" />
          ) : (
            <div className="h-2 w-full rounded-full bg-muted/20" />
          )}
        </div>
      </div>
    </div>
  );
};
