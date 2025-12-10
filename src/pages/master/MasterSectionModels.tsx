import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  Star,
  Save,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  SECTION_MODELS,
  SECTION_DISPLAY_NAMES,
  SectionModel,
  SectionKey,
  PlanLevel,
} from '@/lib/sectionModels';

interface ModelConfig {
  id: string;
  enabled: boolean;
  visible_for_free: boolean;
  visible_for_pro: boolean;
  visible_for_premium: boolean;
  is_featured: boolean;
  sort_order: number;
}

interface MergedModel extends SectionModel {
  config: ModelConfig;
}

const DEFAULT_CONFIG: Omit<ModelConfig, 'id'> = {
  enabled: true,
  visible_for_free: true,
  visible_for_pro: true,
  visible_for_premium: true,
  is_featured: false,
  sort_order: 0,
};

const PLAN_LABELS: Record<PlanLevel, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

// Lista de seções derivada da fonte única de nomes amigáveis
const SECTION_KEY_LIST = Object.keys(SECTION_DISPLAY_NAMES) as SectionKey[];

const MasterSectionModels = () => {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<Record<string, ModelConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [pendingChanges, setPendingChanges] = useState<
    Record<string, Partial<ModelConfig>>
  >({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('section_model_configs')
      .select('*');

    if (error) {
      toast({ title: 'Erro ao carregar configurações', variant: 'destructive' });
    } else if (data) {
      const configMap: Record<string, ModelConfig> = {};
      data.forEach((item: any) => {
        configMap[item.id] = item as ModelConfig;
      });
      setConfigs(configMap);
    }
    setLoading(false);
  };

  // Merge models com configs
  const mergedModels: MergedModel[] = SECTION_MODELS.map((model) => ({
    ...model,
    config: configs[model.id] || { id: model.id, ...DEFAULT_CONFIG },
  }));

  // Aplicar filtros
  const filteredModels = mergedModels.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSection = filterSection === 'all' || m.section === filterSection;
    const matchesPlan = filterPlan === 'all' || m.plan === filterPlan;
    return matchesSearch && matchesSection && matchesPlan;
  });

  // Agrupar por seção
  const groupedModels: Record<SectionKey, MergedModel[]> = {} as any;
  filteredModels.forEach((m) => {
    if (!groupedModels[m.section]) {
      groupedModels[m.section] = [];
    }
    groupedModels[m.section].push(m);
  });

  const handleConfigChange = (
    modelId: string,
    field: keyof ModelConfig,
    value: any
  ) => {
    setPendingChanges((prev) => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [field]: value,
      },
    }));
  };

  const getEffectiveConfig = (model: MergedModel): ModelConfig => {
    const pending = pendingChanges[model.id];
    if (pending) {
      return { ...model.config, ...pending };
    }
    return model.config;
  };

  const handleSaveAll = async () => {
    const changes = Object.entries(pendingChanges);
    if (changes.length === 0) {
      toast({ title: 'Nenhuma alteração pendente' });
      return;
    }

    setSaving(true);

    for (const [modelId, updates] of changes) {
      const existingConfig = configs[modelId];
      const fullConfig = existingConfig
        ? {
            ...existingConfig,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        : {
            id: modelId,
            ...DEFAULT_CONFIG,
            ...updates,
            updated_at: new Date().toISOString(),
          };

      const { error } = await supabase
        .from('section_model_configs')
        .upsert(fullConfig);

      if (error) {
        console.error('Error saving config:', error);
        toast({ title: `Erro ao salvar ${modelId}`, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }

    // Log audit
    await supabase.rpc('log_audit_event', {
      _action: 'update_section_model_configs',
      _target_type: 'section_model_configs',
      _target_id: 'batch',
      _details: { models_updated: Object.keys(pendingChanges) },
    });

    toast({ title: 'Configurações salvas com sucesso!' });
    setPendingChanges({});
    await loadConfigs();
    setSaving(false);
  };

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/master')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg tracking-tight truncate">
              Governança de Modelos de Seção
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              Controle visibilidade e disponibilidade dos modelos por plano
            </p>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={saving || !hasPendingChanges}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alterações
            {hasPendingChanges && (
              <Badge variant="secondary" className="ml-1">
                {Object.keys(pendingChanges).length}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Seção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Seções</SelectItem>
              {SECTION_KEY_LIST.map((s) => (
                <SelectItem key={s} value={s}>
                  {SECTION_DISPLAY_NAMES[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-full md:w-36">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Planos</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedModels).map(([section, models]) => (
              <Card key={section}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {SECTION_DISPLAY_NAMES[section as SectionKey]}
                    <Badge variant="secondary" className="text-xs">
                      {models.length} modelo{models.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium">Modelo</th>
                          <th className="pb-2 font-medium text-center">Plano Mín.</th>
                          <th className="pb-2 font-medium text-center">Ativo</th>
                          <th className="pb-2 font-medium text-center">Free</th>
                          <th className="pb-2 font-medium text-center">Pro</th>
                          <th className="pb-2 font-medium text-center">Premium</th>
                          <th className="pb-2 font-medium text-center">Destaque</th>
                          <th className="pb-2 font-medium text-center">Ordem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {models.map((model) => {
                          const config = getEffectiveConfig(model);
                          const hasChanges = !!pendingChanges[model.id];

                          return (
                            <tr
                              key={model.id}
                              className={cn(
                                'border-b last:border-0',
                                hasChanges && 'bg-primary/5'
                              )}
                            >
                              <td className="py-3 pr-4">
                                <div>
                                  <span className="font-medium">{model.name}</span>
                                  {hasChanges && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-[10px]"
                                    >
                                      Editado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {model.description}
                                </p>
                                <code className="text-[10px] text-muted-foreground">
                                  {model.id}
                                </code>
                              </td>
                              <td className="py-3 text-center">
                                <Badge
                                  variant={model.plan === 'free' ? 'secondary' : 'default'}
                                  className={cn(
                                    'text-xs',
                                    model.plan === 'pro' && 'bg-blue-500',
                                    model.plan === 'premium' && 'bg-amber-500'
                                  )}
                                >
                                  {PLAN_LABELS[model.plan]}
                                </Badge>
                              </td>
                              <td className="py-3 text-center">
                                <Switch
                                  checked={config.enabled}
                                  onCheckedChange={(v) =>
                                    handleConfigChange(model.id, 'enabled', v)
                                  }
                                />
                              </td>
                              <td className="py-3 text-center">
                                <Switch
                                  checked={config.visible_for_free}
                                  onCheckedChange={(v) =>
                                    handleConfigChange(
                                      model.id,
                                      'visible_for_free',
                                      v
                                    )
                                  }
                                  disabled={model.plan !== 'free'}
                                />
                              </td>
                              <td className="py-3 text-center">
                                <Switch
                                  checked={config.visible_for_pro}
                                  onCheckedChange={(v) =>
                                    handleConfigChange(
                                      model.id,
                                      'visible_for_pro',
                                      v
                                    )
                                  }
                                  disabled={model.plan === 'premium'}
                                />
                              </td>
                              <td className="py-3 text-center">
                                <Switch
                                  checked={config.visible_for_premium}
                                  onCheckedChange={(v) =>
                                    handleConfigChange(
                                      model.id,
                                      'visible_for_premium',
                                      v
                                    )
                                  }
                                />
                              </td>
                              <td className="py-3 text-center">
                                <button
                                  onClick={() =>
                                    handleConfigChange(
                                      model.id,
                                      'is_featured',
                                      !config.is_featured
                                    )
                                  }
                                  className={cn(
                                    'p-1 rounded transition-colors',
                                    config.is_featured
                                      ? 'text-amber-500'
                                      : 'text-muted-foreground hover:text-amber-500'
                                  )}
                                >
                                  <Star
                                    className={cn(
                                      'w-4 h-4',
                                      config.is_featured && 'fill-current'
                                    )}
                                  />
                                </button>
                              </td>
                              <td className="py-3 text-center">
                                <Input
                                  type="number"
                                  value={config.sort_order}
                                  onChange={(e) =>
                                    handleConfigChange(
                                      model.id,
                                      'sort_order',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-16 h-8 text-center text-xs"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredModels.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum modelo encontrado com os filtros aplicados</p>
              </div>
            )}
          </div>
        )}

        {/* Info card */}
        <Card className="mt-8 bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-2">Como funciona a governança?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                • <strong>Ativo:</strong> Se desabilitado, o modelo não aparece como
                opção para novos usos (LPs existentes continuam funcionando)
              </li>
              <li>
                • <strong>Free/Pro/Premium:</strong> Controla quais planos podem usar
                o modelo
              </li>
              <li>
                • <strong>Destaque:</strong> Modelos destacados aparecem primeiro no
                picker
              </li>
              <li>
                • <strong>Ordem:</strong> Define a posição de exibição (menor =
                primeiro)
              </li>
              <li>
                • Os modelos são definidos em código (sectionModels.ts) e as configs
                de visibilidade são salvas no banco
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MasterSectionModels;
