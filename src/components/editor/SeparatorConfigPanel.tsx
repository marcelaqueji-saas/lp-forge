// Separator Config Panel
// Allows users to configure section separators in LP settings

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { 
  SectionSeparator, 
  SEPARATOR_CATALOG, 
  SeparatorType 
} from '@/components/sections/SectionSeparator';
import { PlanLevelWithMaster } from '@/lib/sectionModels';

interface SeparatorConfig {
  separators_enabled?: string;
  separator_type?: string;
  separator_color?: string;
}

interface SeparatorConfigPanelProps {
  config: SeparatorConfig;
  userPlan: PlanLevelWithMaster;
  onChange: (key: keyof SeparatorConfig, value: string) => void;
  onUpgradeClick?: () => void;
}

const PLAN_ORDER: Record<string, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  master: 3,
};

function canUseSeparator(
  separatorPlan: 'free' | 'pro' | 'premium',
  userPlan: PlanLevelWithMaster
): boolean {
  if (userPlan === 'master') return true;
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[separatorPlan];
}

export const SeparatorConfigPanel = ({
  config,
  userPlan,
  onChange,
  onUpgradeClick,
}: SeparatorConfigPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const separatorsEnabled = config.separators_enabled === 'true';
  const currentType = (config.separator_type as SeparatorType) || 'none';
  const separatorColor = config.separator_color || 'hsl(var(--muted))';

  const handleToggle = (enabled: boolean) => {
    onChange('separators_enabled', enabled ? 'true' : 'false');
  };

  const handleSelectType = (type: SeparatorType) => {
    const separator = SEPARATOR_CATALOG.find(s => s.id === type);
    if (!separator) return;

    if (!canUseSeparator(separator.plan, userPlan)) {
      onUpgradeClick?.();
      return;
    }

    onChange('separator_type', type);
  };

  const handleColorChange = (color: string) => {
    onChange('separator_color', color);
  };

  const presetColors = [
    { value: 'hsl(var(--background))', label: 'Fundo' },
    { value: 'hsl(var(--muted))', label: 'Neutro' },
    { value: 'hsl(var(--primary))', label: 'Primária' },
    { value: 'hsl(var(--primary)/0.1)', label: 'Primária suave' },
    { value: 'hsl(var(--accent))', label: 'Destaque' },
  ];

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
        <div>
          <Label className="text-sm font-medium">Separadores entre seções</Label>
          <p className="text-xs text-muted-foreground">
            Adiciona divisores visuais entre as seções
          </p>
        </div>
        <Switch
          checked={separatorsEnabled}
          onCheckedChange={handleToggle}
        />
      </div>

      <AnimatePresence>
        {separatorsEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Separator Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tipo de separador</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SEPARATOR_CATALOG.map((separator) => {
                  const isLocked = !canUseSeparator(separator.plan, userPlan);
                  const isSelected = currentType === separator.id;

                  return (
                    <Card
                      key={separator.id}
                      className={cn(
                        "cursor-pointer transition-all overflow-hidden",
                        isSelected && "ring-2 ring-primary border-primary",
                        isLocked && "opacity-60"
                      )}
                      onClick={() => handleSelectType(separator.id)}
                    >
                      <CardContent className="p-2">
                        {/* Preview */}
                        <div className="h-10 rounded overflow-hidden bg-background mb-2 relative">
                          {separator.preview}
                          {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          {isSelected && !isLocked && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium truncate">{separator.name}</span>
                            {separator.plan !== 'free' && (
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[8px] px-1 py-0",
                                  separator.plan === 'premium' && "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30"
                                )}
                              >
                                {separator.plan}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            {currentType !== 'none' && currentType !== 'glass' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Cor do separador</Label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleColorChange(preset.value)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all",
                        separatorColor === preset.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                      style={{ backgroundColor: preset.value.replace('hsl(var(--', 'hsl(var(--').replace('))', '))') }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Live Preview */}
            {currentType !== 'none' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Preview</Label>
                <div className="rounded-lg overflow-hidden border bg-muted/10">
                  <div className="h-16 bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Seção anterior</span>
                  </div>
                  <SectionSeparator 
                    type={currentType} 
                    position="bottom"
                    color={separatorColor}
                  />
                  <div className="h-16 bg-accent/10 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Próxima seção</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade CTA for locked features */}
            {userPlan === 'free' && (
              <Card className="border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-3 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Mais opções no Pro</p>
                    <p className="text-xs text-muted-foreground">
                      Curvas, triângulos, zig-zag e mais
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={onUpgradeClick}>
                    Upgrade
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeparatorConfigPanel;
