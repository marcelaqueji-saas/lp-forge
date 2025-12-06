import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { getAllPlanLimits, updatePlanLimits, PlanLimits, PlanTier } from '@/lib/authApi';

const CATEGORIES = ['básico', 'avançado', 'animado', 'robusto'];

const PLAN_CONFIG = {
  free: { icon: Sparkles, color: 'text-muted-foreground', label: 'Gratuito' },
  pro: { icon: Zap, color: 'text-primary', label: 'Pro' },
  premium: { icon: Crown, color: 'text-accent', label: 'Premium' },
};

const MasterPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanLimits[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const data = await getAllPlanLimits();
    setPlans(data);
    setLoading(false);
  };

  const handleUpdate = (plan: PlanTier, field: keyof PlanLimits, value: any) => {
    setPlans(prev => prev.map(p => 
      p.plan === plan ? { ...p, [field]: value } : p
    ));
  };

  const handleCategoryToggle = (plan: PlanTier, category: string, type: 'model' | 'separator') => {
    setPlans(prev => prev.map(p => {
      if (p.plan !== plan) return p;
      
      const field = type === 'model' ? 'allowed_model_categories' : 'allowed_separator_categories';
      const current = p[field] || [];
      const updated = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      
      return { ...p, [field]: updated };
    }));
  };

  const handleSave = async (plan: PlanTier) => {
    setSaving(plan);
    const planData = plans.find(p => p.plan === plan);
    if (!planData) return;

    const success = await updatePlanLimits(plan, {
      max_sites: planData.max_sites,
      max_storage_mb: planData.max_storage_mb,
      custom_domain_limit: planData.custom_domain_limit,
      allowed_model_categories: planData.allowed_model_categories,
      allowed_separator_categories: planData.allowed_separator_categories,
    });

    if (success) {
      toast({ title: `Plano ${plan} atualizado` });
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Limites de Planos</h1>
            <p className="text-xs text-muted-foreground">Configure os limites para cada plano</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const config = PLAN_CONFIG[plan.plan as PlanTier];
            const Icon = config.icon;

            return (
              <Card key={plan.plan}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Limits */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Máx. Sites</Label>
                      <Input
                        type="number"
                        value={plan.max_sites}
                        onChange={(e) => handleUpdate(plan.plan as PlanTier, 'max_sites', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Armazenamento (MB)</Label>
                      <Input
                        type="number"
                        value={plan.max_storage_mb}
                        onChange={(e) => handleUpdate(plan.plan as PlanTier, 'max_storage_mb', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Limite de Domínios</Label>
                      <Input
                        type="number"
                        value={plan.custom_domain_limit}
                        onChange={(e) => handleUpdate(plan.plan as PlanTier, 'custom_domain_limit', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Model Categories */}
                  <div>
                    <Label className="text-xs mb-2 block">Categorias de Modelos</Label>
                    <div className="space-y-2">
                      {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex items-center gap-2">
                          <Checkbox
                            id={`${plan.plan}-model-${cat}`}
                            checked={plan.allowed_model_categories?.includes(cat)}
                            onCheckedChange={() => handleCategoryToggle(plan.plan as PlanTier, cat, 'model')}
                          />
                          <Label htmlFor={`${plan.plan}-model-${cat}`} className="text-sm capitalize">
                            {cat}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Separator Categories */}
                  <div>
                    <Label className="text-xs mb-2 block">Categorias de Separadores</Label>
                    <div className="space-y-2">
                      {CATEGORIES.map((cat) => (
                        <div key={cat} className="flex items-center gap-2">
                          <Checkbox
                            id={`${plan.plan}-sep-${cat}`}
                            checked={plan.allowed_separator_categories?.includes(cat)}
                            onCheckedChange={() => handleCategoryToggle(plan.plan as PlanTier, cat, 'separator')}
                          />
                          <Label htmlFor={`${plan.plan}-sep-${cat}`} className="text-sm capitalize">
                            {cat}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleSave(plan.plan as PlanTier)}
                    disabled={saving === plan.plan}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving === plan.plan ? 'Salvando...' : 'Salvar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MasterPlans;
